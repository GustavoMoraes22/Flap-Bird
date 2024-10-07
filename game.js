
//board
let board
let boardWidth = 360
let boarHeight = 640
let context
let gameStarted = false

let gameOverImg

//onload game
let onloadImg

//bird
let birdWidth = 34
let birdHeight = 24
let birdX = boardWidth / 8
let birdY = boarHeight / 2

let birdUpImg
let birdMidImg
let birdDownImg

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
}

//pipe
let pipeArray = []
let pipeWidth = 64
let pipeHeight = 512
let pipeX = boardWidth
let pipeY = 0

let topPipeImg
let bottonPipeImg

//physics
let velocityX = -4   // cano vai se mover para a esquerda
let velocityY = 0 // passaro vai pular
let gravity = 0.4 // peso da gravidade sobre o passaro
let gameOver = false
let score = 0

// score logic
let scoreImage = []
for(let i = 0; i < 10 ; i++ ){
    let img = new Image()
    img.src = `./assets/sprites/${i}.png`
    scoreImage.push(img)
}

//audio
let hitSound
let wingSound
let pointSound

window.onload = function () {
    board = document.getElementById('gameCanvas')
    board.height = boarHeight
    board.width = boardWidth
    context = board.getContext('2d') // usado para desenhar dentro do elemento canvas 
    
    // load images
    
    onloadImg = new Image()
    onloadImg.src = './assets/sprites/message.png'
    onloadImg.onload = function(){
        context.drawImage(
            onloadImg,
            (boardWidth - onloadImg.width) / 2,
            (boarHeight - onloadImg.height) /2,
            onloadImg.width,
            onloadImg.height
        )//usado para desenhar 
    }

    birdUpImg = new Image()
    birdUpImg.src = "./assets/sprites/redbird-upflap.png"

    birdDownImg = new Image()
    birdDownImg.src = "./assets/sprites/redbird-downflap.png"

    birdMidImg = new Image()
    birdMidImg.src = "./assets/sprites/redbird-midflap.png"
    birdMidImg.onload = function(){
        context.drawImage(
            birdMidImg,
            bird.x,
            bird.y,
            bird.width,
            bird.height
        )
    }

    topPipeImg = new Image()
    topPipeImg.src = './assets/sprites/toppipe.png'

    bottonPipeImg = new Image()
    bottonPipeImg.src = './assets/sprites/bottompipe.png'

    gameOverImg = new Image()
    gameOverImg.src = './assets/sprites/gameover.png'

    //load sounds

    hitSound = new Audio('./assets/audios/hit.wav')
    wingSound = new Audio('./assets/audios/wing.wav')
    pointSound = new Audio('./assets/audios/point.wav')

}

window.addEventListener('keydown' , ()=>{

    if(!gameStarted){
        gameStarted = true
         // Inicie o jogo quando uma tecla for pressionada
        startGame()
    }

})

function startGame(){
    requestAnimationFrame(update)//fala para o navegador que deseja-se realizar uma animação
    setInterval(placePipes,1500)
    window.addEventListener('keydown', moveBird )
}

function update(){
    requestAnimationFrame(update)

    if(gameOver){
        return
    }

    context.clearRect(0,0, board.width, board.height)

    //bird
    velocityY += gravity
    let birdImgToUse
    if(velocityY < 0){
         // Inicie o jogo quando uma tecla for pressionada
        birdImgToUse  = birdUpImg
    }else if(velocityY > 0){
        // Se o pássaro estiver descendo
        birdImgToUse  = birdDownImg
    }else{
        // Se o pássaro estiver parado (não subindo nem descendo)
        birdImgToUse = birdMidImg
    }

    bird.y = Math.max(bird.y + velocityY, 0)
    context.drawImage(birdImgToUse, bird.x,bird.y,bird.width,bird.height)

    if(bird.y > board.height){
        gameOver = true
    }

    //pipe

    for(let i = 0; i < pipeArray.length; i++){
        let pipe = pipeArray[i]

        pipe.x += velocityX
        context.drawImage(
            pipe.img,
            pipe.x,
            pipe.y,
            pipe.width,
            pipe.height
        )

        if(!pipe.passed && bird.x > pipe.x + pipe.width){
            score += 0.5 
            pipe.passed = true

            pointSound.play()
        }

        if(detectCollision(bird,pipe)){
            gameOver = true
        }
    }


    //clear pipe

    while(pipeArray.length > 0 && pipeArray[0].x < -pipeWidth){
        pipeArray.shift() // remove o primeiro elemento do array
    }

    //score
    drawScore(score)

    if(gameOver){
        hitSound.play() 
        context.drawImage(
            gameOverImg,
            (board.width - gameOverImg.width) / 2,
            (board.height - gameOverImg.height) / 2
        )
      
    }
}

function placePipes(){
    if(gameOver){
        return
    }

    let randompipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2)
    let openingSpace = board.height / 4

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randompipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }

    pipeArray.push(topPipe)

    let bottompipe = {
        img: bottonPipeImg,
        x: pipeX,
        y: randompipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }

    pipeArray.push(bottompipe)
}

function moveBird(){
    velocityY = -6
    if(gameOver){
        bird.y = birdY
        pipeArray = []
        score = 0
        gameOver = false
    }
    wingSound.play()

}

function detectCollision(a,b){
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y

}

function drawScore(){

    let scoreStr = score.toString() // Converte o score para string
    let digitWidth = scoreImage[0].width // Largura de cada dígito
    let digitHeight = scoreImage[0].height // Altura de cada dígito
    let totalWidth = digitWidth + scoreStr.length // Largura total do score

     // Calcula a posição inicial do primeiro dígito para centralizá-lo

    let startX = (boardWidth - totalWidth) / 2

     // Desenha cada dígito do score no canvas

    for(let i = 0 ; i < scoreStr.length; i++ ){
        let digit = parseInt(scoreStr[i]) // Converte o dígito de string para número
        let x = startX + i * digitWidth // Posição horizontal do dígito
        let y = 140 // Posição vertical do dígito
        context.drawImage(scoreImage[digit],x,y,digitWidth,digitHeight)
    }

}

