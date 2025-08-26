//Class
class Client {
	constructor(connection, id){
		this.connection = connection;
		this.id = id;
		this.in_game = false;
		this.side = "none";
	}
}
class Box {
	constructor(x, y, effect){
		this.x = x;
		this.y = y;
		this.effect = effect;
	}
}
class Obstacle {
	constructor(x, y){
		this.x = x;
		this.y = y;
	}
}
class Ball {
	constructor(x, y, dx ,dy){
		this.x = x;
		this.y = y;
		this.dx = dx;
		this.dy = dy;
	}
}

//Import
import * as utils from './pong_web_utils.js';

//Game constant
const HEIGHT = 60;
const WIDTH = 80;
const BASE_PLAYER_SPEED = 1;
const BASE_BALL_SPEED = 0.7;
const MAX_BOUNCE_ANGLE = Math.PI / 5;
let MAX_SCORE = 10;

//Game option
let local = false;
let IA = true;
let custom_mode = true;
let four_player = false; //Not used yet

//Game variable
let PLAYER_SPEED = BASE_PLAYER_SPEED;
let BALL_SPEED = BASE_BALL_SPEED;
let gamestart = false;
let gameover = false;
let point_value = 1;

//Player Input
const base_up_player1 = 'w';
const base_down_player1 = 's';
const base_up_player2 = (local == false) ? 'w' : 'ArrowUp';
const base_down_player2 = (local == false) ? 's' : 'ArrowDown';

let up_player1 = base_up_player1;
let down_player1 = base_down_player1;
let up_player2 = base_up_player2;
let down_player2 = base_down_player2;

//Player Score
let player1_score = 0;
let player2_score = 0;

//Initialisation of players and balls
let player1 = Math.floor(HEIGHT / 2);
let player2 = Math.floor(HEIGHT / 2);
let ball = new Ball(WIDTH / 2, Math.floor(HEIGHT / 2), Math.random() < 0.5 ? -1 : 1, Math.random() < 0.5 ? -1 : 1);
// {x : WIDTH / 2, y : Math.floor(HEIGHT / 2), dx : Math.random() < 0.5 ? -1 : 1 , dy : Math.random() < 0.5 ? -1 : 1};

//Ball Movement
let velocity1 = 0;
let velocity2 = 0;
let last_velocity1 = player1;
let last_velocity2 = player2;
let effect = 0.15;

//Player Movement
let player1_vel = 0;
let player2_vel = 0;
let keyW = false, keyS = false, keyUp = false, keyDown = false;

//Data
let exchange_nbr = 0;
let bounce_nbr = 0;
let velocity_use = 0;

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
let error_margin = 65;
let target_IA = {x : WIDTH / 2, y : Math.floor(HEIGHT / 2)};

//Mode
let pause = false;
let vision = false;

//Vision
let futur_vision = 60;
let ball_futur = new Ball(WIDTH / 2, Math.floor(HEIGHT / 2), Math.random() < 0.5 ? -1 : 1, Math.random() < 0.5 ? -1 : 1);
let ball_array_futur = [];
let ball_real_array_futur = [];

//Customization
let in_effect = false;
let box_array = [];
let true_speeding_ball = false;
let multiple_ball = false;
let multiple_ball_array = [];
let obstacle_array = [];
let holes = false;
let holes_array = [];
let negative = false;
let snake_mode = false;
let snake_array = [];
let invisible_player = false;
let meteorites = false;
let meteorites_array = [];
let gold_game = false;
let epic_moment = false;
let portal = false;
let invisible_ball_active = false;
let invisible_ball = false;

//IA Difficulty
/* 
The difficulties of the IA are :
	Impossible {0}: Max Stat
	Hard {1}: Almost as hard as Impossible
	Medium {2}: You can win the IA if you are good
	Easy {3}: You can win the IA if you are medium
	Peacefull {4}: You will win
*/
let IA_diff = 1;
switch (IA_diff){
	case 0 :
		error_margin = 0; futur_vision = 100; break;
	case 1 :
		error_margin = 65; futur_vision = 60; break;
	case 2 :
		error_margin = 55; futur_vision = 31; break;
	case 3 :
		error_margin = 41; futur_vision = 15; break;
	case 4 :
		error_margin = 31; futur_vision = 12; break;
}
let speeding_mode = false;

//Websocket
let clients = [];
let id = 0;
import Fastify from 'fastify';
import websocketPlugin from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify();

await fastify.register(websocketPlugin);
await fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'game'),
  prefix: '/',
});

