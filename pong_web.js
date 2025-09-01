//Game constant
const FPS = 60;
const GAME_SPEED = 1.4
const HEIGHT = 60;
const WIDTH = 80;
const BASE_PLAYER_SPEED = 0.8 * GAME_SPEED;
const BASE_BALL_SPEED = 0.5 * GAME_SPEED;
const MAX_BOUNCE_ANGLE = Math.PI / 5;
let MAX_SCORE = 10;

//Class
/*
	player on the side according to his id :
	0 is right
	1 is left
	2 is up
	3 is down
	axis is the axis on wich the player moves
*/

class Team{
	constructor(nbr, backplayer, frontplayer){
		this.nbr = nbr;
		this.backplayer = backplayer;
		this.frontplayer = frontplayer;
		this.score = 0;
	}
}

class Player{
	constructor(id, posx, base_up, base_down){
		this.hitbox = 2;
		this.id = id;
		this.posx = posx;
		this.posy = HEIGHT / 2;
		this.array = new Set();
		this.base_up = base_up;
		this.base_down = base_down;
		this.up_player = this.base_up;
		this.down_player = this.base_down;
		this.velocity = 0;
		this.last_velocity = this.posy;
		this.player_vel = 0;
		this.keyUp = false;
		this.keyDown = false;

		//Custom
		this.base_right = "d";
		this.base_left = "a";
		this.right_player = this.base_right;
		this.left_player = this.base_left;
		this.keyRight = false;
		this.keyLeft = false;
	}
	move(local_player_size, reduce_speed){
		if (this.keyUp == true && this.posy + (this.player_vel * reduce_speed) > local_player_size + top_margin_size) this.posy += (this.player_vel * reduce_speed);
		if (this.keyDown == true && this.posy +(this.player_vel * reduce_speed) < HEIGHT - (local_player_size + top_margin_size)) this.posy += (this.player_vel * reduce_speed);
		if (this.posy >= HEIGHT - (local_player_size + top_margin_size)) this.posy--;
		if (this.posy <= local_player_size + top_margin_size) this.posy++;
	
		//Custom
		if (this.keyRight == true && this.posx + (this.player_vel * reduce_speed) > 2) this.posx += (this.player_vel * reduce_speed);
		if (this.keyLeft == true && this.posx +(this.player_vel * reduce_speed) < WIDTH - 2) this.posx += (this.player_vel * reduce_speed);
		if (this.posx >= WIDTH - 2) this.posx--;
		if (this.posx <= 2) this.posx++;
	}
	input(local_player_size, key, connection){
		if (this.id == 1 && IA == true)
			return ;
		if (key == this.up_player && this.posy < HEIGHT - (local_player_size + top_margin_size) && (local == true || (local == false && connection == clients[this.id].connection))){
			this.player_vel = -1 * PLAYER_SPEED;
			this.keyDown = false; this.keyUp = true;
		}
		if (key == this.down_player && this.posy < HEIGHT - (local_player_size + top_margin_size) && (local == true || (local == false && connection == clients[this.id].connection))){
			this.player_vel = 1 * PLAYER_SPEED;
			this.keyUp = false; this.keyDown = true;
		}
	}
	release(key, connection){
		if (this.id == 1 && IA == true)
			return ;
		if (key == this.up_player && (local == true || (local == false && connection == clients[this.id].connection))){
			this.keyUp = false;
			if (this.keyDown == false) this.player_vel = 0;
		}
		if (key == this.down_player && (local == true || (local == false && connection == clients[this.id].connection))){
			this.keyDown = false;
			if (this.keyUp == false) this.player_vel = 0;
		}
	}
	update_velocity(){
		this.velocity = this.posy - this.last_velocity;
		this.last_velocity = this.posy;
	}
}

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
		this.last_touch = null;
	}
}

//Import
import * as utils from './pong_web_utils.js';

//Game option
let local = true;
let IA = true;
let four_player = false;
let custom_mode = true;

//Game variable
let PLAYER_SPEED = BASE_PLAYER_SPEED;
let BALL_SPEED = BASE_BALL_SPEED;
let gamestart = false;
let gameover = false;
let point_value = 1;

