//Game constant
const HEIGHT = 30;
const WIDTH = 90;
const MAX_BOUNCE_ANGLE = Math.PI / 5;
const BALL_SPEED = 1;

//Player Score
let player1_score = 0;
let player2_score = 0;

//Initialisation of players and balls
let player1 = Math.floor(HEIGHT / 2);
let player2 = Math.floor(HEIGHT / 2);
let ball = {x : WIDTH / 2, y : Math.floor(HEIGHT / 2), dx : Math.random() < 0.5 ? -1 : 1 , dy : Math.random() < 0.5 ? -1 : 1};

//Data
let velocity_use = 0;
let velocity1 = 0;
let velocity2 = 0;
let last_velocity1 = player1;
let last_velocity2 = player2;
let effect = 0.5;

//Size
let player_size = 3;
let ball_size = 1;

//Map
let player1_array = [];
let player2_array = [];
let ball_array = [];

//IA
let IA = true;
let error_margin = 85;
let target_IA = {x : WIDTH / 2, y : Math.floor(HEIGHT / 2)};

//Mode
let pause = false;
let vision = false;

//Vision
let futur_vision = 60;
let ball_futur = {x : WIDTH / 2, y : Math.floor(HEIGHT / 2), dx : Math.random() < 0.5 ? -1 : 1 , dy : Math.random() < 0.5 ? -1 : 1};
let ball_array_futur = [];

function count_array_futur(){
	for (let x = Math.round(ball_futur.x) - ball_size + 1; x < Math.round(ball_futur.x) + ball_size; x++){
		for (let y = Math.round(ball_futur.y) - ball_size + 1; y < Math.round(ball_futur.y) + ball_size; y++){
			ball_array_futur.push({x,y});
		}
	}
}

function futur(){
	ball_futur = {...ball};
	for (let t = 0; t < futur_vision; t++){
		ball_futur.x += ball_futur.dx;
		ball_futur.y += ball_futur.dy;
		if (ball_futur.y <= ball_size - 1 || ball_futur.y >= HEIGHT - (ball_size)) ball_futur.dy *= -1;
		if (ball_futur.dx < 0 && ball_futur.x <= (ball_size + 1)
			&& player1_array.includes(Math.round(ball_futur.y))){
			let hit_pos = (ball_futur.y - player1) / ((player_size * 2 + 1) / 2);
			if (hit_pos < -1) hit_pos = -1;
			if (hit_pos > 1) hit_pos = 1;
			let bounce_angle = hit_pos * MAX_BOUNCE_ANGLE;
			ball_futur.dx = BALL_SPEED * Math.cos(bounce_angle);
			ball_futur.dy = BALL_SPEED * Math.sin(bounce_angle);
			if (ball_futur.dx < 0) ball_futur.dx = Math.abs(ball_futur.dx);
			// Velocity from player
			ball_futur.dy += velocity1 * effect
		}
		else if (ball_futur.dx > 0 && ball_futur.x >= WIDTH - (ball_size + 2)
				&& player2_array.includes(Math.round(ball_futur.y))){
			let hit_pos = (ball_futur.y - player2) / ((player_size * 2 + 1) / 2);
			if (hit_pos < -1) hit_pos = -1;
			if (hit_pos > 1) hit_pos = 1;
			let bounce_angle = hit_pos * MAX_BOUNCE_ANGLE;
			ball_futur.dx = -BALL_SPEED * Math.cos(bounce_angle);
			ball_futur.dy = BALL_SPEED * Math.sin(bounce_angle);
			if (ball_futur.dx > 0) ball_futur.dx = -Math.abs(ball_futur.dx);
			// Velocity from player
			ball_futur.dy += velocity2 * effect
		}
		if (ball_futur.x < 0) return ;
		else if (ball_futur.x > WIDTH - 1) return ;
		if (ball_futur.y < 0) ball_futur.y = 0;
		else if (ball_futur.y > HEIGHT - 1) ball_futur.y = HEIGHT - 1 ;
		count_array_futur();
	}
}