fastify.register(async function (fastify){
	fastify.get('/ws', {websocket : true }, (connection, req) => {
		let new_client = new Client(connection, id); id++;
		clients.push(new_client);
		console.log("New Client", new_client.id);
		let game_data = game_data_creation();
		connection.send(JSON.stringify({ type: 'state', state: game_data }));
		connection.on('message', (message) => {
			try {
			const data = JSON.parse(message);
			if (data.type === 'keydown') inputpressed(data.key, connection);
			if (data.type === 'keyup') inputrelease(data.key, connection);
			} catch (e) {}
		});
		connection.on('close', () => {
			const index = clients.indexOf(connection.socket);
			console.log("Client Leaving", clients[index]);
			if (index !== -1) clients.splice(index, 1);
		});
	});
})

fastify.listen({ port: 3000, host: '0.0.0.0' }, err => {
  if (err) throw err;
  console.log('Server listening at http://localhost:3000');
});

process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);

//Store the futur of the ball at an instance
function count_array_futur(touch){
	for (let x = ball_futur.x - ball_size + 1; x < ball_futur.x + ball_size; x++){
		for (let y = ball_futur.y - ball_size + 1; y < ball_futur.y + ball_size; y++)
			ball_real_array_futur.push({x,y,touch});
	}
	for (let x = Math.round(ball_futur.x) - ball_size + 1; x < Math.round(ball_futur.x) + ball_size; x++){
		for (let y = Math.round(ball_futur.y) - ball_size + 1; y < Math.round(ball_futur.y) + ball_size; y++)
			ball_array_futur.push({x,y,touch});
	}
}

//Use to change the dir of a ball of the custom mode "More ! More ! {4}"
function new_direction_aproximation(obj_ball){
	const angle = Math.atan2(obj_ball.dy, obj_ball.dx);
	const speed = Math.sqrt(obj_ball.dx * obj_ball.dx + obj_ball.dy * obj_ball.dy);
	const delta = (Math.random() - 0.5) * 10;
	const newAngle = angle + delta;
	const newDx = Math.cos(newAngle) * speed;
	const newDy = Math.sin(newAngle) * speed;
	return ({newDx, newDy});
}

function bounce_on_obstacle(obj_ball, obs_array){
	let hitbox = 1;
	let remove = [];
	obs_array.forEach(obs => {
		if (Math.round(obj_ball.x) - obs.x <= hitbox && Math.round(obj_ball.x) - obs.x >= -hitbox){
			if (Math.round(obj_ball.y) - obs.y <= hitbox && Math.round(obj_ball.y) - obs.y >= -hitbox){
				if (Math.abs(obj_ball.dx) > Math.abs(obj_ball.dy))
					obj_ball.dx *= -1;
				else if (Math.abs(obj_ball.dx) < Math.abs(obj_ball.dy))
					obj_ball.dy *= -1;
				else
					obj_ball.dx *= -1; obj_ball.dy *= -1;
				if (obj_ball == ball)
					remove.push(obs_array.indexOf(obs));
			}
		}
	});
	for (let i = remove.length - 1; i >= 0; i--)
		obs_array.splice(remove[i], 1);
}

//Compute the new position of a ball
function move_obj_ball(obj_ball){
	obj_ball.x += obj_ball.dx;
	obj_ball.y += obj_ball.dy;
	
	if (custom_mode){
		bounce_on_obstacle(obj_ball, obstacle_array);
		bounce_on_obstacle(obj_ball, meteorites_array);
		bounce_on_obstacle(obj_ball, snake_array);
	}
	
	if (obj_ball.y <= ball_size + top_margin_size || obj_ball.y >= HEIGHT - (ball_size + top_margin_size)){
		if (portal == false){
			if (obj_ball === ball)
				bounce_nbr++;
			obj_ball.dy *= -1;
		}
		else {
			if (obj_ball.y < HEIGHT / 2)
				obj_ball.y = HEIGHT - (ball_size + top_margin_size) - 2;
			else
				obj_ball.y  =ball_size + top_margin_size + 2;
		}
	}
	if (obj_ball.dx < 0 && obj_ball.x <= (ball_size + bounce_margin_size) && obj_ball.x >= kill_margin_size
			&& player1_array.includes(Math.round(obj_ball.y))){
		if (obj_ball === ball){
			exchange_nbr++;
			if (multiple_ball == true){
				for (let i = 0; i < 5; i++){
					let temp_dir = new_direction_aproximation(obj_ball);
					multiple_ball_array.push(new Ball(ball.x, ball.y, temp_dir.newDx, temp_dir.newDy));
				}
			}
		}
		let hit_pos = (obj_ball.y - player1) / ((player_size * 2 + 1) / 2);
		if (hit_pos < -1) hit_pos = -1;
		if (hit_pos > 1) hit_pos = 1;
		let bounce_angle = hit_pos * MAX_BOUNCE_ANGLE;
		obj_ball.dx = BALL_SPEED * Math.cos(bounce_angle);
		obj_ball.dy = BALL_SPEED * Math.sin(bounce_angle);
		if (obj_ball.dx < 0) obj_ball.dx = Math.abs(obj_ball.dx);
		// Velocity from player
		obj_ball.dy += velocity1 * effect;
		if (velocity1 != 0 && obj_ball === ball) velocity_use++;

	}
	else if (obj_ball.dx > 0 && obj_ball.x >= WIDTH - (ball_size + bounce_margin_size) && obj_ball.x <= WIDTH - kill_margin_size
			&& player2_array.includes(Math.round(obj_ball.y))){
		if (obj_ball === ball){
			exchange_nbr++;
			if (multiple_ball == true){
				for (let i = 0; i < 5; i++){
					let temp_dir = new_direction_aproximation(obj_ball);
					multiple_ball_array.push(new Ball(ball.x, ball.y, temp_dir.newDx, temp_dir.newDy));
				}
			}
		}
		let hit_pos = (obj_ball.y - player2) / ((player_size * 2 + 1) / 2);
		if (hit_pos < -1) hit_pos = -1;
		if (hit_pos > 1) hit_pos = 1;
		let bounce_angle = hit_pos * MAX_BOUNCE_ANGLE;
		obj_ball.dx = -BALL_SPEED * Math.cos(bounce_angle);
		obj_ball.dy = BALL_SPEED * Math.sin(bounce_angle);
		if (obj_ball.dx > 0) obj_ball.dx = -Math.abs(obj_ball.dx);
		// Velocity from player
		obj_ball.dy += velocity2 * effect;
		if (velocity1 != 0 && obj_ball === ball) velocity_use++;
	}
}

