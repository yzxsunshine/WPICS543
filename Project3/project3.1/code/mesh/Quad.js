/* Module      : Quad
 * Author      : Zhixin Yan
 * Email       : zyan@wpi.edu
 * Course      : CS 543
 *
 * Description : a class to render quads by webGL, it derived from Mesh class
 *
 * Date        : 2015/11/19
 *
 * Special Usage : Before you include this file, you need include Mesh.js in your html file as well.
 * (c) Copyright 2008, Worcester Polytechnic Institute.
 */

Quad.prototype = new Mesh();
Quad.prototype.constructor = Quad;

function Quad (width, height, colorSet) {
	var colorMod = colorSet.length;
	if (colorSet.length == 4) {	// possibly to be a single vec4 color
		if (typeof(colorSet[0]) == "number") {
			colorMod = 0;
		}
	}
	else if (colorSet.length == 0) {
		colorSet = vec4(1, 1, 1, 1);
	}
	
	this.vertices.push(vec3(-width/2, 0, -height/2));
	this.vertices.push(vec3(-width/2, 0, height/2));
	this.vertices.push(vec3(width/2, 0, height/2));
	this.vertices.push(vec3(width/2, 0, -height/2));
	
	this.indices.push(0, 1, 2);
	this.indices.push(0, 2, 3);
	
	this.faceColors = [];
	for (var i = 0; i < indices.length / 3; i++) {
		if(colorMod == 0) {
			color = colorSet;
		}
		else {
			color = colorSet[i % colorMod];
		}
		this.faceColors.push(color);
	}
}
}
