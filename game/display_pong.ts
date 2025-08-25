//Web constant
const ws = new WebSocket('ws://localhost:3000/ws');
const canvas = document.getElementById('pong') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
const HEIGHT = canvas.height / 10;
const WIDTH = canvas.width / 10;
const SCALE_X = canvas.width / WIDTH;
const SCALE_Y = canvas.height / HEIGHT;

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'state') {
    const state = data.state;
    draw_web(state);
  }
};
ws.onopen = () => console.log('WebSocket open!');
ws.onerror = e => console.error('WebSocket error', e);
ws.onclose = () => console.log('WebSocket closed!');

async function draw_ball(obj_ball : any, color : string, size : number){
	ctx.fillStyle = color;
	const bx = obj_ball.x * SCALE_X;
	const by = obj_ball.y * SCALE_Y;
	const ball_px = size * SCALE_X;
	ctx.beginPath();
	ctx.arc(bx, by, ball_px / 2, 0, 2 * Math.PI);
	ctx.fill();
}

async function draw_web(screen : any){
	// const response = await fetch('../screen');
	// const screen = await response.json();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	if (screen.vision == true && screen.IA == true){
		ctx.fillStyle = "#001111";
		for (let i = screen.error_margin; i < WIDTH - (screen.kill_margin_size ); i++){
			for (let j = 0; j < HEIGHT; j += 1) {
				ctx.fillRect(i * SCALE_X, j * SCALE_Y, SCALE_X, SCALE_Y);
			}
		}
		draw_ball(screen.target_IA, "#00FFFF", screen.ball_size * 3); 
		// ctx.fillStyle = "#00FFFF";
		// const ibx = screen.target_IA.x * SCALE_X;
		// const iby = screen.target_IA.y * SCALE_Y;
		// const iball_px = screen.ball_size * 3 * SCALE_X;
		// ctx.beginPath();
		// ctx.arc(ibx, iby, iball_px / 2, 0, 2 * Math.PI);
		// ctx.fill();
	}

	ctx.fillStyle = "#FFFFFF";
	ctx.font = "90px Noto Sans";
	let msg = "" + screen.player1_score;
	let msgX = (WIDTH/3 - 1) * SCALE_X - ctx.measureText(msg).width;
	ctx.fillText(msg, msgX, (canvas.height / 7));
	msg = "" + screen.player2_score;
	msgX = ((WIDTH/5 - 1) * SCALE_X) * 4 - ctx.measureText(msg).width;
	ctx.fillText(msg, msgX, (canvas.height / 7));

	// ctx.fillStyle = "#000000";
	// const bx2 = screen.ball.x * SCALE_X;
	// const by2 = screen.ball.y * SCALE_Y;
	// const ball_px2 = screen.ball_size * 3 * SCALE_X;
	// ctx.beginPath();
	// ctx.arc(bx2, by2, ball_px2 / 2, 0, 2 * Math.PI);
	// ctx.fill();
	// draw_ball(screen.ball, "#000000", screen.ball_size * 3); 

	ctx.fillStyle = "#FFFFFF";
	for (let i = 1.5; i < HEIGHT; i += 5) {
		ctx.fillRect((WIDTH/2 - 1) * SCALE_X, i * SCALE_Y, 2 * SCALE_X, 2 * SCALE_Y);
	}
	
	ctx.fillStyle = "#FFFFFF";
	if (screen.portal == true)
		ctx.fillStyle = "#FF8800";
	ctx.fillRect(0, 0, canvas.width, SCALE_Y);
	if (screen.portal == true)
		ctx.fillStyle = "#0088FF";
	ctx.fillRect(0, (HEIGHT-1) * SCALE_Y, canvas.width, SCALE_Y);
	for (let obs of screen.obstacle_array)
		ctx.fillRect(obs.x * SCALE_X - (obs.x / 2), obs.y * SCALE_Y - (obs.y / 2), SCALE_X * 2, SCALE_Y * 2);
	for (let obs of screen.meteorites_array)
		ctx.fillRect(obs.x * SCALE_X - (obs.x / 2), obs.y * SCALE_Y - (obs.y / 2), SCALE_X * 2, SCALE_Y * 2);
	for (let obs of screen.snake_array)
		ctx.fillRect(obs.x * SCALE_X - (obs.x / 2), obs.y * SCALE_Y - (obs.y / 2), SCALE_X * 2, SCALE_Y * 2);
	
	for (let obs of screen.box_array){
		ctx.fillStyle = "#5500FF";
		ctx.fillRect(obs.x * SCALE_X - (obs.x / 2), obs.y * SCALE_Y - (obs.y / 2), SCALE_X * 2, SCALE_Y * 2);
	}
	if (screen.vision == true){
		for (let obj of screen.ball_real_array_futur){
			let color = "#000000"
			if (obj.touch == true) color = '#2233FF';
			else if (obj.x <= screen.ball_size + screen.kill_margin_size || obj.x >= WIDTH - (screen.ball_size + screen.kill_margin_size)) color = '#FF5500';
			else color = '#FF0000';
			// const obx = obj.x * SCALE_X;
			// const oby = obj.y * SCALE_Y;
			// const obj_px = screen.ball_size * 1.5 * SCALE_X;
			// ctx.beginPath();
			// ctx.arc(obx, oby, obj_px / 2, 0, 2 * Math.PI);
			// ctx.fill();
			draw_ball(obj, color, screen.ball_size * 1.5);
		}
	}
	if (screen.invisible_player == false){
		ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(5 * SCALE_X, (screen.player1 - screen.player_size) * SCALE_Y, SCALE_X * 2, SCALE_Y * screen.player_size * 2);
		ctx.fillRect((WIDTH - 7) * SCALE_X, (screen.player2 - screen.player_size) * SCALE_Y, SCALE_X * 2, SCALE_Y * screen.player_size * 2);
		ctx.fillStyle = "#000000";
		for (let hole of screen.holes_array){
			ctx.fillRect(5 * SCALE_X, (screen.player1 + hole) * SCALE_Y, SCALE_X * 2, SCALE_Y);
			ctx.fillRect((WIDTH - 7) * SCALE_X, (screen.player2 + hole) * SCALE_Y, SCALE_X * 2, SCALE_Y);
		}
	}
	// const bx = screen.ball.x * SCALE_X;
	// const by = screen.ball.y * SCALE_Y;
	// const ball_px = screen.ball_size * 1.5 * SCALE_X;
	// ctx.beginPath();
	// ctx.arc(bx, by, ball_px / 2, 0, 2 * Math.PI);
	// ctx.fill();
	for (let obj of screen.multiple_ball_array){
		draw_ball(obj, "#EEEEEE", screen.ball_size * 1.2); 
	}
	if (screen.invisible_ball == false) //real ball
		draw_ball(screen.ball, "#FFFFFF", screen.ball_size * 1.5); 
	if (screen.gameover == true){
		if (screen.player1_score >= screen.MAX_SCORE)
			afficherMessage(screen, "Player 1 Wins !!!", 'l');
		else if (screen.player2_score >= screen.MAX_SCORE)
			afficherMessage(screen, "Player 2 Wins !!!", 'r');
	}
	if (screen.in_effect){
		let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		let data : Uint8ClampedArray = imageData.data;
		for (let i = 0; i < data.length; i += 4) {
			// if (Math.random() < 0.2){
			data[i] = 150;
			data[i + 1] = 150;
			// }
		}
		ctx.putImageData(imageData, 0, 0);
	}
	if (screen.gold_game){
		let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		let data : Uint8ClampedArray = imageData.data;
		for (let i = 0; i < data.length; i += 4) {
			data[i + 2] = 0;
		}
		ctx.putImageData(imageData, 0, 0);
	}
	if (screen.negative){
		let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		let data : Uint8ClampedArray = imageData.data;
		for (let i = 0; i < data.length; i += 4) {
		data[i] = 255 - data[i];
		data[i + 1] = 255 - data[i + 1];
		data[i + 2] = 255 - data[i + 2];
		}
		ctx.putImageData(imageData, 0, 0);
	}
}

