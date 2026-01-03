// Fonction pour setup le canvas en haute résolution 
function setupCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    return ctx;
}

function Obstacle(x, y, w, h, speed) { // La fonction Obstacle permettra de créer les obstacles
    this.x = x; // il faut la position de base en x
    this.y = y; // en y
    this.w = w; // son épaisseur
    this.h = h; // sa hauteur
    this.speed = speed; // et la vitesse à laquelle l'obstacle sera amené à se déplacer
}

function Voiture(x, y, w, h) { // cette fonction permettra de créer notre voiture ====> provisoir, sera remplacer par une img voiture
    this.x = x; // avec son x
    this.y = y; // son y
    this.w = w; // son épaisseur
    this.h = h; // sa hauteur
}

function Collision(voiture, obstacle) { // cette fonction permet de gérer la collision
    return voiture.x < obstacle.x + obstacle.w && voiture.x + voiture.w > obstacle.x && voiture.y < obstacle.y + obstacle.h && voiture.y + voiture.h > obstacle.y   
}

Obstacle.prototype.draw = function(ctx) { // fonction permettant de dessiner les obstacle / prototype signifie que c'est la fonction Obstacle (créer ci-dessous) qui héritera de la fonction draw
    ctx.fillStyle = '#ffffffff';
    ctx.fillRect(this.x, this.y, this.w, this.h); // on dessine le rectangle avec son x, y, épaisseur, hauteur
}

Voiture.prototype.drawcar = function(ctx) { // pareil mais pour la voiture
    ctx.fillStyle = '#000000';
    ctx.fillRect(this.x, this.y, this.w, this.h);
}

// les fonctions update hérité par obstacle, déplace les objets en x, y en fonction de speed, tout en augmentant  la taille de l'objet et la vitesse qui s'accroit peu à peu
// dans ces mêmes fonctions on regarde si les touches flèche droite et flèche gauche sont pressées/enfoncés à l'aide d'un dictionnaire, voir en bas pour comprendre
// et en fonction de quelle touche est pressé on décale l'objet sur son axe x
// la raison pour laquelle il y a update1 ou *2 est que sur un même axe y il y a deux obstacles qui s'écartent peu à peu pour donner l'effet de 3d
Obstacle.prototype.update1 = function(ctx) { 
    // par défaut la balle avance en x et y
    this.x -= this.speed;
    this.y += this.speed;
    this.w += 0.2;
    this.h += 0.3;
    this.speed = this.speed * 1.08
    this.draw(ctx)
    if (touches["ArrowRight"]) {
        this.x -= this.speed;
    }

    if (touches["ArrowLeft"]) {
        this.x += this.speed;
    }
};

Obstacle.prototype.update2 = function(ctx) {
    // par défaut la balle avance en x et y
    this.x += this.speed;
    this.y += this.speed;
    this.w += 0.2;
    this.h += 0.3;
    this.speed = this.speed * 1.08
    this.draw(ctx)
    if (touches["ArrowRight"]) {
        this.x -= this.speed;
    }

    if (touches["ArrowLeft"]) {
        this.x += this.speed;
    }
};

var canvas = document.getElementById('game'); // on créer le canva en récupérant l'id game
var ctx = setupCanvas(canvas); // on setup le canvas en HD
var canvasWidth = canvas.getBoundingClientRect().width; // largeur CSS du canvas
var canvasHeight = canvas.getBoundingClientRect().height; // hauteur CSS du canvas
var running = false; // running sert au fonction start, pause et reset
var info = document.getElementById('info'); 
var rafId = null; // sert à la fonction loop() et pause(), sert à savoir si la fonction se "répète"
var obstacles = []; // liste obstacles, les objets obstacle sont stockés ici
var time = 0; // time est utilisé plus bas
var w_voiture = 200; // l'épaisseur de la voiture doublée
var h_voiture = 50; // hauteur de la voiture doublée
var direction = -1; // -1 pour aller vers la gauche, 1 pour aller vers la droite
var position = Math.random() * 5; // on choisit une position au hasard
var position_reset = position // est utilisé dans la fonction reset()
var voiture = new Voiture(canvasWidth/2-w_voiture/2, canvasHeight-h_voiture, w_voiture,h_voiture); // on créé l'objet voiture
var touches = {}; // dico touche, utilisé plus haut, on y stocke les touches, voir plus bas pour comprendre les valeurs associés
var car1 = new Image();
car1.src = "medias/car1.png";
var score = 0;
var timer_score = 0;
var speed = 0.4;
var speed_kmh = 100;
var w_obstacle = 2;
var h_obstacle = 4;
var timer_game = 120;
var timer_second = 0;
var timer_random = 0;
var engineSound = new Audio("medias/sound.MP3"); // Ajoute ici
engineSound.loop = true; // Pour qu'il tourne en boucle
engineSound.volume = 0.3; // Ajuste le volume (0.0 à 1.0)
var crashSound = new Audio("medias/crash.MP3")
crashSound.volume = 0.3

