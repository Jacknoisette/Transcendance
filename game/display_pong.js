//Web constant
const ws = new WebSocket('ws://localhost:3000/ws');
const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');
const HEIGHT = canvas.height / 10;
const WIDTH = canvas.width / 10;
const SCALE_X = canvas.width / WIDTH;
const SCALE_Y = canvas.height / HEIGHT;
import { ImageSrc } from "./image_loader.js";
const imgsrc = new ImageSrc;
;
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
    document.getElementById('speedingModeBtn').textContent = "Speeding Mode : " + (pongConfig.tournament ? "ON" : "OFF");
    document.getElementById('playerNbrBtn').textContent = (pongConfig.player_nbr === 4 ? "4 joueurs : ON" : "4 joueurs : OFF");
    document.getElementById('startBtn').textContent = "START : " + (pongConfig.start ? "ON" : "OFF");
    document.getElementById('player3').style.display = pongConfig.player_nbr === 4 ? "" : "none";
    document.getElementById('player4').style.display = pongConfig.player_nbr === 4 ? "" : "none";
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
        draw_search();
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
document.getElementById('player3').oninput = function (e) {
    pongConfig.player3 = e.target.value;
};
document.getElementById('player4').oninput = function (e) {
    pongConfig.player4 = e.target.value;
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
    if (data.type === 'welcome') {
        my_id = data.id;
    }
};
ws.onopen = () => console.log('WebSocket open!');
ws.onerror = e => console.error('WebSocket error', e);
ws.onclose = () => console.log('WebSocket closed!');
async function draw_image(obj_ball, bsize, img) {
    const bx = obj_ball.x * SCALE_X - (bsize * SCALE_X / 2);
    const by = obj_ball.y * SCALE_Y - (bsize * SCALE_Y / 2);
    ctx.drawImage(img, bx, by, bsize * SCALE_X, bsize * SCALE_Y);
}
async function write_score(bsize, nbr, posx) {
    const array = nbr.toString().split('').map(Number);
    for (let i = 0; i < array.length; i++) {
        let n = array[i];
        let img = imgsrc.nbrfont[n];
        if (!img || !img.complete)
            continue;
        let bx = posx - (bsize * SCALE_X * array.length / 2) + (i * bsize * SCALE_X);
        let by = (canvas.height / 7) - (bsize * SCALE_Y / 2);
        ctx.drawImage(img, bx, by, bsize * SCALE_X, bsize * SCALE_Y);
    }
}
async function draw_game(screen) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (screen.gold_game)
        ctx.drawImage(imgsrc.goldbackground_img, 0, 0, canvas.width, canvas.height);
    else
        ctx.drawImage(imgsrc.background_img, 0, 0, canvas.width, canvas.height);
    if (screen.vision == true && screen.IA == true) {
        ctx.fillStyle = "#00111150";
        for (let i = screen.error_margin; i < WIDTH - (screen.kill_margin_size); i++) {
            for (let j = 0; j < HEIGHT; j += 1) {
                ctx.fillRect(i * SCALE_X, j * SCALE_Y, SCALE_X, SCALE_Y);
            }
        }
        draw_image(screen.target_IA, screen.ball_size * 6, imgsrc.ai_target);
    }
    write_score(4, screen.team1_score, ((WIDTH / 4) * SCALE_X) * 1);
    write_score(4, screen.team2_score, ((WIDTH / 4) * SCALE_X) * 3);
    for (let i = 1.5; i < HEIGHT; i += 5)
        ctx.drawImage(imgsrc.center_img, (WIDTH / 2 - 1) * SCALE_X, i * SCALE_Y, 2 * SCALE_X, 2 * SCALE_Y);
    if (screen.portal == false) {
        ctx.drawImage(imgsrc.top_img, 0, 0, canvas.width, SCALE_Y);
        ctx.drawImage(imgsrc.bottom_img, 0, (HEIGHT - 1) * SCALE_Y, canvas.width, SCALE_Y);
    }
    else {
        ctx.drawImage(imgsrc.portaltop_img, 0, 0, canvas.width, SCALE_Y);
        ctx.drawImage(imgsrc.portalbottom_img, 0, (HEIGHT - 1) * SCALE_Y, canvas.width, SCALE_Y);
    }
    for (let obs of screen.obstacle_array)
        ctx.drawImage(imgsrc.obstacleImg, obs.x * SCALE_X - SCALE_X, obs.y * SCALE_Y - SCALE_Y, SCALE_X * 2, SCALE_Y * 2);
    for (let obs of screen.meteorites_array) {
        const w = imgsrc.meteorImg.width / 5;
        const h = imgsrc.meteorImg.height / 5;
        const cx = obs.x * SCALE_X;
        const cy = obs.y * SCALE_Y;
        ctx.drawImage(imgsrc.meteorImg, cx - w / 2, cy - h / 2, w, h);
    }
    for (let obs of screen.snake_array)
        ctx.drawImage(imgsrc.snakeImg, obs.x * SCALE_X - SCALE_X, obs.y * SCALE_Y - SCALE_Y, SCALE_X * 2, SCALE_Y * 2);
    for (let obs of screen.box_array) {
        draw_image(obs, 3, imgsrc.powerupImg);
    }
    if (screen.vision == true) {
        for (let obj of screen.ball_real_array_futur) {
            if (obj.touch == true && imgsrc.bounce_ballImg.complete)
                draw_image(obj, screen.ball_size * 2, imgsrc.bounce_ballImg);
            else if ((obj.x <= screen.ball_size + screen.kill_margin_size || obj.x >= WIDTH - (screen.ball_size + screen.kill_margin_size)) && imgsrc.kill_ballImg.complete)
                draw_image(obj, screen.ball_size * 2, imgsrc.kill_ballImg);
            else if (imgsrc.futur_ballImg.complete)
                draw_image(obj, screen.ball_size * 2, imgsrc.futur_ballImg);
        }
    }
    if (screen.invisible_player == false && imgsrc.playerImg.complete) {
        for (let player of screen.players) {
            ctx.drawImage(imgsrc.playerImg, player.posx * SCALE_X, (player.posy - player.size) * SCALE_Y, SCALE_X * 2, SCALE_Y * player.size * 2);
            if (player.type == "b") {
                for (let hole of screen.holes_array) {
                    ctx.fillStyle = "#1A1733";
                    ctx.fillRect(player.posx * SCALE_X, (player.posy + hole) * SCALE_Y, SCALE_X * 2, SCALE_Y);
                }
            }
        }
    }
    for (let obj of screen.multiple_ball_array) {
        if (imgsrc.ballImg.complete)
            draw_image(obj, screen.ball_size * 1.5, imgsrc.ballImg);
    }
    if (screen.invisible_ball == false && imgsrc.ballImg.complete) {
        const trailLength = screen.ball_array_past.length;
        for (let i = 0; i < trailLength; i++) {
            const alpha = (i + 1) / (trailLength + 1);
            ctx.globalAlpha = alpha * 0.6;
            draw_image(screen.ball_array_past[i], screen.ball_size * 2, imgsrc.ballImg);
        }
        ctx.globalAlpha = 1.0;
        draw_image(screen.ball, screen.ball_size * 2, imgsrc.ballImg);
    }
    if (screen.gameover == true) {
        if (screen.team1_score >= screen.MAX_SCORE)
            afficherMessage(screen, "Team 1" + " Wins !!!", 'r');
        if (screen.team2_score >= screen.MAX_SCORE)
            afficherMessage(screen, "Team 2" + " Wins !!!", 'l');
    }
    if (screen.negative) {
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
        }
        ctx.putImageData(imageData, 0, 0);
    }
}
function afficherMessage(game_data, msg, side) {
    ctx.font = "40px Arial";
    ctx.fillStyle = "#FFFFFF";
    let stats = [
        "STATS :",
        "exchange_nbr : " + (game_data.exchange_nbr ?? "0"),
        "bounce nbr : " + (game_data.bounce_nbr ?? "0"),
        "velocity boost nbr : " + (game_data.velocity_use ?? "0")
    ];
    let msgX = 0, statsX = 0;
    let lineHeight = 40;
    let maxStatsWidth = Math.max(...stats.map(text => ctx.measureText(text).width));
    if (side == 'l') {
        msgX = 10;
        statsX = canvas.width - 10 - maxStatsWidth;
    }
    else if (side == 'r') {
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
    ws.send(JSON.stringify({ type: 'keydown', key: event.key, id: my_id }));
});
document.addEventListener('keyup', function (event) {
    ws.send(JSON.stringify({ type: 'keyup', key: event.key, id: my_id }));
});
function draw_start(state) {
    if (state == false) {
        ctx.drawImage(imgsrc.start_img, 0, 0, canvas.width, canvas.height);
    }
    else {
        ctx.drawImage(imgsrc.startcustom_img, 0, 0, canvas.width, canvas.height);
    }
}
function draw_search() {
    console.log('hello');
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
}
//# sourceMappingURL=display_pong.js.map