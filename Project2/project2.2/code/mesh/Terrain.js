Terrain.prototype = new Mesh();
Terrain.prototype.constructor = Terrain;

function Terrain(data, width, length, columns, rows, colorSet) {
    this.vertices = [];
    this.indices = [];
    this.colors= [];
    this.numRows = rows;
    this.numCols = columns;
    this.unitWidth = width * 1.0 /  columns;
    this.unitLength = length * 1.0 / rows;
	this.xSize = width;
	this.zSize = length;
	
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
			var curHeight = 0;
			if (data != 0) {
				curHeight = data[id00] / 100;
			}
            this.vertices.push(vec3((c - columns * 0.5) * this.unitWidth, curHeight, (r - rows * 0.5) * this.unitLength));
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

Terrain.prototype.GetVertices = function (row, col) {
	return this.vertices[row * this.numCols + col];
}

Terrain.prototype.GetHeightFromImage = function (img, width, height) {
    var canvas = document.createElement( 'canvas-tmp' );
	canvas.display = none;
    canvas.width = width;
    canvas.height = height;
    var context = canvas.getContext( '2d' );

    var size = width * height, data = new Float32Array( size );

    context.drawImage(img,0,0);

    for ( var i = 0; i < size; i ++ ) {
        data[i] = 0
    }

    var imgd = context.getImageData(0, 0, width, height);
    var pix = imgd.data;

    var j=0;
    for (var i = 0, n = pix.length; i < n; i += (4)) {
        var all = pix[i]+pix[i+1]+pix[i+2];
        data[j++] = all/30;
    }

    return data;
}

Terrain.prototype.GenerateRandomHeight = function (maxHeight) {
	for (var r = 0; r < this.numRows; r++) {
        for (var c = 0; c < this.numCols; c++) {
			var id = r * this.numCols + c;
			this.vertices[id][1] = Math.random() * maxHeight;
		}
	}
}