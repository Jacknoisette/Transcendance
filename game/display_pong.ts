//Web constant
const ws = new WebSocket('ws://localhost:3000/ws');
const canvas = document.getElementById('pong') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
const HEIGHT = canvas.height / 10;
const WIDTH = canvas.width / 10;
const SCALE_X = canvas.width / WIDTH;
const SCALE_Y = canvas.height / HEIGHT;

//Player image
const playerImg = new Image();
playerImg.src = "image/paddel.png";
playerImg.onload = function() {};

//Ball image
const ballImg = new Image();
ballImg.src = "image/ball.png";
ballImg.onload = function() {};
const futur_ballImg = new Image();
futur_ballImg.src = "image/futur_ball.png";
futur_ballImg.onload = function() {};
const bounce_ballImg = new Image();
bounce_ballImg.src = "image/bounce_ball.png";
bounce_ballImg.onload = function() {};
const kill_ballImg = new Image();
kill_ballImg.src = "image/kill_ball.png";
kill_ballImg.onload = function() {};

//IA image
const ai_target = new Image();
ai_target.src = "image/IA_target.png";
ai_target.onload = function() {};

//Custom
const crateImg = new Image();
crateImg.src = "image/crate.png";
crateImg.onload = function() {};

//Game
const top_img = new Image();
top_img.src = "image/top.png";
top_img.onload = function() {};
const bottom_img = new Image();
bottom_img.src = "image/bottom.png";
bottom_img.onload = function() {};
const center_img = new Image();
center_img.src = "image/game_center.png";
center_img.onload = function() {};

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

async function draw_image(obj_ball : any, bsize : number, img : HTMLImageElement) {
	const bx = obj_ball.x * SCALE_X - (bsize * SCALE_X / 2);
  	const by = obj_ball.y * SCALE_Y - (bsize * SCALE_Y / 2);
	ctx.drawImage(img, bx, by, bsize * SCALE_X, bsize * SCALE_Y);
}

async function draw_web(screen : any){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#1A1733";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	if (screen.vision == true && screen.IA == true){
		ctx.fillStyle = "#001111";
		for (let i = screen.error_margin; i < WIDTH - (screen.kill_margin_size ); i++){
			for (let j = 0; j < HEIGHT; j += 1) {
				ctx.fillRect(i * SCALE_X, j * SCALE_Y, SCALE_X, SCALE_Y);
			}
		}
		// draw_image(screen.target_IA, screen.ball_size * 3, )
		draw_image(screen.target_IA, screen.ball_size * 6, ai_target); 
	}

	ctx.fillStyle = "#FFFFFF";
	ctx.font = "90px Noto Sans";
	let msg = "" + screen.player1_score;
	let msgX = (WIDTH/3 - 1) * SCALE_X - ctx.measureText(msg).width;
	ctx.fillText(msg, msgX, (canvas.height / 7));
	msg = "" + screen.player2_score;
	msgX = ((WIDTH/5 - 1) * SCALE_X) * 4 - ctx.measureText(msg).width;
	ctx.fillText(msg, msgX, (canvas.height / 7));

	// ctx.fillStyle = "#FFFFFF";
	for (let i = 1.5; i < HEIGHT; i += 5) {
		ctx.drawImage(center_img, (WIDTH/2 - 1) * SCALE_X, i * SCALE_Y, 2 * SCALE_X, 2 * SCALE_Y);
		// ctx.fillRect((WIDTH/2 - 1) * SCALE_X, i * SCALE_Y, 2 * SCALE_X, 2 * SCALE_Y);
	}
	ctx.drawImage(top_img, 0, 0, canvas.width, SCALE_Y);
	ctx.drawImage(bottom_img, 0, (HEIGHT-1) * SCALE_Y, canvas.width, SCALE_Y);
	// ctx.fillStyle = "#FFFFFF";
	// if (screen.portal == true)
	// 	ctx.fillStyle = "#FF8800";
	// ctx.fillRect(0, 0, canvas.width, SCALE_Y);
	// if (screen.portal == true)
	// 	ctx.fillStyle = "#0088FF";
	// ctx.fillRect(0, (HEIGHT-1) * SCALE_Y, canvas.width, SCALE_Y);
	for (let obs of screen.obstacle_array)
		ctx.fillRect(obs.x * SCALE_X - SCALE_X , obs.y * SCALE_Y - SCALE_Y , SCALE_X * 2, SCALE_Y * 2);
	for (let obs of screen.meteorites_array)
		ctx.fillRect(obs.x * SCALE_X - SCALE_X , obs.y * SCALE_Y - SCALE_Y , SCALE_X * 2, SCALE_Y * 2);
	for (let obs of screen.snake_array)
		ctx.fillRect(obs.x * SCALE_X - SCALE_X , obs.y * SCALE_Y - SCALE_Y , SCALE_X * 2, SCALE_Y * 2);
	
	for (let obs of screen.box_array){
		draw_image(obs, 3, crateImg);
	}
	if (screen.vision == true){
		for (let obj of screen.ball_real_array_futur){
			if (obj.touch == true && bounce_ballImg.complete) draw_image(obj, screen.ball_size * 2, bounce_ballImg);
			else if ((obj.x <= screen.ball_size + screen.kill_margin_size || obj.x >= WIDTH - (screen.ball_size + screen.kill_margin_size)) && kill_ballImg.complete) draw_image(obj, screen.ball_size * 2, kill_ballImg);
			else if (futur_ballImg.complete) draw_image(obj, screen.ball_size * 2, futur_ballImg);
			// draw_ball(obj, color, screen.ball_size * 1.5);
		}
	}
	if (screen.invisible_player == false && playerImg.complete){
		ctx.drawImage(playerImg, 5 * SCALE_X, (screen.player1 - screen.player_size) * SCALE_Y, SCALE_X * 2, SCALE_Y * screen.player_size * 2);
		ctx.drawImage(playerImg,(WIDTH - 7) * SCALE_X, (screen.player2 - screen.player_size) * SCALE_Y, SCALE_X * 2, SCALE_Y * screen.player_size * 2);
		ctx.fillStyle = "#1A1733";
		for (let hole of screen.holes_array){
			ctx.fillRect(5 * SCALE_X, (screen.player1 + hole) * SCALE_Y, SCALE_X * 2, SCALE_Y);
			ctx.fillRect((WIDTH - 7) * SCALE_X, (screen.player2 + hole) * SCALE_Y, SCALE_X * 2, SCALE_Y);
		}
	}

	for (let obj of screen.multiple_ball_array){
		if (ballImg.complete)
			draw_image(obj, screen.ball_size * 1.7, ballImg);
	}
	if (screen.invisible_ball == false && ballImg.complete){
		draw_image(screen.ball, screen.ball_size * 2, ballImg);
	}
	if (screen.gameover == true){
		if (screen.player1_score >= screen.MAX_SCORE)
			afficherMessage(screen, "Player 1 Wins !!!", 'l');
		else if (screen.player2_score >= screen.MAX_SCORE)
			afficherMessage(screen, "Player 2 Wins !!!", 'r');
	}
	if (screen.gold_game){
		let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		let data : Uint8ClampedArray = imageData.data;
		for (let i = 0; i < data.length; i += 4) {
			data[i] = 255;
			data[i + 1] = (data[i + 1] + 50 > 255)? 255 : data[i + 1] + 50;
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