function searchIA(){
	let lowerindex = -1;
	for (let i = error_margin; i < WIDTH - 1; i++){
		for (let j = 0; j < HEIGHT - 1; j++){
			let index = ball_array_futur.findIndex(b => b.x === i && b.y === j);
			if (index != -1){
				if (lowerindex == -1 || index < lowerindex)
					lowerindex = index;
			}
		}
	}
	target_IA = {x : WIDTH / 2, y : Math.floor(HEIGHT / 2)};
	if (lowerindex == -1)
		return ;
	target_IA = ball_array_futur[lowerindex];
}

function moveIA(){
	if (target_IA.y > player2 && player2 < HEIGHT - (player_size + 1)) player2++;
	if (target_IA.y < player2 && player2 > player_size) player2--;
	if (player2 < player_size)
		player2 = player_size;
}

function count_array(){
	player1_array = [];
	player2_array = [];
	ball_array = [];
	for (let i = 0 - player_size; i <= player_size; i++){
		player1_array.push(player1 + i);
		player2_array.push(player2 + i);
	}
	for (let x = Math.round(ball.x) - ball_size + 1; x < Math.round(ball.x) + ball_size; x++){
		for (let y = Math.round(ball.y) - ball_size + 1; y < Math.round(ball.y) + ball_size; y++){
			ball_array.push({x,y});
		}
	}
}

function draw(){
	count_array();
	let lines = [];
	let linestart = "-";
	for (let i = 0; i <= WIDTH; i++){
		linestart += "-";
	}
	lines.push(linestart);
	for (let i = 0; i < HEIGHT; i++){
		let line = "|";
		for (let j = 0; j < WIDTH; j++){
			let obj = {x : i, y : j};
			if (player1_array.includes(i) && j === 0) line += "\x1b[47m\x1b[37m-\x1b[0m";
			else if (player2_array.includes(i) && j === WIDTH - 1) line += "\x1b[47m\x1b[37m-\x1b[0m";
			else if (ball_array.some(b => b.x === j && b.y === i)) line += "\x1b[47m\x1b[37m-\x1b[0m";
			else if (vision == true && ball_array_futur.some(b => b.x === j && b.y === i)){
				if (j <= 0 || j >= WIDTH - 1)
					line += "\x1b[44m\x1b[34m-\x1b[0m";
				else
					line += "\x1b[41m\x1b[31m-\x1b[0m";
			} 
			else if (j == WIDTH / 2) line += "\x1b[46m\x1b[36m-\x1b[0m"; 
			else line += " ";
		}
		line += "|";
		lines.push(line);
	}
	let lineend = "-";
	for (let i = 0; i <= WIDTH; i++){
		lineend += "-";
	}
	lines.push(lineend);
	// console.clear();
	process.stdout.write('\x1Bc');
	console.log(lines.join('\n'));
	console.log("Player 1 Score :", player1_score);
	console.log("Player 2 Score :", player2_score);
	console.log("\nData :");
	console.log("Velocity use :", velocity_use);
	console.log("Player 1 Velocity :", velocity1);
	console.log("Player 2 Velocity :", velocity2);
	console.log("Paddel Size :", player_size);
	console.log("Ball Size :", ball_size);
	console.log("Ball coor :", ball.x, ",", ball.y, "Ball dir :", ball.dx, ",", ball.dy);
	console.log("\nMode :");
	console.log("Vision active :", vision, "Range :", futur_vision);
	console.log("Ball futur coor :", ball_futur.x, ",", ball_futur.y, "Ball futur dir :", ball_futur.dx, ",", ball.dy);
	console.log("");
	console.log("Pause active :", pause);
}

