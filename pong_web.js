//Game constant
const FPS = 60;
const GAME_SPEED = 1.4
const HEIGHT = 60;
const WIDTH = 80;
const BASE_PLAYER_SPEED = 0.8 * GAME_SPEED;
const BASE_BALL_SPEED = 0.5 * GAME_SPEED;
const MAX_BOUNCE_ANGLE = Math.PI / 5;
let MAX_SCORE = 10;
let top_margin_size = 1;
let bounce_margin_size = 8;
let kill_margin_size = 4;

//Import
import * as utils from './pong_web_utils.js';

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

export class Player{
	constructor(id, posx, base_up, base_down, connection){
		this.connection = connection;
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
		
	}
	move(local_player_size, reduce_speed){
		if (this.keyUp == true && this.posy + (this.player_vel * reduce_speed) > local_player_size + top_margin_size) this.posy += (this.player_vel * reduce_speed);
		if (this.keyDown == true && this.posy +(this.player_vel * reduce_speed) < HEIGHT - (local_player_size + top_margin_size)) this.posy += (this.player_vel * reduce_speed);
		if (this.posy >= HEIGHT - (local_player_size + top_margin_size)) this.posy--;
		if (this.posy <= local_player_size + top_margin_size) this.posy++;
	}
	input(game, local_player_size, key, id){
		if (this.id == 1 && this.IA == true)
			return ;
		if (key == this.up_player && this.posy < HEIGHT - (local_player_size + top_margin_size) && (game.local == true || (game.local == false && id == this.id))){
			this.player_vel = -1 * game.PLAYER_SPEED;
			this.keyDown = false; this.keyUp = true;
		}
		if (key == this.down_player && this.posy < HEIGHT - (local_player_size + top_margin_size) && (game.local == true || (game.local == false && id == this.id))){
			this.player_vel = 1 * game.PLAYER_SPEED;
			this.keyUp = false; this.keyDown = true;
		}
	}
	release(game, key, id){
		if (this.id == 1 && game.IA == true)
			return ;
		if (key == this.up_player && (game.local == true || (game.local == false && id == this.id))){
			this.keyUp = false;
			if (this.keyDown == false) this.player_vel = 0;
		}
		if (key == this.down_player && (game.local == true || (game.local == false && id == this.id))){
			this.keyDown = false;
			if (this.keyUp == false) this.player_vel = 0;
		}
	}
	update_velocity(){
		this.velocity = this.posy - this.last_velocity;
		this.last_velocity = this.posy;
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

export class Game {
	constructor(operator, local, IA, players, custom_mode, IA_diff){
		this.operator = operator;
		this.local = local;
		this.IA = IA;
		this.players = players;
		this.custom_mode = custom_mode;
		this.PLAYER_SPEED = BASE_PLAYER_SPEED;
		this.BALL_SPEED = BASE_BALL_SPEED;
		this.start = false;
		this.over = false;
		this.point_value = 1;

		this.ball = new Ball(WIDTH / 2, Math.floor(HEIGHT / 2),
					Math.random() < 0.5 ? -1 : 1, 
					Math.random() < 0.5 ? -1 : 1);
		let angle = (Math.random() - 0.5) * MAX_BOUNCE_ANGLE;
		let dir = Math.random() < 0.5 ? 1 : -1;
		this.ball.dx = dir * this.BALL_SPEED * Math.cos(angle);
		this.ball.dy = this.BALL_SPEED * Math.sin(angle);

		this.exchange_nbr = 0;
		this.bounce_nbr = 0;
		this.velocity_use = 0;
		this.player_size = 5;
		this.ball_size = 1;
		this.ball_array = new Set();
		this.error_margin = 65;
		this.target_IA = {x : WIDTH / 2, y : Math.floor(HEIGHT / 2)};
		this.pause = false;
		this.vision = false;
		this.futur_vision = 60;
		this.ball_futur = {...this.ball};
		this.ball_array_futur = new Set();
		this.ball_real_array_futur = new Set();
		this.effect = 0.15;
		this.in_effect = false;
		this.box_array = [];
		this.true_speeding_ball = false;
		this.multiple_ball = false;
		this.multiple_ball_array = [];
		this.obstacle_array = [];
		this.holes = false;
		this.holes_array = [];
		this.negative = false;
		this.snake_mode = false;
		this.snake_array = [];
		this.invisible_player = false;
		this.meteorites = false;
		this.meteorites_array = [];
		this.gold_game = false;
		this.epic_moment = false;
		this.portal = false;
		this.invisible_ball_active = false;
		this.invisible_ball = false;
		this.IA_diff = IA_diff ;
		switch (IA_diff){
			case 0 :
				this.error_margin = 0; this.futur_vision = 100; break;
			case 1 :
				this.error_margin = 65; this.futur_vision = 60; break;
			case 2 :
				this.error_margin = 55; this.futur_vision = 31; break;
			case 3 :
				this.error_margin = 41; this.futur_vision = 15; break;
			case 4 :
				this.error_margin = 31; this.futur_vision = 12; break;
		}
		this.speeding_mode = false;

		this.team1 = null;
		this.team2 = null;
		// this.team1 = new Team(1, players[0], null);
		// this.team2 = new Team(2, new Player(1, WIDTH - 6, 
		// 	'ArrowUp', 'ArrowDown', this.players[0].connection), null);
		if (this.players.length >= 3){
			this.team1 = new Team(1, players[0], players[2]);
		} else {
			this.team1 = new Team(1, players[0], null);
		}
		if (this.players.length >= 4){
			this.team2 = new Team(2, players[1], players[3]);
		} else if (local){ 
			this.team2 = new Team(2, new Player(1, WIDTH - 6, 
			'ArrowUp', 'ArrowDown', this.players[0].connection), null);
		} else {
			this.team2 = new Team(2, players[1], null);
		}

		this.teams = [this.team1, this.team2];
	}

	startGame(){
		this.gameLoop();
		//Check if the player is moving to give Velocity to the this.Ball
		setInterval(() => {
			this.teams.forEach(team =>{
				team.backplayer.update_velocity();
				if (team.frontplayer)
					team.frontplayer.update_velocity();
				})
		}, 100);

		//Update the this.IA every 1sec
		if (this.IA == true){
			setInterval(() => {
				this.error_margin +=  Math.random() < 0.7 - (this.IA_diff * 0.1) ? -1 : 1;
				this.futur_vision +=  Math.random() < 0.3 + (this.IA_diff * 0.1) ? -1 : 1;
				let rage = (this.teams[0].score <= this.teams[1].score) ? 0 : Math.round(Math.pow((this.teams[0].score - this.teams[1].score ), 2) / 4);
				switch (this.IA_diff){
					case 0 :
						if (this.error_margin < 0) this.error_margin = 0;
						if (this.error_margin > 10) this.error_margin = 10;
						if (this.futur_vision < 90 + (rage * 2)) this.futur_vision = 90 + (rage * 2);
						if (this.futur_vision > 110 + (rage * 2)) this.futur_vision = 110 + (rage * 2);
						break;
					case 1 :
						if (this.error_margin < 55 - rage) this.error_margin = 55 - rage;
						if (this.error_margin > 75 - rage) this.error_margin = 75 - rage;
						if (this.futur_vision < 50 + (rage * 2)) this.futur_vision = 50 + (rage * 2);
						if (this.futur_vision > 70 + (rage * 2)) this.futur_vision = 70 + (rage * 2);
						break;
					case 2 :
						if (this.error_margin < 50 - rage) this.error_margin = 50 - rage;
						if (this.error_margin > 65 - rage) this.error_margin = 70 - rage;
						if (this.futur_vision < 21 + (rage * 2)) this.futur_vision = 21 + (rage * 2);
						if (this.futur_vision > 41 + (rage * 2)) this.futur_vision = 41 + (rage * 2);
						break;
					case 3 :
						if (this.error_margin < 31 - rage) this.error_margin = 31 - rage;
						if (this.error_margin > 51 - rage) this.error_margin = 51 - rage;
						if (this.futur_vision < 9 + (rage * 2)) this.futur_vision = 9 + (rage * 2);
						if (this.futur_vision > 21 + (rage * 2)) this.futur_vision = 21 + (rage * 2);
						break;
					case 4 :
						if (this.error_margin < 25 - rage) this.error_margin = 25 - rage;
						if (this.error_margin > 41 - rage) this.error_margin = 41 - rage;
						if (this.futur_vision < 6 + (rage * 2)) this.futur_vision = 6 + (rage * 2);
						if (this.futur_vision > 18 + (rage * 2)) this.futur_vision = 18 + (rage * 2);
						break;
				}
				this.searchIA(this.teams[1].backplayer);
			}, 1000);
		}

		if (this.speeding_mode == true){
			setInterval(() => {
					this.BALL_SPEED += 0.1;
					this.PLAYER_SPEED += 0.1;
			}, 5000);
		}
	}

	//The iteration of the Game
	gameLoop() {
		try{
			if (inputdata.type === 'keydown') inputpressed(inputdata.key, connection);
			if (inputdata.type === 'keyup') inputrelease(inputdata.key, connection);
		} catch (e) {}
		for (let team of this.teams){
			if (team.score >= MAX_SCORE){
				this.over = true;
				this.sendInfoToFront();
				return ;
			}
		}
		if (this.start == true)
			this.movePlayers();
		if (this.start == true && this.pause == false){
			this.moveBall();
		}
		this.ball_array_futur = new Set();
		this.ball_real_array_futur = new Set();
		if (this.vision == true || this.IA == true)
			this.futur();
		if (this.start == true && this.pause == false && this.custom_mode == true){
			this.moveMultipleBall();
		}
		if (this.start == true && this.IA == true)
			this.moveIA();
		this.draw_web();
		if (!this.over) setTimeout(this.gameLoop.bind(this), 1000 / FPS);
	}

	//Store the futur of the this.ball at an instance
	count_array_futur(touch){
		for (let x = this.ball_futur.x - this.ball_size + 1; x < this.ball_futur.x + this.ball_size; x++){
			for (let y = this.ball_futur.y - this.ball_size + 1; y < this.ball_futur.y + this.ball_size; y++)
				this.ball_real_array_futur.add({x,y,touch});
		}
		for (let x = Math.round(this.ball_futur.x) - this.ball_size + 1; x < Math.round(this.ball_futur.x) + this.ball_size; x++){
			for (let y = Math.round(this.ball_futur.y) - this.ball_size + 1; y < Math.round(this.ball_futur.y) + this.ball_size; y++)
				this.ball_array_futur.add({x,y,touch});
		}
	}

	//Use to change the dir of a this.ball of the custom mode "More ! More ! {4}"
	new_direction_aproximation(obj_ball){
		const angle = Math.atan2(obj_ball.dy, obj_ball.dx);
		const speed = Math.sqrt(obj_ball.dx * obj_ball.dx + obj_ball.dy * obj_ball.dy);
		const delta = (Math.random() - 0.5) * 4;
		const newAngle = angle + delta;
		const newDx = Math.cos(newAngle) * speed;
		const newDy = Math.sin(newAngle) * speed;
		return ({newDx, newDy});
	}

	bounce_on_obstacle(obj_ball, obs_array, hitbox){
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
					if (obj_ball == this.ball)
						remove.push(obs_array.indexOf(obs));
				}
			}
		});
		for (let i = remove.length - 1; i >= 0; i--)
			obs_array.splice(remove[i], 1);
	}

	isBallOnPaddle(obj_ball, player) {
		return (
			obj_ball.x >= player.posx - player.hitbox &&
			obj_ball.x <= player.posx + player.hitbox &&
			obj_ball.y >= player.posy - (this.player_size + 0.5) &&
			obj_ball.y <= player.posy + (this.player_size + 0.5)
		);
	}

	bounce_on_player(obj_ball){
		let player = null;
		let side = 0;
		for (let t = 0; t < this.teams.length; t++) {
			let candidates = [this.teams[t].backplayer];
			if (this.teams[t].frontplayer) candidates.push(this.teams[t].frontplayer);
			for (let p of candidates) {
				if (this.isBallOnPaddle(obj_ball, p)) {
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
		// let hit_pos = (obj_ball.y - player.posy) / ((this.player_size * 2 + 1) / 2);
		// if (hit_pos < -1) hit_pos = -1;
		// if (hit_pos > 1) hit_pos = 1;
		// let bounce_angle = hit_pos * MAX_BOUNCE_ANGLE;
		let hit_pos = (obj_ball.y - player.posy) / ((this.player_size * 2 + 1) / 2);
		hit_pos = Math.max(-1, Math.min(1, hit_pos));
		let bounce_angle = hit_pos * MAX_BOUNCE_ANGLE;

		// let from_left = (obj_ball.x < player.posx) && (obj_ball.dx > 0);
		// let from_right = (obj_ball.x > player.posx) && (obj_ball.dx < 0);

		// if (from_left || from_right) {
		//     let sign = (obj_ball.x < player.posx) ? -1 : 1; // rebond correct selon le côté
		//     obj_ball.dx = sign * this.BALL_SPEED * Math.cos(bounce_angle);
		//     obj_ball.dy = this.BALL_SPEED * Math.sin(bounce_angle);
		// }
		let over_left = Math.abs(obj_ball.x - (player.posx - player.hitbox)) < Math.abs(obj_ball.dx);
		let over_right = Math.abs(obj_ball.x - (player.posx + player.hitbox)) < Math.abs(obj_ball.dx);
		let over_top = Math.abs(obj_ball.y - (player.posy - this.player_size)) < Math.abs(obj_ball.dy);
		let over_bot = Math.abs(obj_ball.y - (player.posy + this.player_size)) < Math.abs(obj_ball.dy);

		if ((over_left && obj_ball.dx > 0) || (over_right && obj_ball.dx < 0)) {
			let sign = (obj_ball.x < player.posx) ? -1 : 1;
			obj_ball.dx = sign * this.BALL_SPEED * Math.cos(bounce_angle);
			obj_ball.dy = this.BALL_SPEED * Math.sin(bounce_angle);
		} else if ((over_top && obj_ball.dy > 0) || (over_bot && obj_ball.dy < 0)) {
			obj_ball.dy *= -1;
			obj_ball.dx *= -1;
		}

		//Player's velocity
		if (player.velocity != 0)
			obj_ball.dy += player.velocity * this.effect;

		if (obj_ball === this.ball){
			this.exchange_nbr++;
			if (this.multiple_ball == true){
				for (let i = 0; i < 5; i++){
					let temp_dir = this.new_direction_aproximation(obj_ball);
					this.multiple_ball_array.push(new Ball(this.ball.x, this.ball.y, temp_dir.newDx, temp_dir.newDy));
				}
			}
		}
		// if (player.velocity != 0 && obj_ball === this.ball) this.velocity_use++;
		// obj_ball.dx = this.BALL_SPEED * Math.cos(bounce_angle);
		// obj_ball.dy = this.BALL_SPEED * Math.sin(bounce_angle);
		
		// if (team == 0 && obj_ball.dx < 0) obj_ball.dx = Math.abs(obj_ball.dx);
		// if (team == 1 && obj_ball.dx > 0) obj_ball.dx = -Math.abs(obj_ball.dx);
		// Velocity from player
		// obj_ball.dy += player.velocity * effect;
		// if (player.velocity != 0 && obj_ball === this.ball) this.velocity_use++;
	}

	//Compute the new position of a this.ball
	move_obj_ball(obj_ball){
		obj_ball.x += obj_ball.dx;
		obj_ball.y += obj_ball.dy;
		
		if (this.custom_mode){
			this.bounce_on_obstacle(obj_ball, this.obstacle_array, 1);
			this.bounce_on_obstacle(obj_ball, this.meteorites_array, 2);
			this.bounce_on_obstacle(obj_ball, this.snake_array, 1);
		}
		
		if (obj_ball.y <= this.ball_size + top_margin_size || obj_ball.y >= HEIGHT - (this.ball_size + top_margin_size)){
			if (this.portal == false){
				if (obj_ball === this.ball)
					this.bounce_nbr++;
				obj_ball.dy *= -1;
			}
			else {
				if (obj_ball.y < HEIGHT / 2)
					obj_ball.y = HEIGHT - (this.ball_size + top_margin_size) - 2;
				else
					obj_ball.y  =this.ball_size + top_margin_size + 2;
			}
		}
		// for (let player of players){
		this.bounce_on_player(obj_ball);
		// }
	}

	//Compute and Store the info on the this.ball's futur in 'this.vision' distance
	futur(){
		this.ball_futur = {...this.ball};
		let touch = false;
		for (let t = 0; t < this.futur_vision * (1 + (this.BALL_SPEED - BASE_BALL_SPEED)); t++){
			let temp_obj_dx = this.ball_futur.dx;
			this.move_obj_ball(this.ball_futur);
			if (temp_obj_dx != this.ball_futur.dx) touch = true;
			if (this.ball_futur.x < 0) return ;
			else if (this.ball_futur.x > WIDTH) return ;
			if (this.ball_futur.y < this.ball_size + top_margin_size) this.ball_futur.y = this.ball_size + top_margin_size;
			else if (this.ball_futur.y > HEIGHT - (this.ball_size + top_margin_size)) this.ball_futur.y = HEIGHT - (this.ball_size + top_margin_size);
			this.count_array_futur(touch);
		}
	}

	//Get the next position of the this.IA
	searchIA(player){
		const arr = Array.from(this.ball_array_futur);
		let target = arr.slice().reverse().find(obj =>
			obj.touch === false &&
			obj.x >= this.error_margin &&
			obj.x < player.posx + player.hitbox
		);

		this.target_IA = {x : player.posx + player.hitbox, y : Math.floor(HEIGHT / 2)};
		if (target) this.target_IA = { x: target.x, y: target.y };
	}

	//It's in the name, it moves the this.IA
	moveIA(){
		let ia_array = new Set(); // [];
		let ia_player_size = (this.player_size <= 1) ? (this.player_size) : (this.player_size - 1);
		for (let i = 0 - ia_player_size; i <= ia_player_size; i++)
			ia_array.add(Math.round(this.teams[1].backplayer.posy) + i);
		if (ia_array.has(this.target_IA.y)) {
			this.teams[1].backplayer.keyDown = false;
			this.teams[1].backplayer.keyUp = false;
			this.teams[1].backplayer.player_vel = 0;
			return ;
		}
		if (this.target_IA.y > this.teams[1].backplayer.posy){
			this.teams[1].backplayer.keyUp = true;
			this.teams[1].backplayer.player_vel = 1 * this.PLAYER_SPEED;
		}
		if (this.target_IA.y < this.teams[1].backplayer.posy){
			this.teams[1].backplayer.keyDown = true;
			this.teams[1].backplayer.player_vel = -1 * this.PLAYER_SPEED;
		}
	}

	//Get the hitbox of the players and this.ball
	count_array_web(){
		this.teams.forEach(team => {
			team.backplayer.array = new Set()
			if (team.frontplayer)
				team.frontplayer.array = new Set()
		});
		this.ball_array = new Set(); //[];
		for (let i = 0 - this.player_size; i <= this.player_size; i++){
			for (let team of this.teams){
				if ((this.holes == true && !this.holes_array.includes(i)) || this.holes == false)
					team.backplayer.array.add(Math.round(team.backplayer.posy) + i);
			}
		}
		for (let i = 0 - this.player_size + 1; i < this.player_size; i++){
			for (let team of this.teams){
				if (team.frontplayer)
					team.frontplayer.array.add(Math.round(team.frontplayer.posy) + i);
			}
		}
		for (let x = Math.round(this.ball.x) - this.ball_size + 1; x < Math.round(this.ball.x) + this.ball_size; x++){
			for (let y = Math.round(this.ball.y) - this.ball_size + 1; y < Math.round(this.ball.y) + this.ball_size; y++)
				this.ball_array.add({x,y});
		}
	}

	serializePlayer(player) {
		if (!player) return null;
		return {
			id: player.id,
			posx: player.posx,
			posy: player.posy,
		};
	}

	//Store the data to send to the front
	game_data_creation(){
		let display_players = [];
		let idx = 0;
		for (let team of this.teams){
			let display_player_back = {
				posx: team.backplayer.posx - idx,
				posy: team.backplayer.posy,
				size : this.player_size,
				type : "b"
			}
			display_players.push(display_player_back);
			if (team.frontplayer){
				let display_player_front = {
					posx: team.frontplayer.posx - idx,
					posy: team.frontplayer.posy,
					size : this.player_size - 1,
					type : "f"
				}
				display_players.push(display_player_front);
			}
			idx++;
		}
		let display_ball = {
			x: this.ball.x,
			y: this.ball.y,
			dx: this.ball.dx,
			dy: this.ball.dy
		}
		let display_mutliple_array = [];
		for (let obj_ball of this.multiple_ball_array){
			let display_ball = {
				x: obj_ball.x,
				y: obj_ball.y,
				dx: obj_ball.dx,
				dy: obj_ball.dy
			}
			display_mutliple_array.push(display_ball);
		}
		let game_data = {
			team1_score: this.teams[0].score,
			team2_score: this.teams[1].score,
			players: display_players,
			ball: display_ball,
			ball_size: this.ball_size,
			ball_real_array_futur: this.ball_real_array_futur,
			vision: this.vision,
			IA: this.IA,
			target_IA: this.target_IA,
			MAX_SCORE: MAX_SCORE,
			error_margin: this.error_margin,
			player_size: this.player_size,
			kill_margin_size: kill_margin_size,
			gamestart: this.start,
			gameover: this.over,
			exchange_nbr: this.exchange_nbr, 
			bounce_nbr: this.bounce_nbr,
			velocity_use: this.velocity_use,
			obstacle_array: this.obstacle_array, 
			holes_array: this.holes_array, 
			negative: this.negative,
			snake_array: this.snake_array,
			invisible_player: this.invisible_player,
			gold_game: this.gold_game,
			meteorites_array: this.meteorites_array,
			invisible_ball: this.invisible_ball,
			multiple_ball_array: display_mutliple_array, 
			portal: this.portal, 
			custom_mode: this.custom_mode, 
			box_array: this.box_array,
			in_effect: this.in_effect
		}
		return game_data;
	}

	//Send info to the front (Again it's in the name)
	sendInfoToFront(){
		let game_data = this.game_data_creation();
		game_data.ball_real_array_futur = Array.from(this.ball_real_array_futur);
		this.players
			.filter(client => client.connection && client.connection.readyState === client.connection.OPEN)
			.forEach(client => {
				try {
					client.connection.send(JSON.stringify({ type: 'state', state: game_data }));
				} catch (e){
					console.error('Erreur lors de l\'envoi du this.over au client :', e);
				}
			});
	}

	//Groups function that are used to draw the game
	draw_web(){
		this.count_array_web();
		this.sendInfoToFront();
	}

	//It's in the name, it moves the players
	movePlayers(){
		for (let team of this.teams){
			team.backplayer.move(this.player_size, 1);
			if (team.frontplayer)
				team.frontplayer.move(this.player_size - 1, 1);
		}
	}

	async winBall(){
		this.ball.x = Math.floor(WIDTH / 2);
		this.ball.y = Math.floor(HEIGHT / 2);
		let angle = (Math.random() - 0.5) * MAX_BOUNCE_ANGLE;
		let dir = Math.random() < 0.5 ? 1 : -1;
		this.ball.dx = dir * this.BALL_SPEED * Math.cos(angle);
		this.ball.dy = this.BALL_SPEED * Math.sin(angle);
		this.ball.last_touch = null;
		if (this.speeding_mode){
			this.PLAYER_SPEED = BASE_PLAYER_SPEED;
			this.BALL_SPEED = BASE_BALL_SPEED;
		}
		if (this.custom_mode == true)
			reset_effect(this);
		this.pause = true;
		await utils.sleep(1000);
		this.pause = false;
	}

	//It's in the name, it moves the this.Ball
	async moveBall(){
		this.move_obj_ball(this.ball);
		if (this.ball.x < 0){
			this.teams[1].score += this.point_value;
			this.winBall();
		}
		else if (this.ball.x > WIDTH){
			this.teams[0].score += this.point_value;
			this.winBall();
		}
		if (this.ball.y < this.ball_size + top_margin_size) this.ball.y = this.ball_size + top_margin_size;
		else if (this.ball.y > HEIGHT - (this.ball_size + top_margin_size)) this.ball.y = HEIGHT - (this.ball_size + top_margin_size) ;
		touch_box(this);
	}

	//It moves the array of this.ball if the custom mode "More ! More ! {4}" is active
	async moveMultipleBall(){
		let remove = [];
		for (let i = 0; i < this.multiple_ball_array.length; i++){
			this.move_obj_ball(this.multiple_ball_array[i]);
			if (this.multiple_ball_array[i].x < 0 || this.multiple_ball_array[i].x > WIDTH){
				remove.push(i);
				continue ;
			}
			if (this.multiple_ball_array[i].y < this.ball_size + top_margin_size) this.multiple_ball_array[i].y = this.ball_size + top_margin_size;
			else if (this.multiple_ball_array[i].y > HEIGHT - (this.ball_size + top_margin_size)) this.multiple_ball_array[i].y = HEIGHT - (this.ball_size + top_margin_size) ;
		}
		for (let i = remove.length - 1; i >= 0; i--)
			this.multiple_ball_array.splice(remove[i], 1);
	}

	inputpressed(key, id){
		for (let team of this.teams){
			team.backplayer.input(this, this.player_size, key, id);
			if (team.frontplayer)
				team.frontplayer.input(this, this.player_size - 1, key, id);
		}
		
		if (this.operator == true){
			if (key === 'p' && this.pause == true) this.pause = false;
			else if (key === 'p' && this.pause == false) this.pause = true;
			if (key === 'v' && this.vision == true) this.vision = false;
			else if (key === 'v' && this.vision == false) this.vision = true;
			if (key === ',' && this.vision == true) this.futur_vision -= 1;
			if (key === '.' && this.vision == true) this.futur_vision += 1;
			if (key === '[' && this.vision == true) this.error_margin -= 1;
			if (key === ']' && this.vision == true) this.error_margin += 1; 
			if (key === '1' && this.ball_size < 15) this.ball_size += 1;
			if (key === '2' && this.ball_size > 1) this.ball_size -= 1;
			if (key === '3' && this.player_size < 15) this.player_size += 1;
			if (key === '4' && this.player_size > 1 + (this.players.length > 2) ? 1 : 0) this.player_size -= 1;
			if (key === '\\' && this.IA == true) this.IA = false;
			else if (key === '\\' && this.IA == false) this.IA = true;
			if (key === '+' || key === '-'){
				let angle = Math.atan2(this.ball.dy, this.ball.dx) * 180 / Math.PI;
				angle += (key === '+') ? 1.5 : -1.5;
				let speed = Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy) || this.BALL_SPEED;
				this.ball.dx = speed * Math.cos(angle * Math.PI / 180);
				this.ball.dy = speed * Math.sin(angle * Math.PI / 180);
			}
		}
		if (this.start == false && key === ' ' && ((this.local == false && clients.length) || this.local == true)){
			this.start = true;
			custom_mode_func(this);
		}
	};

	//Called when an input is released by a player
	inputrelease(key, id){
		for (let team of this.teams){
			team.backplayer.release(this, key, id);
			if (team.frontplayer)
				team.frontplayer.release(this, key, id);
		}
	};
}

/*
	The box has a chance of 1 to 10 to spawn every 3 sec
	it give the following changes to the games if the this.ball touchs it :
	Fake news {0} : Changes the direction of the this.ball randomly
	Always faster {1} : The game start to speed up really fast (forever)
	You are not big enought {2} : The players paddels are bigger now
	Smaller ! {3} : The players paddels are smaller now
	More ! More ! {4} : The this.ball multiplies each time it hits a paddel but don't influence the score (until the next point)
	You are hallucinating {5} : The control are reverse (until the next point)
	It's just a break {6} : The game slow up before reaccelerating at a random moment
	It's the golden this.ball {7} : The next point worth X2 (combo is possible) (until the next point)
	Obstacles you say ? {8} : Obstacles appears on the field (until the next point)
	 {9} : 
	Some cheese ! {10} : The paddels got this.holes (until the next point)
	It's everywhere ! {11} : The this.ball teleports everywhere for a few random seconds before going to the middle
	 {12} : 
	this.Negative mode {13} : The color are this.negative for 5sec
	Snake mode {14} : The this.ball leave a trail and can bounce on it (until the next point)
	Wait what ? {15} : The paddels teleports on the y axis randomly
	Where am I ? {16} : You cant see yourself for 3 sec
	Meteor shower ! {17} : this.Meteorites fell from the top influencing the this.balls direction (until the next point)
	1 Life ! {18} : The game is reset and the next this.ball make the player win
	I see the futur ! {19} : Everyone can see the trajectory of the this.ball for a few seconds
	Epic moment ! {20} : The game just got epic, it's start by the effect 11, then the effect 1 (forever) 4 7 (until the next point) are applied on a cool music (until the next point)
	this.Portals ! {21} : When the this.ball hits the top or bottom it goes to the other (until the next point)
	Where is it ! Tell me ! {22} : The this.ball is invisible for 2 sec every 4 sec (until the next point)
*/

async function effect0(game){ //done
	console.log("Fake news {0}");
	let angle = (Math.random() - 0.5) * MAX_BOUNCE_ANGLE;
	let dir = Math.random() < 0.5 ? 1 : -1;
	game.ball.dx = dir * game.BALL_SPEED * Math.cos(angle);
	game.ball.dy = game.BALL_SPEED * Math.sin(angle);
	game.ball.last_touch = null;
}

async function effect1(game){ //done to scale
	console.log("Always faster {1}");
	if (game.true_speeding_ball == false){
		game.true_speeding_ball = true;
		setInterval(() => {
			if (game.true_speeding_ball == false){
				game.BALL_SPEED = BASE_BALL_SPEED;
				game.PLAYER_SPEED = BASE_PLAYER_SPEED;
				return ;
			}
			if (game.BALL_SPEED > 3)
				return ;
			game.BALL_SPEED += 0.05;
			game.PLAYER_SPEED += 0.05;
		}, 1000);
	}
}

async function effect2(game){ //done
	console.log("You are not big enought {2}");
	if (game.player_size < 15) game.player_size += 1;
}

async function effect3(game){ //done
	console.log("Smaller ! {3}");
	if (game.player_size > 1 + (game.players.length > 2) ? 1 : 0) game.player_size -= 1;
}

async function effect4(game){ //done
	console.log("More ! More ! {4}");
	game.multiple_ball = true;
}

async function effect5(game){  //second player don't work
	console.log("You are hallucinating {5}");
	game.teams.forEach(team =>{
		team.backplayer.up_player = team.backplayer.base_down;
		team.backplayer.down_player = team.backplayer.base_up;
		if (team.frontplayer){
			team.frontplayer.up_player = team.frontplayer.base_down;
			team.frontplayer.down_player = team.frontplayer.base_up;
		}
	})
}

async function effect6(game){  //lag a bit
	if (game.in_effect == true)
		return ;
	game.in_effect = true;
	console.log("It's just a break {6}");
	game.ball.last_touch = null;
	let ball_before = game.BALL_SPEED;
	let balldx = game.ball.dx;
	let balldy = game.ball.dy;
	let player_before = game.PLAYER_SPEED;
	game.BALL_SPEED = 0.1;
	game.ball.dx *= 0.5;
	game.ball.dy *= 0.5;
	game.PLAYER_SPEED = 0.3;
	await utils.sleep(1000 * Math.round((Math.random() * 10) / 3));
	game.ball.last_touch = null;
	game.BALL_SPEED = ball_before;
	game.ball.dx = balldx;
	game.ball.dy = balldy;
	game.PLAYER_SPEED = player_before;
	game.in_effect = false;
}

async function effect7(game){  //done normally
	console.log("Silver Bullet {7}", game.point_value * 2);
	game.point_value *= 2;
}

async function effect8(game){ //done maybe ajust despawn after point
	if (game.obstacle_array.length > 0)
		return ;
	console.log("Obstacles {8}");
	for (let i = 0; i < 15; i++){
		let new_obstacle = new Obstacle(
			bounce_margin_size + Math.round((WIDTH - bounce_margin_size) * Math.random()),
			top_margin_size + Math.round((HEIGHT - top_margin_size) * Math.random()));
		game.obstacle_array.push(new_obstacle);
	}
	await utils.sleep(20000);
	game.obstacle_array = [];
}

async function effect9(game){ //nothing
	console.log("Nothing yet {9}");
	
}

async function effect10(game){ //done
	if (game.holes == true)
		return ;
	console.log("Cheese {10}");
	game.holes = true;
	for (let i = -game.player_size; i <= game.player_size; i++){
		if (Math.random() < 0.5 && game.holes_array.length <= game.player_size + game.player_size / 2)
			game.holes_array.push(i);
	}
}

async function effect11(game){ //done
	if (game.in_effect == true)
		return ;
	game.in_effect = true;
	console.log("It's everywhere ! {11}");
	game.ball.last_touch = null;
	for (let i = 0; i < Math.floor(Math.random() * 30); i++){
		game.ball.x = bounce_margin_size + Math.round((WIDTH - bounce_margin_size * 1.5) * Math.random());
		game.ball.y = top_margin_size + Math.round((HEIGHT - top_margin_size) * Math.random());
		await utils.sleep(150);
	}
	game.ball.x = Math.floor(WIDTH / 2);
	game.ball.y = Math.floor(HEIGHT / 2);
	game.in_effect = false;
}

async function effect12(game){ //nothing

}

async function effect13(game){ //done
	if (game.negative == true)
		return ;
	console.log("game.Negative mode {13}");
	game.negative = true;
	await utils.sleep(5000);
	game.negative = false;
}

async function effect14(game){ //done to scale
	if (game.snake_mode == true)
		return ;
	console.log("Snake mode {14}");
	game.snake_mode = true;
	let hitbox = 1;
	while (game.snake_mode == true){
		if (game.snake_array.length > 10)
			game.snake_array.shift();
		let obs = new Obstacle(game.ball.x,game.ball.y);
		await utils.sleep(100);
		const overlap = game.snake_array.some(o => o.x === obs.x && o.y === obs.y);
		if (!overlap) {
			game.snake_array.push(obs);
		}
	}
	game.snake_array = [];
}

async function effect15(game){ //done to scale
	console.log("Teleport player {15}");
	let tmp_margin = top_margin_size + game.player_size;
	game.teams.forEach(team =>{
		team.backplayer.posy =  tmp_margin + Math.round((HEIGHT - tmp_margin) * Math.random());
		if (team.frontplayer){
			team.frontplayer.posy =  tmp_margin + Math.round((HEIGHT - tmp_margin) * Math.random());
		}
	})
}

async function effect16(game){ //done
	if (game.invisible_player)
		return ;
	console.log("Invisible player {16}");
	game.invisible_player = true;
	await utils.sleep(1500);
	game.invisible_player = false;
}

async function effect17(game){ //done
	if (game.meteorites == true)
		return ;
	game.meteorites = true;
	console.log("Meteor shower ! {17}");
	if (game.meteorites_array.length > 0)
		return ;
	do{
		game.meteorites_array.forEach(meteor =>{
			meteor.y++;
			if (meteor.y > HEIGHT - top_margin_size){
				const index = game.meteorites_array.indexOf(meteor);
				game.meteorites_array.splice(index, 1);
			}
		});
		if (Math.random() < 0.3 || game.meteorites_array.length == 0){
			let new_meteor = new Obstacle(
				bounce_margin_size + Math.round((WIDTH - bounce_margin_size) * Math.random()),
				top_margin_size);
			game.meteorites_array.push(new_meteor);
		}
		await utils.sleep(500);
	} while (game.meteorites_array.length > 0 && game.meteorites == true)
	game.meteorites = false;
}

async function effect18(game){ //done
	if (game.gold_game == true)
		return ;
	game.box_array = [];
	console.log("Golden game.Ball {18}");
	game.teams.forEach(team => team.score = 0);
	MAX_SCORE = 1;
	game.gold_game = true;
}

async function effect19(game){ //done normally
	console.log("I see the futur ! {19}");
	game.vision = true;
	await utils.sleep(10000);
	game.vision = false;
}

async function effect20(game){ //done scale 1
	if (game.epic_moment)
		return ;
	console.log("Epic moment ! {20}");
	game.epic_moment = true;
	game.box_array = [];
	await effect11(game);
	effect1(game);
	effect4(game);
	effect7(game);
}

async function effect21(game){ //done normally no visual
	console.log("game.Portals ! {21}");
	game.portal = true;
}

async function effect22(game){ //done normally no visual
	if (game.invisible_ball_active)
		return ;
	game.invisible_ball_active = true;
	console.log("Invisiball {22}");
	for (let i = 0; i < 5; i++){
		game.invisible_ball = true;
		await utils.sleep(500);
		if (game.invisible_ball_active == false){
			game.invisible_ball = false;
			break ;
		}
		game.invisible_ball = false;
		await utils.sleep(500);
		if (game.invisible_ball_active == false){
			game.invisible_ball = false;
			break ;
		}
	}
	game.invisible_ball_active = false;
}

function apply_effect(game, nbr){
	switch (nbr){
		case 0 : effect0(game); break;
		case 1 : effect1(game); break;
		case 2 : effect2(game); break;
		case 3 : effect3(game); break;
		case 4 : effect4(game); break;
		case 5 : effect5(game); break;
		case 6 : effect6(game); break;
		case 7 : effect7(game); break;
		case 8 : effect8(game); break;
		case 9 : effect9(game); break;
		case 10 : effect10(game); break;
		case 11 : effect11(game); break;
		case 12 : effect12(game); break;
		case 13 : effect13(game); break;
		case 14 : effect14(game); break;
		case 15 : effect15(game); break;
		case 16 : effect16(game); break;
		case 17 : effect17(game); break;
		case 18 : effect18(game); break;
		case 19 : effect19(game); break;
		case 20 : effect20(game); break;
		case 21 : effect21(game); break;
		case 22 : effect22(game); break;
	}
}

function reset_effect(game){
	game.true_speeding_ball = false;
	game.in_effect = false;
	game.multiple_ball = false;
	game.multiple_ball_array = [];
	game.teams.forEach(team =>{
		team.backplayer.up_player = team.backplayer.base_up;
		team.backplayer.down_player = team.backplayer.base_down;
		if (team.frontplayer){
			team.frontplayer.up_player = team.frontplayer.base_up;
			team.frontplayer.down_player = team.frontplayer.base_down;
		}
	})
	game.point_value = 1;
	game.obstacle_array = [];
	game.holes = false;
	game.holes_array = [];
	game.negative = false;
	game.snake_mode = false;
	game.snake_array = [];
	game.invisible_player = false;
	game.meteorites = false;
	game.meteorites_array = [];
	game.vision = false;
	game.epic_moment = false;
	game.portal = false;
	game.invisible_ball_active = false;
	game.invisible_ball = false;
}

function touch_box(game){
	let hitbox = 2;
	game.box_array.forEach(box => {
		if (Math.round(game.ball.x) - box.x <= hitbox && Math.round(game.ball.x) - box.x >= -hitbox){
			if (Math.round(game.ball.y) - box.y <= hitbox && Math.round(game.ball.y) - box.y >= -hitbox){
				apply_effect(game, box.effect);
				game.box_array.splice(game.box_array.indexOf(box), 1);
			}
		}
	});
}

async function custom_mode_func(game){
	if (game.custom_mode == true){
		function spawn_a_box(){
			let x = bounce_margin_size + Math.round((WIDTH - bounce_margin_size) * Math.random());;
			let y = top_margin_size + Math.round((HEIGHT - top_margin_size) * Math.random());
			// let new_box = new Box(Math.round(WIDTH * Math.random()), Math.round(HEIGHT * Math.random()), Math.floor(Math.random() * 23));
			// while (game.box_array.includes(new_box) == true)
			// 	new_box = new Box(Math.round(WIDTH * Math.random()), Math.round(HEIGHT * Math.random()), Math.floor(Math.random() * 23));
			let nbr = 9;
			let new_box = new Box(Math.round(WIDTH * Math.random()), Math.round(HEIGHT * Math.random()), nbr);
			return (new_box);
		}
		setInterval(() => {
			if (game.box_array.length > 10)
				game.box_array.shift();
			if (Math.random() < 0.3 && game.gold_game == false && game.epic_moment == false && game.pause == false)
				game.box_array.push(spawn_a_box());
		}, 1000);
	}
}

