var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
//Web constant
var ws = new WebSocket('ws://localhost:3001/ws');
var canvas = document.getElementById('pong');
var ctx = canvas.getContext('2d');
var HEIGHT = canvas.height / 10;
var WIDTH = canvas.width / 10;
var SCALE_X = canvas.width / WIDTH;
var SCALE_Y = canvas.height / HEIGHT;
ws.onmessage = function (event) {
    var data = JSON.parse(event.data);
    if (data.type === 'state') {
        var state = data.state;
        draw_web(state);
    }
};
function draw_web(screen) {
    return __awaiter(this, void 0, void 0, function () {
        var msg, msgX, bx2, by2, ball_px2, i, i, j, ibx, iby, iball_px, _i, _a, obj, obx, oby, obj_px, bx, by, ball_px;
        return __generator(this, function (_b) {
            // const response = await fetch('../screen');
            // const screen = await response.json();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "90px Noto Sans";
            msg = "" + screen.player1_score;
            msgX = (WIDTH / 3 - 1) * SCALE_X - ctx.measureText(msg).width;
            ctx.fillText(msg, msgX, (canvas.height / 7));
            msg = "" + screen.player2_score;
            msgX = ((WIDTH / 5 - 1) * SCALE_X) * 4 - ctx.measureText(msg).width;
            ctx.fillText(msg, msgX, (canvas.height / 7));
            ctx.fillStyle = "#000000";
            bx2 = screen.ball.x * SCALE_X;
            by2 = screen.ball.y * SCALE_Y;
            ball_px2 = screen.ball_size * 3 * SCALE_X;
            ctx.beginPath();
            ctx.arc(bx2, by2, ball_px2 / 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = "#FFFFFF";
            for (i = 1.5; i < HEIGHT; i += 5) {
                ctx.fillRect((WIDTH / 2 - 1) * SCALE_X, i * SCALE_Y, 2 * SCALE_X, 2 * SCALE_Y);
            }
            if (screen.vision == true && screen.IA == true) {
                ctx.fillStyle = "#001111";
                for (i = screen.error_margin; i < WIDTH - (screen.kill_margin_size); i++) {
                    for (j = 0; j < HEIGHT; j += 1) {
                        ctx.fillRect(i * SCALE_X, j * SCALE_Y, SCALE_X, SCALE_Y);
                    }
                }
                ctx.fillStyle = "#00FFFF";
                ibx = screen.target_IA.x * SCALE_X;
                iby = screen.target_IA.y * SCALE_Y;
                iball_px = screen.ball_size * 3 * SCALE_X;
                ctx.beginPath();
                ctx.arc(ibx, iby, iball_px / 2, 0, 2 * Math.PI);
                ctx.fill();
            }
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, SCALE_Y);
            ctx.fillRect(0, (HEIGHT - 1) * SCALE_Y, canvas.width, SCALE_Y);
            if (screen.vision == true) {
                for (_i = 0, _a = screen.ball_real_array_futur; _i < _a.length; _i++) {
                    obj = _a[_i];
                    if (obj.touch == true)
                        ctx.fillStyle = '#2233FF';
                    else if (obj.x <= screen.ball_size + screen.kill_margin_size || obj.x >= WIDTH - (screen.ball_size + screen.kill_margin_size))
                        ctx.fillStyle = '#FF5500';
                    else
                        ctx.fillStyle = '#FF0000';
                    obx = obj.x * SCALE_X;
                    oby = obj.y * SCALE_Y;
                    obj_px = screen.ball_size * 1.5 * SCALE_X;
                    ctx.beginPath();
                    ctx.arc(obx, oby, obj_px / 2, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(5 * SCALE_X, (screen.player1 - screen.player_size) * SCALE_Y, SCALE_X * 2, SCALE_Y * screen.player_size * 2);
            ctx.fillRect((WIDTH - 7) * SCALE_X, (screen.player2 - screen.player_size) * SCALE_Y, SCALE_X * 2, SCALE_Y * screen.player_size * 2);
            bx = screen.ball.x * SCALE_X;
            by = screen.ball.y * SCALE_Y;
            ball_px = screen.ball_size * 1.5 * SCALE_X;
            ctx.beginPath();
            ctx.arc(bx, by, ball_px / 2, 0, 2 * Math.PI);
            ctx.fill();
            return [2 /*return*/];
        });
    });
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
