const container = document.getElementById("container");

const canvas = container.querySelector("#canvas");
const ctx = canvas.getContext("2d");

const depth_display = container.querySelector("#depth_num");
const info_tab = container.querySelector("#info_tab");

var oceanDepth = rndInt(window.innerHeight * 10, window.innerHeight * 17);
var depth = 0; 

var decoration = [];
var decorate_PossibleX = [0, canvas.width];
var decorateStrokeColors = ["black", "gray", "dimgray"];

var canvas_width = window.innerWidth;
var canvas_height = oceanDepth; 

canvas.width = canvas_width;
canvas.height = canvas_height;

var max_depth = oceanDepth - window.innerHeight;
var gamePaused = false;

const popSfxs = [];

const circles = [];
const keys = [];

const mouse = { x: undefined, undefined: 0 };

const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
gradient.addColorStop(0.1666666666666667, "#78ddff");
gradient.addColorStop(0.3333333333333334, "lightblue");
gradient.addColorStop(0.5000000000000001, "rgb(62, 155, 186)");
gradient.addColorStop(0.6666666666666668, "#347f97");
gradient.addColorStop(0.8333333333333335, "#225b6e");
gradient.addColorStop(1, "#163945");

canvas.addEventListener("mousemove", function (e) {
    mouse.x = e.pageX;
    mouse.y = e.pageY;
});

canvas.addEventListener("mouseleave", function () {
    mouse.x = undefined;
    mouse.y = undefined;
});

canvas.addEventListener("click", function (e) {
    
    for (let i = 0; i < circles.length; i++) {
        var distance = Math.sqrt(
            Math.pow(mouse.x - circles[i].x, 2) +
            Math.pow(mouse.y - circles[i].y, 2)
        );
        if (circles[i].radius >= distance) {
            circles[i].clicks--;
            circles[i].color = random_color();
            circles[i].radius -= circles[i].decreaseRadius;

            if (!circles[i].sound.paused) {
                circles[i].sound.currentTime = 0;
            }
            circles[i].sound.play();
            if (circles[i].clicks <= 0) {
                circles.splice(i, 1);
                i--;
            }
        }
    }
});

class Circle {
    constructor() {
        this.radius = rndInt(22, 45);
        this.x = rndInt(this.radius, canvas.width - this.radius);
        this.y = rndInt(this.radius, oceanDepth - this.radius);
        this.directionX = Math.random() * 4 - 2;
        this.directionY = Math.random() * 4 - 2;
        this.color = random_color();
        this.clicks = Math.floor(this.radius / 2);
        this.sound =
            popSfxs[Math.floor(Math.random() * popSfxs.length)].cloneNode();
        this.sound.load();
        this.decreaseRadius = this.radius / this.clicks - 0.95;
    }
    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = `${this.radius}px Arial`;
        ctx.textBaseline = "middle";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(`${this.clicks}`, this.x, this.y);

        ctx.strokeStyle = "white";
        ctx.stroke();
    }
    update() {
        this.x += this.directionX;
        this.y += this.directionY;

        if (this.x <= this.radius || this.x >= canvas.width - this.radius) {
            this.directionX = -this.directionX;
        }

        if (this.y <= this.radius || this.y >= canvas.height - this.radius) {
            this.directionY = -this.directionY;
        }

        if (mouse.x != undefined && mouse.y != undefined) {
            var distance = Math.sqrt(
                Math.pow(mouse.x - this.x, 2) + Math.pow(mouse.y - this.y, 2)
            );
            if (this.radius >= distance) {
                canvas.style.cursor = "pointer";
            }
        }
    }
}

class Decoration {
    constructor() {
        this.radius = rndInt(20, 30);
        this.x =
            decorate_PossibleX[
            Math.floor(Math.random() * decorate_PossibleX.length)
            ];
        this.y = rndInt(this.radius, oceanDepth - this.radius);
        this.directionY = Math.random() * 5 - 2.5;
        this.strokeColor =
            decorateStrokeColors[
            Math.floor(Math.random() * decorateStrokeColors.length)
            ];
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient; 
        ctx.fill();
        ctx.strokeStyle = this.strokeColor;
        ctx.stroke();

        for (let i = this.radius / 5; i < this.radius; i += this.radius / 5) {
            ctx.beginPath();
            ctx.strokeStyle = this.strokeColor;
            ctx.arc(this.x, this.y, i, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    update() {
        this.y += this.directionY;
        if (this.y + this.radius <= 0) {
            this.y = canvas.height + this.radius - 1;
        }
        if (this.y - this.radius >= canvas.height) {
            this.y = 1 - this.radius;
        }
    }
}

function handleDisplay() {
    [...decoration, ...circles].forEach((object) => object.draw());
    [...decoration, ...circles].forEach((object) => object.update());
}

function createCircles(num) {
    for (let i = 0; i < num; i++) {
        circles.push(new Circle());
    }
}

function updateCamera() {
    if (keys[38]) {
        depth -= 25;
        if (depth < 0) {
            depth = 0;
        }
    }

    if (keys[40]) {
        depth += 25;
        if (depth > max_depth) {
            depth = max_depth;
        }
    }
    var precent = ((depth / max_depth) * 100).toFixed(1);
    depth_display.textContent = Math.floor(precent);
    window.scrollTo(0, depth);
}

function Render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (canvas.style.cursor == "pointer") {
        canvas.style.cursor = "auto";
    }
    updateCamera();
    
    handleDisplay();
    if (!gamePaused) requestAnimationFrame(Render);
}

function rndInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function random_color() {
    return `rgb(${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)})`;
}

window.addEventListener("load", function () {
    for (let i = 1; i <= 3; i++) {
        popSfxs.push(
            new Audio(`resources/sounds/pop SFX collection/pop-${i}.mp3`)
        );
    }

    createCircles(rndInt(100, 400));

    var numOfDecorate = rndInt(100, 170);
    for (let i = 0; i < numOfDecorate; i++) {
        decoration.push(new Decoration());
    }

    

    var changeColorTime = rndInt(5, 10) * 1000;
    setInterval(function () {
        for (let i = 0; i < circles.length; i++) {
            circles[i].color = random_color();
        }
    }, changeColorTime);

    requestAnimationFrame(Render);
});

window.addEventListener("resize", function () {
    canvas.width = window.innerWidth;
    canvas.height = canvas_height;
    max_depth = oceanDepth - window.innerHeight;
    
});

window.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
});

window.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});

function enter_info() {
    gamePaused = true;
    info_tab.style.display = "block";
    container.querySelector("#infoBtn").disabled = true;
}

function exit_info() {
    container.querySelector("#infoBtn").disabled = false;
    info_tab.style.display = "none";
    gamePaused = false;
    requestAnimationFrame(Render);
}
