const canvas = document.getElementById("tetrisCanvas");
const ctx = canvas.getContext("2d");

ctx.scale(20,20);

const matrix = [
	[0,0,0],
	[1,1,1],
	[0,1,0]
	];

function collide(arena, player){
	//o = offset
	const [m,o] = [player.matrix, player.pos];
	for(let y = 0; y < m.length; ++y){
		for(let x = 0; x < m[y].length; ++x){
			if(m[y][x] != 0 && 
			   (arena[y + o.y] && 	//has row
			   arena[y+o.y][x+o.x]) != 0){ //has column and is not 0
				return true;
			}
		}
	}
}

function createMatrix(w,h){
	const matrix = [];
	while(h--){
		matrix.push(new Array(w).fill(0));
	}
	return matrix;
}

function draw(){
	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, canvas.width,canvas.height);
	drawMatrix(arena, {x: 0, y: 0});
	drawMatrix(player.matrix, player.pos );	
}

function drawMatrix(matrix, offset){
	matrix.forEach((row,y) => {
		row.forEach((value,x) => {
			if(value != 0){
				ctx.fillStyle = 'red';
				ctx.fillRect(x + offset.x,
							 y + offset.y
							 ,1,1);
			}
		});
	});
}

let dropCounter = 0;
let dropInterval = 1000;

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

function merge(arena, player){
	player.matrix.forEach((row,y) =>{
		row.forEach((value, x) => {
			if(value != 0){
				arena[y+player.pos.y][x+player.pos.x] = value;
			}
		})
	})
}

function playerDrop(){
	player.pos.y++;
	if(collide(arena, player)) {
		player.pos.y--;
		merge(arena, player);
		player.pos.y = 0;
	}
	dropCounter = 0;
}

const arena = createMatrix(12,20);
//console.table(arena);

const player = {
	pos: {x: 5, y: 5},
	matrix: matrix,
}

document.addEventListener('keydown', event => {
//	console.log(event)
	if(event.keyCode == 37){
		player.pos.x--;
	}
	else if(event.keyCode == 39){
		player.pos.x++;
	}
	else if(event.keyCode == 40){
		playerDrop();
	}
})

update();