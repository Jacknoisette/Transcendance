//Websocket
const HEIGHT = 30;
const WIDTH = 90;
let clients = [];
let id = 0;
let gameInstance = null;
const pos = [6, WIDTH - 6, 16, WIDTH - 16];

class Client {
	constructor(connection, id){
		this.connection = connection;
		this.id = id;
	}
}

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
		if (gameInstance){
			let tmp_pos = (new_client.id < 4) ? pos[new_client.id] : 0
			gameInstance.players.push(new Player(new_client.id, tmp_pos, 'w', 's', new_client.connection));
		}
		// let game_data = game_data_creation();
		// connection.send(JSON.stringify({ type: 'state', state: game_data }));
		
		connection.on('message', (message) => {
			try {
			    const data = JSON.parse(message);
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

import {Game, Player} from './pong_web.js';
import * as utils from './pong_web_utils.js';

while (id < 1){
    await utils.sleep(1000);
}

const players = clients.map(client => {
    const tmp_pos = (client.id < 4) ? pos[client.id] : 0;
    return new Player(client.id, tmp_pos, 'w', 's', client.connection);
});
gameInstance = new Game(true, true, true, players, true, 1);
gameInstance.startGame();