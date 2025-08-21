//Class
class Client {
	constructor(connection, id){
		this.connection = connection;
		this.id = id;
	}
}

//Game constant
const HEIGHT = 60;
const WIDTH = 80;
const MAX_BOUNCE_ANGLE = Math.PI / 5;
const BALL_SPEED = 0.7;
const PLAYER_SPEED = 1;
const MAX_SCORE = 10;

//Game variable
let gamestart = false;
let gameover = false;

//Player Score
let player1_score = 0;
let player2_score = 0;

//Initialisation of players and balls
let player1 = Math.floor(HEIGHT / 2);
let player2 = Math.floor(HEIGHT / 2);
let ball = {x : WIDTH / 2, y : Math.floor(HEIGHT / 2), dx : Math.random() < 0.5 ? -1 : 1 , dy : Math.random() < 0.5 ? -1 : 1};

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
let IA = true;
let error_margin = 65;
let target_IA = {x : WIDTH / 2, y : Math.floor(HEIGHT / 2)};

//Mode
let pause = false;
let vision = false;

//Vision
let futur_vision = 60;
let ball_futur = {x : WIDTH / 2, y : Math.floor(HEIGHT / 2), dx : Math.random() < 0.5 ? -1 : 1 , dy : Math.random() < 0.5 ? -1 : 1};
let ball_array_futur = [];
let ball_real_array_futur = [];

//Difficulty
// let IA_difficulty = "Medium";
// if ()
// let speeding_mode = false;

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
		console.log("New Client");
		let game_data = game_data_creation();
		connection.send(JSON.stringify({ type: 'state', state: game_data }));
		connection.on('message', (message) => {
			try {
			const data = JSON.parse(message);
			if (data.type === 'keydown') inputpressed(data.key);
			if (data.type === 'keyup') inputrelease(data.key);
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

//Compute the new position of a ball
function move_obj_ball(obj_ball){
	obj_ball.x += obj_ball.dx;
	obj_ball.y += obj_ball.dy;
	if (obj_ball.y <= ball_size + top_margin_size || obj_ball.y >= HEIGHT - (ball_size + top_margin_size)){
		if (obj_ball === ball)
			bounce_nbr++;
		obj_ball.dy *= -1;
	}
	if (obj_ball.dx < 0 && obj_ball.x <= (ball_size + bounce_margin_size) && obj_ball.x >= kill_margin_size
			&& player1_array.includes(Math.round(obj_ball.y))){
		if (obj_ball === ball) exchange_nbr++;
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
		if (obj_ball === ball) exchange_nbr++;
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
	for (let t = 0; t < futur_vision; t++){
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
		exchange_nbr, bounce_nbr, velocity_use
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
	if (keyW == true && player1 > player_size + top_margin_size) player1 += player1_vel;
	if (keyS == true && player1 < HEIGHT - (player_size + top_margin_size)) player1 += player1_vel;
	if (keyUp == true && player2 > player_size + top_margin_size) player2 += player2_vel;
	if (keyDown == true && player2 < HEIGHT - (player_size + top_margin_size)) player2 += player2_vel;

	if (player2 >= HEIGHT - (player_size + top_margin_size)) player2--;
	if (player2 <= player_size + top_margin_size) player2++;
	if (player1 >= HEIGHT - (player_size + top_margin_size)) player1--;
	if (player1 <= player_size + top_margin_size) player1++;
}

//It's in the name, it moves the Ball
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

//Called when an input is pressed by a player
function inputpressed(key){
	if (key === 'w' && player1 > player_size + top_margin_size){
		player1_vel = -1 * PLAYER_SPEED;
		keyS = false; keyW = true;
	} 
	if (key === 's' && player1 < HEIGHT - (player_size + top_margin_size)){
		player1_vel = 1 * PLAYER_SPEED;
		keyW = false; keyS = true;
	}
	if (key === 'ArrowUp' && player2 > player_size + top_margin_size && IA == false){
		player2_vel = -1 * PLAYER_SPEED;
		keyDown = false; keyUp = true;
	}
	if (key === 'ArrowDown' && player2 < HEIGHT - (player_size + top_margin_size) && IA == false){
		player2_vel = 1 * PLAYER_SPEED;
		keyUp = false; keyDown = true;
	}
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
	if (key === ' ') gamestart = true;
};

//Called when an input is realeased by a player
function inputrelease(key){
	if (key === 'w'){
		keyW = false;
		if (keyS === false) player1_vel = 0;
	}
	if (key === 's'){
		keyS = false;
		if (keyW === false) player1_vel = 0;
	}
	if (IA == false){
		if (key === 'ArrowUp'){
			keyUp = false;
			if (keyDown === false) player2_vel = 0;
		}
		if (key === 'ArrowDown'){
			keyDown = false;
			if (keyUp === false) player2_vel = 0;
		}
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
	if (gamestart == true && pause == false)
		moveBall();
	ball_array_futur = [];
	ball_real_array_futur = [];
	if (vision == true || IA == true)
		futur();
	if (gamestart == true && IA == true)
		moveIA();
	draw_web();
	if (!gameover) setTimeout(gameLoop, 1000 / 60);
}

gameLoop();

//Check if the player is moving to give Velocity to the Ball
setInterval(() => {
	velocity1 = player1 - last_velocity1;
	velocity2 = player2 - last_velocity2;
	last_velocity1 = player1;
	last_velocity2 = player2;
}, 100);

//Update the IA every 1sec
setInterval(() => {
	if (IA == true) searchIA();
}, 1000);