//Compute and Store the info on the ball's futur in 'vision' distance
function futur(){
	ball_futur = {...ball};
	let touch = false;
	for (let t = 0; t < futur_vision * (1 + (BALL_SPEED - BASE_BALL_SPEED)); t++){
		let temp_obj_dx = ball_futur.dx;
		move_obj_ball(ball_futur);
		if (temp_obj_dx != ball_futur.dx) touch = true;
		if (ball_futur.x < 0) return ;
		else if (ball_futur.x > WIDTH) return ;
		if (ball_futur.y < ball_size + top_margin_size) ball_futur.y = ball_size + top_margin_size;
		else if (ball_futur.y > HEIGHT - (ball_size + top_margin_size)) ball_futur.y = HEIGHT - (ball_size + top_margin_size);
		count_array_futur(touch);
	}
}

//Get the next position of the IA
function searchIA(){
	let lowerindex = -1;
	for (let i = error_margin; i < WIDTH - (kill_margin_size); i++){
		for (let j = 0; j < HEIGHT - 1; j++){
			let index = ball_array_futur.findIndex(b => b.x === i && b.y === j && b.touch == false);
			if (index != -1){
				if (lowerindex == -1 || index > lowerindex) lowerindex = index;
			}
		}
	}
	target_IA = {x : WIDTH - bounce_margin_size, y : Math.floor(HEIGHT / 2)};
	if (lowerindex == -1) return ;
	target_IA = ball_array_futur[lowerindex];
}

//It's in the name, it moves the IA
function moveIA(){
	let ia_array = [];
	let ia_player_size = (player_size <= 1) ? (player_size) : (player_size - 1);
	for (let i = 0 - ia_player_size; i <= ia_player_size; i++)
		ia_array.push(Math.round(player2) + i);
	if (ia_array.includes(target_IA.y)) {
		keyDown = false;
		keyUp = false;
		player2_vel = 0;
		return ;
	}
	if (target_IA.y > player2){
		keyUp = true;
		player2_vel = 1 * PLAYER_SPEED;
	}
	if (target_IA.y < player2){
		keyDown = true;
		player2_vel = -1 * PLAYER_SPEED;
	}
}

//Get the hitbox of the players and ball
function count_array_web(){
	player1_array = [];
	player2_array = [];
	ball_array = [];
	for (let i = 0 - player_size; i <= player_size; i++){
		player1_array.push(Math.round(player1) + i);
		player2_array.push(Math.round(player2) + i);
		if (holes == true && holes_array.includes(i)){
			player1_array.pop();
			player2_array.pop();
		}
	}
	for (let x = Math.round(ball.x) - ball_size + 1; x < Math.round(ball.x) + ball_size; x++){
		for (let y = Math.round(ball.y) - ball_size + 1; y < Math.round(ball.y) + ball_size; y++)
			ball_array.push({x,y});
	}
}

