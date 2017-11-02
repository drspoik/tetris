var ctx;
var pieceSize = 20;

function arenaSweep(){
	
	var rowCount = 1;
	var minRowClear = 0;
	
	var clearFlag = false;
	
	//for every row, starting from the bottom
	outer: for(var y = arena.length - 1; y > 0; --y){
		//from left to right
		for(var x = 0; x < arena[y].length; ++x){
			//if any square is 0, therefore empty, skip it, since it can't be a full row anymore
			if(arena[y][x] == 0){
				continue outer;
			}
		}
		
		if(!clearFlag){
			//remember the minimum row thats need to be cleared
			minRowClear = y+1;
			//clear the canvas from this row upwards
			clearPartialMatrix(arena, {x:0, y:0}, {x:0, y:0}, {x:arena[y].length, y:minRowClear});
			clearFlag = true;
		}
		
		//when this row is full, remove the row
		var row = arena.splice(y,1)[0];
		
		//set it to 0
		row.fill(0);
		//and insert it at the beginning (top)
		arena.unshift(row);
		
		//repeat the same line again, since the bottom rows now shifted down
		++y;
		
		//add to the score and keep track of a multiplier, rewarding clearing multiple rows in one go
		player.score += rowCount*10;
		rowCount *= 2;
	}
	
	//if there was clearing, redraw parts of the arena
	if(clearFlag){
		drawPartialMatrix(arena, {x: 0, y:0}, {x:0, y:0}, {x:arena[0].length, y:minRowClear});
	}
}