//Initialisation of players and balls
// let players = [];
let team1 = null;
if (four_player){
	team1 = new Team(1, new Player(0, 6, 'w', 's'),
	new Player(2, 16, 'w', 's'));
} else {
	team1 = new Team(1, new Player(0, 6, 'w', 's'), null);
}
let team2 = null;
if (four_player){
	team2 = new Team(2, new Player(1, WIDTH - 6, 'w', 's'),
	new Player(3, WIDTH - 16, 'w', 's'));
} else { 
	team2 = new Team(2, new Player(1, WIDTH - 6, 
	(local == false) ? 'w' : 'ArrowUp', 
	(local == false) ? 's' : 'ArrowDown'));
}

let teams = [team1, team2];

let ball = new Ball(WIDTH / 2, Math.floor(HEIGHT / 2), Math.random() < 0.5 ? -1 : 1, Math.random() < 0.5 ? -1 : 1);

//Ball Movement
let effect = 0.15;

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

let ball_array = new Set();

//IA
let error_margin = 65;
let target_IA = {x : WIDTH / 2, y : Math.floor(HEIGHT / 2)};

//Mode
let operator = true;
let pause = false;
let vision = false;

//Vision
let futur_vision = 60;
let ball_futur = new Ball(WIDTH / 2, Math.floor(HEIGHT / 2), Math.random() < 0.5 ? -1 : 1, Math.random() < 0.5 ? -1 : 1);
let ball_array_futur = new Set();
let ball_real_array_futur = new Set();

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
let free_mode = false;

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
		// let playerId = localStorage.getItem('pong_player_id');
		// if (!playerId) {
		// 	playerId = crypto.randomUUID();
		// 	localStorage.setItem('pong_player_id', playerId);
		// }
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
			ball_real_array_futur.add({x,y,touch});
	}
	for (let x = Math.round(ball_futur.x) - ball_size + 1; x < Math.round(ball_futur.x) + ball_size; x++){
		for (let y = Math.round(ball_futur.y) - ball_size + 1; y < Math.round(ball_futur.y) + ball_size; y++)
			ball_array_futur.add({x,y,touch});
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

function bounce_on_obstacle(obj_ball, obs_array, hitbox){
	let remove = [];
	obs_array.forEach(obs => {
		if (obj_ball.x - obs.x <= hitbox && obj_ball.x - obs.x >= -hitbox){
			if (obj_ball.y - obs.y <= hitbox && obj_ball.y - obs.y >= -hitbox){
				if (Math.abs(obj_ball.dx) > Math.abs(obj_ball.dy))
					obj_ball.dx *= -1;
				else if (Math.abs(obj_ball.dx) < Math.abs(obj_ball.dy))
					obj_ball.dy *= -1;
				else
					obj_ball.dx *= -1; obj_ball.dy *= -1;
				obj_ball.last_touch = null;
				if (obj_ball == ball)
					remove.push(obs_array.indexOf(obs));
			}
		}
	});
	for (let i = remove.length - 1; i >= 0; i--)
		obs_array.splice(remove[i], 1);
}

function isBallOnPaddle(ball, player) {
    return (
		ball.x >= player.posx - player.hitbox &&
		ball.x <= player.posx + player.hitbox &&
		ball.y >= player.posy - (player_size + 0.5) &&
		ball.y <= player.posy + (player_size + 0.5)
    );
}

function bounce_on_player(obj_ball){
	let player = null;
	let side = 0;
	for (let t = 0; t < teams.length; t++) {
        let candidates = [teams[t].backplayer];
        if (teams[t].frontplayer) candidates.push(teams[t].frontplayer);
        for (let p of candidates) {
            if (isBallOnPaddle(obj_ball, p)) {
                player = p;
                side = t + 1;
                break;
            }
        }
        if (player) break;
    }
    if (!player) return;
	if (obj_ball.last_touch == player) return ;
	obj_ball.last_touch = player;
	if (obj_ball === ball){
		exchange_nbr++;
		if (multiple_ball == true){
			for (let i = 0; i < 5; i++){
				let temp_dir = new_direction_aproximation(obj_ball);
				multiple_ball_array.push(new Ball(ball.x, ball.y, temp_dir.newDx, temp_dir.newDy));
			}
		}
	}
	// let hit_pos = (obj_ball.y - player.posy) / ((player_size * 2 + 1) / 2);
	// if (hit_pos < -1) hit_pos = -1;
	// if (hit_pos > 1) hit_pos = 1;
	// let bounce_angle = hit_pos * MAX_BOUNCE_ANGLE;
	let hit_pos = (obj_ball.y - player.posy) / ((player_size * 2 + 1) / 2);
    hit_pos = Math.max(-1, Math.min(1, hit_pos));
    let bounce_angle = hit_pos * MAX_BOUNCE_ANGLE;

	// let from_left = (obj_ball.x < player.posx) && (obj_ball.dx > 0);
    // let from_right = (obj_ball.x > player.posx) && (obj_ball.dx < 0);

	// if (from_left || from_right) {
    //     let sign = (obj_ball.x < player.posx) ? -1 : 1; // rebond correct selon le côté
    //     obj_ball.dx = sign * BALL_SPEED * Math.cos(bounce_angle);
    //     obj_ball.dy = BALL_SPEED * Math.sin(bounce_angle);
    // }
	let over_left = Math.abs(obj_ball.x - (player.posx - player.hitbox)) < Math.abs(obj_ball.dx);
    let over_right = Math.abs(obj_ball.x - (player.posx + player.hitbox)) < Math.abs(obj_ball.dx);
    let over_top = Math.abs(obj_ball.y - (player.posy - player_size)) < Math.abs(obj_ball.dy);
    let over_bot = Math.abs(obj_ball.y - (player.posy + player_size)) < Math.abs(obj_ball.dy);

	if ((over_left && obj_ball.dx > 0) || (over_right && obj_ball.dx < 0)) {
		let sign = (obj_ball.x < player.posx) ? -1 : 1;
		obj_ball.dx = sign * BALL_SPEED * Math.cos(bounce_angle);
		obj_ball.dy = BALL_SPEED * Math.sin(bounce_angle);
	} else if ((over_top && obj_ball.dy > 0) || (over_bot && obj_ball.dy < 0)) {
		obj_ball.dy *= -1;
		obj_ball.dx *= -1;
	}

	//Player's velocity
	if (player.velocity != 0)
		obj_ball.dy += player.velocity * effect;
	// if (player.velocity != 0 && obj_ball === ball) velocity_use++;
	// obj_ball.dx = BALL_SPEED * Math.cos(bounce_angle);
	// obj_ball.dy = BALL_SPEED * Math.sin(bounce_angle);
	
	// if (team == 0 && obj_ball.dx < 0) obj_ball.dx = Math.abs(obj_ball.dx);
	// if (team == 1 && obj_ball.dx > 0) obj_ball.dx = -Math.abs(obj_ball.dx);
	// Velocity from player
	// obj_ball.dy += player.velocity * effect;
	// if (player.velocity != 0 && obj_ball === ball) velocity_use++;
}

//Compute the new position of a ball
function move_obj_ball(obj_ball){
	obj_ball.x += obj_ball.dx;
	obj_ball.y += obj_ball.dy;
	
	if (custom_mode){
		bounce_on_obstacle(obj_ball, obstacle_array, 1);
		bounce_on_obstacle(obj_ball, meteorites_array, 2);
		bounce_on_obstacle(obj_ball, snake_array, 1);
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
	// for (let player of players){
	bounce_on_player(obj_ball);
	// }
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
function searchIA(player){
	const arr = Array.from(ball_array_futur);
	let target = arr.slice().reverse().find(obj =>
		obj.touch === false &&
		obj.x >= error_margin &&
		obj.x < player.posx + player.hitbox
	);

	target_IA = {x : player.posx + player.hitbox, y : Math.floor(HEIGHT / 2)};
	if (target) target_IA = { x: target.x, y: target.y };
}

//It's in the name, it moves the IA
function moveIA(){
	let ia_array = new Set(); // [];
	let ia_player_size = (player_size <= 1) ? (player_size) : (player_size - 1);
	for (let i = 0 - ia_player_size; i <= ia_player_size; i++)
		ia_array.add(Math.round(teams[1].backplayer.posy) + i);
	if (ia_array.has(target_IA.y)) {
		teams[1].backplayer.keyDown = false;
		teams[1].backplayer.keyUp = false;
		teams[1].backplayer.player_vel = 0;
		return ;
	}
	if (target_IA.y > teams[1].backplayer.posy){
		teams[1].backplayer.keyUp = true;
		teams[1].backplayer.player_vel = 1 * PLAYER_SPEED;
	}
	if (target_IA.y < teams[1].backplayer.posy){
		teams[1].backplayer.keyDown = true;
		teams[1].backplayer.player_vel = -1 * PLAYER_SPEED;
	}
}

//Get the hitbox of the players and ball
function count_array_web(){
	teams.forEach(team => {
		team.backplayer.array = new Set()
		if (team.frontplayer)
			team.frontplayer.array = new Set()
	});
	ball_array = new Set(); //[];
	for (let i = 0 - player_size; i <= player_size; i++){
		for (let team of teams){
			if ((holes == true && !holes_array.includes(i)) || holes == false)
				team.backplayer.array.add(Math.round(team.backplayer.posy) + i);
		}
	}
	for (let i = 0 - player_size + 1; i < player_size; i++){
		for (let team of teams){
			if (team.frontplayer)
				team.frontplayer.array.add(Math.round(team.frontplayer.posy) + i);
		}
	}
	for (let x = Math.round(ball.x) - ball_size + 1; x < Math.round(ball.x) + ball_size; x++){
		for (let y = Math.round(ball.y) - ball_size + 1; y < Math.round(ball.y) + ball_size; y++)
			ball_array.add({x,y});
	}
}

//Store the data to send to the front
function game_data_creation(){
	let game_data = {
		teams,
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
	game_data.ball_real_array_futur = Array.from(ball_real_array_futur);
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
	for (let team of teams){
		team.backplayer.move(player_size, 1);
		if (team.frontplayer)
			team.frontplayer.move(player_size - 1, 1);
	}
}

async function winBall(){
	ball.x = Math.floor(WIDTH / 2);
	ball.y = Math.floor(HEIGHT / 2);
	let angle = (Math.random() - 0.5) * MAX_BOUNCE_ANGLE;
	let dir = Math.random() < 0.5 ? 1 : -1;
	ball.dx = dir * BALL_SPEED * Math.cos(angle);
	ball.dy = BALL_SPEED * Math.sin(angle);
	ball.last_touch = null;
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
		teams[1].score += point_value;
		winBall();
	}
	else if (ball.x > WIDTH){
		teams[0].score += point_value;
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
	for (let team of teams){
		team.backplayer.input(player_size, key, connection);
		if (team.frontplayer)
			team.frontplayer.input(player_size - 1, key, connection);
	}
	
	if (operator == true){
		if (key === 'p' && pause == true) pause = false;
		else if (key === 'p' && pause == false) pause = true;
		if (key === 'v' && vision == true) vision = false;
		else if (key === 'v' && vision == false) vision = true;
		if (key === ',' && vision == true) futur_vision -= 1;
		if (key === '.' && vision == true) futur_vision += 1;
		if (key === '[' && vision == true) error_margin -= 1;
		if (key === ']' && vision == true) error_margin += 1; 
		if (key === '1' && ball_size < 15) ball_size += 1;
		if (key === '2' && ball_size > 1) ball_size -= 1;
		if (key === '3' && player_size < 15) player_size += 1;
		if (key === '4' && player_size > 1 + four_player) player_size -= 1;
		if (key === '\\' && IA == true) IA = false;
		else if (key === '\\' && IA == false) IA = true;
		if (key === '+' || key === '-'){
			let angle = Math.atan2(ball.dy, ball.dx) * 180 / Math.PI;
			angle += (key === '+') ? 1.5 : -1.5;
			let speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy) || BALL_SPEED;
			ball.dx = speed * Math.cos(angle * Math.PI / 180);
			ball.dy = speed * Math.sin(angle * Math.PI / 180);
		}
	}
	if (gamestart == false && key === ' ' && ((local == false && clients.length) || local == true)){
		gamestart = true;
		custom_mode_func();
	}
};

//Called when an input is realeased by a player
function inputrelease(key, connection){
	for (let team of teams){
		team.backplayer.release(key, connection);
		if (team.frontplayer)
			team.frontplayer.release(key, connection);
	}
};

//The iteration of the Game
function gameLoop() {
	for (let team of teams){
		if (team.score >= MAX_SCORE){
			gameover = true;
			sendInfoToFront();
			return ;
		}
	}
	if (gamestart == true)
		movePlayers();
	if (gamestart == true && pause == false){
		moveBall();
	}
	ball_array_futur = new Set();
	ball_real_array_futur = new Set();
	if (vision == true || IA == true)
		futur();
	if (gamestart == true && pause == false && custom_mode == true){
		moveMultipleBall();
	}
	if (gamestart == true && IA == true)
		moveIA();
	draw_web();
	if (!gameover) setTimeout(gameLoop, 1000 / FPS);
}

gameLoop();

//Check if the player is moving to give Velocity to the Ball
setInterval(() => {
	teams.forEach(team =>{
		team.backplayer.update_velocity();
		if (team.frontplayer)
			team.frontplayer.update_velocity();
	})
}, 100);

//Update the IA every 1sec
if (IA == true){
	setInterval(() => {
		error_margin +=  Math.random() < 0.7 - (IA_diff * 0.1) ? -1 : 1;
		futur_vision +=  Math.random() < 0.3 + (IA_diff * 0.1) ? -1 : 1;
		let rage = (teams[0].score <= teams[1].score) ? 0 : Math.round(Math.pow((teams[0].score - teams[1].score ), 2) / 4);
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
		searchIA(teams[1].backplayer);
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
	ball.last_touch = null;
}

async function effect1(){ //done to scale
	console.log("Always faster {1}");
	if (true_speeding_ball == false){
		true_speeding_ball = true;
		setInterval(() => {
			if (true_speeding_ball == false){
				BALL_SPEED = BASE_BALL_SPEED;
				PLAYER_SPEED = BASE_PLAYER_SPEED;
				return ;
			}
			if (BALL_SPEED > 3)
				return ;
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
	if (player_size > 1 + four_player) player_size -= 1;
}

async function effect4(){ //done
	console.log("More ! More ! {4}");
	multiple_ball = true;
}

async function effect5(){  //second player don't work
	console.log("You are hallucinating {5}");
	teams.forEach(team =>{
		team.backplayer.up_player = team.backplayer.base_down;
		team.backplayer.down_player = team.backplayer.base_up;
		if (team.frontplayer){
			team.frontplayer.up_player = team.frontplayer.base_down;
			team.frontplayer.down_player = team.frontplayer.base_up;
		}
	})
}

async function effect6(){  //lag a bit
	if (in_effect == true)
		return ;
	in_effect = true;
	console.log("It's just a break {6}");
	ball.last_touch = null;
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
	ball.last_touch = null;
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
	teams.forEach(team =>{
		team.backplayer.posy =  tmp_margin + Math.round((HEIGHT - tmp_margin) * Math.random());
		if (team.frontplayer){
			team.frontplayer.posy =  tmp_margin + Math.round((HEIGHT - tmp_margin) * Math.random());
		}
	})
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
	// if (gold_game == true)
	// 	return ;
	// box_array = [];
	// console.log("Golden Ball {18}");
	// teams.forEach(team => team.score = 0);
	// MAX_SCORE = 1;
	// gold_game = true;
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
	true_speeding_ball = false;
	in_effect = false;
	multiple_ball = false;
	multiple_ball_array = [];
	teams.forEach(team =>{
		team.backplayer.up_player = team.backplayer.base_up;
		team.backplayer.down_player = team.backplayer.base_down;
		if (team.frontplayer){
			team.frontplayer.up_player = team.frontplayer.base_up;
			team.frontplayer.down_player = team.frontplayer.base_down;
		}
	})
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
	if (custom_mode == true){
		function spawn_a_box(){
			let x = bounce_margin_size + Math.round((WIDTH - bounce_margin_size) * Math.random());;
			let y = top_margin_size + Math.round((HEIGHT - top_margin_size) * Math.random());
			let new_box = new Box(Math.round(WIDTH * Math.random()), Math.round(HEIGHT * Math.random()), Math.floor(Math.random() * 23));
			while (box_array.includes(new_box) == true)
				new_box = new Box(Math.round(WIDTH * Math.random()), Math.round(HEIGHT * Math.random()), Math.floor(Math.random() * 23));
			// let nbr = 18;
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