//Store the data to send to the front
function game_data_creation(){
	let game_data = {
		player1, player1_array, player1_score,
		player2, player2_array, player2_score,
		ball, ball_size, ball_real_array_futur,
		vision, IA, target_IA,
		player_size, error_margin, kill_margin_size,
		gamestart, gameover, MAX_SCORE,
		exchange_nbr, bounce_nbr, velocity_use,
		obstacle_array, holes_array, negative,
		snake_array, invisible_player, gold_game,
		meteorites_array, invisible_ball,
		multiple_ball_array, portal, custom_mode, box_array,
		in_effect
	}
	return game_data;
}

//Send info to the front (Again it's in the name)
function sendInfoToFront(){
	let game_data = game_data_creation();
	clients
		.filter(client => client.connection && client.connection.readyState === client.connection.OPEN)
		.forEach(client => {
			try {
				client.connection.send(JSON.stringify({ type: 'state', state: game_data }));
			} catch (e){
				console.error('Erreur lors de l\'envoi du gameover au client :', e);
			}
		});
}

//Groups function that are used to draw the game
function draw_web(){
	count_array_web();
	sendInfoToFront();
}

//It's in the name, it moves the players
function movePlayers(){
	if (keyW == true && player1 + player1_vel > player_size + top_margin_size) player1 += player1_vel;
	if (keyS == true && player1 + player1_vel < HEIGHT - (player_size + top_margin_size)) player1 += player1_vel;
	if (keyUp == true && player2 + player2_vel > player_size + top_margin_size) player2 += player2_vel;
	if (keyDown == true && player2 + player2_vel < HEIGHT - (player_size + top_margin_size)) player2 += player2_vel;

	if (player2 >= HEIGHT - (player_size + top_margin_size)) player2--;
	if (player2 <= player_size + top_margin_size) player2++;
	if (player1 >= HEIGHT - (player_size + top_margin_size)) player1--;
	if (player1 <= player_size + top_margin_size) player1++;
}

async function winBall(){
	ball.x = Math.floor(WIDTH / 2);
	ball.y = Math.floor(HEIGHT / 2);
	let angle = (Math.random() - 0.5) * MAX_BOUNCE_ANGLE;
	let dir = Math.random() < 0.5 ? 1 : -1;
	ball.dx = dir * BALL_SPEED * Math.cos(angle);
	ball.dy = BALL_SPEED * Math.sin(angle);
	if (speeding_mode){
		PLAYER_SPEED = BASE_PLAYER_SPEED;
		BALL_SPEED = BASE_BALL_SPEED;
	}
	if (custom_mode == true)
		reset_effect();
	pause = true;
	await utils.sleep(1000);
	pause = false;
}

//It's in the name, it moves the Ball
async function moveBall(){
	move_obj_ball(ball);
	if (ball.x < 0){
		player2_score += point_value;
		winBall();
	}
	else if (ball.x > WIDTH){
		player1_score += point_value;
		winBall();
	}
	if (ball.y < ball_size + top_margin_size) ball.y = ball_size + top_margin_size;
	else if (ball.y > HEIGHT - (ball_size + top_margin_size)) ball.y = HEIGHT - (ball_size + top_margin_size) ;
	touch_box();
}

//It moves the array of ball if the custom mode "More ! More ! {4}" is active
async function moveMultipleBall(){
	let remove = [];
	for (let i = 0; i < multiple_ball_array.length; i++){
		move_obj_ball(multiple_ball_array[i]);
		if (multiple_ball_array[i].x < 0 || multiple_ball_array[i].x > WIDTH){
			remove.push(i);
			continue ;
		}
		if (multiple_ball_array[i].y < ball_size + top_margin_size) multiple_ball_array[i].y = ball_size + top_margin_size;
		else if (multiple_ball_array[i].y > HEIGHT - (ball_size + top_margin_size)) multiple_ball_array[i].y = HEIGHT - (ball_size + top_margin_size) ;
	}
	for (let i = remove.length - 1; i >= 0; i--)
		multiple_ball_array.splice(remove[i], 1);
}

