/* Module      : Sphere
 * Author      : Zhixin Yan
 * Email       : zyan@wpi.edu
 * Course      : CS 543
 *
 * Description : a class to render sphere by webGL, it derived from Mesh class
 *
 * Date        : 2015/11/10
 *
 * Special Usage : Before you include this file, you need include Mesh.js in your html file as well.
 * (c) Copyright 2008, Worcester Polytechnic Institute.
 */

Sphere.prototype = new Mesh();
Sphere.prototype.constructor = Sphere;

/* ----------------------------------------------------------------------- */
/* Function    : Sphere ( radius, numBands, colorSet )
 *
 * Description : constructor of Sphere, create vertices/indices/colors/normals of a sphere
 *
 * Parameters  : radius : radius of sphere
 *				 numBands : resolution of sphere	
 *				 colorSet : color of sphere
 */
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
			var xTex = j * 1.0 / (numBands);
			var yTex = i * 1.0 / (numBands);
			var xTex_1 = (j+1) * 1.0 / (numBands);
			var yTex_1 = (i+1) * 1.0 / (numBands);
			
			
			this.texCoords.push(vec2(xTex, yTex_1));
			this.texCoords.push(vec2(xTex, yTex));
			this.texCoords.push(vec2(xTex_1, yTex));
			
			this.texCoords.push(vec2(xTex_1, yTex_1));
			this.texCoords.push(vec2(xTex, yTex_1));
			this.texCoords.push(vec2(xTex_1, yTex));
		}
	}
}