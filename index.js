const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

// Initialise collisions map to identify tiles player cannot walk through.
const collisionsMap = []
for(let i = 0; i < collisions.length; i += 70) {
    collisionsMap.push(collisions.slice(i, i + 70));
}

const battleZonesMap = [];
for(let i = 0; i < battleZonesData.length; i += 70) {
    battleZonesMap.push(battleZonesData.slice(i, i + 70));
}

const offset = {
    x: -1745,
    y: -480
}

const boundaries = [];

collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025 ) { 
            boundaries.push(new Boundary({position: { x: j * Boundary.width + offset.x, y: i * Boundary.height + offset.y}}))
        }
    })
})

const battleZones = [];
battleZonesMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025 ) { 
            battleZones.push(new Boundary({position: { x: j * Boundary.width + offset.x, y: i * Boundary.height + offset.y}}))
        }
    })
})

console.log(battleZones)


// Initialise tileset image and player starting position
const image = new Image();
image.src = './images/PokemonStyleGameMap400.png';

const foregroundImage = new Image();
foregroundImage.src = './images/PokemonStyleGameMapForeground.png'

const playerImage = new Image();
playerImage.src = './images/playerDown.png';

const playerUpImage = new Image();
playerUpImage.src = './images/playerUp.png';

const playerLeftImage = new Image();
playerLeftImage.src = './images/playerLeft.png';

const playerRightImage = new Image();
playerRightImage.src = './images/playerRight.png';

image.onload = () => {
    c.drawImage(image,offset.x, offset.y)
    c.drawImage(
        playerImage, 
        0, 
        0, 
        playerImage.width / 4, 
        playerImage.height, 
        canvas.width / 2 - (playerImage.width / 4) / 2, 
        canvas.height / 2 - playerImage.height / 2, 
        playerImage.width / 4, 
        playerImage.height
    )
}

const player = new Sprite({
    position: {
        x: canvas.width / 2 - (192 / 4) / 2,
        y: canvas.height / 2 - 68 / 2
    },
    image: playerImage,
    frames: {
        max: 4,
        hold: 10
    },
    sprites: {
        up: playerUpImage,
        left: playerLeftImage,
        right: playerRightImage,
        down: playerImage
    }
});

const background = new Sprite({ 
    position: {
        x: offset.x,
        y: offset.y
    },
    image: image
});

const foreground = new Sprite({ 
    position: {
        x: offset.x,
        y: offset.y
    },
    image: foregroundImage
})

const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
};

const testBoundary = new Boundary({
    position: {
        x: 400,
        y: 400
    }
})

const movables = [background, ...boundaries, foreground, ...battleZones];

function rectangularCollission({r1, r2}) {
    return (
        r1.position.x + r1.width-10 >= r2.position.x &&
        r1.position.x <= r2.width + r2.position.x &&
        r1.position.y <= r2.height - 50 + r2.position.y &&
        r1.position.y + r1.height >= r2.position.y
    )
}

const battle = {
    initiated: false
}

function animate() {
    const animationId = window.requestAnimationFrame(animate);
    
    background.draw();
    boundaries.forEach((boundary) => {
        boundary.draw();
    })
    battleZones.forEach((battleZone) => {
        battleZone.draw();
    })
    player.draw();
    foreground.draw();

    let moving = true;
    player.animate = false

    // Check if the player is moving upon a battle zone and activate battle 
    if(battle.initiated) return
    if(keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
        for(let i = 0; i < battleZones.length; i++) {
            const battleZone = battleZones[i]
            const overlappingArea = (Math.min(player.position.x + player.width, battleZone.position.x + battleZone.width) - Math.max(player.position.x, battleZone.position.x)) * (Math.min(player.position.y + player.height, battleZone.position.y + battleZone.height) - Math.max(player.position.y, battleZone.position.y));
            if(rectangularCollission({r1: player, r2: {...battleZone, position: {x: battleZone.position.x, y: battleZone.position.y + 3}}}) && overlappingArea > (player.width * player.height) / 2 && Math.random() < 0.02) {
                console.log('battling'); 
                window.cancelAnimationFrame(animationId)
                battle.initiated = true;
                audio.Map.stop()
                audio.initBattle.play()
                gsap.to('#overlapping-div', {
                    opacity: 1,
                    repeat: 3,
                    yoyo: true,
                    duration: 0.4,
                    onComplete() {
                        gsap.to('#overlapping-div', {
                            opacity: 1,
                            duration: 0.4,
                            onComplete() {
                                audio.battle2.play()
                                initBattle();
                                animateBattle();
                                gsap.to('#overlapping-div', {
                                    opacity: 0,
                                    duration: 0.4,
                                    
                                })
                            }
                        })
                    }
                }) 
                break;
            }
        }
    }

    
    if (keys.w.pressed && lastKey === 'w') {
        player.animate = true;
        player.image = player.sprites.up
        for(let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if(rectangularCollission({r1: player, r2: {...boundary, position: {x: boundary.position.x, y: boundary.position.y + 3}}})) {
                moving = false;
                break;
            }
        }

        if(moving) {
            movables.forEach(movable => {movable.position.y += 3})
        }
    } else if (keys.a.pressed && lastKey === 'a') {
        player.animate = true;
        player.image = player.sprites.left
        for(let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if(rectangularCollission({r1: player, r2: {...boundary, position: {x: boundary.position.x + 3, y: boundary.position.y}}})) {

                moving = false;
                break;
            }
        }
        if(moving) {
            movables.forEach(movable => {movable.position.x += 3})
        }
    } else if (keys.s.pressed && lastKey === 's') {
        player.animate = true;
        player.image = player.sprites.down
        for(let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if(rectangularCollission({r1: player, r2: {...boundary, position: {x: boundary.position.x, y: boundary.position.y - 3}}})) {
               
                moving = false;
                break;
            }
        }
        if(moving) {
            movables.forEach(movable => {movable.position.y -= 3})
        }
    } else if (keys.d.pressed && lastKey === 'd') {
        player.animate = true;
        player.image = player.sprites.right
        for(let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if(rectangularCollission({r1: player, r2: {...boundary, position: {x: boundary.position.x - 3, y: boundary.position.y}}})) {
                
                moving = false;
                break;
            }
        }
        if(moving) {
            movables.forEach(movable => {movable.position.x -= 3})
        }
    }
}

let lastKey = ''
window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w':
            keys.w.pressed = true;
            lastKey = 'w';
            break;
        case 'a':
            keys.a.pressed = true;
            lastKey = 'a';
            break;
        case 's':
            keys.s.pressed = true;
            lastKey = 's';
            break;
        case 'd':
            keys.d.pressed = true;
            lastKey = 'd';
            break;
    }
})

window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'w':
            keys.w.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;
        case 's':
            keys.s.pressed = false;
            break;
        case 'd':
            keys.d.pressed = false;
            break;
    }
})

document.querySelector('#play-game').addEventListener('click', (e) => {
    document.querySelector('#start-game').style.display = 'none';
    audio.Map.play()
    animate()
})