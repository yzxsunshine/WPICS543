Lamp.prototype = new Spirit3d();
Lamp.prototype.constructor = Lamp;

function Lamp (offset, lampHeight, radius, tubeColor, shadeColor) {
	this.height = lampHeight;
	this.tubeRadius = radius;
	this.ShadeRadius = 3 * radius;
	offset[1] = 0; //lampHeight / 2;
	this.SetTranslation(offset);
	var pointList = [];
	pointList.push(vec3(0, 0, 0));
	pointList.push(vec3(0, 0.8 * this.height, 0));
	pointList.push(vec3(0.2 * this.height, this.height, 0));
	pointList.push(vec3(0.35 * this.height, this.height, 0));
	pointList.push(vec3(0.4 * this.height, 0.9 * this.height, 0));
	var shade = new Spirit3d();
	shade.mesh = new Cylinder(this.tubeRadius, this.ShadeRadius, 0.1 * this.height, 10, tubeColor);
	shade.SetTranslation(vec3(0.4 * this.height, 0.875 * this.height, 0));
	shade.SetRotation(15, vec3(0, 0, 1));
	this.children.push(shade);
	var tube = new PolyCylinder(pointList, this.tubeRadius, tubeColor, tubeColor, 0);
	this.children.push(tube);
}

Lamp.prototype.SetChildrenShader = function (gl, prog, pts, norms, cols, texs, tangs, script) {
	
	for (var i = 0; i < this.children.length; i++) {
		this.children[i].points = pts;
		this.children[i].normals = norms;
		this.children[i].colors = cols;
		this.children[i].texCoords = texs;
		this.children[i].tangents = tangs;
		this.children[i].shader.program = prog;
		this.children[i].shader.shaderScript = script;
		this.children[i].shader.uMVMatrix 			= gl.getUniformLocation(this.children[i].shader.program, "uMVMatrix");
		this.children[i].shader.uProjMatrix  		= gl.getUniformLocation(this.children[i].shader.program, "uProjMatrix");
		this.children[i].shader.uNormalMatrix 		= gl.getUniformLocation(this.children[i].shader.program, "uNormalMatrix");
		this.children[i].shader.uMaterialAmbient   	= gl.getUniformLocation(this.children[i].shader.program, "uMaterialAmbient"); 
		this.children[i].shader.uMaterialDiffuse   	= gl.getUniformLocation(this.children[i].shader.program, "uMaterialDiffuse");
		this.children[i].shader.uMaterialSpecular  	= gl.getUniformLocation(this.children[i].shader.program, "uMaterialSpecular");
		this.children[i].shader.uShininess          = gl.getUniformLocation(this.children[i].shader.program, "uShininess");
		this.children[i].shader.uLightAmbient      	= gl.getUniformLocation(this.children[i].shader.program, "uLightAmbient");
		this.children[i].shader.uLightDiffuse      	= gl.getUniformLocation(this.children[i].shader.program, "uLightDiffuse");
		this.children[i].shader.uLightSpecular     	= gl.getUniformLocation(this.children[i].shader.program, "uLightSpecular");
		this.children[i].shader.uLightDirection    	= gl.getUniformLocation(this.children[i].shader.program, "uLightDirection");
	}
	
}