//Make it changeable with AZERTY or other keyboard
//Called when an input is pressed by a player
function inputpressed(key, connection){
	if (key == up_player1 && player1 > player_size + top_margin_size && ((local == false && connection == clients[0].connection) || local == true)){
		player1_vel = -1 * PLAYER_SPEED;
		keyS = false; keyW = true;
	} 
	if (key == down_player1 && player1 < HEIGHT - (player_size + top_margin_size) && ((local == false && connection == clients[0].connection) || local == true)){
		player1_vel = 1 * PLAYER_SPEED;
		keyW = false; keyS = true;
	}
	if (key == up_player2 && player2 > player_size + top_margin_size && IA == false && local == false && connection == clients[1].connection){
		// || (key === 'ArrowUp' && player2 > player_size + top_margin_size && IA == false && local == true)){
		player2_vel = -1 * PLAYER_SPEED;
		keyDown = false; keyUp = true;
	}
	if (key == down_player2 && player2 < HEIGHT - (player_size + top_margin_size) && IA == false && local == false){// && connection == clients[1].connection)
		// || (key === 'ArrowDown' && player2 < HEIGHT - (player_size + top_margin_size) && IA == false && local == true)){
		player2_vel = 1 * PLAYER_SPEED;
		keyUp = false; keyDown = true;
	}
	// if (){
	// 	player2_vel = -1 * PLAYER_SPEED;
	// 	keyDown = false; keyUp = true;
	// }
	// if (key === 'ArrowDown' && player2 < HEIGHT - (player_size + top_margin_size) && IA == false && local == true){
	// 	player2_vel = 1 * PLAYER_SPEED;
	// 	keyUp = false; keyDown = true;
	// }
	if (key === 'p' && pause == true) pause = false;
	else if (key === 'p' && pause == false) pause = true;
	if (key === 'v' && vision == true) vision = false;
	else if (key === 'v' && vision == false) vision = true;
	if (key === ',' && vision == true) futur_vision -= 1;
	if (key === '.' && vision == true) futur_vision += 1;
	if (key === ';' && vision == true) error_margin -= 1;
	if (key === '\'' && vision == true) error_margin += 1; 
	if (key === '1' && ball_size < 15) ball_size += 1;
	if (key === '2' && ball_size > 1) ball_size -= 1;
	if (key === '3' && player_size < 15) player_size += 1;
	if (key === '4' && player_size > 1) player_size -= 1;
	if (key === '\\' && IA == true) IA = false;
	else if (key === '\\' && IA == false) IA = true;
	if (key === '+' || key === '-'){
		let angle = Math.atan2(ball.dy, ball.dx) * 180 / Math.PI;
		angle += (key === '+') ? 1.5 : -1.5;
		let speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy) || BALL_SPEED;
		ball.dx = speed * Math.cos(angle * Math.PI / 180);
		ball.dy = speed * Math.sin(angle * Math.PI / 180);
	}
	if (key === ' ' && ((local == false && clients.length) || local == true)) gamestart = true;
};

//Called when an input is realeased by a player
function inputrelease(key, connection){
	if (key === up_player1 && ((local == false && connection == clients[0].connection) || local == true)){
		keyW = false;
		if (keyS === false) player1_vel = 0;
	}
	if (key === down_player1 && ((local == false && connection == clients[0].connection) || local == true)){
		keyS = false;
		if (keyW === false) player1_vel = 0;
	}
	if (IA == false){
		if (key === up_player2 && player2 > player_size + top_margin_size && IA == false && local == false && connection == clients[1].connection){
			keyUp = false;
			if (keyDown === false) player2_vel = 0;
		}
		if (key === down_player2 && player2 < HEIGHT - (player_size + top_margin_size) && IA == false && local == false && connection == clients[1].connection){
			keyDown = false;
			if (keyUp === false) player2_vel = 0;
		}
		// if (key === 'ArrowUp' && local == true){
		// 	keyUp = false;
		// 	if (keyDown === false) player2_vel = 0;
		// }
		// if (key === 'ArrowDown' && local == true){
		// 	keyDown = false;
		// 	if (keyUp === false) player2_vel = 0;
		// }
	}
};

//The iteration of the Game
function gameLoop() {
	if (player1_score >= MAX_SCORE || player2_score >= MAX_SCORE){
		gameover = true;
		sendInfoToFront();
		return ;
	}
	if (gamestart == true)
		movePlayers();
	if (gamestart == true && pause == false){
		moveBall();
	}
	ball_array_futur = [];
	ball_real_array_futur = [];
	if (vision == true || IA == true)
		futur();
	if (gamestart == true && pause == false && custom_mode == true){
		moveMultipleBall();
	}
	if (gamestart == true && IA == true)
		moveIA();
	draw_web();
	if (!gameover) setTimeout(gameLoop, 1000 / 60);
}

gameLoop();
custom_mode_func()

//Check if the player is moving to give Velocity to the Ball
setInterval(() => {
	velocity1 = player1 - last_velocity1;
	velocity2 = player2 - last_velocity2;
	last_velocity1 = player1;
	last_velocity2 = player2;
}, 100);