function afficherMessage(game_data : any, msg : string, side : string) {
    ctx.font = "40px Arial";
    ctx.fillStyle = "#FFFFFF";
	let stats : string[] = [
        "STATS :",
        "exchange_nbr : " + (game_data.exchange_nbr ?? "0"),
        "bounce nbr : " + (game_data.bounce_nbr ?? "0"),
        "velocity boost nbr : " + (game_data.velocity_use ?? "0")
    ];
	let msgX : number = 0, statsX : number = 0;
	let lineHeight : number = 40;
	let maxStatsWidth = Math.max(...stats.map(text => ctx.measureText(text).width));
    if (side == 'l') {
        msgX = 10;
        statsX = canvas.width - 10 - maxStatsWidth;
    } else if (side == 'r') {
        msgX = canvas.width - 10 - ctx.measureText(msg).width;
        statsX = 10;
    }
    let blockTop = canvas.height / 2 - (stats.length * lineHeight) / 2;
	
	ctx.fillStyle = "#AAAAAA";
	ctx.fillText(msg, msgX, (canvas.height / 2) + (lineHeight / 2));

	for (let i = 0; i < stats.length; i++) {
		let text = (stats[i] ?? "0");
		let y = blockTop + i * lineHeight;
		ctx.fillStyle = "#AAAAAA";
		ctx.fillText(text, statsX, y);
	}
}

document.addEventListener('keydown', function (event) {
  ws.send(JSON.stringify({ type: 'keydown', key: event.key }));
});
document.addEventListener('keyup', function (event) {
  ws.send(JSON.stringify({ type: 'keyup', key: event.key }));
});

