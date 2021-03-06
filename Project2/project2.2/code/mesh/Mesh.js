/* Module      : Mesh
 * Author      : Zhixin Yan
 * Email       : zyan@wpi.edu
 * Course      : CS 543
 *
 * Description : general class for 3d mesh
 *
 * Date        : 2015/11/10
 *
 * Special Usage : Before you include this file, you need include vec.js in your html file as well.
 * (c) Copyright 2008, Worcester Polytechnic Institute.
 */

/* ----------------------------------------------------------------------- */
/* Function    : Mesh (  )
 *
 * Description : constructor of Mesh, initialize vertices, normals, colors, indices, and face normals.
 *
 * Parameters  : radius : radius of sphere
 *				 numBands : resolution of sphere	
 *				 colorSet : color of sphere
 */
function Mesh () {
	this.vertices = [];	// type vec4
	this.normals = [];	// type vec4
	this.colors = [];	// type vec4
	this.indices = [];	// type int
	this.faceNormals = [];
	this.faceColors = [];
	
	this.startIndex = 0;
	this.vertexNum = 0;
}

Mesh.prototype.ComputeFaceNormal = function () {
	for (var i = 0; i < this.indices.length; i += 3) {
			var normal = vec3CrossProduct(vec3Subtract(this.vertices[this.indices[i+1]], this.vertices[this.indices[i]])
												  , vec3Subtract(this.vertices[this.indices[i+2]], this.vertices[this.indices[i+1]]));
			normal = vec3Normalize(normal);
			this.faceNormals.push(normal);
	}	
}

Mesh.prototype.ComputeVertexNormal = function () {
	if (this.faceNormals.length == 0)
		this.ComputeFaceNormal();
	var normalCount = [];
	this.normals = [];
	for (var i = 0; i < this.vertices.length; i++) {
		this.normals.push(vec3(0, 0, 0));
		normalCount.push(0);
	}
	for (var i = 0; i < this.faceNormals.length; i++) {
		for (var j = 0; j < 3; j++) {
			var id = this.indices[i * 3 + j];
			this.normals[id] = vec3Add(this.normals[id], this.faceNormals[i]);
			normalCount[id]++;
		}
	}
	
	for (var i = 0; i < this.normals.length; i++) {
		if (normalCount[i] > 0) {
			this.normals[i] = vec3Multiply(this.normals[i], normalCount[i]);	
		}
	}
}

/* ----------------------------------------------------------------------- */
/* Function    : DumpToVertextArray ( vertexBuffer, normalBuffer, colorBuffer, shareVertex )
 *
 * Description : convert mesh representation to webgl representation, and dump them to vertex buffer
 *
 * Parameters  : vertexBuffer : vertex buffer
 *				 normalBuffer : normal buffer
 *				 colorBuffer : color buffer
 *				 shareVertex : use vertex normal or face normal
 */
Mesh.prototype.DumpToVertextArray = function (vertexBuffer, normalBuffer, colorBuffer, shareVertex) {
	this.startIndex = vertexBuffer.length;
	this.vertexNum = this.indices.length;
	if (shareVertex == 0 || this.faceColors.length > 0) {	// not sharing
		if (this.faceNormals.length == 0)
			this.ComputeFaceNormal();
		for (var i = 0; i < this.faceNormals.length; i++) {
			for (var j = 0; j < 3; j++) {
				var id = this.indices[i * 3 + j];
				vertexBuffer.push(vec3UpgradeToVec4(this.vertices[id]));
				normalBuffer.push(vec3UpgradeToVec4(this.faceNormals[i]));
				if (this.faceColors.length > 0) {
					colorBuffer.push(this.faceColors[i]);
				}
				else {	
					colorBuffer.push(this.colors[id]);
				}
			}
		}
	}
	else {
		if (this.normals.length == 0)
			this.ComputeVertexNormal();
		for (var i = 0; i < this.indices.length / 3; i++) {
			for (var j = 0; j < 3; j++) {
				var id = this.indices[i * 3 + j];
				vertexBuffer.push(vec3UpgradeToVec4(this.vertices[id]));
				normalBuffer.push(vec3UpgradeToVec4(this.normals[id]));
				colorBuffer.push(this.colors[id]);
			}
		}
	}
}
