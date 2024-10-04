// Nombre d'images par seconde
let fps = 30;

// déclaration des variables globales
// taille canvas
const largeurCanvas = 300;
const hauteurCanvas = 200;
const tailleCase = 20;
const X = largeurCanvas / tailleCase;
const Y = hauteurCanvas / tailleCase;
const diagAllowed = false;
let map = createArray(X, Y);
let typeAlgo = 0;
let tpsTouche;
// variables pour Dijkstra
let distance = createArray(X, Y);
let Q = createArray(X, Y);
let predecesseur = createArray(X, Y);
let posDepart, posFin;
let cheminTrouve;
// variables pour A*
let gScore = createArray(X, Y);
let fScore = createArray(X, Y);
let openSet = [];

// lien avec le canvas dans la page HTML
// création canvas
const myCanvas = document.createElement("canvas");
myCanvas.id = "moncanvas";
myCanvas.width = largeurCanvas;
myCanvas.height = hauteurCanvas;
const body = document.querySelector("body");
body.append(myCanvas);
let ctx = myCanvas.getContext("2d");

// lancement
init();
// Event Listener pour la capture des touches clavier
document.addEventListener("keydown", keyDownListener);
document.addEventListener("keyup", keyUpListener);
document.addEventListener("mousedown", mouseDownListener);
document.addEventListener("mouseup", mouseUpListener);
// début de la boucle de rendu
requestAnimationFrame(renduCanvas);

// routine de lecture des touches clavier et de la souris
let keyPresses = {};
let mousePress = false;
let mousePos;

function keyDownListener(event) {
	// événement touche appuyée
	keyPresses[event.key] = true;
}
function keyUpListener(event) {
	// événement touche relâchée
	keyPresses[event.key] = false;
}
function mouseDownListener(event) {
	// événement clic souris + capture de sa position
	mousePress = true;
	mousePos = getMousePos(event);
}
function mouseUpListener(event) {
	// événement clic souris relaché
	mousePress = false;
}
function getMousePos(evt) {
	// retourne la position de la souris dans une structure x,y
	var rect = myCanvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top,
	};
}

function enrCoord(xVal, yVal, array) {
	// enregistrement d'un tableau de coordonnées x,y
	array.push({ x: xVal, y: yVal });
}

function enrCoord4(xVal, yVal, xVal2, yVal2, array) {
	// enregistrement d'un tableau de coordonnées left, top, right, bottom
	array.push({ left: xVal, top: yVal, right: xVal2, bottom: yVal2 });
}

function enrCoordNoeud(xVal, yVal, coutVal, heuristiqueVal, array) {
	// enregistrement d'une structure de tableau pour les éléments tombants
	array.push({ x: xVal, y: yVal, cout: coutVal, heuristique: heuristiqueVal });
}

function createArray(length) {
	// fonction de création d'un tableau à n dimensions
	let arr = new Array(length || 0),
		i = length;

	if (arguments.length > 1) {
		var args = Array.prototype.slice.call(arguments, 1);
		while (i--) arr[length - 1 - i] = createArray.apply(this, args);
	}

	return arr;
}

