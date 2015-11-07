Terrain.prototype = new Mesh();
Terrain.prototype.constructor = Terrain;

function Terrain(width, length, columns, rows, colorSet) {
    this.vertices = [];
    this.indices = [];
    this.colors= [];
    this.numRows = rows;
    this.numCols = columns;
    this.unitWidth = width * 1.0 /  columns;
    this.unitLength = length * 1.0 / rows;
	
	var colorMod = colorSet.length;
	if (colorSet.length == 4) {	// possibly to be a single vec4 color
		if (typeof(colorSet[0]) == "number") {
			colorMod = 0;
		}
	}
	var color;
	
    for (var r = 0; r < rows; r++) {
        for (var c = 0; c < columns; c++) {
			if(colorMod == 0) {
				color = colorSet;
			}
			else {
				color = colorSet[r % colorMod];
			}
            var id00 = r * columns + c;
            var id10 = (r + 1) * columns + c;
            var id_10 = (r - 1) * columns + c;
            var id01 = r * columns + c + 1;
            var id0_1 = r * columns + c - 1;
            this.vertices.push(vec3((c - columns * 0.5) * this.unitWidth, 0, (r - rows * 0.5) * this.unitLength));
			this.colors.push(color);
            if (r < rows - 1 && c < columns - 1) {
                this.indices.push(id00);
                this.indices.push(id10);
                this.indices.push(id01);
            }
            
            if (r > 0 && c > 0) {
                this.indices.push(id00);
                this.indices.push(id0_1);
                this.indices.push(id_10);
            }
        }
    }
}

Terrain.prototype.ApplyHeightMap = function () {
	
}