//Import
import {WIDTH} from './pong_constant.js';
import {Player, Client} from './pong_class.js';
import {Tournament} from './pong_tournament.js';
import {Game} from './pong_web.js';
import * as utils from './pong_web_utils.js';

import Fastify from 'fastify';
import websocketPlugin from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';

//Game
let tournament = true;
let operator = true;
let local = true;
let IA = false;
let custom = true;
let IA_diff = 1;
let player_nbr = 4;

//Websocket
let clients = [];
let id = 0;
let gameInstance = null;
const pos = [6, WIDTH - 6, 16, WIDTH - 16];

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
		if (gameInstance){
			let tmp_pos = (new_client.id < 4) ? pos[new_client.id] : 0
			gameInstance.players.push(new Player(new_client.id, tmp_pos, 'w', 's', new_client.connection));
		}
		connection.send(JSON.stringify({type: 'welcome', id: new_client.id}));
		connection.send(JSON.stringify({type: 'start', state : custom}));
		connection.on('message', (message) => {
			try {
			    const data = JSON.parse(message);
				// console.log(data.id);
				if ((data.type === 'keydown' || data.type === 'keyup') && gameInstance) {
					if (data.type === 'keydown')
						gameInstance.inputpressed(data.key, data.id);
					else
						gameInstance.inputrelease(data.key, data.id);
				}
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

if (local){
	if (tournament == true){
		let player_list = [
			{name : "Ness", rank : 0, player : null}, 
			{name : "Lucas", rank : 0, player : null},
			{name : "Wolf", rank : 0, player : null},
			{name : "Shulk", rank : 0, player : null}];

		while (id < 1){
			await utils.sleep(1000);
		}

		let tournament_game = new Tournament(clients, operator, player_list, custom, IA_diff);
		let winner = await tournament_game.tournament();
		console.log("Winner is :", winner);
	} else {
		while (id < 1){
			await utils.sleep(1000);
		}

		const players = [
			new Player(clients[0].id, pos[0], 'w', 's', clients[0].connection),
			new Player(clients[0].id, pos[1], 'ArrowUp', 'ArrowDown', clients[0].connection)
			];

		gameInstance = new Game(operator, IA, players, custom, IA_diff);
		let winner = await gameInstance.startGame();
		console.log("Winner is :", winner);
	}

} else {
	while (id < player_nbr){
		await utils.sleep(1000);
	}

	const players = clients.map(client => {
		const tmp_pos = (client.id < 4) ? pos[client.id] : 0;
		return new Player(client.id, tmp_pos, 'w', 's', client.connection);
	});

	gameInstance = new Game(operator, IA, players, custom, IA_diff);
	let winner = await gameInstance.startGame();
	console.log("Winner is :", winner);
}
