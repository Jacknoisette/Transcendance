//Web constant
import * as PIXI from 'pixi.js';
// document.getElementsByName()
const ws = new WebSocket('ws://localhost:3000/ws');
// const canvas = document.getElementById('pong') as HTMLCanvasElement;
const canvas = new PIXI.Application({
    width: 800,
    height: 600,
    backgroundColor: 0x050a12
});
document.body.appendChild(canvas.view);
// const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
const HEIGHT = canvas.screen.height / 10;
const WIDTH = canvas.screen.width / 10;
const SCALE_Y = canvas.screen.height / HEIGHT;
const SCALE_X = canvas.screen.width / WIDTH;
import { ImageSrc, hexToRgbArray } from "./image_loader.js";
let ball_trail = [];
let shadow_color = '#00F9EC';
const imgsrc = new ImageSrc(shadow_color);
let ball_color = '#00f9ec';
let ball_middle_color = '#66FF99';
let choose_color = true;
const blurFilter = new PIXI.BlurFilter();
const colorFilter = new PIXI.ColorMatrixFilter();
blurFilter.blur = 10;
colorFilter.tint(shadow_color, false);
let lastTime = performance.now();
let frames = 0;
let lastframe = 0;
setInterval(() => {
    lastframe = frames;
    frames = 0;
}, 1000);
let pongConfig = {
    IA: false,
    local: true,
    tournament: false,
    player_nbr: 2,
    custom_mode: true,
    speeding_mode: false,
    IA_diff: 1,
    player1: "",
    player2: "",
    player3: "",
    player4: "",
    start: false
};
function updateButtons() {
    document.getElementById('iaBtn').textContent = "IA : " + (pongConfig.IA ? "ON" : "OFF");
    document.getElementById('localBtn').textContent = "Local : " + (pongConfig.local ? "ON" : "OFF");
    document.getElementById('tournamentBtn').textContent = "Tournoi : " + (pongConfig.tournament ? "ON" : "OFF");
    document.getElementById('customModeBtn').textContent = "Custom Mode : " + (pongConfig.custom_mode ? "ON" : "OFF");
    document.getElementById('speedingModeBtn').textContent = "Speeding Mode : " + (pongConfig.speeding_mode ? "ON" : "OFF");
    document.getElementById('playerNbrBtn').textContent = (pongConfig.player_nbr === 4 ? "4 joueurs : ON" : "4 joueurs : OFF");
    document.getElementById('startBtn').textContent = "START : " + (pongConfig.start ? "ON" : "OFF");
    document.getElementById('player2').style.display = (pongConfig.local && !pongConfig.IA) ? "" : "none";
}
// Boutons
document.getElementById('iaBtn').onclick = function () {
    pongConfig.IA = !pongConfig.IA;
    updateButtons();
};
document.getElementById('localBtn').onclick = function () {
    pongConfig.local = !pongConfig.local;
    updateButtons();
};
document.getElementById('tournamentBtn').onclick = function () {
    pongConfig.tournament = !pongConfig.tournament;
    updateButtons();
};
document.getElementById('customModeBtn').onclick = function () {
    pongConfig.custom_mode = !pongConfig.custom_mode;
    updateButtons();
};
document.getElementById('speedingModeBtn').onclick = function () {
    pongConfig.speeding_mode = !pongConfig.speeding_mode;
    updateButtons();
};
document.getElementById('playerNbrBtn').onclick = function () {
    pongConfig.player_nbr = pongConfig.player_nbr === 4 ? 2 : 4;
    updateButtons();
};
document.getElementById('startBtn').onclick = function () {
    if (pongConfig.start == false) {
        pongConfig.start = true;
        updateButtons();
        draw_start(pongConfig.custom_mode);
        ball_trail = [];
        shadow_color = '#00F9EC';
        ws.send(JSON.stringify({ type: 'gamesearch', gameparam: pongConfig }));
    }
};
document.getElementById('iaDiff').onchange = function (e) {
    pongConfig.IA_diff = parseInt(e.target.value);
};
document.getElementById('player1').oninput = function (e) {
    pongConfig.player1 = e.target.value;
};
document.getElementById('player2').oninput = function (e) {
    pongConfig.player2 = e.target.value;
};
updateButtons();
export function getPongConfig() {
    return { ...pongConfig };
}
const config = getPongConfig();
//End of Inteface to simulate front
let my_id = null;
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'state') {
        const state = data.state;
        draw_game(state);
    }
    if (data.type === 'start') {
        const state = data.state;
        draw_start(state);
    }
    if (data.type === 'end') {
        pongConfig.start = false;
        updateButtons();
    }
    if (data.type === 'welcome') {
        my_id = data.id;
    }
};
ws.onopen = () => console.log('WebSocket open!');
ws.onerror = e => console.error('WebSocket error', e);
ws.onclose = () => console.log('WebSocket closed!');
function modifySprite(sprite, posx, posy, width, height) {
    sprite.x = posx;
    sprite.y = posy;
    sprite.width = width;
    sprite.height = height;
    return sprite;
}
async function draw_image(sprite, obj_ball, bsize) {
    const bx = obj_ball.x * SCALE_X - (bsize * SCALE_X / 2);
    const by = obj_ball.y * SCALE_Y - (bsize * SCALE_Y / 2);
    canvas.stage.addChild(modifySprite(sprite, bx, by, bsize * SCALE_X, bsize * SCALE_Y));
}
async function write_score(bsize, nbr, posx, posy = (canvas.screen.height / 7)) {
    const array = nbr.toString().split('').map(Number);
    for (let i = 0; i < array.length; i++) {
        let n = Number(array[i]);
        let sprite = imgsrc.nbrfontSprite[n];
        let bx = posx - (bsize * SCALE_X * array.length / 2) + (i * bsize * SCALE_X);
        let by = posy - (bsize * SCALE_Y / 2);
        canvas.stage.addChild(modifySprite(sprite, bx, by, bsize * SCALE_X, bsize * SCALE_Y));
    }
}
const drawBall = (ball, bsize) => {
    blurFilter.blur = 10;
    colorFilter.tint(shadow_color, false);
    // Add trail point
    ball_trail.push({ x: ball.x, y: ball.y, alpha: 1, color: ball_color });
    if (ball_trail.length > 45) {
        ball_trail.shift();
    }
    // Draw trail
    ball_trail.forEach((point, index) => {
        const TRAIL_MAX = 45;
        let virtual_index = index + (TRAIL_MAX - ball_trail.length);
        const alpha = (virtual_index / TRAIL_MAX) * 0.6;
        const radius = bsize * (virtual_index / TRAIL_MAX);
        const trailCircle = new PIXI.Graphics();
        trailCircle.beginFill(new PIXI.Color(point.color), alpha);
        trailCircle.drawCircle(point.x * SCALE_X, point.y * SCALE_Y, radius);
        trailCircle.endFill();
        colorFilter.tint(point.color, false);
        trailCircle.filters = [blurFilter, colorFilter];
        canvas.stage.addChild(trailCircle);
        trailCircle.destroy();
    });
    // Main ball
    colorFilter.tint(ball_color, false);
    const mainBall = new PIXI.Graphics();
    mainBall.beginFill(new PIXI.Color(ball_color), 0.8);
    mainBall.drawCircle(ball.x * SCALE_X, ball.y * SCALE_Y, bsize);
    mainBall.endFill();
    mainBall.filters = [blurFilter];
    canvas.stage.addChild(mainBall);
    // Bright center
    colorFilter.tint(ball_middle_color, false);
    const centerBall = new PIXI.Graphics();
    centerBall.beginFill(new PIXI.Color(ball_middle_color), 0.8);
    centerBall.drawCircle(ball.x * SCALE_X, ball.y * SCALE_Y, bsize * 0.5);
    centerBall.endFill();
    centerBall.filters = [blurFilter];
    canvas.stage.addChild(centerBall);
    mainBall.destroy();
    centerBall.destroy();
    colorFilter.tint(shadow_color, false);
};
const drawFutur = (ball, bsize, color, colorcenter, blur) => {
    blurFilter.blur = 2;
    // Main ball
    // Main ball
    const mainBall = new PIXI.Graphics();
    mainBall.beginFill(new PIXI.Color(ball_color), 0.8);
    mainBall.drawCircle(ball.x * SCALE_X, ball.y * SCALE_Y, bsize);
    mainBall.endFill();
    canvas.stage.addChild(mainBall);
    // Bright center
    const centerBall = new PIXI.Graphics();
    centerBall.beginFill(new PIXI.Color(ball_middle_color), 0.8);
    centerBall.drawCircle(ball.x * SCALE_X, ball.y * SCALE_Y, bsize * 0.5);
    centerBall.endFill();
    canvas.stage.addChild(centerBall);
    mainBall.destroy();
    centerBall.destroy();
    blurFilter.blur = 10;
};
function draw_background() {
    const time = Date.now() * 0.001;
    const w = canvas.screen.width;
    const h = canvas.screen.height;
    if (!canvas.stage.getChildByName("background")) {
        const bgContainer = new PIXI.Container();
        bgContainer.name = "background";
        canvas.stage.addChildAt(bgContainer, 0);
    }
    const bgContainer = canvas.stage.getChildByName("background");
    bgContainer.removeChildren();
    // ctx.strokeStyle = shadow_color;
    // ctx.lineWidth = 0.5;
    // ctx.globalAlpha = 0.1;
    // for (let x = 0; x < canvas.screen.width; x += 40) {
    // const offset = Math.sin(time + x * 0.01) * 5;
    // ctx.beginPath();
    // ctx.moveTo(x + offset, 0);
    // ctx.lineTo(x + offset, canvas.height);
    // ctx.stroke();
    // }
    blurFilter.blur = 8;
    colorFilter.tint(shadow_color, false);
    for (let x = 0; x < w; x += 40) {
        const offset = Math.sin(time + x * 0.01) * 5;
        const line = new PIXI.Graphics();
        line.lineStyle(0.5, new PIXI.Color(shadow_color), 0.1);
        line.moveTo(x + offset, 0);
        line.lineTo(x + offset, h);
        line.filters = [blurFilter, colorFilter];
        bgContainer.addChild(line);
    }
    for (let y = 0; y < h; y += 40) {
        const offset = Math.cos(time + y * 0.01) * 3;
        const line = new PIXI.Graphics();
        line.lineStyle(0.5, new PIXI.Color(shadow_color), 0.1);
        line.moveTo(0, y + offset);
        line.lineTo(w, y + offset);
        line.filters = [blurFilter, colorFilter];
        bgContainer.addChild(line);
    }
    // Floating particles
    // ctx.globalAlpha = 0.3;
    // ctx.fillStyle = shadow_color;
    // for (let i = 0; i < 12; i++) {
    // 	const x = (i * 67 + time * 20) % canvas.screen.width;
    // 	const y = (i * 43 + Math.sin(time + i) * 50) % canvas.height;
    // 	const size = 1 + Math.sin(time + i) * 0.5;
    // 	ctx.shadowColor = shadow_color;
    // 	ctx.shadowBlur = 8;
    // 	ctx.beginPath();
    // 	ctx.arc(x, y, size, 0, Math.PI * 2);
    // 	ctx.fill();
    // }
    // ctx.globalAlpha = 0.2;
    // const cornerGradient1 = ctx.createRadialGradient(0, 0, 0, 0, 0, 150);
    // cornerGradient1.addColorStop(0, shadow_color);
    // cornerGradient1.addColorStop(1, 'transparent');
    // ctx.fillStyle = cornerGradient1;
    // ctx.fillRect(0, 0, 150, 150);
    // const cornerGradient2 = ctx.createRadialGradient(canvas.screen.width, canvas.height, 0, canvas.screen.width, canvas.height, 150);
    // cornerGradient2.addColorStop(0, shadow_color);
    // cornerGradient2.addColorStop(1, 'transparent');
    // ctx.fillStyle = cornerGradient2;
    // ctx.fillRect(canvas.screen.width - 150, canvas.height - 150, 150, 150);
    for (let i = 0; i < 12; i++) {
        const x = (i * 67 + time * 20) % w;
        const y = (i * 43 + Math.sin(time + i) * 50) % h;
        const size = 1 + Math.sin(time + i) * 0.5;
        const circle = new PIXI.Graphics();
        circle.beginFill(new PIXI.Color(shadow_color), 0.3);
        circle.drawCircle(x, y, size);
        circle.endFill();
        circle.filters = [blurFilter, colorFilter]; // Blur sur les particules
        bgContainer.addChild(circle);
    }
    // Coins avec radial gradient
    // Pixi n'a pas de gradient natif sur Graphics, donc on utilise une Sprite de gradient générée par canvas
    function createCornerGradient(x, y, radius) {
        const gradCanvas = document.createElement('canvas');
        gradCanvas.width = gradCanvas.height = radius * 2;
        const ctx = gradCanvas.getContext('2d');
        const grad = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
        grad.addColorStop(0, shadow_color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, gradCanvas.width, gradCanvas.height);
        const texture = PIXI.Texture.from(gradCanvas);
        const sprite = new PIXI.Sprite(texture);
        sprite.x = x;
        sprite.y = y;
        sprite.alpha = 0.2;
        return sprite;
    }
    // Top-left
    bgContainer.addChild(createCornerGradient(0, 0, 150));
    // Bottom-right
    bgContainer.addChild(createCornerGradient(w - 150, h - 150, 150));
    // ctx.globalAlpha = 1;
    // ctx.shadowBlur = 0;
    // ctx.setLineDash([10, 10]);
    // ctx.strokeStyle = shadow_color;
    // ctx.lineWidth = 2;
    // ctx.beginPath();
    // ctx.moveTo(canvas.screen.width / 2, 0);
    // ctx.lineTo(canvas.screen.width / 2, canvas.height);
    // ctx.stroke();
    // ctx.setLineDash([]);
    const centerLine = new PIXI.Graphics();
    centerLine.lineStyle(2, new PIXI.Color(shadow_color), 1);
    const dashLength = 10, gapLength = 10;
    let y = 0;
    while (y < h) {
        centerLine.moveTo(w / 2, y);
        centerLine.lineTo(w / 2, Math.min(y + dashLength, h));
        y += dashLength + gapLength;
    }
    bgContainer.addChild(centerLine);
}
// function hexToRgbArray(hex : string) {
// 	hex = hex.replace(/^#/, "");
// 	const r = parseInt(hex.substring(0,2), 16);
// 	const g = parseInt(hex.substring(2,4), 16);
// 	const b = parseInt(hex.substring(4,6), 16);
// 	return [r, g, b];
// }
function drawColorImage(img, x, y, w, h, color, scaleX = 1, scaleY = 1) {
    if (choose_color == true) {
        const deccolor = hexToRgbArray(color);
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w * scaleX;
        tempCanvas.height = h * scaleY;
        const tempCtx = tempCanvas.getContext('2d');
        ;
        tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Number(deccolor[0]);
            data[i + 1] = Number(deccolor[1]);
            data[i + 2] = Number(deccolor[2]);
        }
        tempCtx.putImageData(imageData, 0, 0);
        // ctx.drawImage(tempCanvas, x, y, w * scaleX, h * scaleY);
    }
    else {
        // ctx.drawImage(img, x, y, w * scaleX, h * scaleY);
    }
}
async function draw_game(rungame) {
    frames++;
    choose_color = true; //!rungame.custom_mode;
    let previous_game_color = shadow_color;
    let game_color = (choose_color) ? rungame.game_color : '#00f9ec';
    let game_sec_color = (choose_color) ? rungame.game_sec_color : '#66FF99';
    ball_color = game_color;
    ball_middle_color = game_sec_color;
    let blur_size = 10;
    shadow_color = (rungame.gold_game) ? '#ffae00ff' : game_color;
    blurFilter.blur = blur_size;
    colorFilter.tint(shadow_color, false);
    if (rungame.point_value > 1) {
        ball_color = '#9f9f9f';
        ball_middle_color = '#b6b6b6';
    }
    if (rungame.gold_game) {
        ball_color = '#ffae00';
        ball_middle_color = '#d6c060';
    }
    if (rungame.negative) {
        let shadowrgb = hexToRgbArray(shadow_color);
        let ballrgb = hexToRgbArray(ball_color);
        let ball_middlergb = hexToRgbArray(ball_middle_color);
        shadow_color = String("#" +
            Number(255 - Number(shadowrgb[0])).toString(16).padStart(2, "0") +
            Number(255 - Number(shadowrgb[1])).toString(16).padStart(2, "0") +
            Number(255 - Number(shadowrgb[2])).toString(16).padStart(2, "0"));
        ball_color = String("#" +
            Number(255 - Number(ballrgb[0])).toString(16).padStart(2, "0") +
            Number(255 - Number(ballrgb[1])).toString(16).padStart(2, "0") +
            Number(255 - Number(ballrgb[2])).toString(16).padStart(2, "0"));
        ball_middle_color = String("#" +
            Number(255 - Number(ball_middlergb[0])).toString(16).padStart(2, "0") +
            Number(255 - Number(ball_middlergb[1])).toString(16).padStart(2, "0") +
            Number(255 - Number(ball_middlergb[2])).toString(16).padStart(2, "0"));
    }
    if (choose_color && shadow_color != previous_game_color) {
        imgsrc.reloadColorImage(game_color);
    }
    const background = new PIXI.Graphics();
    background.beginFill(new PIXI.Color('#050a12'));
    background.drawRect(0, 0, canvas.screen.width, canvas.screen.height);
    background.endFill();
    canvas.stage.addChildAt(background, 0);
    draw_background();
    if (rungame.vision == true && rungame.IA == true) {
        // ctx.fillStyle = "#00111150";
        // for (let i = rungame.error_margin; i < WIDTH - (rungame.kill_margin_size ); i++){
        // 	for (let j = 0; j < HEIGHT; j += 1) {
        // 		ctx.fillRect(i * SCALE_X, j * SCALE_Y, SCALE_X, SCALE_Y);
        // 	}
        // }
        draw_image(imgsrc.ai_targetSprite, rungame.target_IA, rungame.ball_size * 6);
    }
    blurFilter.blur = blur_size;
    colorFilter.tint(shadow_color, false);
    write_score(4, rungame.team1_score, ((WIDTH / 4) * SCALE_X) * 1);
    write_score(4, rungame.team2_score, ((WIDTH / 4) * SCALE_X) * 3);
    // ctx.shadowBlur = 0;
    if (rungame.portal == false) {
        canvas.stage.addChild(modifySprite(imgsrc.topSprite, 0, 0, canvas.screen.width, SCALE_Y));
        canvas.stage.addChild(modifySprite(imgsrc.topSprite, 0, (HEIGHT - 1) * SCALE_Y, canvas.screen.width, SCALE_Y));
    }
    else {
        blurFilter.blur = blur_size * 2;
        colorFilter.tint('#ff9900ff', false);
        canvas.stage.addChild(modifySprite(imgsrc.topSprite, 0, 0, canvas.screen.width, SCALE_Y));
        colorFilter.tint('#0026ffff', false);
        canvas.stage.addChild(modifySprite(imgsrc.topSprite, 0, (HEIGHT - 1) * SCALE_Y, canvas.screen.width, SCALE_Y));
        blurFilter.blur = blur_size;
        colorFilter.tint(shadow_color, false);
    }
    //Obstacle
    for (let obs of rungame.obstacle_array)
        canvas.stage.addChild(modifySprite(imgsrc.obstacleSprite, obs.x * SCALE_X - SCALE_X, obs.y * SCALE_Y - SCALE_Y, SCALE_X * 2, SCALE_Y * 2));
    //Snake
    for (let obs of rungame.snake_array)
        canvas.stage.addChild(modifySprite(imgsrc.obstacleSprite, obs.x * SCALE_X - SCALE_X, obs.y * SCALE_Y - SCALE_Y, SCALE_X * 2, SCALE_Y * 2));
    //Meteor
    const mw = imgsrc.meteorImg.width / 5;
    const mh = imgsrc.meteorImg.height / 5;
    for (let obs of rungame.meteorites_array) {
        const cx = obs.x * SCALE_X;
        const cy = obs.y * SCALE_Y;
        canvas.stage.addChild(modifySprite(imgsrc.meteorSprite, cx - mw / 2, cy - mh / 2, mw, mh));
    }
    //Star
    for (let obs of rungame.box_array) {
        draw_image(obs, 3, imgsrc.powerupSprite);
    }
    if (rungame.vision == true) {
        for (let obj of rungame.ball_real_array_futur) {
            if (obj.touch == true)
                drawFutur(obj, rungame.ball_size * 7, "#0033ff", "#0033ff", !rungame.negative); //draw_image(obj, rungame.ball_size * 2, imgsrc.bounce_ballImg);
            else if ((obj.x <= rungame.ball_size + 8 || obj.x >= WIDTH - (rungame.ball_size + 8)))
                drawFutur(obj, rungame.ball_size * 7, "#ff0000", "#f71d1dcd", !rungame.negative); //draw_image(obj, rungame.ball_size * 2, imgsrc.kill_ballImg);
            else
                drawFutur(obj, rungame.ball_size * 7, "#e5ff00", "#ecef8f", !rungame.negative); //draw_image(obj, rungame.ball_size * 2, imgsrc.futur_ballImg);
        }
    }
    if (rungame.invisible_player == false) {
        for (let player of rungame.players) {
            blurFilter.blur = blur_size;
            colorFilter.tint(shadow_color, false);
            canvas.stage.addChild(modifySprite(imgsrc.playerSprite, player.posx * SCALE_X, (player.posy - player.size) * SCALE_Y, SCALE_X * 2, SCALE_Y * player.size * 2));
            blurFilter.blur = 0;
            if (player.type == "b") {
                for (let hole of rungame.holes_array) {
                    const hole = new PIXI.Graphics();
                    hole.beginFill(new PIXI.Color('#050a12'));
                    hole.drawRect(player.posx * SCALE_X, (player.posy + hole) * SCALE_Y, SCALE_X * 2, SCALE_Y);
                    hole.endFill();
                    canvas.stage.addChild(hole);
                }
            }
        }
    }
    blurFilter.blur = blur_size;
    colorFilter.tint(shadow_color, false);
    for (let obj of rungame.multiple_ball_array) {
        drawFutur(obj, rungame.ball_size * 8, ball_color, ball_middle_color, !rungame.negative);
    }
    // ctx.shadowBlur = 0;
    if (rungame.invisible_ball == false) {
        blurFilter.blur = blur_size;
        colorFilter.tint(shadow_color, false);
        drawBall(rungame.ball, rungame.ball_size * 8);
    }
    else {
        ball_trail = [];
    }
    blurFilter.blur = blur_size;
    colorFilter.tint(shadow_color, false);
    if (rungame.gameover == true) {
        // if (rungame.team1_score >= rungame.MAX_SCORE)
        // 	afficherMessage(rungame, "Team 1" + " Wins !!!", 'r');
        // if (rungame.team2_score >= rungame.MAX_SCORE)
        // 	afficherMessage(rungame, "Team 2" + " Wins !!!", 'l');
    }
    write_score(2, lastframe, (WIDTH - 4) * SCALE_X, (HEIGHT - 4) * SCALE_Y);
}
// function afficherMessage(game_data : any, msg : string, side : string) {
// 	ctx.font = "40px Arial";
// 	ctx.fillStyle = "#FFFFFF";
// 	let stats : string[] = [
// 		"STATS :",
// 		"exchange_nbr : " + (game_data.exchange_nbr ?? "0"),
// 		"bounce nbr : " + (game_data.bounce_nbr ?? "0"),
// 		"velocity boost nbr : " + (game_data.velocity_use ?? "0")
// 	];
// 	let msgX : number = 0, statsX : number = 0;
// 	let lineHeight : number = 40;
// 	let maxStatsWidth = Math.max(...stats.map(text => ctx.measureText(text).width));
// 	if (side == 'l') {
// 		msgX = 10;
// 		statsX = canvas.screen.width - 10 - maxStatsWidth;
// 	} else if (side == 'r') {
// 		msgX = canvas.screen.width - 10 - ctx.measureText(msg).width;
// 		statsX = 10;
// 	}
// 	let blockTop = canvas.height / 2 - (stats.length * lineHeight) / 2;
// 	ctx.fillStyle = "#AAAAAA";
// 	ctx.fillText(msg, msgX, (canvas.height / 2) + (lineHeight / 2));
// 	for (let i = 0; i < stats.length; i++) {
// 		let text = (stats[i] ?? "0");
// 		let y = blockTop + i * lineHeight;
// 		ctx.fillStyle = "#AAAAAA";
// 		ctx.fillText(text, statsX, y);
// 	}
// }
document.addEventListener('keydown', function (event) {
    ws.send(JSON.stringify({ type: 'keydown', key: event.key, id: my_id }));
});
document.addEventListener('keyup', function (event) {
    ws.send(JSON.stringify({ type: 'keyup', key: event.key, id: my_id }));
});
function draw_start(state) {
    if (state == false) {
        canvas.stage.addChild(modifySprite(imgsrc.startSprite, 0, 0, canvas.screen.width, canvas.screen.height));
    }
    else {
        canvas.stage.addChild(modifySprite(imgsrc.startcustomSprite, 0, 0, canvas.screen.width, canvas.screen.height));
    }
}
//# sourceMappingURL=display_pong.js.map