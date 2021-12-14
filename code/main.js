import kaboom from "kaboom"

// initialize context
kaboom({
  crisp: true,
  width: 1280,
  height: 720,
  background: [134, 135, 247]
})

loadSprite("background", "sprites/BG.png")
// loadSprite("bean", "sprites/bean.png")

loadPedit("npmbox", "sprites/npmbox-animated.pedit")
loadPedit("npmbox-dev", "sprites/npmbox-dev.pedit");
loadPedit("rail", "sprites/rail.pedit")
loadPedit("rail2", "sprites/rail.pedit")
// loadPedit("Patch-Rails", "sprites/Patch-Rails.pedit")
loadPedit("Patch-Jumper", "sprites/Patch-Jumper.pedit")
loadPedit("Mode-protected", "sprites/Mode-protected.pedit");
loadPedit("Mode-filterdevs", "sprites/Mode-filterdevs.pedit");

//
loadSound("jump-fast", "sounds/fast-simple-chop-5-6270.mp3");
loadSound("score", "sounds/score.mp3");
loadSound("soundThunder", "sounds/mixkit-distant-thunder-explosion-1278.wav");
loadSound("soundPackageCollide", "sounds/mixkit-epic-impact-afar-explosion-2782.wav");
loadSound("soundItem1", "sounds/mixkit-fast-small-sweep-transition-166.wav");
loadSound("soundItem2", "sounds/mixkit-fairy-teleport-868.wav");
loadSound("soundItem3", "sounds/mixkit-magic-sparkle-whoosh-2350.wav");
loadSound("game-background-music2", "sounds/game-background-music2.mp3");
loadSound("game-nonplay", "sounds/deep-ambient-version-60s-9889.mp3");
const gameMusic = play('game-background-music2', {loop: true, volume: 0.6})
const soundThunder = play('soundThunder', {loop: false, volume: 0.9})
const gameMusicIntro = play('game-nonplay', {loop: true, volume: 0.7})
//

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
let packagesAnimType = 'regular'
let playerProtected = false
let devDepsCounter = 0

// jump mode:
const scorePhase1 = 1200
// protected mode:
const scorePhase2 = 2000
// devdeps:
const scorePhase3 = 2800
// currently unused:
const scorePhase4 = 5000
const scorePhase5 = 10000