function loop() {
    if (!running) return; // si running == true 
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight); // on efface le canva
    ctx.font = "16px arial"; // texte doublé
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText("VOTRE SCORE " + score, 20, 46);
    ctx.fillText("VITESSE MAX " + speed_kmh, canvasWidth-160, 46);
    ctx.fillText("TEMPS  " + timer_game, canvasWidth-114, 30);
    voiture.drawcar(ctx)    // on dessine la voiture
    ctx.drawImage(car1, canvasWidth/2-w_voiture/2, canvasHeight-h_voiture, w_voiture,h_voiture);
    
    // Déplacer position
    position = position + direction; // on incrémente position pour faire bouger les obstacles
    
    // Inverser la direction si on dépasse les limites 
    if (position <= -canvasWidth/2 + 10) {
        direction = 1; // Inverser vers la droite
    } else if (position >= canvasWidth/2 - 10) {
        direction = -1; // Inverser vers la gauche
    }
    
    // Changer aléatoirement la direction de temps en temps (pas à chaque fois)
    if (Math.random() < 0.05) { // 5% de chance à chaque frame
        direction = Math.random() > 0.5 ? 1 : -1;
    }
    
    if (time === 0) { // donc time sert à mettre un "timer" de quand les obstacles apparaissent
        obstacles.push(new Obstacle(canvasWidth/2-position, canvasHeight/2-70, w_obstacle, h_obstacle, speed))
        obstacles.push(new Obstacle(canvasWidth/2-position+10, canvasHeight/2-70, w_obstacle, h_obstacle, speed))
    }

    // Dessiner l'obstacle
    for (let i = 0; i < obstacles.length; i++) {
        if (i % 2 === 0) {
            obstacles[i].update1(ctx)
        } else {
            obstacles[i].update2(ctx)
        }
        if (Collision(voiture, obstacles[i])) { // s'il il y a une collision => game over 
            pause();
            ctx.fillStyle = '#f30f0fa1';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            ctx.font = "96px arial"; 
            ctx.fillStyle = '#3bf104ff';
            ctx.fillText("Game Over", canvasWidth/2-250, canvasHeight/2);
            console.log('voiture x :' + voiture.x)
            console.log('côté de l obstacle ' + (obstacles[i].x + obstacles[i].w))
            crashSound.play();
        }
    }
    if (timer_game === 0) {
        const score_gagnant = score;
        const vmax_gagnant = speed_kmh;
        reset();
        ctx.fillStyle = '#00000096';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.font = "64px arial";
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText("BRAVO !", canvasWidth/2-120, canvasHeight/2-50);
        ctx.font = "48px arial";
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText("Tu as gagné !", canvasWidth/2-150, canvasHeight/2+20);
        ctx.font = "24px arial";
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText("Score : " + score_gagnant + ' | VMax : ' + vmax_gagnant, canvasWidth/2-125, canvasHeight/2+70);
    }
   
    
    time++ // on incrément time, c'est notre timer
    timer_score++
    timer_second++
    if (time === 10) { // une fois à 10, on le reset et un obstacle peut apparaître
        time = 0
    }
    if (timer_second === 60) {
        timer_second = 0;
        timer_game = timer_game - 1;
    }
    if (timer_score === 25) {
        timer_score = 0;
        score++;
        speed += 0.03;
        speed_kmh += Math.round(Math.random() * 5);
        w_obstacle += 0.05;
        h_obstacle += 0.065;
    }
    rafId = requestAnimationFrame(loop); // répète la fonction
};

function start() {
    if (running) return; // si c'est false, la fonction lance le jeu
    running = true;
    info.textContent = "En cours d'exécution...";
    engineSound.play(); // Lance le son
    loop(); // fonction loop est lancé
};

function pause() {
    running = false; // quand pause est cliqué, running = false => stoppe le jeu
    if (rafId) { // si rafId == true
        cancelAnimationFrame(rafId); // on stoppe l'animation
        rafId = null;
    }
    if (info) info.textContent = "En pause"; // petit texte en dessous le canva
    engineSound.pause(); // Met en pause le son
};

function reset() {
    running = false; 
    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    if (info) info.textContent = "Reset";

    obstacles = []; // on reset la liste obstacles
    position = position_reset; // et leur position
    score = 0;
    speed_kmh = 100;
    timer_game = 120;
    speed = 0.4;
    w_obstacle = 2;
    h_obstacle = 4;
};

// on récupère les boutons cliqués => actionne les fonctions concernées
const startBtn = document.getElementById('start');
startBtn.addEventListener('click', start);

const pauseBtn = document.getElementById('pause');
pauseBtn.addEventListener('click', pause);

const resetBtn = document.getElementById('reset');
resetBtn.addEventListener('click', reset);

document.addEventListener('keydown', (e) => {
    touches[e.key] = true; // on récupère la touche enfoncée, on met en valeur true à sa clé dans le dico
})

document.addEventListener('keyup', (e) => {
    touches[e.key] = false; // si la touche n'est plus enfoncée, on met false
})