//Update the IA every 1sec
if (IA == true){
	setInterval(() => {
		error_margin +=  Math.random() < 0.7 - (IA_diff * 0.1) ? -1 : 1;
		futur_vision +=  Math.random() < 0.3 + (IA_diff * 0.1) ? -1 : 1;
		let rage = (player1_score <= player2_score) ? 0 : Math.round(Math.pow((player1_score - player2_score ), 2) / 4);
		// console.log("Rage", rage);
		// console.log("error margin", error_margin);
		// console.log("futur vision", futur_vision);
		switch (IA_diff){
			case 0 :
				if (error_margin < 0) error_margin = 0;
				if (error_margin > 10) error_margin = 10;
				if (futur_vision < 90 + (rage * 2)) futur_vision = 90 + (rage * 2);
				if (futur_vision > 110 + (rage * 2)) futur_vision = 110 + (rage * 2);
				break;
			case 1 :
				if (error_margin < 55 - rage) error_margin = 55 - rage;
				if (error_margin > 75 - rage) error_margin = 75 - rage;
				if (futur_vision < 50 + (rage * 2)) futur_vision = 50 + (rage * 2);
				if (futur_vision > 70 + (rage * 2)) futur_vision = 70 + (rage * 2);
				break;
			case 2 :
				if (error_margin < 50 - rage) error_margin = 50 - rage;
				if (error_margin > 65 - rage) error_margin = 70 - rage;
				if (futur_vision < 21 + (rage * 2)) futur_vision = 21 + (rage * 2);
				if (futur_vision > 41 + (rage * 2)) futur_vision = 41 + (rage * 2);
				break;
			case 3 :
				if (error_margin < 31 - rage) error_margin = 31 - rage;
				if (error_margin > 51 - rage) error_margin = 51 - rage;
				if (futur_vision < 9 + (rage * 2)) futur_vision = 9 + (rage * 2);
				if (futur_vision > 21 + (rage * 2)) futur_vision = 21 + (rage * 2);
				break;
			case 4 :
				if (error_margin < 25 - rage) error_margin = 25 - rage;
				if (error_margin > 41 - rage) error_margin = 41 - rage;
				if (futur_vision < 6 + (rage * 2)) futur_vision = 6 + (rage * 2);
				if (futur_vision > 18 + (rage * 2)) futur_vision = 18 + (rage * 2);
				break;
		}
		searchIA();
	}, 1000);
}

if (speeding_mode == true){
	setInterval(() => {
			BALL_SPEED += 0.1;
			PLAYER_SPEED += 0.1;
	}, 5000);
}

/*
	The box has a chance of 1 to 10 to spawn every 3 sec
	it give the following changes to the games if the ball touchs it :
	Fake news {0} : Changes the direction of the ball randomly
	Always faster {1} : The game start to speed up really fast (forever)
	You are not big enought {2} : The players paddels are bigger now
	Smaller ! {3} : The players paddels are smaller now
	More ! More ! {4} : The ball multiplies each time it hits a paddel but don't influence the score (until the next point)
	You are hallucinating {5} : The control are reverse (until the next point)
	It's just a break {6} : The game slow up before reaccelerating at a random moment
	It's the golden ball {7} : The next point worth X2 (combo is possible) (until the next point)
	Obstacles you say ? {8} : Obstacles appears on the field (until the next point)
	 {9} : 
	Some cheese ! {10} : The paddels got holes (until the next point)
	It's everywhere ! {11} : The ball teleports everywhere for a few random seconds before going to the middle
	 {12} : 
	Negative mode {13} : The color are negative for 5sec
	Snake mode {14} : The ball leave a trail and can bounce on it (until the next point)
	Wait what ? {15} : The paddels teleports on the y axis randomly
	Where am I ? {16} : You cant see yourself for 3 sec
	Meteor shower ! {17} : Meteorites fell from the top influencing the balls direction (until the next point)
	1 Life ! {18} : The game is reset and the next ball make the player win
	I see the futur ! {19} : Everyone can see the trajectory of the ball for a few seconds
	Epic moment ! {20} : The game just got epic, it's start by the effect 11, then the effect 1 (forever) 4 7 (until the next point) are applied on a cool music (until the next point)
	Portals ! {21} : When the ball hits the top or bottom it goes to the other (until the next point)
	Where is it ! Tell me ! {22} : The ball is invisible for 2 sec every 4 sec (until the next point)
*/

async function effect0(){ //done
	console.log("Fake news {0}");
	let angle = (Math.random() - 0.5) * MAX_BOUNCE_ANGLE;
	let dir = Math.random() < 0.5 ? 1 : -1;
	ball.dx = dir * BALL_SPEED * Math.cos(angle);
	ball.dy = BALL_SPEED * Math.sin(angle);
}

async function effect1(){ //done to scale
	console.log("Always faster {1}");
	if (true_speeding_ball == false){
		true_speeding_ball = true;
		setInterval(() => {
			BALL_SPEED += 0.05;
			PLAYER_SPEED += 0.05;
		}, 1000);
	}
}