scene("game", () => {
  gameMusicIntro.stop()

  let SPAWN_PACKAGES_TOP_SPEED = 3.5
  gameMusic.play()

  let helpers = ['Patch-Jumper', 'Protected',  'Protected', 'Mode-filterdevs', 'Mode-filterdevs', 'Protected', 'Mode-filterdevs']
  score = 0

  let JUMP_FORCE = 705
  const FLOOR_HEIGHT = 48
  const MOVE_SPEED = 200
  
  // define gravity
	gravity(2400)

  // add christmas background!
  add([
    sprite("background"),
    pos(0, 0),
    scale(0.9)
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
      play('jump-fast', {loop: false})
      player.jump(JUMP_FORCE)
      player.play('idle')
    }
  }

  onKeyPress("space", jump)
  onKeyPress("up", jump)
  mouseClick(jump)


  onKeyPress('right', () => {
    player.flipX(true)
  })

  onKeyPress('left', () => {
    player.flipX(false)
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

  player.onCollide("package", (element) => {
    if (playerProtected !== true) {
      addKaboom(player.pos)
      play('soundPackageCollide', {loop: false})
      shake()
      go("lose")
    }
  })

  player.collides("Patch-Jumper", (element) => {
    play('soundItem3', {loop: false})
    addKaboom(player.pos)
    shake()

    // upgrade the jump force!
    JUMP_FORCE = 1000
    
    // remove the helper now that it's received
    helperIndex = helpers.indexOf('Patch-Jumper')
    helpers.splice(helperIndex, 1)

    destroy(element)
  })

  player.onCollide("DevDeps", (element) => {
    addKaboom(player.pos)
    play('soundPackageCollide', {loop: false})
    shake()
    go("lose")
  })

  player.collides("Mode-protected", (element) => {
    play('soundItem2', {loop: false})
    // remove the helper now that it's received
    helperIndex = helpers.indexOf('Protected')
    helpers.splice(helperIndex, 1)

    addKaboom(player.pos)
    shake(5)
    destroy(element)

    // new spawned packages should have the "weak" animation
    packagesAnimType = 'weak'
    playerProtected = true
    every('package', (element) => {
      element.play(packagesAnimType)
    })
    // and after 5 seconds it expires back to "regular"
    wait(5, () => {
      packagesAnimType = 'regular'
      every('package', (element) => {
        element.play(packagesAnimType)
      })
      playerProtected = false
    })
  })

  player.collides("Mode-filterdevs", (element) => {
    play('soundItem3', {loop: false})
    // remove the helper now that it's received
    helperIndex = helpers.indexOf('Mode-filterdevs')
    helpers.splice(helperIndex, 1)

    addKaboom(player.pos)
    shake(5)
    destroy(element)

    destroyAll("DevDeps")
  })

  let colorama = 0
  let coloramaIndex = [BLUE, MAGENTA]
  let radiusProtector = 40

  onDraw(() => {
    if (playerProtected) {
      drawCircle({
          pos: vec2(player.pos.x + 40, player.pos.y + 20),
          radius: radiusProtector,
          opacity: 0,
          outline: { color: coloramaIndex[colorama], width: 1 },
      })
    }
	})

  loop(0.1, () => {
    colorama = Number(!colorama)
    radiusProtector++
    if (radiusProtector >= 55) {
      radiusProtector = 45
    }
  })

  loop(5, () => {
    // Phase2 begins
    if (score >= scorePhase2) {
      if (helpers.includes('Protected')) {
        add([
          sprite("Mode-protected"),
          area(),
          origin('botleft'),
          pos(width(), 80),
          move(LEFT, 130),
          "Mode-protected",
          fixed(),
          solid(),
          scale(2.5),
          body()
        ])
      }
    }
    // Phase2 ends
  })

  // play thunder sound effect
  loop(15, () => {
    soundThunder.stop()
    soundThunder.play()
  })

  loop(4, () => {
    // Phase3 begins
    if (score >= scorePhase3 && devDepsCounter >= 6) {
      devDepsCounter = 0
      if (helpers.includes('Mode-filterdevs')) {
        add([
          sprite("Mode-filterdevs"),
          area(),
          origin('botleft'),
          pos(width(), 80),
          move(LEFT, 150),
          "Mode-filterdevs",
          fixed(),
          solid(),
          scale(2.5),
          body()
        ])
      }
    }
    // Phase3 ends
  })

  loop(1.7, () => {
    // Phase3 begins
    if (score >= scorePhase3) {
      if (helpers.includes('Mode-filterdevs')) {
        devDepsCounter++
        add([
          sprite("npmbox-dev"),
          area(),
          origin('botleft'),
          pos(width(), height() - FLOOR_HEIGHT),
          move(LEFT, 150),
          "DevDeps",
          fixed(),
          solid(),
          scale(0.5)
        ])
      }
    }
    // Phase3 ends
  })

  let railTimeout = 1
  loop(1, () => {

    // if this helper doesn't exist in our array box, then it means the user
    // already took it. great for them, let's add some rails now to the screen
    if (!helpers.includes('Patch-Jumper')) {
      // print rails to the screen
      let randomNumber = randi(0, 30)

      if (railTimeout > 0) {
        railTimeout -= 1
        return
      }

      if (randomNumber % 5 === 0) {
        // on the first rail apperance we want to increase
        // the speed in which packages are being spawned
        SPAWN_PACKAGES_TOP_SPEED = 2.2

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
    }
  })

  loop(3, () => {
    // Phase1 begins
    if (score >= scorePhase1 && score <= scorePhase2) {
      // show the patch jumper helper
      if (helpers.includes('Patch-Jumper')) {
        const PatchJumper = add([
          sprite("Patch-Jumper"),
          area(),
          origin('botleft'),
          pos(width(), height() - (FLOOR_HEIGHT * 2.5)),
          move(LEFT, 200),
          "Patch-Jumper",
          fixed(),
          solid(),
          scale(1)
        ])
      }
    }
  })  

  onUpdate("Patch-Jumper", (element) => {
    if (element.pos.x < 0) {
      destroy(element)
    }
  })

  onUpdate("package", (element) => {
    if (element.pos.x < 0) {
      destroy(element)
    }
  })

  onUpdate("rail", (element) => {
    // scaled element to be 5x so need to account for bigger size
    // of just element.width
    if (element.pos.x < -300) {
      destroy(element)
    }
  })

  onUpdate("label", (element) => {
    if (element.pos.x < 0) {
      destroy(element)
    }
  })

  onUpdate("DevDeps", (element) => {
    if (element.pos.x < 0) {
      destroy(element)
    }
  })

  onUpdate("Mode-filterdevs", (element) => {
    if (element.pos.x < 0) {
      destroy(element)
    }
  })

  onUpdate("Mode-protected", (element) => {
    if (element.pos.x < 0) {
      destroy(element)
    }
  })

  function spawnPackages() {
    const npmPackage = add([
      sprite("npmbox", {anim: packagesAnimType}),
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
      'label',
      pos(width(), height() - 100)
    ])

    wait(rand(0.8, SPAWN_PACKAGES_TOP_SPEED), () => {
      spawnPackages()
    })
  }

  spawnPackages()

}) //end game scene

scene("lose", () => {
  gameMusic.stop()
  gameMusicIntro.play()

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

  scene('instructions', () => {
    gameMusic.stop()
    soundThunder.stop()
    gameMusicIntro.play()

    add([
      text('Dependency Frost\n\n\nYou are patch, the dog\nYour mission is to avoid vulnerable package versions\nCollect super powers along your journey\n\n\n\n\nPress space to start game!', {
        size: 28,
        font: 'apl386'
      }),
      pos(width()/2, height()/2),
      origin('center')
    ]);

    keyPress('space', () => {
      score = 0
      go('game');
    });
    
  })

go("instructions")