function GetRandom(min, max) {
	// retroune un nombre au hazard en min et max inclus
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pad(num, size) {
	/// formate un nombre sur size caractères (ex : 12 -> 000012)
	return ("000000" + num).substr(-size);
}

function getPixel(x, y, contextTmp) {
	// retourne les caractéristiques d'un pixel situé en x,y sur un context
	return contextTmp.getImageData(x, y, 1, 1).data;
}

function getTimeSecond() {
	// retourne le temps en secondes
	let d = new Date();
	return Math.floor(d.getTime() / (60 * 10));
}
function getTimeMilli() {
	// retourne le temps en millisecondes
	let d = new Date();
	return d.getTime();
}

function init() {
	// fonction d'initialisation quelque soit l'algorithme
	let i, x, y, j, k;
	for (i = 0; i < X; i++) {
		for (j = 0; j < Y; j++) {
			// remise à zéro de la map
			map[i][j] = 0;
			// sur les bords on génère un mur
			if (i == 0 || j == 0 || i == X - 1 || j == Y - 1) {
				map[i][j] = 9;
			}
		}
	}
	// position aléatoire du début et de la fin (début à gauche et fin à droite)
	posDepart = GetRandom(1, Y - 2);
	posFin = GetRandom(1, Y - 2);
	map[1][posDepart] = 1;
	map[X - 2][posFin] = 2;
	// on génère des obstacles
	const tailleMax = 6;
	for (i = 1; i <= 100; i++) {
		x = GetRandom(2, X - 1 - tailleMax);
		y = GetRandom(2, Y - 1 - tailleMax);
		taille = GetRandom(2, 5);
		taille = 1;
		for (j = x; j <= x + taille; j++) {
			for (k = y; k <= y + taille; k++) {
				// pas d'obstacle sur le départ ou l'arrivée
				if (j != 1 && j != X - 2 && j >= 0 && k >= 0 && j <= X - 1 && k <= Y - 1) {
					map[j][k] = 9;
				}
			}
		}
	}
	// initialisation de l'algorithme de Dijkstra
	Dijkstra_init();
	// initialisation de l'algorithme de AStar
	Astar_init();
	tpsTouche = getTimeMilli();
}

///////////////////////////////////////////////////////
// Fonctions pour l'algorithme de Dijkstra
///////////////////////////////////////////////////////
function Dijkstra_init() {
	let i, j;
	cheminTrouve = false;
	for (i = 0; i < X; i++) {
		for (j = 0; j < Y; j++) {
			distance[i][j] = 99999;
			Q[i][j] = true;
			if (map[i][j] == 8) {
				map[i][j] = 0;
			}
		}
	}
	distance[1][posDepart] = 0;
	predecesseur = createArray(X, Y);
}
function Dijkstra_trouve_min() {
	let mini = 99999;
	let sommetx, sommety;
	sommetx = -1;
	sommety = -1;
	for (i = 0; i < X; i++) {
		for (j = 0; j < Y; j++) {
			if (Q[i][j] && map[i][j] <= 2) {
				if (distance[i][j] < mini) {
					mini = distance[i][j];
					sommetx = i;
					sommety = j;
				}
			}
		}
	}
	return {
		x: sommetx,
		y: sommety,
	};
}
function Dijkstra_poids(x1, y1, x2, y2) {
	// retourne un "poids" entre deux points
	// remarque : dans un jeu, on pourrait mettre un poids plus important s'il y a une colline à franchir par exemple.
	if (map[x2][y2] > 2) {
		// si ce n'est pas un espace vide, c'est impossible de passer
		return 99999;
	} else {
		if (x1 == x2 || y1 == y2) {
			// si c'est une case adjacente, on met un poids de 1
			return 1;
		} else if (diagAllowed) {
			// si c'est une diagonale, on met un poids de 1.5 pour favoriser le chemin le plus droit
			return 1.5;
		}
	}
}
function Dijkstra_maj_distances(x1, y1, x2, y2) {
	// remplacer dans le if suivant le +1 par le poids entre deux points si nécessaire
	if (distance[x2][y2] > distance[x1][y1] + Dijkstra_poids(x1, y1, x2, y2)) {
		distance[x2][y2] = distance[x1][y1] + Dijkstra_poids(x1, y1, x2, y2);
		predecesseur[x2][y2] = { x: x1, y: y1 };
	}
}
function Dijkstra_tout_parcouru() {
	let i, j;
	let tout_parcouru = true;
	for (i = X - 1; i >= 0; i--) {
		for (j = Y - 1; j >= 0; j--) {
			if (Q[i][j]) {
				tout_parcouru = false;
				i = -1;
				j = -1;
			}
		}
	}
	return tout_parcouru;
}
function Dijkstra() {
	let paire;
	let curX, curY, tx, ty;
	if (!Dijkstra_tout_parcouru() && !cheminTrouve) {
		paire = Dijkstra_trouve_min();
		if (paire.x != -1) {
			Q[paire.x][paire.y] = false;
			for (i = -1; i <= 1; i++) {
				for (j = -1; j <= 1; j++) {
					if (!(i == 0 && j == 0)) {
						Dijkstra_maj_distances(paire.x, paire.y, paire.x + i, paire.y + j);
					}
				}
			}
		}
	}
	// on établit le chemin si la fin a été trouvée
	curX = X - 2;
	curY = posFin;
	if (predecesseur[X - 2][posFin]) {
		cheminTrouve = true;
		while (!(curX == 1 && curY == posDepart)) {
			if (!(curX == X - 2 && curY == posFin) && !(curX == 1 && curY == posDepart)) {
				map[curX][curY] = 8;
			}
			tx = predecesseur[curX][curY].x;
			ty = predecesseur[curX][curY].y;
			curX = tx;
			curY = ty;
		}
	}
}

///////////////////////////////////////////////////////
// Fonctions pour l'algorithme de A*
///////////////////////////////////////////////////////
function Astar_init() {
	let i, j;
	cheminTrouve = false;
	for (i = 0; i < X; i++) {
		for (j = 0; j < Y; j++) {
			gScore[i][j] = 99999;
			fScore[i][j] = 99999;
			Q[i][j] = true;
			if (map[i][j] == 8) {
				map[i][j] = 0;
			}
		}
	}
	gScore[1][posDepart] = 0;
	fScore[1][posDepart] = Astar_h(1, posDepart);
	predecesseur = createArray(X, Y);
	while (openSet.length > 0) {
		openSet.pop();
	}
	enrCoord(1, posDepart, openSet);
}
function Astar_h(x, y) {
	// fonction heuristique qui retourne la distance entre un point x,y et l'arrivée
	// j'utilise pythagore pour calculer la distance entre ces deux points
	return Math.sqrt(Math.pow(Math.abs(X - 2 - x), 2) + Math.pow(Math.abs(posFin - y), 2));
}
function Astar_recherche() {
	let mini = 99999;
	let sommetx, sommety, indice;
	sommetx = -1;
	sommety = -1;
	indice = -1;
	// recherche dans openSet du plus petit fScore
	for (i = 0; i < openSet.length; i++) {
		if (fScore[openSet[i].x][openSet[i].y] < mini) {
			mini = fScore[openSet[i].x][openSet[i].y];
			sommetx = openSet[i].x;
			sommety = openSet[i].y;
			indice = i;
		}
	}
	return { x: sommetx, y: sommety, i: indice };
}
function Astar_paspresent(x, y) {
	let paspresent = true;
	for (i = 0; i < openSet.length; i++) {
		if (openSet[i].x == x && openSet[i].y == y) {
			paspresent = false;
		}
	}
	return paspresent;
}
function Astar() {
	let current;
	let i, j;
	let tentative_gScore;
	let curX, curY;

	if (openSet.length > 0 && !cheminTrouve) {
		current = Astar_recherche();
		if (current.x != -1) {
			// on a trouvé la fin ?
			if (current.x == X - 2 && current.y == posFin) {
				// on reconstitue le chemin
				curX = X - 2;
				curY = posFin;
				cheminTrouve = true;
				while (!(curX == 1 && curY == posDepart)) {
					if (!(curX == X - 2 && curY == posFin) && !(curX == 1 && curY == posDepart)) {
						map[curX][curY] = 8;
					}
					tx = predecesseur[curX][curY].x;
					ty = predecesseur[curX][curY].y;
					curX = tx;
					curY = ty;
				}
				// on vide openSet, c'est fini
				while (openSet.length > 0) {
					openSet.pop();
				}
			}
			// on enlève cet élément des élements à traiter
			openSet.splice(current.i, 1);
			// on teste toutes les cases autour
			for (i = -1; i <= 1; i++) {
				for (j = -1; j <= 1; j++) {
					if (!(i == 0 && j == 0)) {
						tentative_gScore =
							gScore[current.x][current.y] +
							Dijkstra_poids(current.x, current.y, current.x + i, current.y + j);
						if (tentative_gScore < gScore[current.x + i][current.y + j]) {
							predecesseur[current.x + i][current.y + j] = {
								x: current.x,
								y: current.y,
							};
							gScore[current.x + i][current.y + j] = tentative_gScore;
							fScore[current.x + i][current.y + j] =
								gScore[current.x + i][current.y + j] +
								Astar_h(current.x + i, current.y + j);
							if (Astar_paspresent(current.x + i, current.y + j)) {
								// on ajoute un nouveau noeud à découvrir
								enrCoord(current.x + i, current.y + j, openSet);
								// zone explorée, sert juste à l'affichage
								Q[current.x + i][current.y + j] = false;
							}
						}
					}
				}
			}
		}
	}
}

function renduCanvas() {
	ctx.beginPath();
	// on efface le fond
	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, largeurCanvas, hauteurCanvas);
	ctx.strokeStyle = "#FFFFFF";
	ctx.font = "16px Arial";
	// on trace le quadrillage
	for (i = 0; i < X; i++) {
		ctx.moveTo(i * tailleCase, 0);
		ctx.lineTo(i * tailleCase, hauteurCanvas);
		if (i <= X - 1) {
			ctx.moveTo(0, i * tailleCase);
			ctx.lineTo(largeurCanvas, i * tailleCase);
		}
	}
	// appel de l'algo de Dijkstra ou Astar
	if (typeAlgo == 0) {
		Dijkstra();
	} else {
		Astar();
	}
	// affichage des éléments de la grille
	for (i = 0; i < X; i++) {
		for (j = 0; j < Y; j++) {
			// le départ
			if (map[i][j] == 1) {
				ctx.fillStyle = "#0000FF";
				ctx.fillRect(
					i * tailleCase + 1,
					j * tailleCase + 1,
					tailleCase - 2,
					tailleCase - 2
				);
				ctx.fillStyle = "#FFFFFF";
				ctx.fillText("D", i * tailleCase + 5, j * tailleCase + 15);
			}
			// l'arrivée
			if (map[i][j] == 2) {
				ctx.fillStyle = "#FF0000";
				ctx.fillRect(
					i * tailleCase + 1,
					j * tailleCase + 1,
					tailleCase - 2,
					tailleCase - 2
				);
				ctx.fillStyle = "#FFFFFF";
				ctx.fillText("F", i * tailleCase + 5, j * tailleCase + 15);
			}
			// un mur
			if (map[i][j] == 9) {
				ctx.fillStyle = "#FFFFFF";
				ctx.fillRect(
					i * tailleCase + 1,
					j * tailleCase + 1,
					tailleCase - 2,
					tailleCase - 2
				);
			}
			// le tracé du chemin final
			if (map[i][j] == 8) {
				ctx.fillStyle = "#FFFF00";
				ctx.fillRect(
					i * tailleCase + 1,
					j * tailleCase + 1,
					tailleCase - 2,
					tailleCase - 2
				);
			}
			// les zones explorées
			if (!Q[i][j] && !(i == 1 && j == posDepart) && !(i == tailleCase - 2 && j == posFin)) {
				ctx.fillStyle = "#FF0000";
				ctx.fillRect(
					i * tailleCase + Math.floor(tailleCase / 3),
					j * tailleCase + Math.floor(tailleCase / 3),
					5,
					5
				);
			}
		}
	}
	ctx.stroke();
	// réinitialisation de l'algorithme ?
	if (keyPresses.i) {
		if (typeAlgo == 0) {
			Dijkstra_init();
		}
		if (typeAlgo == 1) {
			Astar_init();
		}
	}
	// reset complet et génération d'une nouvelle map
	if (keyPresses.n) {
		init();
	}
	// passage d'un algorithme à l'autre
	if (keyPresses.s && getTimeMilli() - tpsTouche > 500) {
		tpsTouche = getTimeMilli();
		typeAlgo = (typeAlgo + 1) % 2;
		if (typeAlgo == 0) {
			Dijkstra_init();
		} else {
			Astar_init();
		}
	}
	// affichage de l'algorithme en cours
	if (typeAlgo == 0) {
		ctx.fillStyle = "#FF0000";
		ctx.fillText("Dijkstra", 5, 15);
	}
	if (typeAlgo == 1) {
		ctx.fillStyle = "#FF0000";
		ctx.fillText("A Star", 5, 15);
	}
	setTimeout(function () {
		// on rafraichi la page "fps" fois par seconde
		requestAnimationFrame(renduCanvas);
	}, 1000 / fps);
}