async function effect2(){ //done
	console.log("You are not big enought {2}");
	if (player_size < 15) player_size += 1;
}

async function effect3(){ //done
	console.log("Smaller ! {3}");
	if (player_size > 1) player_size -= 1;
}

async function effect4(){ //done
	console.log("More ! More ! {4}");
	multiple_ball = true;
}

async function effect5(){  //second player don't work
	console.log("You are hallucinating {5}");
	up_player1 = base_down_player1;
	down_player1 = base_up_player1;
	up_player2 = base_down_player2;
	down_player2 = base_up_player2;
}

async function effect6(){  //lag a bit
	if (in_effect == true)
		return ;
	in_effect = true;
	console.log("It's just a break {6}");
	let ball_before = BALL_SPEED;
	let balldx = ball.dx;
	let balldy = ball.dy;
	let player_before = PLAYER_SPEED;
	BALL_SPEED = 0.1;
	ball.dx *= 0.5;
	ball.dy *= 0.5;
	PLAYER_SPEED = 0.3;
	await utils.sleep(1000 * Math.round((Math.random() * 10) / 3));
	BALL_SPEED = ball_before;
	ball.dx = balldx;
	ball.dy = balldy;
	PLAYER_SPEED = player_before;
	in_effect = false;
}

async function effect7(){  //done normally
	console.log("Silver Bullet {7}", point_value * 2);
	point_value *= 2;
}

async function effect8(){ //done maybe ajust despawn after point
	if (obstacle_array.length > 0)
		return ;
	console.log("Obstacles {8}");
	for (let i = 0; i < 15; i++){
		let new_obstacle = new Obstacle(
			bounce_margin_size + Math.round((WIDTH - bounce_margin_size) * Math.random()),
			top_margin_size + Math.round((HEIGHT - top_margin_size) * Math.random()));
		obstacle_array.push(new_obstacle);
	}
	await utils.sleep(20000);
	obstacle_array = [];
}

async function effect9(){ //nothing
	console.log("Nothing yet {9}");
	
}

async function effect10(){ //done
	if (holes == true)
		return ;
	console.log("Cheese {10}");
	holes = true;
	for (let i = -player_size; i <= player_size; i++){
		if (Math.random() < 0.5 && holes_array.length <= player_size + player_size / 2)
			holes_array.push(i);
	}
}

async function effect11(){ //done
	if (in_effect == true)
		return ;
	in_effect = true;
	console.log("It's everywhere ! {11}");
	for (let i = 0; i < Math.floor(Math.random() * 30); i++){
		ball.x = bounce_margin_size + Math.round((WIDTH - bounce_margin_size * 1.5) * Math.random());
		ball.y = top_margin_size + Math.round((HEIGHT - top_margin_size) * Math.random());
		await utils.sleep(150);
	}
	ball.x = Math.floor(WIDTH / 2);
	ball.y = Math.floor(HEIGHT / 2);
	in_effect = false;
}

async function effect12(){ //nothing

}

async function effect13(){ //done
	if (negative == true)
		return ;
	console.log("Negative mode {13}");
	negative = true;
	await utils.sleep(5000);
	negative = false;
}

async function effect14(){ //done to scale
	if (snake_mode == true)
		return ;
	console.log("Snake mode {14}");
	snake_mode = true;
	let hitbox = 1;
	while (snake_mode == true){
		if (snake_array.length > 10)
			snake_array.shift();
		let obs = new Obstacle(ball.x,ball.y);
		await utils.sleep(100);
		const overlap = snake_array.some(o => o.x === obs.x && o.y === obs.y);
		if (!overlap) {
			snake_array.push(obs);
		}
	}
	snake_array = [];
}

async function effect15(){ //done to scale
	console.log("Teleport player {15}");
	let tmp_margin = top_margin_size + player_size;
	player1 = tmp_margin + Math.round((HEIGHT - tmp_margin) * Math.random());
	player2 = tmp_margin + Math.round((HEIGHT - tmp_margin) * Math.random());
}

async function effect16(){ //done
	if (invisible_player)
		return ;
	console.log("Invisible player {16}");
	invisible_player = true;
	await utils.sleep(1500);
	invisible_player = false;
}

async function effect17(){ //done
	if (meteorites == true)
		return ;
	meteorites = true;
	console.log("Meteor shower ! {17}");
	if (meteorites_array.length > 0)
		return ;
	do{
		meteorites_array.forEach(meteor =>{
			meteor.y++;
			if (meteor.y > HEIGHT - top_margin_size){
				const index = meteorites_array.indexOf(meteor);
				meteorites_array.splice(index, 1);
			}
		});
		if (Math.random() < 0.3 || meteorites_array.length == 0){
			let new_meteor = new Obstacle(
				bounce_margin_size + Math.round((WIDTH - bounce_margin_size) * Math.random()),
				top_margin_size);
			meteorites_array.push(new_meteor);
		}
		await utils.sleep(500);
	} while (meteorites_array.length > 0 && meteorites == true)
	meteorites = false;
}

