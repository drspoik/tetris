const canvas = document.getElementById("tetrisCanvas");
const ctx = canvas.getContext("2d");

ctx.scale(20,20);

function arenaSweep(){
	
	let rowCount = 1;
	
	outer: for(let y = arena.length - 1; y > 0; --y){
		for(let x = 0; x < arena[y].length; ++x){
			if(arena[y][x] == 0){
				continue outer;
			}
		}
		
		const row = arena.splice(y,1)[0].fill(0);
		arena.unshift(row);
		++y;
		
		player.score += rowCount*10;
		rowCount *= 2;
	}
}

function collide(arena, player){
 	const m = player.matrix;
    const o = player.pos;
	
	for(let y = 0; y < m.length; ++y){
		for(let x = 0; x < m[y].length; ++x){
			if(m[y][x] != 0 && 
			   (arena[y + o.y] && 	//has row
			   arena[y+o.y][x+o.x]) != 0){ //has column and is not 0
				return true;
			}
		}
	}
	return false;
}

function createMatrix(w,h){
	const matrix = [];
	while(h--){
		matrix.push(new Array(w).fill(0));
	}
	return matrix;
}

function createPiece(type){
	if(type == 'T'){
		return [
				[0,0,0],
				[1,1,1],
				[0,1,0]
		];
	}
	else if(type == 'O'){
		return [
				[2,2],
				[2,2],
		];
	}
	else if(type == 'L'){
		return [
				[0,3,0],
				[0,3,0],
				[0,3,3]
		];
	}
	else if(type == 'J'){
		return [
				[0,4,0],
				[0,4,0],
				[4,4,0]
		];
	}
	else if(type == 'I'){
		return [
				[0,5,0,0],
				[0,5,0,0],
				[0,5,0,0],
				[0,5,0,0],
		];
	}
	else if(type == 'S'){
		return [
				[0,6,6],
				[6,6,0],
				[0,0,0]
		];
	}
	else if(type == 'Z'){
		return [
				[7,7,0],
				[0,7,7],
				[0,0,0]
		];
	}
}

const colors = [
	null,
	'#A000F1',
	'#F0F001',
	'#EFA000',
	'#0100F0',
	'#00F0F1',
	'#00F000',
	'#F00100'
]

function draw(){
	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, canvas.width,canvas.height);
	drawMatrix(arena, {x: 0, y: 0});
	drawMatrix(player.matrix, player.pos );	
}

const pieceBorder = 0.1;

function drawMatrix(matrix, offset){
	matrix.forEach((row,y) => {
		row.forEach((value,x) => {
			if(value != 0){
				ctx.fillStyle = colors[value];
				ctx.fillRect(x + offset.x + pieceBorder,
							 y + offset.y + pieceBorder,
							 1 - pieceBorder, 1 - pieceBorder);				
			}
		});
	});
}

let dropCounter = 0;
let dropInterval = 1000;
let dropIntervalStart;
let dropIntervalReduction = 10;

let lastTime = 0;

function update(time = 0){
	const deltaTime = time - lastTime;
	lastTime = time;
	
	dropCounter += deltaTime;
	if(dropCounter > dropInterval){
		playerDrop();
	}
	
	draw();
	requestAnimationFrame(update);
}

function updateScore(){
	document.getElementById("score").innerText = player.score;
}

function merge(arena, player){
	player.matrix.forEach((row,y) =>{
		row.forEach((value, x) => {
			if(value != 0){
				arena[y+player.pos.y][x+player.pos.x] = value;
			}
		})
	})
}

function playerMove(dir){
	player.pos.x += dir;
	if(collide(arena, player)){
		player.pos.x -= dir;
	}
}

function playerReset(){
	player.pos.y = 0;
	
	const pieces = 'ILJOTSZ';
	player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]); //floored
	player.pos.y = 0;
	player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
	if(collide(arena, player)){
		restartGame();
	}
}

function restartGame()
{
	arena.forEach(row => row.fill(0));
	player.score = 0;
	updateScore();
	dropInterval = dropIntervalStart;
}

function playerRotate(dir){
	const pos = player.pos.x;
	let offset = 1;
	rotate(player.matrix,dir);
	
	while(collide(arena, player)){
		player.pos.x += offset;
		offset = -(offset + (offset > 0 ? 1 : -1));
		if(offset > player.matrix[0].length){
			rotate(player.matrix, -dir);
			player.pos.x = pos;
			return;
		}
	}
}

function rotate(matrix, dir){
	for(let y = 0; y < matrix.length; ++y){
		for(let x = 0; x < y; ++x){
			[
				matrix[x][y],
				matrix[y][x],
			] = [
				matrix[y][x],
				matrix[x][y],
			]
		}
	}
	if(dir > 0){
		matrix.forEach(row => row.reverse());
	}
	else{
		matrix.reverse();
	}
}

function playerDrop(){
	player.pos.y++;
	if(collide(arena, player)) {
		player.pos.y--;
		merge(arena, player);
		playerReset();
		if(dropInterval >= dropIntervalReduction){
			dropInterval -= dropIntervalReduction;			
		}
		arenaSweep();
		updateScore();
	}
	dropCounter = 0;
}

const arena = createMatrix(10,20);
//console.table(arena);

const player = {
	pos: {x: 0, y: 0},
	matrix: null,
	score: 0,
}

swipe = {
	x: 0,
	y: 0,
	dx: 0,
	dy: 0,
	active: false,
}

var swipeMove = 20;

window.addEventListener("touchstart", event =>{
	
	playerRotate(1);
	
	swipe.x = event.changedTouches[0].screenX;
	swipe.y = event.changedTouches[0].screenY;
	swipe.active = false;	
}, false);

//window.addEventListener("touchmove", event =>{
//	swipe.dx = swipe.x - event.changedTouches[0].screenX;
//	if(swipe.dx < -swipeMove){
//		playerMove(1);
//		swipe.x = event.changedTouches[0].screenX;
//		swipe.active = true;	
//	}
//	if(swipe.dx > swipeMove){
//		playerMove(-1);
//		swipe.x = event.changedTouches[0].screenX;
//		swipe.active = true;	
//	}
//	
//	swipe.dy = swipe.y - event.changedTouches[0].screenY;
//	if(swipe.dy < -swipeMove){
//		playerDrop();
//		swipe.y = event.changedTouches[0].screenY;
//		swipe.active = true;	
//	}
//}, false);
//
//window.addEventListener("touchend", event =>{
//	if(!swipe.active){
//		playerRotate(1);
//	}
//}, false);


document.addEventListener('keydown', event => {
//	console.log(event)
	if(event.keyCode == 37){
		playerMove(-1);
	}
	else if(event.keyCode == 39){
		playerMove(+1);
	}
	else if(event.keyCode == 40){
		playerDrop();
	}
	else if(event.keyCode == 81){
		playerRotate(-1);
	}
	else if(event.keyCode == 87){
		playerRotate(+1);
	}
});

dropIntervalStart = dropInterval;
playerReset();
updateScore();
update();