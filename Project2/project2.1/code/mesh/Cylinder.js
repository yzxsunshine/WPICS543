Cylinder.prototype = new Mesh();
Cylinder.prototype.constructor = Cylinder;


var CreateCircle = function (offset, numFacets, radius, vertices, indices, faceNormals) {
	var deltaAngle = 2 * Math.PI / numFacets;
	var startIndex = vertices.length;
	vertices.push(vec3(offset[0], offset[1], offset[2]));
	for (var i = 0; i < numFacets; i++) {
		var p = vec3(offset[0], offset[1], offset[2]);
		p[0] += Math.sin(deltaAngle * i) * radius;
		p[2] += Math.cos(deltaAngle * i) * radius;
		vertices.push(p);
		indices.push(startIndex);
		indices.push(startIndex + 1 + i % numFacets);
		indices.push(startIndex + 1 + (i + 1) % numFacets);
		faceNormals.push(vec3(0, offset[1] / Math.abs(offset[1]), 0));
	}
}
	
function Cylinder (topRadius, bottomRadius, height, numFacets, colorSet) {
	this.topRadius = topRadius;
	this.bottomRadius = bottomRadius;
	this.height = height;
	this.numFacets = numFacets;
	
	// clear space;
	this.vertices = [];
	this.faceNormals = [];
	this.colors = [];
	this.indices = [];
	
	// Generate Vertices and Normals1
	
	var topY = height / 2;
	var bottomY = -height / 2;
	var topCenterID = this.vertices.length;
	CreateCircle(vec3(0, topY, 0), numFacets, topRadius, this.vertices, this.indices, this.faceNormals);
	var bottomCenterID = this.vertices.length;
	CreateCircle(vec3(0, bottomY, 0), numFacets, bottomRadius, this.vertices, this.indices, this.faceNormals);
	
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
		var normal = vec3Scale(vec3Add(this.vertices[i + topCenterID + 1], this.vertices[(i + 1) % numFacets + bottomCenterID + 1]), 0.5);
		normal = vec3Normalize(normal);
		this.faceNormals.push(normal.slice(0));
		this.faceNormals.push(normal.slice(0));
		
		this.indices.push(i + topCenterID + 1);
		this.indices.push((i + 1) % numFacets + bottomCenterID + 1);
		this.indices.push(i + bottomCenterID + 1);
		
		this.indices.push(i + topCenterID + 1);
		this.indices.push((i + 1) % numFacets + topCenterID + 1);
		this.indices.push((i + 1) % numFacets + bottomCenterID + 1);
	}
}