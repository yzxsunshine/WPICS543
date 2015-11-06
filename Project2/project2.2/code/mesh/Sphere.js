Sphere.prototype = new Mesh();
Sphere.prototype.constructor = Sphere;

function Sphere (radius, numBands, colorSet) {
	var colorMod = colorSet.length;
	if (colorSet.length == 4) {	// possibly to be a single vec4 color
		if (typeof(colorSet[0]) == "number") {
			colorMod = 0;
		}
	}
	var color;
	for (var i = 0; i <= numBands; i++) {	// connect a circle of half circles
		var theta = i * Math.PI / numBands;
		var sinTheta = Math.sin(theta);
		var cosTheta = Math.cos(theta);
		if(colorMod == 0) {
			color = colorSet;
		}
		else {
			color = colorSet[i % colorMod];
		}
		for (var j = 0; j <= numBands; j++) {
			var phi = j * 2 * Math.PI / numBands;
			var sinPhi = Math.sin(phi);
			var cosPhi = Math.cos(phi);
			
			var x = cosPhi * sinTheta;
		    var y = cosTheta;
		    var z = sinPhi * sinTheta;
			
			this.vertices.push(vec3Multiply(vec3(x, y, z), radius));
			this.normals.push(vec3(x, y, z));
			this.colors.push(color);
		}
	}
	
	// build indices
	for (var i = 0; i < numBands; i++) {
		for (var j = 0; j < numBands; j++) {
			var up = i * (numBands + 1) + j;
			var bottom = up + numBands + 1;
			this.indices.push(bottom, up, up + 1, bottom + 1, bottom, up + 1);
		}
	}
}