function moveBall(){
	ball.x += ball.dx;
	ball.y += ball.dy;
		
	if (ball.y <= ball_size - 1 || ball.y >= HEIGHT - (ball_size)) ball.dy *= -1;
	if (ball.dx < 0 && ball.x <= (ball_size + 1)
			&& player1_array.includes(Math.round(ball.y))){
		let hit_pos = (ball.y - player1) / ((player_size * 2 + 1) / 2);
		if (hit_pos < -1) hit_pos = -1;
		if (hit_pos > 1) hit_pos = 1;
		let bounce_angle = hit_pos * MAX_BOUNCE_ANGLE;
		ball.dx = BALL_SPEED * Math.cos(bounce_angle);
		ball.dy = BALL_SPEED * Math.sin(bounce_angle);
		if (ball.dx < 0) ball.dx = Math.abs(ball.dx);
		// Velocity from player
		ball.dy += velocity1 * effect
		if (velocity1 != 0)
			velocity_use++;

	}
	else if (ball.dx > 0 && ball.x >= WIDTH - (ball_size + 2)
			&& player2_array.includes(Math.round(ball.y))){
		let hit_pos = (ball.y - player2) / ((player_size * 2 + 1) / 2);
		if (hit_pos < -1) hit_pos = -1;
		if (hit_pos > 1) hit_pos = 1;
		let bounce_angle = hit_pos * MAX_BOUNCE_ANGLE;
		ball.dx = -BALL_SPEED * Math.cos(bounce_angle);
		ball.dy = BALL_SPEED * Math.sin(bounce_angle);
		if (ball.dx > 0) ball.dx = -Math.abs(ball.dx);
		// Velocity from player
		ball.dy += velocity2 * effect
		if (velocity1 != 0)
			velocity_use++;

	}
	if (ball.x < 0){
		player2_score++;
		ball.x = Math.floor(WIDTH / 2);
		ball.y = Math.floor(HEIGHT / 2);
		let angle = (Math.random() - 0.5) * MAX_BOUNCE_ANGLE;
		let dir = Math.random() < 0.5 ? 1 : -1;
		ball.dx = dir * BALL_SPEED * Math.cos(angle);
		ball.dy = BALL_SPEED * Math.sin(angle);
	}
	else if (ball.x > WIDTH - 1){
		player1_score++;
		ball.x = Math.floor(WIDTH / 2);
		ball.y = Math.floor(HEIGHT / 2);
		let angle = (Math.random() - 0.5) * MAX_BOUNCE_ANGLE;
		let dir = Math.random() < 0.5 ? 1 : -1;
		ball.dx = dir * BALL_SPEED * Math.cos(angle);
		ball.dy = BALL_SPEED * Math.sin(angle);
	}
	if (ball.y < 0) ball.y = 0;
	else if (ball.y > HEIGHT - 1) ball.y = HEIGHT - 1 ;
}

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', (key) => {
	key = key.toString();
	if (key === '\u0003') process.exit();
	if (key === 'w' && player1 > player_size) player1--;
	if (key === 's' && player1 < HEIGHT - (player_size + 1)) player1++;
	if (key === '\u001b[A' && player2 > player_size && IA == false) player2--;
	if (key === '\u001b[B' && player2 < HEIGHT - (player_size + 1) && IA == false) player2++;
	if (key === 'p' && pause == true) pause = false;
	else if (key === 'p' && pause == false) pause = true;
	if (key === 'v' && vision == true) vision = false;
	else if (key === 'v' && vision == false) vision = true;
	if (key === ',' && vision == true) futur_vision -= 1;
	if (key === '.' && vision == true) futur_vision += 1;
	if (key === '1' && ball_size < 15) ball_size += 1;
	if (key === '2' && ball_size > 1) ball_size -= 1;
	if (key === '3' && player_size < 15) player_size += 1;
	if (key === '4' && player_size > 1) player_size -= 1;
	if (key === '\\' && IA == true) IA = false;
	else if (key === '\\' && IA == false) IA = true;
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
	if (vision == true || IA == true)
		futur();
	if (IA == true)
		moveIA();
	draw();
}, Math.round(50));

setInterval(() => {
	velocity1 = player1 - last_velocity1;
	velocity2 = player2 - last_velocity2;
	last_velocity1 = player1;
	last_velocity2 = player2;
}, 150);

setInterval(() => {
	if (IA == true)
		searchIA();
}, 1000);