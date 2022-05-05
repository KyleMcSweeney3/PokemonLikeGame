const battleBGImage = new Image();
battleBGImage.src = './images/battleBackground.png'

const battleBG = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    image: battleBGImage
}) 

let draggle
let emby
let renderedSprites 
let battleAnimationId
let queue

function initBattle() {
    document.querySelector('#user-interface').style.display = 'block'
    document.querySelector('#dialog-box').style.display = 'none'
    document.querySelector('#enemy-health').style.width = '100%'
    document.querySelector('#player-health').style.width = '100%'
    document.querySelector('#attacks-box').replaceChildren()

    draggle = new Monster(monsters.Draggle);
    emby = new Monster(monsters.Emby)
    renderedSprites = [draggle, emby]
    queue = []

    emby.attacks.forEach((attack) => {
        const button = document.createElement('button')
        button.innerHTML = attack.name
        document.querySelector('#attacks-box').append(button)
    })

    // Attack event listeners
    document.querySelectorAll('button').forEach((button) => {
        button.addEventListener('click', (e) => {
            const selectedAttack = attacks[e.currentTarget.innerHTML]
            emby.attack({
                attack: selectedAttack,
                recipient: draggle,
                renderedSprites
            })


            if(draggle.health <= 0) {
                queue.push(() => {
                    draggle.faint()
                })
                queue.push(() => {
                    gsap.to('#overlapping-div', {
                        opacity: 1,
                        onComplete: () => {
                            cancelAnimationFrame(battleAnimationId)
                            animate()
                            document.querySelector('#user-interface').style.display = 'none'
                            gsap.to('#overlapping-div', {
                                opacity: 0
                            })
                            battle.initiated = false
                            audio.Map.play()
                        }
                    })
                })
            }

            const randomAttack = draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)]

            queue.push(() => {
                draggle.attack({
                    attack: randomAttack,
                    recipient: emby,
                    renderedSprites
                })
                if(emby.health <= 0) {
                    queue.push(() => {
                        emby.faint()
                    })
                    queue.push(() => {
                        gsap.to('#overlapping-div', {
                            opacity: 1,
                            onComplete: () => {
                                cancelAnimationFrame(battleAnimationId)
                                animate()
                                document.querySelector('#user-interface').style.display = 'none'
                                gsap.to('#overlapping-div', {
                                    opacity: 0
                                })

                                battle.initiated = false
                            }
                        })
                    })
                }
            })

            
        })

        button.addEventListener('mouseenter', (e) => {
            const selectedAttack = attacks[e.currentTarget.innerHTML]
            document.querySelector('#attack-type').innerHTML = selectedAttack.type
            document.querySelector('#attack-type').style.color = selectedAttack.color
        })
    })
}

function animateBattle() {
    battleAnimationId = window.requestAnimationFrame(animateBattle)
    battleBG.draw();

    renderedSprites.forEach((sprite) => {
        sprite.draw()
    })
}


document.querySelector('#dialog-box').addEventListener('click', (e) => {
    if(queue.length > 0) {
        queue[0]()
        queue.shift()
    } else {
        e.currentTarget.style.display = 'none'  
    }
})