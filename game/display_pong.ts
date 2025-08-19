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

async function draw_web(screen : any){
	// const response = await fetch('../screen');
	// const screen = await response.json();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	ctx.fillStyle = "#FFFFFF";
	ctx.font = "90px Noto Sans";
	let msg = "" + screen.player1_score;
	let msgX = (WIDTH/3 - 1) * SCALE_X - ctx.measureText(msg).width;
	ctx.fillText(msg, msgX, (canvas.height / 7));
	msg = "" + screen.player2_score;
	msgX = ((WIDTH/5 - 1) * SCALE_X) * 4 - ctx.measureText(msg).width;
	ctx.fillText(msg, msgX, (canvas.height / 7));

	ctx.fillStyle = "#000000";
	const bx2 = screen.ball.x * SCALE_X;
	const by2 = screen.ball.y * SCALE_Y;
	const ball_px2 = screen.ball_size * 3 * SCALE_X;
	ctx.beginPath();
	ctx.arc(bx2, by2, ball_px2 / 2, 0, 2 * Math.PI);
	ctx.fill();

	ctx.fillStyle = "#FFFFFF";
	for (let i = 1.5; i < HEIGHT; i += 5) {
		ctx.fillRect((WIDTH/2 - 1) * SCALE_X, i * SCALE_Y, 2 * SCALE_X, 2 * SCALE_Y);
	}
	if (screen.vision == true && screen.IA == true){
		ctx.fillStyle = "#001111";
		for (let i = screen.error_margin; i < WIDTH - (screen.kill_margin_size ); i++){
			for (let j = 0; j < HEIGHT; j += 1) {
				ctx.fillRect(i * SCALE_X, j * SCALE_Y, SCALE_X, SCALE_Y);
			}
		}
		ctx.fillStyle = "#00FFFF";
		const ibx = screen.target_IA.x * SCALE_X;
		const iby = screen.target_IA.y * SCALE_Y;
		const iball_px = screen.ball_size * 3 * SCALE_X;
		ctx.beginPath();
		ctx.arc(ibx, iby, iball_px / 2, 0, 2 * Math.PI);
		ctx.fill();
	}

	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(0, 0, canvas.width, SCALE_Y);
	ctx.fillRect(0, (HEIGHT-1) * SCALE_Y, canvas.width, SCALE_Y);
	if (screen.vision == true){
		for (let obj of screen.ball_real_array_futur){
			if (obj.touch == true) ctx.fillStyle = '#2233FF';
			else if (obj.x <= screen.ball_size + screen.kill_margin_size || obj.x >= WIDTH - (screen.ball_size + screen.kill_margin_size)) ctx.fillStyle = '#FF5500';
			else ctx.fillStyle = '#FF0000';
			const obx = obj.x * SCALE_X;
			const oby = obj.y * SCALE_Y;
			const obj_px = screen.ball_size * 1.5 * SCALE_X;
			ctx.beginPath();
			ctx.arc(obx, oby, obj_px / 2, 0, 2 * Math.PI);
			ctx.fill();
		}
	}
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(5 * SCALE_X, (screen.player1 - screen.player_size) * SCALE_Y, SCALE_X * 2, SCALE_Y * screen.player_size * 2);
	ctx.fillRect((WIDTH - 7) * SCALE_X, (screen.player2 - screen.player_size) * SCALE_Y, SCALE_X * 2, SCALE_Y * screen.player_size * 2);
	const bx = screen.ball.x * SCALE_X;
	const by = screen.ball.y * SCALE_Y;
	const ball_px = screen.ball_size * 1.5 * SCALE_X;
	ctx.beginPath();
	ctx.arc(bx, by, ball_px / 2, 0, 2 * Math.PI);
	ctx.fill();
	// game_data();
}

// function afficherMessage(game_data : any, msg : string, side : string) {
//     ctx.font = "40px Arial";
//     ctx.fillStyle = "#FFFFFF";
// 	let stats : string[] = [
//         "STATS :",
//         "exchange_nbr : " + (game_data.exchange_nbr ?? "0"),
//         "bounce nbr : " + (game_data.bounce_nbr ?? "0"),
//         "velocity boost nbr : " + (game_data.velocity_use ?? "0")
//     ];
// 	let msgX : number = 0, statsX : number = 0;
// 	let lineHeight : number = 40;
// 	let maxStatsWidth = Math.max(...stats.map(text => ctx.measureText(text).width));
//     if (side == 'l') {
//         msgX = 10;
//         statsX = canvas.width - 10 - maxStatsWidth;
//     } else if (side == 'r') {
//         msgX = canvas.width - 10 - ctx.measureText(msg).width;
//         statsX = 10;
//     }
//     let blockTop = canvas.height / 2 - (stats.length * lineHeight) / 2;
	
// 	ctx.fillStyle = "#AAAAAA";
// 	ctx.fillText(msg, msgX, (canvas.height / 2) + (lineHeight / 2));

// 	for (let i = 0; i < stats.length; i++) {
// 		let text = (stats[i] ?? "0");
// 		let y = blockTop + i * lineHeight;
// 		ctx.fillStyle = "#AAAAAA";
// 		ctx.fillText(text, statsX, y);
// 	}
// }

// async function game_data(){
// 	const response = await fetch('../game_data');
// 	const game_data = await response.json();
// 	if (game_data.player1_score >= game_data.MAX_SCORE && game_data.gameover == true){
// 		afficherMessage(game_data, "Player 1 Wins !!!", 'l');
// 		return ;
// 	}
// 	else if (game_data.player2_score >= game_data.MAX_SCORE){
// 		game_data.gameover = true;
// 		afficherMessage(game_data, "Player 2 Wins !!!", 'r');
// 		return ;
// 	}
// }

document.addEventListener('keydown', function (event) {
  ws.send(JSON.stringify({ type: 'keydown', key: event.key }));
});
document.addEventListener('keyup', function (event) {
  ws.send(JSON.stringify({ type: 'keyup', key: event.key }));
});

