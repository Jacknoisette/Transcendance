let player1_score = 0;
let player2_score = 0;
const HEIGHT = 30;
const WIDTH = 90;
let player1 = Math.floor(HEIGHT / 2);
let player2 = Math.floor(HEIGHT / 2);
const player_size = 3;
let ball = {x : WIDTH / 2, y : Math.floor(HEIGHT / 2), dx : Math.random() < 0.5 ? -1 : 1 , dy : Math.random() < 0.5 ? -1 : 1};
const ball_size = 3;
let player1_array = [];
let player2_array = [];
let ball_array = [];
let speed = 1;

let pause = false;

let vision = false;
let futur_vision = 10;
let ball_futur = {x : WIDTH / 2, y : Math.floor(HEIGHT / 2), dx : Math.random() < 0.5 ? -1 : 1 , dy : Math.random() < 0.5 ? -1 : 1};
let ball_array_futur = [];

function count_array_futur(){
    for (let x = ball_futur.x - ball_size + 1; x < ball_futur.x + ball_size; x++){
        for (let y = ball_futur.y - ball_size + 1; y < ball_futur.y + ball_size; y++){
            ball_array_futur.push({x,y});
        }
    }
}

function futur(){
    ball_futur = {...ball};
    for (let t = 0; t < futur_vision; t++){
        ball_futur.x += ball_futur.dx * speed;
        ball_futur.y += ball_futur.dy * speed;
        if (ball_futur.y <= ball_size || ball_futur.y >= HEIGHT - (ball_size + 1)) ball_futur.dy *= -1;
        if (ball_futur.x <= (ball_size + 2) && player1_array.includes(ball_futur.y)) ball_futur.dx *= -1;
        else if (ball_futur.x >= WIDTH - (ball_size + 3) && player2_array.includes(ball_futur.y)) ball_futur.dx *= -1;
        if (ball_futur.x < 0) return ;
        else if (ball_futur.x > WIDTH - 1) return ;
        count_array_futur();
    }
}

function count_array(){
    player1_array = [];
    player2_array = [];
    ball_array = [];
    for (let i = 0 - player_size; i <= player_size; i++){
        player1_array.push(player1 + i);
        player2_array.push(player2 + i);
    }
    for (let x = ball.x - ball_size + 1; x < ball.x + ball_size; x++){
        for (let y = ball.y - ball_size + 1; y < ball.y + ball_size; y++){
            ball_array.push({x,y});
        }
    }
}

function draw(){
    count_array();
    let lines = [];
    for (let i = 0; i < HEIGHT; i++){
        let line = "";
        for (let j = 0; j < WIDTH; j++){
            let obj = {x : i, y : j};
            if (player1_array.includes(i) && j === 0) line += "\x1b[47m\x1b[371m-\x1b[0m";
            else if (player2_array.includes(i) && j === WIDTH - 1) line += "\x1b[47m\x1b[37m-\x1b[0m";
            else if (ball_array.some(b => b.x === j && b.y === i)) line += "\x1b[47m\x1b[37m-\x1b[0m";
            else if (ball_array_futur.some(b => b.x === j && b.y === i)) line += "\x1b[41m\x1b[31m-\x1b[0m";
            else line += " ";
        }
        lines.push(line);
    }
    console.clear();
    console.log(lines.join('\n'));
    console.log("Player 1 Score :", player1_score);
    console.log("Player 2 Score :", player2_score);
}

function moveBall(){
    ball.x += ball.dx * speed;
    ball.y += ball.dy * speed;
    
    if (ball.y <= ball_size || ball.y >= HEIGHT - (ball_size + 1)) ball.dy *= -1;
    if (ball.x <= (ball_size + 2) && player1_array.includes(ball.y)) ball.dx *= -1;
    else if (ball.x >= WIDTH - (ball_size + 3) && player2_array.includes(ball.y)) ball.dx *= -1;

    if (ball.x < 0){
        player2_score++;
        ball.x = Math.floor(WIDTH / 2);
        ball.y = Math.floor(HEIGHT / 2);
        ball.dx = Math.random() < 0.5 ? -1 : 1;
        ball.dy = Math.random() < 0.5 ? -1 : 1;
    }
    else if (ball.x > WIDTH - 1){
        player1_score++;
        ball.x = Math.floor(WIDTH / 2);
        ball.y = Math.floor(HEIGHT / 2);
        ball.dx = Math.random() < 0.5 ? -1 : 1;
        ball.dy = Math.random() < 0.5 ? -1 : 1;
    }
}

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', (key) => {
    key = key.toString();
    if (key === '\u0003') process.exit();
    if (key === 'w' && player1 > player_size) player1--;
    if (key === 's' && player1 < HEIGHT - (player_size + 1)) player1++;
    if (key === '\u001b[A' && player2 > player_size) player2--;
    if (key === '\u001b[B' && player2 < HEIGHT - (player_size + 1)) player2++;
    if (key === 'p' && pause == true) pause = false;
    else if (key === 'p' && pause == false) pause = true;
    if (key === 'v' && vision == true) vision = false;
    else if (key === 'v' && vision == false) vision = true;
    if (key === ',' && vision == true) futur_vision -= 1;
    if (key === '.' && vision == true) futur_vision += 1;

});

setInterval(() => {
    if (player1_score >= 10){
        console.log("Player 1 Wins !!!");
        process.exit();
    }
    else if (player2_score >= 10){
        console.log("Player 2 Wins !!!");
        process.exit()
    }
    if (pause == false)
        moveBall();
    ball_array_futur = [];
    if (vision == true)
        futur();
    draw();
}, 100);
