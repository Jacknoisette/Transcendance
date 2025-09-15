import * as PIXI from 'pixi.js';
export class ImageSrc {
    playerImg;
    playerSprite;
    // IA image
    ai_target;
    ai_targetSprite;
    // Custom images
    powerupImg;
    powerupSprite;
    obstacleImg;
    obstacleSprite;
    meteorImg;
    meteorSprite;
    // Game images
    top_img;
    topSprite;
    start_img;
    startSprite;
    startcustom_img;
    startcustomSprite;
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
    font0Sprite;
    font1Sprite;
    font2Sprite;
    font3Sprite;
    font4Sprite;
    font5Sprite;
    font6Sprite;
    font7Sprite;
    font8Sprite;
    font9Sprite;
    nbrfont;
    nbrfontSprite;
    // constructor(color !: string)
    // {
    // 	this.playerImg = new Image;
    // 	this.ai_target = new Image;
    // 	this.powerupImg = new Image;
    // 	this.obstacleImg = new Image;
    // 	this.meteorImg = new Image;
    // 	this.top_img =new Image;
    // 	this.start_img = new Image;
    // 	this.startcustom_img = new Image;
    // 	this.font0 = new Image;
    // 	this.font1 = new Image;
    // 	this.font2 = new Image;
    // 	this.font3 = new Image;
    // 	this.font4 = new Image;
    // 	this.font5 = new Image;
    // 	this.font6 = new Image;
    // 	this.font7 = new Image;
    // 	this.font8 = new Image;
    // 	this.font9 = new Image;
    // 	this.load(color);
    // }
    async load(color) {
        //Player image
        this.playerImg = await loadImage("image/player.png");
        //IA image
        this.ai_target = await loadImage("image/IA_target.png");
        //Custom
        this.powerupImg = await loadImage("image/neonpowerup.png");
        this.obstacleImg = await loadImage("image/neonobstacle.png");
        this.meteorImg = await loadImage("image/meteorneon.png");
        //Game
        this.top_img = await loadImage("image/neonside.png");
        this.start_img = await loadImage("image/start.png");
        this.startcustom_img = await loadImage("image/startcustom.png");
        //Font
        this.font0 = await loadImage("image/font/0.png");
        this.font1 = await loadImage("image/font/1.png");
        this.font2 = await loadImage("image/font/2.png");
        this.font3 = await loadImage("image/font/3.png");
        this.font4 = await loadImage("image/font/4.png");
        this.font5 = await loadImage("image/font/5.png");
        this.font6 = await loadImage("image/font/6.png");
        this.font7 = await loadImage("image/font/7.png");
        this.font8 = await loadImage("image/font/8.png");
        this.font9 = await loadImage("image/font/9.png");
        this.playerSprite = createSprite(this.playerImg, 0, 0, 1, 1);
        this.ai_targetSprite = createSprite(this.ai_target, 0, 0, 1, 1);
        this.powerupSprite = createSprite(this.powerupImg, 0, 0, 1, 1);
        this.obstacleSprite = createSprite(this.obstacleImg, 0, 0, 1, 1);
        this.meteorSprite = createSprite(this.meteorImg, 0, 0, 1, 1);
        this.topSprite = createSprite(this.top_img, 0, 0, 1, 1);
        this.startSprite = createSprite(this.start_img, 0, 0, 1, 1);
        this.startcustomSprite = createSprite(this.startcustom_img, 0, 0, 1, 1);
        this.nbrfont = [this.font0, this.font1, this.font2, this.font3, this.font4, this.font5, this.font6, this.font7, this.font8, this.font9];
        this.font0Sprite = createSprite(this.font0, 0, 0, 1, 1);
        this.font1Sprite = createSprite(this.font1, 0, 0, 1, 1);
        this.font2Sprite = createSprite(this.font2, 0, 0, 1, 1);
        this.font3Sprite = createSprite(this.font3, 0, 0, 1, 1);
        this.font4Sprite = createSprite(this.font4, 0, 0, 1, 1);
        this.font5Sprite = createSprite(this.font5, 0, 0, 1, 1);
        this.font6Sprite = createSprite(this.font6, 0, 0, 1, 1);
        this.font7Sprite = createSprite(this.font7, 0, 0, 1, 1);
        this.font8Sprite = createSprite(this.font8, 0, 0, 1, 1);
        this.font9Sprite = createSprite(this.font9, 0, 0, 1, 1);
        this.nbrfontSprite = [
            this.font0Sprite, this.font1Sprite, this.font2Sprite, this.font3Sprite, this.font4Sprite,
            this.font5Sprite, this.font6Sprite, this.font7Sprite, this.font8Sprite, this.font9Sprite
        ];
        this.reloadColorImage(color);
    }
    reloadColorImage(main_color) {
        this.playerImg = returnColorImage(this.playerImg, main_color);
        this.ai_target = returnColorImage(this.ai_target, main_color);
        this.powerupImg = returnColorImage(this.powerupImg, main_color);
        this.obstacleImg = returnColorImage(this.obstacleImg, main_color);
        this.meteorImg = returnColorImage(this.meteorImg, main_color);
        this.top_img = returnColorImage(this.top_img, main_color);
        this.start_img = returnColorImage(this.start_img, main_color);
        this.startcustom_img = returnColorImage(this.startcustom_img, main_color);
        for (let font of this.nbrfont) {
            font = returnColorImage(font, main_color);
        }
        this.playerSprite.texture = PIXI.Texture.from(this.playerImg);
        this.ai_targetSprite.texture = PIXI.Texture.from(this.ai_target);
        this.powerupSprite.texture = PIXI.Texture.from(this.powerupImg);
        this.obstacleSprite.texture = PIXI.Texture.from(this.obstacleImg);
        this.meteorSprite.texture = PIXI.Texture.from(this.meteorImg);
        this.topSprite.texture = PIXI.Texture.from(this.top_img);
        this.startSprite.texture = PIXI.Texture.from(this.start_img);
        this.startcustomSprite.texture = PIXI.Texture.from(this.startcustom_img);
        for (let i = 0; i < this.nbrfont.length; i++) {
            this.nbrfontSprite[i].texture = PIXI.Texture.from(this.nbrfont[i]);
        }
    }
}
export function hexToRgbArray(hex) {
    hex = hex.replace(/^#/, "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return [r, g, b];
}
function returnColorImage(img, color, scaleX = 1, scaleY = 1) {
    const deccolor = hexToRgbArray(color);
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = img.width * scaleX;
    tempCanvas.height = img.height * scaleY;
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
    return tempCanvas;
}
function createSprite(img, posx, posy, width, height) {
    const sprite = PIXI.Sprite.from(img);
    sprite.x = posx;
    sprite.y = posy;
    sprite.width = width;
    sprite.height = height;
    return sprite;
}
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = reject;
    });
}
