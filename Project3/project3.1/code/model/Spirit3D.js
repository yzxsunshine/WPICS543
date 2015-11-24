function Spirit3d () {
	this.position = vec3(0, 0, 0);
	this.rotationAxis = vec3(1, 0, 0);
	this.rotationAngle = 0;
	this.mesh = 0;
	this.localMatrix = [];
	this.children = [];
	this.program = 0;
	this.modelViewLoc = 0;
	this.projectionLoc = 0;
}

Spirit3d.prototype.SetShader = function (prog, mvLoc, projLoc) {
	this.program = prog;
	this.modelViewLoc = mvLoc;
	this.projectionLoc  = projLoc;
}

Spirit3d.prototype.SetTransform = function (pos, angle, axis) {
	this.position = pos.slice(0);
	this.rotationAngle = angle;
	this.rotationAxis = axis.slice(0);
	this.localMatrix = translate(this.position[0], this.position[1], this.position[2]);
	var rotMat = rotate(this.rotationAngle, this.rotationAxis[0], this.rotationAxis[1], this.rotationAxis[2]);
	this.localMatrix = mult(this.localMatrix, rotMat);
}

Spirit3d.prototype.SetTranslation = function (pos) {
	this.position = pos.slice(0);
	this.localMatrix = translate(this.position[0], this.position[1], this.position[2]);
	var rotMat = rotate(this.rotationAngle, this.rotationAxis[0], this.rotationAxis[1], this.rotationAxis[2]);
	this.localMatrix = mult(this.localMatrix, rotMat);
}

Spirit3d.prototype.SetRotation = function (angle, axis) {
	this.rotationAngle = angle;
	this.rotationAxis = axis.slice(0);
	this.localMatrix = translate(this.position[0], this.position[1], this.position[2]);
	var rotMat = rotate(this.rotationAngle, this.rotationAxis[0], this.rotationAxis[1], this.rotationAxis[2]);
	this.localMatrix = mult(this.localMatrix, rotMat);
}

Spirit3d.prototype.SetLocalMatrix = function (matrix) {
	this.localMatrix = matrix.slice(0);
	this.localMatrix.matrix = true;
}

Spirit3d.prototype.AddChildren = function (child) {
	this.children.push(child);
}


/* ----------------------------------------------------------------------- */
/* Function    : DumpToVertextArray ( vertexBuffer, normalBuffer, colorBuffer, shareVertex )
 *
 * Description : convert mesh representation to webgl representation, and dump them to vertex buffer
 *
 * Parameters  : points : vertex buffer
 *				 normals : normal buffer
 *				 colors : color buffer
 */
Spirit3d.prototype.DumpToVertextArray = function (points, normals, colors, texCoords) {
	if (this.mesh != 0) {
		this.mesh.DumpToVertextArray(points, normals, colors, texCoords);
	}
	
	for (var i=0; i<this.children.length; i++) {
		this.children[i].DumpToVertextArray(points, normals, colors, texCoords);
	}
}

Spirit3d.prototype.Render = function  (mvMatrix, projection)  {
	var tmpMatrix = mult(mvMatrix, this.localMatrix);
	if (this.mesh != 0) {
		gl.useProgram( this.program );
		gl.uniformMatrix4fv( this.modelViewLoc, false, flatten( tmpMatrix ) );
		gl.uniformMatrix4fv( this.projectionLoc, false, flatten( projection ) );
		gl.drawArrays( gl.TRIANGLES, this.mesh.startIndex, this.mesh.vertexNum );
	}
	
	for (var i=0; i<this.children.length; i++) {
		this.children[i].Render(tmpMatrix, projection);
	}
}