function collide(arena, player){
	var m = player.matrix;
    var o = player.pos;
	
	for(var y = 0; y < m.length; ++y){
		for(var x = 0; x < m[y].length; ++x){
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
	var matrix = [];
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

var colors = [
	null,
	'#A000F1',
	'#F0F001',
	'#EFA000',
	'#0100F0',
	'#00F0F1',
	'#00F000',
	'#F00100'
]

var pieceBorder = 1;

function drawMatrix(matrix, offset){
	drawPartialMatrix(matrix, offset, {x:0, y:0}, {x:matrix[0].length, y:matrix.length})
}

function drawPartialMatrix(matrix, offset, begin, end){
	matrix.forEach(function(row,y){
		row.forEach(function(value,x) {
			if(value != 0 && x >= begin.x && x < end.x && y >= begin.y && y < end.y){
				ctx.fillStyle = colors[value];
				ctx.fillRect((x + offset.x) * pieceSize + pieceBorder,
							(y + offset.y) * pieceSize + pieceBorder,
							pieceSize - pieceBorder*2, pieceSize - pieceBorder*2);					
			}
		});
	});
}

function clearMatrix(matrix, offset){
	clearPartialMatrix(matrix, offset, {x:0, y:0}, {x:matrix[0].length, y:matrix.length})
}

function clearPartialMatrix(matrix, offset, begin, end){
	matrix.forEach(function(row,y){
		row.forEach(function(value,x){
			if(value != 0 && x >= begin.x && x < end.x && y >= begin.y && y < end.y){
				ctx.clearRect((x + offset.x) * pieceSize + pieceBorder,
							(y + offset.y) * pieceSize + pieceBorder,
							pieceSize - pieceBorder*2, pieceSize - pieceBorder*2);				
			}
		});
	});
}

var dropCounter = 0;
var dropInterval = 1000;
var dropIntervalStart;
var dropIntervalReduction = 0.99;
var dropMinInterval = 20;

var lastTime = 0;

function update(time){
	var deltaTime = time - lastTime;
	lastTime = time;
	
	dropCounter += deltaTime;
	if(dropCounter > dropInterval){
		playerDrop();
	}
	
	window.requestAnimationFrame(update);
}

function updateScore(){
	document.getElementById("score").innerText = player.score;
}

function merge(arena, player){
	player.matrix.forEach(function(row,y){
		row.forEach(function(value, x){
			if(value != 0){
				arena[y+player.pos.y][x+player.pos.x] = value;
			}
		})
	})
}

function playerMove(dir){
	clearMatrix(player.matrix,player.pos);
	player.pos.x += dir;
	if(collide(arena, player)){
		player.pos.x -= dir;
	}
	drawMatrix(player.matrix, player.pos );	
	
}

var pieces = 'ILJOTSZ';
var pool = '';

function randomizePool(){
	//get a new random batch of pieces
	pool = pieces.split('').sort(function(){return 0.5-Math.random()}).join('');
}

function playerReset(){
	if(pool.length == 0){
		randomizePool();
	}
		
	//get the last one and remove it from the pack
	player.matrix = createPiece(pool[pool.length-1]);
	pool = pool.slice(0,pool.length - 1);
	
	player.pos.y = 0;
	// | 0 is shorthand for flooring the floating point
	player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
	
	drawMatrix(player.matrix,player.pos);
	
	if(collide(arena, player)){
		restartGame();
	}
}

function restartGame(){
	clearMatrix(arena, {x:0,y:0});
	arena.forEach(function(row){row.fill(0)});
	player.score = 0;
	updateScore();
	dropInterval = dropIntervalStart;
	randomizePool();
}

function playerRotate(dir){
	clearMatrix(player.matrix,player.pos);
	
	var pos = player.pos.x;
	var offset = 1;
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
	
	drawMatrix(player.matrix, player.pos);
}

function rotate(matrix, dir){
	for(var y = 0; y < matrix.length; ++y){
		for(var x = 0; x < y; ++x){
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
		matrix.forEach(function(row){row.reverse()});
	}
	else{
		matrix.reverse();
	}
}

function playerDrop(){

	clearMatrix(player.matrix,player.pos);
	
	player.pos.y++;
	if(collide(arena, player)) {
		player.pos.y--;
		drawMatrix(player.matrix,player.pos);
		
		merge(arena, player);
		playerReset();
		if(dropInterval >= dropMinInterval){
			dropInterval *= dropIntervalReduction;			
		}
		arenaSweep();
		updateScore();
	}
	dropCounter = 0;
	
	drawMatrix(player.matrix,player.pos);
	
}

var arena = createMatrix(10,20);

var player = {
	pos: {x: 0, y: 0},
	matrix: null,
	score: 0,
}

function addListeners(element){
	
	var swipe = {x: 0, y: 0, dx: 0, dy: 0, active: false}
	var swipeMove = 20;

	element.addEventListener("touchstart", function (event){	
		swipe.x = event.changedTouches[0].screenX;
		swipe.y = event.changedTouches[0].screenY;
		swipe.active = false;
	}, false);

	element.addEventListener("touchmove", function (event){
		swipe.dx = swipe.x - event.changedTouches[0].screenX;
		if(swipe.dx < -swipeMove){
			playerMove(1);
			swipe.x = event.changedTouches[0].screenX;
			swipe.active = true;	
		}
		if(swipe.dx > swipeMove){
			playerMove(-1);
			swipe.x = event.changedTouches[0].screenX;
			swipe.active = true;	
		}

		swipe.dy = swipe.y - event.changedTouches[0].screenY;
		if(swipe.dy < -swipeMove){
			playerDrop();
			swipe.y = event.changedTouches[0].screenY;
			swipe.active = true;	
		}
	}, false);

	element.addEventListener("touchend", function (){
		if(!swipe.active){
			playerRotate(1);
		}
	}, false);
	
	element.addEventListener('keydown', function (event){
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
}

function main(){
	
	ctx = document.getElementById("tetrisCanvas").getContext("2d");
	ctx.width *= pieceSize;
	ctx.height *= pieceSize;
	
	addListeners(window);

	dropIntervalStart = dropInterval;
	playerReset();
	updateScore();
	update(0);
}

main();