async function effect18(){ //done
	if (gold_game == true)
		return ;
	box_array = [];
	console.log("Golden Ball {18}");
	player1_score = 0;
	player2_score = 0;
	MAX_SCORE = 1;
	gold_game = true;
}

async function effect19(){ //done normally
	console.log("I see the futur ! {19}");
	vision = true;
	await utils.sleep(10000);
	vision = false;
}

async function effect20(){ //done scale 1
	if (epic_moment)
		return ;
	console.log("Epic moment ! {20}");
	epic_moment = true;
	box_array = [];
	await effect11();
	effect1();
	effect4();
	effect7();
}

async function effect21(){ //done normally no visual
	console.log("Portals ! {21}");
	portal = true;
}

async function effect22(){ //done normally no visual
	if (invisible_ball_active)
		return ;
	invisible_ball_active = true;
	console.log("Invisiball {22}");
	for (let i = 0; i < 5; i++){
		invisible_ball = true;
		await utils.sleep(500);
		if (invisible_ball_active == false){
			invisible_ball = false;
			break ;
		}
		invisible_ball = false;
		await utils.sleep(500);
		if (invisible_ball_active == false){
			invisible_ball = false;
			break ;
		}
	}
	invisible_ball_active = false;
}

function apply_effect(nbr){
	switch (nbr){
		case 0 : effect0(); break;
		case 1 : effect1(); break;
		case 2 : effect2(); break;
		case 3 : effect3(); break;
		case 4 : effect4(); break;
		case 5 : effect5(); break;
		case 6 : effect6(); break;
		case 7 : effect7(); break;
		case 8 : effect8(); break;
		case 9 : effect9(); break;
		case 10 : effect10(); break;
		case 11 : effect11(); break;
		case 12 : effect12(); break;
		case 13 : effect13(); break;
		case 14 : effect14(); break;
		case 15 : effect15(); break;
		case 16 : effect16(); break;
		case 17 : effect17(); break;
		case 18 : effect18(); break;
		case 19 : effect19(); break;
		case 20 : effect20(); break;
		case 21 : effect21(); break;
		case 22 : effect22(); break;
	}
}

function reset_effect(){
	in_effect = false;
	multiple_ball = false;
	multiple_ball_array = [];
	up_player1 = base_up_player1;
	down_player1 = base_down_player1;
	up_player2 = base_up_player2;
	down_player2 = base_down_player2;
	point_value = 1;
	obstacle_array = [];
	holes = false;
	holes_array = [];
	negative = false;
	snake_mode = false;
	snake_array = [];
	invisible_player = false;
	meteorites = false;
	meteorites_array = [];
	gold_game = false;
	vision = false;
	epic_moment = false;
	portal = false;
	invisible_ball_active = false;
	invisible_ball = false;
}

function touch_box(){
	let hitbox = 2;
	box_array.forEach(box => {
		if (Math.round(ball.x) - box.x <= hitbox && Math.round(ball.x) - box.x >= -hitbox){
			if (Math.round(ball.y) - box.y <= hitbox && Math.round(ball.y) - box.y >= -hitbox){
				apply_effect(box.effect);
				box_array.splice(box_array.indexOf(box), 1);
			}
		}
	});
}

async function custom_mode_func(){
	while (gamestart == false)
		await utils.sleep(1000);
	if (custom_mode == true){
		function spawn_a_box(){
			let x = bounce_margin_size + Math.round((WIDTH - bounce_margin_size) * Math.random());;
			let y = top_margin_size + Math.round((HEIGHT - top_margin_size) * Math.random());
			let new_box = new Box(Math.round(WIDTH * Math.random()), Math.round(HEIGHT * Math.random()), Math.floor(Math.random() * 23));
			while (box_array.includes(new_box) == true)
				new_box = new Box(Math.round(WIDTH * Math.random()), Math.round(HEIGHT * Math.random()), Math.floor(Math.random() * 23));
			// let nbr = 22;
			// let new_box = new Box(Math.round(WIDTH * Math.random()), Math.round(HEIGHT * Math.random()), nbr);
			return (new_box);
		}
		setInterval(() => {
			if (box_array.length > 10)
				box_array.shift();
			if (Math.random() < 0.3 && gold_game == false && epic_moment == false && pause == false)
				box_array.push(spawn_a_box());
		}, 1000);
	}
}

