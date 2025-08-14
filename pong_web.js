//Game constant
const HEIGHT = 60;
const WIDTH = 80;
const MAX_BOUNCE_ANGLE = Math.PI / 5;
const BALL_SPEED = 0.5;
const PLAYER_SPEED = 1;

//Web constant
const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');
const SCALE_X = canvas.width / WIDTH;  // 10
const SCALE_Y = canvas.height / HEIGHT; // 10

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
let effect = 0.25;

//Size
let top_margin_size = 1;
let bounce_margin_size = 8;
let kill_margin_size = 4;
let player_size = 5;
let ball_size = 1;

//Map
let player1_array = [];
let player2_array = [];
let ball_array = [];

//IA
let IA = true;
let error_margin = 70;
let target_IA = {x : WIDTH / 2, y : Math.floor(HEIGHT / 2)};

//Mode
let pause = false;
let vision = false;

//Vision
let futur_vision = 60;
let ball_futur = {x : WIDTH / 2, y : Math.floor(HEIGHT / 2), dx : Math.random() < 0.5 ? -1 : 1 , dy : Math.random() < 0.5 ? -1 : 1};
let ball_array_futur = [];
let ball_real_array_futur = [];

//Keys
// let player1_vel = 0;
// let player2_vel = 0;
// const PLAYER_MAX_SPEED = 0.6;
// const PLAYER_ACCEL = 0.08;
// const PLAYER_FRICTION = 0.85;
// let keyW = false, keyS = false, keyUp = false, keyDown = false;

function count_array_futur(touch){
	for (let x = ball_futur.x - ball_size + 1; x < ball_futur.x + ball_size; x++){
		for (let y = ball_futur.y - ball_size + 1; y < ball_futur.y + ball_size; y++){
			ball_real_array_futur.push({x,y,touch});
		}
	}
	for (let x = Math.round(ball_futur.x) - ball_size + 1; x < Math.round(ball_futur.x) + ball_size; x++){
		for (let y = Math.round(ball_futur.y) - ball_size + 1; y < Math.round(ball_futur.y) + ball_size; y++){
			ball_array_futur.push({x,y,touch});
		}
	}
}

function move_obj_ball(obj_ball){
	obj_ball.x += obj_ball.dx;
	obj_ball.y += obj_ball.dy;
	if (obj_ball.y <= ball_size + top_margin_size || obj_ball.y >= HEIGHT - (ball_size + top_margin_size)) obj_ball.dy *= -1;
	if (obj_ball.dx < 0 && obj_ball.x <= (ball_size + bounce_margin_size) && obj_ball.x >= kill_margin_size
			&& player1_array.includes(Math.round(obj_ball.y))){
		let hit_pos = (obj_ball.y - player1) / ((player_size * 2 + 1) / 2);
		if (hit_pos < -1) hit_pos = -1;
		if (hit_pos > 1) hit_pos = 1;
		let bounce_angle = hit_pos * MAX_BOUNCE_ANGLE;
		obj_ball.dx = BALL_SPEED * Math.cos(bounce_angle);
		obj_ball.dy = BALL_SPEED * Math.sin(bounce_angle);
		if (obj_ball.dx < 0) obj_ball.dx = Math.abs(obj_ball.dx);
		// Velocity from player
		obj_ball.dy += velocity1 * effect
		if (velocity1 != 0)
			velocity_use++;

	}
	else if (obj_ball.dx > 0 && obj_ball.x >= WIDTH - (ball_size + bounce_margin_size) && obj_ball.x <= WIDTH - kill_margin_size
			&& player2_array.includes(Math.round(obj_ball.y))){
		let hit_pos = (obj_ball.y - player2) / ((player_size * 2 + 1) / 2);
		if (hit_pos < -1) hit_pos = -1;
		if (hit_pos > 1) hit_pos = 1;
		let bounce_angle = hit_pos * MAX_BOUNCE_ANGLE;
		obj_ball.dx = -BALL_SPEED * Math.cos(bounce_angle);
		obj_ball.dy = BALL_SPEED * Math.sin(bounce_angle);
		if (obj_ball.dx > 0) obj_ball.dx = -Math.abs(obj_ball.dx);
		// Velocity from player
		obj_ball.dy += velocity2 * effect
		if (velocity1 != 0)
			velocity_use++;
	}
}

function futur(){
	ball_futur = {...ball};
	let touch = false;
	for (let t = 0; t < futur_vision; t++){
		let temp_obj_dx = ball_futur.dx;
		move_obj_ball(ball_futur);
		if (temp_obj_dx != ball_futur.dx){
			touch = true;
		}
		if (ball_futur.x < 0) return ;
		else if (ball_futur.x > WIDTH) return ;
		if (ball_futur.y < ball_size + top_margin_size) ball_futur.y = ball_size + top_margin_size;
		else if (ball_futur.y > HEIGHT - (ball_size + top_margin_size)) ball_futur.y = HEIGHT - (ball_size + top_margin_size);
		count_array_futur(touch);
	}
}

