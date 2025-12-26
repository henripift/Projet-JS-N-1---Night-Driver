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
    this.w += 0.1;
    this.h += 0.15;
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
    this.w += 0.1;
    this.h += 0.15;
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
var ctx = canvas.getContext('2d'); // le canva est en 2d
var running = false; // running sert au fonction start, pause et reset
var info = document.getElementById('info'); 
var rafId = null; // sert à la fonction loop() et pause(), sert à savoir si la fonction se "répète"
var obstacles = []; // liste obstacles, les objets obstacle sont stockés ici
var time = 0; // time est utilisé plus bas
var w_voiture = 100; // l'épaisseur de la voiture est de 100
var h_voiture = 25; // hauteur de la voiture
var direction = -1; // -1 pour aller vers la gauche, 1 pour aller vers la droite
var position = Math.random() * 5; // on choisit une position au hasard
var position_reset = position // est utilisé dans la fonction reset()
var voiture = new Voiture(canvas.width/2-w_voiture/2, canvas.height-h_voiture, w_voiture,h_voiture); // on créé l'objet voiture
var touches = {}; // dico touche, utilisé plus haut, on y stocke les touches, voir plus bas pour comprendre les valeurs associés
var car1 = new Image();
car1.src = "medias/car1.png";

function loop() {
    if (!running) return; // si running == true 
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height); // on efface le canva
    voiture.drawcar(ctx)    // on dessine la voiture
    ctx.drawImage(car1, canvas.width/2-w_voiture/2, canvas.height-h_voiture, w_voiture,h_voiture);
    // Déplacer position
    position = position + direction; // on incrémente position pour faire bouger les obstacles
    
    // Inverser la direction si on dépasse les limites ====> provisoir
    if (position <= -canvas.width/2 + 10) {
        direction = 1; // Inverser vers la droite
    } else if (position >= canvas.width/2 - 10) {
        direction = -1; // Inverser vers la gauche
    }
    
    if (time === 0) { // donc time sert à mettre un "timer" de quand les obstacles apparaissent
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
        if (Collision(voiture, obstacles[i])) { // s'il il y a une collision => game over 
            pause();
            ctx.fillStyle = '#f30f0fa1';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = "48px arial";
            ctx.fillStyle = '#3bf104ff';
            ctx.fillText("Game Over", canvas.width/2-125, canvas.height/2);
            console.log('voiture x :' + voiture.x)
            console.log('côté de l obstacle ' + (obstacles[i].x + obstacles[i].w))
        }
    }

   
    
    time++ // on incrément time, c'est notre timer
    if (time === 10) { // une fois à 10, on le reset et un obstacle peut apparaître
        time = 0
    }
    rafId = requestAnimationFrame(loop); // répète la fonction
};

function start() {
    if (running) return; // si c'est false, la fonction lance le jeu
    running = true;
    info.textContent = "En cours d'exécution...";
    loop(); // fonction loop est lancé
};

function pause() {
    running = false; // quand pause est cliqué, running = false => stoppe le jeu
    if (rafId) { // si rafId == true
        cancelAnimationFrame(rafId); // on stoppe l'animation
        rafId = null;
    }
    if (info) info.textContent = "En pause"; // petit texte en dessous le canva
};

function reset() {
    running = false; 
    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (info) info.textContent = "Reset";

    obstacles = [] // on reset la liste obstacles
    position = position_reset // et leur position
    // note : reset la taille aussi
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