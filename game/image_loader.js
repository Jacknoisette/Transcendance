export class ImageSrc {
    playerImg;
    // Ball images
    ballImg;
    futur_ballImg;
    bounce_ballImg;
    kill_ballImg;
    // IA image
    ai_target;
    // Custom images
    powerupImg;
    obstacleImg;
    meteorImg;
    snakeImg;
    portaltop_img;
    portalbottom_img;
    goldbackground_img;
    // Game images
    top_img;
    bottom_img;
    center_img;
    background_img;
    start_img;
    startcustom_img;
    //font
    font0;
    font1;
    font2;
    font3;
    font4;
    font5;
    font6;
    font7;
    font8;
    font9;
    nbrfont;
    constructor() {
        //Player image
        this.playerImg = new Image();
        this.playerImg.src = "image/paddel.png";
        //Ball image
        this.ballImg = new Image();
        this.ballImg.src = "image/newball.png";
        this.futur_ballImg = new Image();
        this.futur_ballImg.src = "image/futur_ball.png";
        this.bounce_ballImg = new Image();
        this.bounce_ballImg.src = "image/bounce_ball.png";
        this.kill_ballImg = new Image();
        this.kill_ballImg.src = "image/kill_ball.png";
        //IA image
        this.ai_target = new Image();
        this.ai_target.src = "image/IA_target.png";
        //Custom
        this.powerupImg = new Image();
        this.powerupImg.src = "image/powerup.png";
        this.obstacleImg = new Image();
        this.obstacleImg.src = "image/obstacle.png";
        this.meteorImg = new Image();
        this.meteorImg.src = "image/meteor.png";
        this.snakeImg = new Image();
        this.snakeImg.src = "image/snake.png";
        this.portaltop_img = new Image();
        this.portaltop_img.src = "image/portaltop.png";
        this.portalbottom_img = new Image();
        this.portalbottom_img.src = "image/portalbottom.png";
        this.goldbackground_img = new Image();
        this.goldbackground_img.src = "image/goldbackground.png";
        //Game
        this.top_img = new Image();
        this.top_img.src = "image/top.png";
        this.bottom_img = new Image();
        this.bottom_img.src = "image/bottom.png";
        this.center_img = new Image();
        this.center_img.src = "image/game_center.png";
        this.background_img = new Image();
        this.background_img.src = "image/background.png";
        this.start_img = new Image();
        this.start_img.src = "image/start.png";
        this.startcustom_img = new Image();
        this.startcustom_img.src = "image/startcustom.png";
        //Font
        this.font0 = new Image();
        this.font0.src = "image/font/0.png";
        this.font1 = new Image();
        this.font1.src = "image/font/1.png";
        this.font2 = new Image();
        this.font2.src = "image/font/2.png";
        this.font3 = new Image();
        this.font3.src = "image/font/3.png";
        this.font4 = new Image();
        this.font4.src = "image/font/4.png";
        this.font5 = new Image();
        this.font5.src = "image/font/5.png";
        this.font6 = new Image();
        this.font6.src = "image/font/6.png";
        this.font7 = new Image();
        this.font7.src = "image/font/7.png";
        this.font8 = new Image();
        this.font8.src = "image/font/8.png";
        this.font9 = new Image();
        this.font9.src = "image/font/9.png";
        this.nbrfont = [this.font0, this.font1, this.font2, this.font3, this.font4, this.font5, this.font6, this.font7, this.font8, this.font9];
    }
}
//# sourceMappingURL=image_loader.js.map