/* Module      : Cylinder
 * Author      : Zhixin Yan
 * Email       : zyan@wpi.edu
 * Course      : CS 543
 *
 * Description : a class to render Cylinder by webGL, it derived from Mesh class
 *
 * Date        : 2015/11/10
 *
 * Special Usage : Before you include this file, you need include Mesh.js in your html file as well.
 * (c) Copyright 2008, Worcester Polytechnic Institute.
 */

Cylinder.prototype = new Mesh();
Cylinder.prototype.constructor = Cylinder;

/* ----------------------------------------------------------------------- */
/* Function    : CreateCircle ( offset, numFacets, radius, vertices, indices, faceNormals )
 *
 * Description : create a 2d circle which center is offset
 *
 * Parameters  : offset : center of 2d circle
 *				 numFacets : number of facets in one circle
 *				 radius : radius of sphere
 *				 vertices : array of vritices	
 *				 indices : array of indices
 *				 faceNormals : array of face normals
 */
 
var CreateCircle = function (offset, numFacets, radius, vertices, indices, texCoords, tangents, faceNormals) {
	var deltaAngle = 2 * Math.PI / numFacets;
	var startIndex = vertices.length;
	vertices.push(vec3(offset[0], offset[1], offset[2]));
	for (var i = 0; i < numFacets; i++) {
		var p = vec3(offset[0], offset[1], offset[2]);
		p[0] += Math.sin(deltaAngle * i) * radius;
		p[2] += Math.cos(deltaAngle * i) * radius;
		vertices.push(p);
		
		var xTex = (Math.sin(deltaAngle * i) + 1) * 0.5;
		var yTex = (Math.cos(deltaAngle * i) + 1) * 0.5;
		var xTex_1 = (Math.sin(deltaAngle * ((i + 1))) + 1) * 0.5;
		var yTex_1 = (Math.cos(deltaAngle * ((i + 1))) + 1) * 0.5;
			
		indices.push(startIndex);
		texCoords.push(vec2(0.5, 0.5));
		indices.push(startIndex + 1 + i % numFacets);
		texCoords.push(vec2(xTex, yTex));
		indices.push(startIndex + 1 + (i + 1) % numFacets);
		texCoords.push(vec2(xTex_1, yTex_1));
		//faceNormals.push(vec3(0, offset[1] / Math.abs(offset[1]), 0));
		
	}
	
	for (var i = 0; i < numFacets; i++) {
		for (var j = 0; j < 3; j++)
			tangents.push(subtract(vertices[startIndex + 1 + (i + 1) % numFacets], vertices[startIndex + 1 + i % numFacets]));
	}
}
	
/* ----------------------------------------------------------------------- */
/* Function    : Cylinder ( topRadius, bottomRadius, height, numFacets, colorSet )
 *
 * Description : constructor of Sphere, create vertices/indices/colors/normals of a sphere
 *
 * Parameters  : topRadius : radius of top circle
 *				 bottomRadius : radius of bottom circle
 *				 height : height of cylinder
 *				 numFacets : number of facets for one circle
 *				 colorSet : color of sphere
 */	
function Cylinder (topRadius, bottomRadius, height, numFacets, colorSet) {
	this.topRadius = topRadius;
	this.bottomRadius = bottomRadius;
	this.height = height;
	this.numFacets = numFacets;
	
	// clear space;
	this.vertices = [];	// type vec4
	this.normals = [];	// type vec4
	this.colors = [];	// type vec4
	this.indices = [];	// type int
	this.faceNormals = [];
	this.faceColors = [];
	
	// Generate Vertices and Normals1
	
	var topY = height / 2;
	var bottomY = -height / 2;
	var topCenterID = this.vertices.length;
	CreateCircle(vec3(0, topY, 0), numFacets, topRadius, this.vertices, this.indices, this.texCoords, this.tangents, this.faceNormals);
	var bottomCenterID = this.vertices.length;
	CreateCircle(vec3(0, bottomY, 0), numFacets, bottomRadius, this.vertices, this.indices, this.texCoords, this.tangents, this.faceNormals);
	var colorMod = colorSet.length;
	if (colorSet.length == 4) {	// possibly to be a single color
		if (typeof(colorSet[0]) == "number") {
			colorMod = 0;
		}
	}
	for (var i = 0; i < this.vertices.length; i++) {
		if (colorMod == 0) {
			this.colors.push(colorSet);	
		}
		else {
			this.colors.push(colorSet[i%colorMod]);	
		}
	}
		
	for (var i = 0; i < numFacets; i++) {
		//var normal = vec3Divide(vec3Add(this.vertices[i + topCenterID + 1], this.vertices[(i + 1) % numFacets + bottomCenterID + 1]), 0.5);
		//normal = vec3Normalize(normal);
		//this.faceNormals.push(normal.slice(0));
		//this.faceNormals.push(normal.slice(0));
		
		var xTex = i * 1.0 / numFacets;
		var xTex_1 = (i + 1) * 1.0 / numFacets;
		
		this.indices.push(i + topCenterID + 1);
		this.texCoords.push(vec2(xTex, 0));
		this.indices.push(i + bottomCenterID + 1);
		this.texCoords.push(vec2(xTex, 1));
		this.indices.push((i + 1) % numFacets + bottomCenterID + 1);
		this.texCoords.push(vec2(xTex_1, 1));
		
		this.indices.push(i + topCenterID + 1);
		this.texCoords.push(vec2(xTex, 0));
		this.indices.push((i + 1) % numFacets + bottomCenterID + 1);
		this.texCoords.push(vec2(xTex_1, 1));
		this.indices.push((i + 1) % numFacets + topCenterID + 1);
		this.texCoords.push(vec2(xTex_1, 0));
		
		for (var j = 0; j < 6; j++)
			this.tangents.push(subtract(this.vertices[(i + 1) % numFacets + topCenterID + 1], this.vertices[i + topCenterID + 1]));
	}
}