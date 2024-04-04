const cvs = document.getElementById("breakout");
const ctx = cvs.getContext("2d");

// граница для канваса
cvs.style.border = "1px solid #0ff";

// линии кирпичиков
ctx.lineWidth = 4;

// переменные
const PADDLE_WIDTH = 100;
const PADDLE_MARGIN_BOTTOM = 50;
const PADDLE_HEIGHT = 20;
const BALL_RADIUS = 8;
let LIFE = 3;
let SCORE = 0;
const SCORE_UNIT = 10;
let LEVEL = 1;
const MAX_LEVEL = 4;
let GAME_OVER = false;
let leftArrow = false;
let rightArrow = false;

// СОЗДАЕМ ПЛАТФОРМУ
const paddle = {
    x : cvs.width/2 - PADDLE_WIDTH/2,
    y : cvs.height - PADDLE_MARGIN_BOTTOM - PADDLE_HEIGHT,
    width : PADDLE_WIDTH,
    height : PADDLE_HEIGHT,
    dx :5
}

// РИСУЕМ ПЛАТФОРМУ
function drawPaddle(){
    ctx.fillStyle = "#00FFFF";
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// КОНТРОЛИМ ПЛАТФОРМУ ЧЕРЕЗ СТРЕЛОЧКИ
document.addEventListener("keydown", function(event){
   if(event.keyCode == 37){
       leftArrow = true;
   }else if(event.keyCode == 39){
       rightArrow = true;
   }
});
document.addEventListener("keyup", function(event){
   if(event.keyCode == 37){
       leftArrow = false;
   }else if(event.keyCode == 39){
       rightArrow = false;
   }
});

// ПЕРЕМЕЩАЕМ ПЛАТФОРМУ
function movePaddle(){
    if(rightArrow && paddle.x + paddle.width < cvs.width){
        paddle.x += paddle.dx;
    }else if(leftArrow && paddle.x > 0){
        paddle.x -= paddle.dx;
    }
}

// СОЗДАЕМ ШАРИК
const ball = {
    x : cvs.width/2,
    y : paddle.y - BALL_RADIUS,
    radius : BALL_RADIUS,
    speed : 4,
    dx : 3 * (Math.random() * 2 - 1),
    dy : -3
}

// РИСУЕМ ШАРИК
function drawBall(){
    ctx.beginPath();
    
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fillStyle = "#00FFFF";
    ctx.fill();
    
    ctx.strokeStyle = "#00FFFF";
    ctx.stroke();
    
    ctx.closePath();
}

// ПЕРЕМЕЩАЕМ ШАРИК
function moveBall(){
    ball.x += ball.dx;
    ball.y += ball.dy;
}

// СТОЛКНОВЕНИЕ ШАРИКА СО СТЕНОЙ
function ballWallCollision(){
    if(ball.x + ball.radius > cvs.width || ball.x - ball.radius < 0){
        ball.dx = - ball.dx;
        WALL_HIT.play();
    }
    
    if(ball.y - ball.radius < 0){
        ball.dy = -ball.dy;
        WALL_HIT.play();
    }
    
    if(ball.y + ball.radius > cvs.height){
        LIFE--; 
        LIFE_LOST.play();
        resetBall();
    }
}

// СБРОС ШАРИКА
function resetBall(){
    ball.x = cvs.width/2;
    ball.y = paddle.y - BALL_RADIUS;
    ball.dx = 3 * (Math.random() * 2 - 1);
    ball.dy = -3;
}

// СТОЛКНОВЕНИЕ ШАРИКА И ПЛАТФОРМЫ
function ballPaddleCollision(){
    if(ball.x < paddle.x + paddle.width && ball.x > paddle.x && paddle.y < paddle.y + paddle.height && ball.y > paddle.y){

        PADDLE_HIT.play();
        let collidePoint = ball.x - (paddle.x + paddle.width/2);
        collidePoint = collidePoint / (paddle.width/2);
        let angle = collidePoint * Math.PI/3;
            
        ball.dx = ball.speed * Math.sin(angle);
        ball.dy = - ball.speed * Math.cos(angle);
    }
}

// СОЗДАЕМ КИРПИЧИКИ
const brick = {
    row : 1,
    column : 5,
    width : 55,
    height : 20,
    offSetLeft : 20,
    offSetTop : 20,
    marginTop : 40,
    fillColor : "#FB2DCD",
    strokeColor : "#00FFFF"
}

let bricks = [];

function createBricks(){
    for(let r = 0; r < brick.row; r++){
        bricks[r] = [];
        for(let c = 0; c < brick.column; c++){
            bricks[r][c] = {
                x : c * ( brick.offSetLeft + brick.width ) + brick.offSetLeft,
                y : r * ( brick.offSetTop + brick.height ) + brick.offSetTop + brick.marginTop,
                status : true
            }
        }
    }
}

createBricks();

// РИСУЕМ КИРПИЧИКИ
function drawBricks(){
    for(let r = 0; r < brick.row; r++){
        for(let c = 0; c < brick.column; c++){
            let b = bricks[r][c];
            // если кирпичик не разрушился
            if(b.status){
                ctx.fillStyle = brick.fillColor;
                ctx.fillRect(b.x, b.y, brick.width, brick.height);
                
                ctx.strokeStyle = brick.strokeColor;
                ctx.strokeRect(b.x, b.y, brick.width, brick.height);
            }
        }
    }
}

// СТОЛКНОВЕНИЕ ШАРИКА И КИРПИЧИКА
function ballBrickCollision(){
    for(let r = 0; r < brick.row; r++){
        for(let c = 0; c < brick.column; c++){
            let b = bricks[r][c];
            // если кирпичик не разрушился
            if(b.status){
                if(ball.x + ball.radius > b.x && ball.x - ball.radius < b.x + brick.width && ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + brick.height){
                    BRICK_HIT.play();
                    ball.dy = - ball.dy;
                    b.status = false; // разрушился
                    SCORE += SCORE_UNIT;
                }
            }
        }
    }
}


// ИГРОВАЯ СТАТИСТИКА 
function showGameStats(text, textX, textY, img, imgX, imgY){
    // text
    ctx.fillStyle = "#FFF";
    ctx.font = "25px Germania One";
    ctx.fillText(text, textX, textY);
    
    // image
    ctx.drawImage(img, imgX, imgY, width = 25, height = 25);
}

// DRAW FUNCTION
function draw(){
    drawPaddle();
    
    drawBall();
    
    drawBricks();
    
    // ОЧКИ
    showGameStats(SCORE, 35, 25, SCORE_IMG, 5, 5);
    // ЖИЗНИ
    showGameStats(LIFE, cvs.width - 25, 25, LIFE_IMG, cvs.width-55, 5); 
    // УРОВЕНЬ
    showGameStats(LEVEL, cvs.width/2, 25, LEVEL_IMG, cvs.width/2 - 30, 5);
}

// gameover
function gameOver(){
    if(LIFE <= 0){
        showYouLose();
        GAME_OVER = true;
    }
}

// level up
function levelUp(){
    let isLevelDone = true;
    
    // ПРОВЕРКА ВСЕ ЛИ КИРПИЧИКИ РАЗРУШЕНЫ
    for(let r = 0; r < brick.row; r++){
        for(let c = 0; c < brick.column; c++){
            isLevelDone = isLevelDone && ! bricks[r][c].status;
        }
    }
    
    if(isLevelDone){
        WIN.play();
        
        if(LEVEL >= MAX_LEVEL){
            showYouWin();
            GAME_OVER = true;
            return;
        }
        brick.row++;
        createBricks();
        ball.speed += 0.5;
        resetBall();
        LEVEL++;
    }
}

// ОБНОВЛЯЕМ ЭКРАН
function update(){
    movePaddle();
    
    moveBall();
    
    ballWallCollision();
    
    ballPaddleCollision();
    
    ballBrickCollision();
    
    gameOver();
    
    levelUp();
}

// LOOP
function loop(){
    // чистим канвас
    ctx.drawImage(BG_IMG, 0, 0);
    
    draw();
    
    update();
    
    if(! GAME_OVER){
        requestAnimationFrame(loop);
    }
}
loop();


// выбираем звук
const soundElement  = document.getElementById("sound");

soundElement.addEventListener("click", audioManager);

function audioManager(){
    // смена картинок со звуком
    let imgSrc = soundElement.getAttribute("src");
    let SOUND_IMG = imgSrc == "img/SOUND_ON.svg" ? "img/SOUND_OFF.svg" : "img/SOUND_ON.svg";
    
    soundElement.setAttribute("src", SOUND_IMG);
    
    // вкл выкл звука
    WALL_HIT.muted = WALL_HIT.muted ? false : true;
    PADDLE_HIT.muted = PADDLE_HIT.muted ? false : true;
    BRICK_HIT.muted = BRICK_HIT.muted ? false : true;
    WIN.muted = WIN.muted ? false : true;
    LIFE_LOST.muted = LIFE_LOST.muted ? false : true;
}

/* выбираем */
const gameover = document.getElementById("gameover");
const youwin = document.getElementById("youwin");
const youlose = document.getElementById("youlose");
const restart = document.getElementById("restart");
const again = document.getElementById("again");

//таблица рекордов
table.addEventListener("click", function(){
    setCookie();
    showScore();
    deleteAllCookies();
})

// чистим таблицу
clearStorage.addEventListener("click", function(){
    deleteAllCookies();
})

// рестарт
restart.addEventListener("click", function(){
    location.reload(); // обновляем страничку
})

again.addEventListener("click", function(){
    location.reload(); // обновляем страничку
})

// вин
function showYouWin(){
    gameover.style.display = "block";
    youwon.style.display = "block";
}

// гейм-овер
function showYouLose(){
    gameover.style.display = "block";
    youlose.style.display = "block";
}

// cookie
function deleteAllCookies() { // удаляем куки
    var cookies = document.cookie.split(";");
    
    for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    var eqPos = cookie.indexOf("=");
    var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT"; // время жизни куки
    }
    }
function setCookie(){
    let name=prompt("Введите ваше имя:"); // получаем от пользователя имя
    var cookies = document.cookie.split(";");
    for (var i = 0; i < 10; i++){
    var cookie = cookies[i];
    var eqPos = cookie.indexOf("=");
    document.cookie = name + " = " + SCORE + "\n"; // запись в куки
    }
    }
function showScore() {
    alert(document.cookie.split(";"));
    }