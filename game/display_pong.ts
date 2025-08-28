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

//Ball image
const ballImg = new Image();
ballImg.src = "image/newball.png";
const futur_ballImg = new Image();
futur_ballImg.src = "image/futur_ball.png";
const bounce_ballImg = new Image();
bounce_ballImg.src = "image/bounce_ball.png";
const kill_ballImg = new Image();
kill_ballImg.src = "image/kill_ball.png";

//IA image
const ai_target = new Image();
ai_target.src = "image/IA_target.png";

//Custom
const powerupImg = new Image();
powerupImg.src = "image/powerup.png";
const obstacleImg = new Image();
obstacleImg.src = "image/obstacle.png";
const meteorImg = new Image();
meteorImg.src = "image/meteor.png";
const snakeImg = new Image();
snakeImg.src = "image/snake.png";

const portaltop_img = new Image();
portaltop_img.src = "image/portaltop.png";
const portalbottom_img = new Image();
portalbottom_img.src = "image/portalbottom.png";

const goldbackground_img = new Image();
goldbackground_img.src = "image/goldbackground.png";

//Game
const top_img = new Image();
top_img.src = "image/top.png";
const bottom_img = new Image();
bottom_img.src = "image/bottom.png";
const center_img = new Image();
center_img.src = "image/game_center.png";

const background_img = new Image();
background_img.src = "image/background2.png";

//Font
const font0 = new Image();
font0.src = "image/font/0.png";
const font1 = new Image();
font1.src = "image/font/1.png";
const font2 = new Image();
font2.src = "image/font/2.png";
const font3 = new Image();
font3.src = "image/font/3.png";
const font4 = new Image();
font4.src = "image/font/4.png";
const font5 = new Image();
font5.src = "image/font/5.png";
const font6 = new Image();
font6.src = "image/font/6.png";
const font7 = new Image();
font7.src = "image/font/7.png";
const font8 = new Image();
font8.src = "image/font/8.png";
const font9 = new Image();
font9.src = "image/font/9.png";
const nbrfont : HTMLImageElement[] = [font0, font1, font2, font3, font4, font5, font6, font7, font8, font9];


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

async function write_score(bsize : number, nbr : number, posx : number){
	const array = nbr.toString().split('').map(Number);
	for (let i = 0; i < array.length; i++){
		let n = array[i];
        let img = nbrfont[n];
        if (!img || !img.complete) continue;
		let bx = posx - (bsize * SCALE_X * array.length / 2) + (i * bsize * SCALE_X);
		let by = (canvas.height / 7) - (bsize * SCALE_Y / 2);
		ctx.drawImage(img, bx, by, bsize * SCALE_X, bsize * SCALE_Y);
	}
}

async function draw_web(screen : any){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	if (screen.gold_game)
		ctx.drawImage(goldbackground_img, 0, 0, canvas.width, canvas.height);
	else
		ctx.drawImage(background_img, 0, 0, canvas.width, canvas.height);
	if (screen.vision == true && screen.IA == true){
		ctx.fillStyle = "#001111";
		for (let i = screen.error_margin; i < WIDTH - (screen.kill_margin_size ); i++){
			for (let j = 0; j < HEIGHT; j += 1) {
				ctx.fillRect(i * SCALE_X, j * SCALE_Y, SCALE_X, SCALE_Y);
			}
		}
		draw_image(screen.target_IA, screen.ball_size * 6, ai_target); 
	}
	write_score(4, screen.player1_score, ((WIDTH/4) * SCALE_X) * 1);
	write_score(4, screen.player2_score, ((WIDTH/4) * SCALE_X) * 3);

	for (let i = 1.5; i < HEIGHT; i += 5)
		ctx.drawImage(center_img, (WIDTH/2 - 1) * SCALE_X, i * SCALE_Y, 2 * SCALE_X, 2 * SCALE_Y);
	if (screen.portal == false){
		ctx.drawImage(top_img, 0, 0, canvas.width, SCALE_Y);
		ctx.drawImage(bottom_img, 0, (HEIGHT-1) * SCALE_Y, canvas.width, SCALE_Y);
	} else {
		ctx.drawImage(portaltop_img, 0, 0, canvas.width, SCALE_Y);
		ctx.drawImage(portalbottom_img, 0, (HEIGHT-1) * SCALE_Y, canvas.width, SCALE_Y);
	}
	for (let obs of screen.obstacle_array)
		ctx.drawImage(obstacleImg, obs.x * SCALE_X - SCALE_X , obs.y * SCALE_Y - SCALE_Y , SCALE_X * 2, SCALE_Y * 2);
	for (let obs of screen.meteorites_array){
		const w = meteorImg.width / 5;
		const h = meteorImg.height / 5;
		const cx = obs.x * SCALE_X;
		const cy = obs.y * SCALE_Y;
		ctx.drawImage(meteorImg, cx - w/2, cy - h/2, w, h);
	}
	for (let obs of screen.snake_array)
				ctx.drawImage(snakeImg, obs.x * SCALE_X - SCALE_X , obs.y * SCALE_Y - SCALE_Y , SCALE_X * 2, SCALE_Y * 2);
	
	for (let obs of screen.box_array){
		draw_image(obs, 3, powerupImg);
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

