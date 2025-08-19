//Web constant
const canvas = document.getElementById('pong') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
// const HEIGHTts = canvas.width / 10;
// const WIDTHts = canvas.height / 10;
const SCALE_X = canvas.width / WIDTH;
const SCALE_Y = canvas.height / HEIGHT;
 
async function draw_web(){
	const response = await fetch('/screen');
	const screen = await response.json();
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
}

async function sendInputPressedToServer(input:any){
	await fetch('/inputpressed',{
		method : 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(input)
	});
}

async function sendInputReleasedToServer(input:any){
	await fetch('/inputrelease',{
		method : 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(input)
	});
}

document.addEventListener('keydown', function(event) {
	const inputData = {
		type: "keydow",
		key: event.key
	}
	sendInputPressedToServer(inputData);
});

document.addEventListener('keyup', function(event) {
	const inputData = {
		type: "keyup",
		key: event.key
	}
	sendInputReleasedToServer(inputData);
});

	// let key = event.key;
	// if (key === 'w' && player1 > player_size + top_margin_size){
	// 	player1_vel = -1 * PLAYER_SPEED;
	// 	keyS = false;
	// 	keyW = true;
	// } 
	// if (key === 's' && player1 < HEIGHT - (player_size + top_margin_size)){
	// 	player1_vel = 1 * PLAYER_SPEED;
	// 	keyW = false;
	// 	keyS = true;
	// }
	// if (key === 'ArrowUp' && player2 > player_size + top_margin_size && IA == false){
	// 	player2_vel = -1 * PLAYER_SPEED;
	// 	keyDown = false;
	// 	keyUp = true;
	// }
	// if (key === 'ArrowDown' && player2 < HEIGHT - (player_size + top_margin_size) && IA == false){
	// 	player2_vel = 1 * PLAYER_SPEED;
	// 	keyUp = false;
	// 	keyDown = true;
	// }
	// if (key === 'p' && pause == true) pause = false;
	// else if (key === 'p' && pause == false) pause = true;
	// if (key === 'v' && vision == true) vision = false;
	// else if (key === 'v' && vision == false) vision = true;
	// if (key === ',' && vision == true) futur_vision -= 1;
	// if (key === '.' && vision == true) futur_vision += 1;
	// if (key === ';' && vision == true) error_margin -= 1;
	// if (key === '\'' && vision == true) error_margin += 1;
	// if (key === '1' && ball_size < 15) ball_size += 1;
	// if (key === '2' && ball_size > 1) ball_size -= 1;
	// if (key === '3' && player_size < 15) player_size += 1;
	// if (key === '4' && player_size > 1) player_size -= 1;
	// if (key === '\\' && IA == true) IA = false;
	// else if (key === '\\' && IA == false) IA = true;
	// if (key === '+' || key === '-'){
	// 	let angle = Math.atan2(ball.dy, ball.dx) * 180 / Math.PI;
	// 	angle += (key === '+') ? 1.5 : -1.5;
	// 	let speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy) || BALL_SPEED;
	// 	ball.dx = speed * Math.cos(angle * Math.PI / 180);
	// 	ball.dy = speed * Math.sin(angle * Math.PI / 180);
	// }
