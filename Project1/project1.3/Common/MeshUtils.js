function Geometry() {
	this.vertices = new Array();
	this.normals = new Array();
	this.faces = new Array();
}

function Mesh3D() {
	this.geometry = new Geometry();
}

Mesh3D.prototype.LoadMesh = function (meshURL) {
	
}