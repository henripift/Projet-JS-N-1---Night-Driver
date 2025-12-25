function Obstacle(x, y, w, h, speed) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.speed = speed;
}

function Voiture(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
}

function Collision(voiture, obstacle) {
    return voiture.x < obstacle.x + obstacle.w && voiture.x + voiture.w > obstacle.x && voiture.y < obstacle.y + obstacle.h && voiture.y + voiture.h > obstacle.y   
}

Voiture.prototype.drawcar = function(ctx) {
    ctx.fillStyle = '#ffbb00ff';
    ctx.fillRect(this.x, this.y, this.w, this.h)
}

Obstacle.prototype.draw = function(ctx) {
    ctx.fillStyle = '#ffffffff';
    ctx.fillRect(this.x, this.y, this.w, this.h);
}

Obstacle.prototype.update1 = function(ctx) {
    // par défaut la balle avance en x et y
    this.x -= this.speed;
    this.y += this.speed;
    this.w += 0.1;
    this.h += 0.15;
    this.speed = this.speed * 1.08
    this.draw(ctx)
};

Obstacle.prototype.update2 = function(ctx) {
    // par défaut la balle avance en x et y
    this.x += this.speed;
    this.y += this.speed;
    this.w += 0.1;
    this.h += 0.15;
    this.speed = this.speed * 1.08
    this.draw(ctx)
};

var canvas = document.getElementById('game');
var ctx = canvas.getContext('2d');
var running = false;
var info = document.getElementById('info'); 
var rafId = null;
var obstacles = [];
var time = 0;
var w_voiture = 100;
var direction = -1; // -1 pour aller vers la gauche, 1 pour aller vers la droite
var position = Math.random() * 5;
var position_reset = position
var voiture = new Voiture(canvas.width/2-w_voiture/2, canvas.height-20, w_voiture,20);

function loop() {
    if (!running) return;
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    voiture.drawcar(ctx)    
    
    // Déplacer position
    position = position + direction;
    
    // Inverser la direction si on dépasse les limites
    if (position <= -canvas.width/2 + 10) {
        direction = 1; // Inverser vers la droite
    } else if (position >= canvas.width/2 - 10) {
        direction = -1; // Inverser vers la gauche
    }
    
    if (time === 0) {
        obstacles.push(new Obstacle(canvas.width/2-position, canvas.height/2-50, 1, 2, 0.2))
        obstacles.push(new Obstacle(canvas.width/2-position+5, canvas.height/2-50, 1, 2, 0.2))
    }

    // Dessiner l'obstacle
    for (let i = 0; i < obstacles.length; i++) {
        if (i % 2 === 0) {
            obstacles[i].update1(ctx)
        } else {
            obstacles[i].update2(ctx)
        }
        if (Collision(voiture, obstacles[i])) {
            pause();
        }
    }

   
    
    time++
    console.log('position : ' + position)
    if (time === 10) {
        time = 0
    }
    rafId = requestAnimationFrame(loop);
};

function start() {
    if (running) return;
    running = true;
    info.textContent = "En cours d'exécution...";
    loop();
};

function pause() {
    running = false;
    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
    if (info) info.textContent = "En pause";
};

function reset() {
    running = false;
    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (info) info.textContent = "Reset";

    obstacles = []
    position = position_reset
};

const startBtn = document.getElementById('start');
startBtn.addEventListener('click', start);

const pauseBtn = document.getElementById('pause');
pauseBtn.addEventListener('click', pause);

const resetBtn = document.getElementById('reset');
resetBtn.addEventListener('click', reset);

document.addEventListener('keydown', (event) => {
    console.log(`Vous avez pressé la touche : ${event.key}`);
});