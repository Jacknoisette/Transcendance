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
var ws = new WebSocket('ws://localhost:3000/ws');
var canvas = document.getElementById('pong');
var ctx = canvas.getContext('2d');
var HEIGHT = canvas.height / 10;
var WIDTH = canvas.width / 10;
var SCALE_X = canvas.width / WIDTH;
var SCALE_Y = canvas.height / HEIGHT;
//Player image
var playerImg = new Image();
playerImg.src = "image/paddel.png";
playerImg.onload = function () { };
//Ball image
var ballImg = new Image();
ballImg.src = "image/ball.png";
ballImg.onload = function () { };
var futur_ballImg = new Image();
futur_ballImg.src = "image/futur_ball.png";
futur_ballImg.onload = function () { };
var bounce_ballImg = new Image();
bounce_ballImg.src = "image/bounce_ball.png";
bounce_ballImg.onload = function () { };
var kill_ballImg = new Image();
kill_ballImg.src = "image/kill_ball.png";
kill_ballImg.onload = function () { };
//IA image
var ai_target = new Image();
ai_target.src = "image/IA_target.png";
ai_target.onload = function () { };
//Custom
var crateImg = new Image();
crateImg.src = "image/crate.png";
crateImg.onload = function () { };
//Game
var top_img = new Image();
top_img.src = "image/top.png";
top_img.onload = function () { };
var bottom_img = new Image();
bottom_img.src = "image/bottom.png";
bottom_img.onload = function () { };
var center_img = new Image();
center_img.src = "image/game_center.png";
center_img.onload = function () { };
ws.onmessage = function (event) {
    var data = JSON.parse(event.data);
    if (data.type === 'state') {
        var state = data.state;
        draw_web(state);
    }
};
ws.onopen = function () { return console.log('WebSocket open!'); };
ws.onerror = function (e) { return console.error('WebSocket error', e); };
ws.onclose = function () { return console.log('WebSocket closed!'); };
function draw_ball(obj_ball, color, size) {
    return __awaiter(this, void 0, void 0, function () {
        var bx, by, ball_px;
        return __generator(this, function (_a) {
            ctx.fillStyle = color;
            bx = obj_ball.x * SCALE_X;
            by = obj_ball.y * SCALE_Y;
            ball_px = size * SCALE_X;
            ctx.beginPath();
            ctx.arc(bx, by, ball_px / 2, 0, 2 * Math.PI);
            ctx.fill();
            return [2 /*return*/];
        });
    });
}
function draw_image(obj_ball, bsize, img) {
    return __awaiter(this, void 0, void 0, function () {
        var bx, by;
        return __generator(this, function (_a) {
            bx = obj_ball.x * SCALE_X - (bsize * SCALE_X / 2);
            by = obj_ball.y * SCALE_Y - (bsize * SCALE_Y / 2);
            ctx.drawImage(img, bx, by, bsize * SCALE_X, bsize * SCALE_Y);
            return [2 /*return*/];
        });
    });
}
function draw_web(screen) {
    return __awaiter(this, void 0, void 0, function () {
        var i, j, msg, msgX, i, _i, _a, obs, _b, _c, obs, _d, _e, obs, _f, _g, obs, _h, _j, obj, _k, _l, hole, _m, _o, obj, imageData, data, i, imageData, data, i;
        return __generator(this, function (_p) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#1A1733";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            if (screen.vision == true && screen.IA == true) {
                ctx.fillStyle = "#001111";
                for (i = screen.error_margin; i < WIDTH - (screen.kill_margin_size); i++) {
                    for (j = 0; j < HEIGHT; j += 1) {
                        ctx.fillRect(i * SCALE_X, j * SCALE_Y, SCALE_X, SCALE_Y);
                    }
                }
                // draw_image(screen.target_IA, screen.ball_size * 3, )
                draw_image(screen.target_IA, screen.ball_size * 6, ai_target);
            }
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "90px Noto Sans";
            msg = "" + screen.player1_score;
            msgX = (WIDTH / 3 - 1) * SCALE_X - ctx.measureText(msg).width;
            ctx.fillText(msg, msgX, (canvas.height / 7));
            msg = "" + screen.player2_score;
            msgX = ((WIDTH / 5 - 1) * SCALE_X) * 4 - ctx.measureText(msg).width;
            ctx.fillText(msg, msgX, (canvas.height / 7));
            // ctx.fillStyle = "#FFFFFF";
            for (i = 1.5; i < HEIGHT; i += 5) {
                ctx.drawImage(center_img, (WIDTH / 2 - 1) * SCALE_X, i * SCALE_Y, 2 * SCALE_X, 2 * SCALE_Y);
                // ctx.fillRect((WIDTH/2 - 1) * SCALE_X, i * SCALE_Y, 2 * SCALE_X, 2 * SCALE_Y);
            }
            ctx.drawImage(top_img, 0, 0, canvas.width, SCALE_Y);
            ctx.drawImage(bottom_img, 0, (HEIGHT - 1) * SCALE_Y, canvas.width, SCALE_Y);
            // ctx.fillStyle = "#FFFFFF";
            // if (screen.portal == true)
            // 	ctx.fillStyle = "#FF8800";
            // ctx.fillRect(0, 0, canvas.width, SCALE_Y);
            // if (screen.portal == true)
            // 	ctx.fillStyle = "#0088FF";
            // ctx.fillRect(0, (HEIGHT-1) * SCALE_Y, canvas.width, SCALE_Y);
            for (_i = 0, _a = screen.obstacle_array; _i < _a.length; _i++) {
                obs = _a[_i];
                ctx.fillRect(obs.x * SCALE_X - SCALE_X, obs.y * SCALE_Y - SCALE_Y, SCALE_X * 2, SCALE_Y * 2);
            }
            for (_b = 0, _c = screen.meteorites_array; _b < _c.length; _b++) {
                obs = _c[_b];
                ctx.fillRect(obs.x * SCALE_X - SCALE_X, obs.y * SCALE_Y - SCALE_Y, SCALE_X * 2, SCALE_Y * 2);
            }
            for (_d = 0, _e = screen.snake_array; _d < _e.length; _d++) {
                obs = _e[_d];
                ctx.fillRect(obs.x * SCALE_X - SCALE_X, obs.y * SCALE_Y - SCALE_Y, SCALE_X * 2, SCALE_Y * 2);
            }
            for (_f = 0, _g = screen.box_array; _f < _g.length; _f++) {
                obs = _g[_f];
                draw_image(obs, 3, crateImg);
            }
            if (screen.vision == true) {
                for (_h = 0, _j = screen.ball_real_array_futur; _h < _j.length; _h++) {
                    obj = _j[_h];
                    if (obj.touch == true && bounce_ballImg.complete)
                        draw_image(obj, screen.ball_size * 2, bounce_ballImg);
                    else if ((obj.x <= screen.ball_size + screen.kill_margin_size || obj.x >= WIDTH - (screen.ball_size + screen.kill_margin_size)) && kill_ballImg.complete)
                        draw_image(obj, screen.ball_size * 2, kill_ballImg);
                    else if (futur_ballImg.complete)
                        draw_image(obj, screen.ball_size * 2, futur_ballImg);
                    // draw_ball(obj, color, screen.ball_size * 1.5);
                }
            }
            if (screen.invisible_player == false && playerImg.complete) {
                ctx.drawImage(playerImg, 5 * SCALE_X, (screen.player1 - screen.player_size) * SCALE_Y, SCALE_X * 2, SCALE_Y * screen.player_size * 2);
                ctx.drawImage(playerImg, (WIDTH - 7) * SCALE_X, (screen.player2 - screen.player_size) * SCALE_Y, SCALE_X * 2, SCALE_Y * screen.player_size * 2);
                ctx.fillStyle = "#1A1733";
                for (_k = 0, _l = screen.holes_array; _k < _l.length; _k++) {
                    hole = _l[_k];
                    ctx.fillRect(5 * SCALE_X, (screen.player1 + hole) * SCALE_Y, SCALE_X * 2, SCALE_Y);
                    ctx.fillRect((WIDTH - 7) * SCALE_X, (screen.player2 + hole) * SCALE_Y, SCALE_X * 2, SCALE_Y);
                }
            }
            for (_m = 0, _o = screen.multiple_ball_array; _m < _o.length; _m++) {
                obj = _o[_m];
                if (ballImg.complete)
                    draw_image(obj, screen.ball_size * 1.7, ballImg);
            }
            if (screen.invisible_ball == false && ballImg.complete) {
                draw_image(screen.ball, screen.ball_size * 2, ballImg);
            }
            if (screen.gameover == true) {
                if (screen.player1_score >= screen.MAX_SCORE)
                    afficherMessage(screen, "Player 1 Wins !!!", 'l');
                else if (screen.player2_score >= screen.MAX_SCORE)
                    afficherMessage(screen, "Player 2 Wins !!!", 'r');
            }
            if (screen.gold_game) {
                imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                data = imageData.data;
                for (i = 0; i < data.length; i += 4) {
                    data[i] = 255;
                    data[i + 1] = (data[i + 1] + 50 > 255) ? 255 : data[i + 1] + 50;
                    data[i + 2] = 0;
                }
                ctx.putImageData(imageData, 0, 0);
            }
            if (screen.negative) {
                imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                data = imageData.data;
                for (i = 0; i < data.length; i += 4) {
                    data[i] = 255 - data[i];
                    data[i + 1] = 255 - data[i + 1];
                    data[i + 2] = 255 - data[i + 2];
                }
                ctx.putImageData(imageData, 0, 0);
            }
            return [2 /*return*/];
        });
    });
}
function afficherMessage(game_data, msg, side) {
    var _a, _b, _c, _d;
    ctx.font = "40px Arial";
    ctx.fillStyle = "#FFFFFF";
    var stats = [
        "STATS :",
        "exchange_nbr : " + ((_a = game_data.exchange_nbr) !== null && _a !== void 0 ? _a : "0"),
        "bounce nbr : " + ((_b = game_data.bounce_nbr) !== null && _b !== void 0 ? _b : "0"),
        "velocity boost nbr : " + ((_c = game_data.velocity_use) !== null && _c !== void 0 ? _c : "0")
    ];
    var msgX = 0, statsX = 0;
    var lineHeight = 40;
    var maxStatsWidth = Math.max.apply(Math, stats.map(function (text) { return ctx.measureText(text).width; }));
    if (side == 'l') {
        msgX = 10;
        statsX = canvas.width - 10 - maxStatsWidth;
    }
    else if (side == 'r') {
        msgX = canvas.width - 10 - ctx.measureText(msg).width;
        statsX = 10;
    }
    var blockTop = canvas.height / 2 - (stats.length * lineHeight) / 2;
    ctx.fillStyle = "#AAAAAA";
    ctx.fillText(msg, msgX, (canvas.height / 2) + (lineHeight / 2));
    for (var i = 0; i < stats.length; i++) {
        var text = ((_d = stats[i]) !== null && _d !== void 0 ? _d : "0");
        var y = blockTop + i * lineHeight;
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
