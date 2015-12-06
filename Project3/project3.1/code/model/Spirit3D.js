function Spirit3d () {
	this.position = vec3(0, 0, 0);
	this.rotationAxis = vec3(1, 0, 0);
	this.rotationAngle = 0;
	this.mesh = 0;
	this.localMatrix = [];
	this.children = [];
	this.points = [];
	this.normals = [];
	this.colors = [];
	this.texCoords = [];
	this.shader = {
		program 			: 0,
		shaderScript 		: 0,
		uMVMatrix 			: 0,
		uProjMatrix  		: 0,
		uNormalMatrix 		: 0,
		uMaterialAmbient   	: 0,
		uMaterialDiffuse   	: 0,
		uMaterialSpecular  	: 0,
		uShininess          : 0,
		uLightAmbient      	: 0,
		uLightDiffuse      	: 0,
		uLightSpecular     	: 0,
		uLightDirection    	: 0
	}
}

Spirit3d.prototype.SetShader = function (gl, prog, mvLoc, projLoc, pts, norms, cols, texs, script) {
	this.points = pts;
	this.normals = norms;
	this.colors = cols;
	this.texCoords = texs;
	
	this.shader.program = prog;
	this.shader.shaderScript = script;
	this.shader.uMVMatrix 			= gl.getUniformLocation(this.shader.program, "uMVMatrix");
	this.shader.uProjMatrix  		= gl.getUniformLocation(this.shader.program, "uProjMatrix");
	this.shader.uNormalMatrix 		= gl.getUniformLocation(this.shader.program, "uNormalMatrix");
	this.shader.uMaterialAmbient   	= gl.getUniformLocation(this.shader.program, "uMaterialAmbient"); 
    this.shader.uMaterialDiffuse   	= gl.getUniformLocation(this.shader.program, "uMaterialDiffuse");
    this.shader.uMaterialSpecular  	= gl.getUniformLocation(this.shader.program, "uMaterialSpecular");
    this.shader.uShininess          = gl.getUniformLocation(this.shader.program, "uShininess");
    this.shader.uLightAmbient      	= gl.getUniformLocation(this.shader.program, "uLightAmbient");
    this.shader.uLightDiffuse      	= gl.getUniformLocation(this.shader.program, "uLightDiffuse");
    this.shader.uLightSpecular     	= gl.getUniformLocation(this.shader.program, "uLightSpecular");
    this.shader.uLightDirection    	= gl.getUniformLocation(this.shader.program, "uLightDirection");
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
		if (this.shader.shaderScript != 0) {
			this.shader.shaderScript(this.shader, tmpMatrix, projection, this.points, this.normals, this.colors, this.texCoords);
		}
		gl.drawArrays( gl.TRIANGLES, this.mesh.startIndex, this.mesh.vertexNum );
	}
	
	for (var i=0; i<this.children.length; i++) {
		this.children[i].Render(tmpMatrix, projection);
	}
}