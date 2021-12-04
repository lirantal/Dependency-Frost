import kaboom from "kaboom"

// initialize context
kaboom({crisp: true, background: [134, 135, 247]})
loadSprite("background", "sprites/BG.png")
loadSprite("bean", "sprites/bean.png")
loadPedit("npmbox", "sprites/npmbox.pedit")
loadPedit("rail", "sprites/rail.pedit");
loadPedit("rail2", "sprites/rail.pedit");

// original assets from:
// https://opengameart.org/content/dog-run-stand-pee-6frames-46x27
loadSprite("dog", "sprites/dog_brown.png", {
  sliceX: 3,
  sliceY: 2,
  anims: {
    idle: {
      from: 0, to: 0
    },
    run: {
      from: 0, to: 2, loop: true
    }
  }
})

let score = 0
scene("game", () => {

  const JUMP_FORCE = 1000
  const FLOOR_HEIGHT = 48
  const MOVE_SPEED = 200
  
  // define gravity
	gravity(2400)

  // add christmas background!
  add([
    sprite("background"),
    pos(0, 0),
    scale(0.6)
  ])

  const scoreLabel = add([
    text(score),
    pos(24, 24),
    fixed()
  ])

  // increment score every frame
  action(() => {
    score++
    scoreLabel.text = score
  })

  // add the bottom solid platform
  platform = add([ 
    rect(width(), FLOOR_HEIGHT),
    pos(0, height() - FLOOR_HEIGHT),
    outline(4),
    area(),
    solid(),
    color(128,0,128)
  ])

  // add a character to screen
  const player = add([
    sprite("dog"),
    pos(80, 40),
    area(),
    body(),
    scale(1.8),
    "player",
  ])
  player.flipX(true)

  // const traveler = add([
  //   sprite("dog", {animeSpeed: 100, anime: 'idle'}),
  //   pos(80, 140),
  //   origin("center"),
  //   scale(1.8),
  //   area(),
  //   body(),
  // ])
  // traveler.flipX(true)
  
  // enable camera position movement
  // player.action(() => {
  // center camera to player
  // var currCam = camPos();
  // if (currCam.x < player.pos.x) {
  //     camPos(player.pos.x, currCam.y);
  //   }
  // });

  onDraw("player", () => {
    if (player.pos.x <0) {
      player.moveTo(0, player.pos.y)
    }
  })

  function jump() {
    if (player.grounded()) {
      player.jump(JUMP_FORCE)
      player.play('idle')
    }
  }

  onKeyPress("space", jump)
  onKeyPress("up", jump)
  mouseClick(jump)


  onKeyPress('right', () => {
    player.flipX(true)
    // traveler.scale.x = 1
    // traveler.play('run')
  })

  onKeyPress('left', () => {
    player.flipX(false)
    // traveler.scale.x = -1
    // traveler.play('run')
  })

  onKeyRelease('left', () => {
    player.play('run')
  })

  onKeyRelease('right', () => {
    player.play('run')
  })

  onKeyDown('right', () => {
    player.move(MOVE_SPEED, 0)
  })

  onKeyDown('left', () => {
    player.move(-MOVE_SPEED, 0)
  })

  player.collides("package", () => {
    addKaboom(player.pos)
    shake()
    go("lose")
  })


  let railTimeout = 1
  loop(1, () => {
    let randomNumber = randi(0,49)
    console.log({randomNumber})

    if (railTimeout > 0) {
      railTimeout -= 1
      return
    }

    if (randomNumber % 7 === 0) {
      railTimeout = 1
      add([
        sprite("rail2"),
        origin('botleft'),
        pos(width() + 50, height() - (FLOOR_HEIGHT * 4)),
        move(LEFT, 180),
        "rail",
        scale(5),
        area(),
        fixed(),
        solid()
      ])
    }
  })

  function spawnPackages() {
    const npmPackage = add([
      sprite("npmbox"),
      area(),
      origin('botleft'),
      pos(width(), height() - FLOOR_HEIGHT),
      move(LEFT, 240),
      "package",
      scale(1)
    ])

    add([
      text("react", { size: '22', width: 120, font: 'apl386' }),
      move(LEFT, 240),
      origin('botleft'),
      color(255, 255, 255),
      pos(width(), height() - 100)
    ])

    wait(rand(0.8, 3.5), () => {
      spawnPackages()
    })
  }

  spawnPackages()
})

onUpdate("package", (pkg) => {
  if (pkg.pos.x < 0) {
    destroy(pkg)
  }
})

scene("lose", () => {
  add([
		text("Game Over"),
		pos(center()),
		origin("center"),
	])

	add([
		text(score),
		pos(width() / 2, height() / 2 + 120),
		scale(2),
		origin("center"),
	])

	onKeyPress("space", () => restartGame())
	mouseClick(() => restartGame())

  const restartGame = () => {
    score = 0
    go("game")
  }
})

go("game")