function searchIA(){
	if (ball_array_futur.includes(target_IA)) return ;
	let lowerindex = -1;
	for (let i = error_margin; i < WIDTH - (bounce_margin_size); i++){
		for (let j = 0; j < HEIGHT - 1; j++){
			let index = ball_array_futur.findIndex(b => b.x === i && b.y === j && b.touch == false);
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
	if (player2_array.includes(target_IA.y)) return ;
	if (target_IA.y > player2 && player2 < HEIGHT - (player_size + top_margin_size)) player2++;
	if (target_IA.y < player2 && player2 > player_size + top_margin_size) player2--;
	// searchIA();
}

function count_array_web(){
	player1_array = [];
	player2_array = [];
	ball_array = [];
	for (let i = 0 - player_size; i <= player_size; i++){
		player1_array.push(Math.round(player1) + i);
		player2_array.push(Math.round(player2) + i);
	}
	for (let x = Math.round(ball.x) - ball_size + 1; x < Math.round(ball.x) + ball_size; x++){
		for (let y = Math.round(ball.y) - ball_size + 1; y < Math.round(ball.y) + ball_size; y++){
			ball_array.push({x,y});
		}
	}
}

function draw_web(){
	count_array_web();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#FFFFFF";
	for (let i = 2.5; i < HEIGHT; i += 5) {
		ctx.fillRect((WIDTH/2 - 1) * SCALE_X, i * SCALE_Y, 2 * SCALE_X, 2 * SCALE_Y);
	}
	ctx.fillRect(0, 0, canvas.width, SCALE_Y);
	ctx.fillRect(0, (HEIGHT-1) * SCALE_Y, canvas.width, SCALE_Y);
	if (vision == true){
		for (obj of ball_real_array_futur){
			if (obj.touch == true) ctx.fillStyle = '#2233FF';
			else if (obj.x <= ball_size + kill_margin_size || obj.x >= WIDTH - (ball_size + kill_margin_size)) ctx.fillStyle = '#FF5500';
			else ctx.fillStyle = '#FF0000';
			const obx = obj.x * SCALE_X;
			const oby = obj.y * SCALE_Y;
			const obj_px = ball_size * 1.5 * SCALE_X;
			ctx.beginPath();
			ctx.arc(obx, oby, obj_px / 2, 0, 2 * Math.PI);
			ctx.fill();
		}
	}
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(5 * SCALE_X, (player1 - player_size) * SCALE_Y, SCALE_X * 2, SCALE_Y * player_size * 2);
	ctx.fillRect((WIDTH - 7) * SCALE_X, (player2 - player_size) * SCALE_Y, SCALE_X * 2, SCALE_Y * player_size * 2);
	const bx = ball.x * SCALE_X;
	const by = ball.y * SCALE_Y;
	const ball_px = ball_size * 1.5 * SCALE_X;
	ctx.beginPath();
	ctx.arc(bx, by, ball_px / 2, 0, 2 * Math.PI);
	ctx.fill();
}

function moveBall(){
	move_obj_ball(ball);
	if (ball.x < 0){
		player2_score++;
		ball.x = Math.floor(WIDTH / 2);
		ball.y = Math.floor(HEIGHT / 2);
		let angle = (Math.random() - 0.5) * MAX_BOUNCE_ANGLE;
		let dir = Math.random() < 0.5 ? 1 : -1;
		ball.dx = dir * BALL_SPEED * Math.cos(angle);
		ball.dy = BALL_SPEED * Math.sin(angle);
	}
	else if (ball.x > WIDTH){
		player1_score++;
		ball.x = Math.floor(WIDTH / 2);
		ball.y = Math.floor(HEIGHT / 2);
		let angle = (Math.random() - 0.5) * MAX_BOUNCE_ANGLE;
		let dir = Math.random() < 0.5 ? 1 : -1;
		ball.dx = dir * BALL_SPEED * Math.cos(angle);
		ball.dy = BALL_SPEED * Math.sin(angle);
	}
	if (ball.y < ball_size + top_margin_size) ball.y = ball_size + top_margin_size;
	else if (ball.y > HEIGHT - (ball_size + top_margin_size)) ball.y = HEIGHT - (ball_size + top_margin_size) ;
}

document.addEventListener('keydown', function(event) {
	key = event.key;
	if (key === 'w' && player1 > player_size + top_margin_size) player1 -= 1 * PLAYER_SPEED;
	if (key === 's' && player1 < HEIGHT - (player_size + top_margin_size)) player1 += 1 * PLAYER_SPEED;
	if (key === 'ArrowUp' && player2 > player_size + top_margin_size && IA == false) player2 -= 1 * PLAYER_SPEED;
	if (key === 'ArrowDown' && player2 < HEIGHT - (player_size + top_margin_size) && IA == false) player2 += 1 * PLAYER_SPEED;
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

function afficherMessage(msg) {
    ctx.font = "40px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(msg, 100, canvas.height/2);
}

let gameover = false;
function gameLoop() {
	if (player1_score >= 10){
		gameover = true;
		afficherMessage("Player 1 Wins !!!");
		return ;
	}
	else if (player2_score >= 10){
		gameover = true;
		afficherMessage("Player 2 Wins !!!");
		return ;
	}
	if (pause == false)
		moveBall();
	ball_array_futur = [];
	ball_real_array_futur = [];
	if (vision == true || IA == true)
		futur();
	if (IA == true)
		moveIA();
	draw_web();
	if (!gameover) requestAnimationFrame(gameLoop);
}

gameLoop();

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