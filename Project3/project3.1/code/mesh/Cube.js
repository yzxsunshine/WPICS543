/* Module      : Cube
 * Author      : Zhixin Yan
 * Email       : zyan@wpi.edu
 * Course      : CS 543
 *
 * Description : a class to render cubes by webGL, it derived from Mesh class
 *
 * Date        : 2015/11/14
 *
 * Special Usage : Before you include this file, you need include Mesh.js in your html file as well.
 * (c) Copyright 2008, Worcester Polytechnic Institute.
 */

Cube.prototype = new Mesh();
Cube.prototype.constructor = Cube;

/* ----------------------------------------------------------------------- */
/* Function    : Cube ( radius, numBands, colorSet )
 *
 * Description : constructor of Cube, create vertices/indices/colors/normals of a cube
 *
 * Parameters  : radius : radius of cube
 *				 numBands : resolution of cube	
 *				 colorSet : color of cube
 */
function Cube (xExtent, yExtent, zExtent, colorSet) {
	var colorMod = colorSet.length;
	if (colorSet.length == 4) {	// possibly to be a single vec4 color
		if (typeof(colorSet[0]) == "number") {
			colorMod = 0;
		}
	}
	else if (colorSet.length == 0) {
		colorSet = vec4(1, 1, 1, 1);
	}
	var color;
	this.vertices = [];	// type vec4
	this.normals = [];	// type vec4
	this.colors = [];	// type vec4
	this.indices = [];	// type int
	this.faceNormals = [];
	this.faceColors = [];
	
	this.vertices.push(vec3(-xExtent/2, -yExtent/2, -zExtent/2));
	this.vertices.push(vec3(-xExtent/2, -yExtent/2, zExtent/2));
	this.vertices.push(vec3(xExtent/2, -yExtent/2, zExtent/2));
	this.vertices.push(vec3(xExtent/2, -yExtent/2, -zExtent/2));
	this.vertices.push(vec3(-xExtent/2, yExtent/2, -zExtent/2));
	this.vertices.push(vec3(-xExtent/2, yExtent/2, zExtent/2));
	this.vertices.push(vec3(xExtent/2, yExtent/2, zExtent/2));
	this.vertices.push(vec3(xExtent/2, yExtent/2, -zExtent/2));
	
	this.indices.push(0, 1, 2);
	this.texCoords.push(vec2(0, 0));
	this.texCoords.push(vec2(0, 1));
	this.texCoords.push(vec2(1, 1));
	this.indices.push(0, 2, 3);
	this.texCoords.push(vec2(0, 0));
	this.texCoords.push(vec2(1, 1));
	this.texCoords.push(vec2(1, 0));
	
	this.indices.push(4, 5, 6);
	this.texCoords.push(vec2(0, 0));
	this.texCoords.push(vec2(0, 1));
	this.texCoords.push(vec2(1, 1));
	this.indices.push(4, 6, 7);
	this.texCoords.push(vec2(0, 0));
	this.texCoords.push(vec2(1, 1));
	this.texCoords.push(vec2(1, 0));
	
	this.indices.push(4, 5, 1);
	this.texCoords.push(vec2(0, 0));
	this.texCoords.push(vec2(0, 1));
	this.texCoords.push(vec2(1, 1));
	this.indices.push(4, 1, 0);
	this.texCoords.push(vec2(0, 0));
	this.texCoords.push(vec2(1, 1));
	this.texCoords.push(vec2(1, 0));
	
	this.indices.push(6, 7, 3);
	this.texCoords.push(vec2(0, 0));
	this.texCoords.push(vec2(0, 1));
	this.texCoords.push(vec2(1, 1));
	this.indices.push(6, 3, 2);
	this.texCoords.push(vec2(0, 0));
	this.texCoords.push(vec2(1, 1));
	this.texCoords.push(vec2(1, 0));
	
	this.indices.push(7, 4, 0);
	this.texCoords.push(vec2(0, 0));
	this.texCoords.push(vec2(0, 1));
	this.texCoords.push(vec2(1, 1));
	this.indices.push(7, 0, 3);
	this.texCoords.push(vec2(0, 0));
	this.texCoords.push(vec2(1, 1));
	this.texCoords.push(vec2(1, 0));
	
	this.indices.push(5, 6, 2);
	this.texCoords.push(vec2(0, 0));
	this.texCoords.push(vec2(0, 1));
	this.texCoords.push(vec2(1, 1));
	this.indices.push(5, 2, 1);
	this.texCoords.push(vec2(0, 0));
	this.texCoords.push(vec2(1, 1));
	this.texCoords.push(vec2(1, 0));
	
	this.faceColors = [];
	for (var i = 0; i < this.indices.length / 3; i++) {
		if(colorMod == 0) {
			color = colorSet;
		}
		else {
			color = colorSet[i % colorMod];
		}
		this.faceColors.push(color);
	}
}
