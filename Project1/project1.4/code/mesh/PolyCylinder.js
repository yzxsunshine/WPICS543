/* Module      : PolyCylinder
 * Author      : Zhixin Yan
 * Email       : zyan@wpi.edu
 * Course      : CS 543
 *
 * Description : general class for 3d mesh
 *
 * Date        : 2015/11/10
 *
 * Special Usage : Before you include this file, you need include Cylinder.js and Sphere.js in your html file as well.
 * (c) Copyright 2008, Worcester Polytechnic Institute.
 */

PolyCylinder.prototype = new Spirit3d();
PolyCylinder.prototype.constructor = PolyCylinder;

 /* ----------------------------------------------------------------------- */
/* Function    : Sphere ( pointList, radius, cylinderColorSet, sphereColorSet, drawLastSphere )
 *
 * Description : constructor of Sphere, create vertices/indices/colors/normals of a sphere
 *
 * Parameters  : pointList : a list of points, the cylinders will be drawn from ith point to i+1th point, sphere will be drawn at each point
 * 				 radius : radius of sphere and cylinder
 *				 cylinderColorSet : color of cylinders	
 *				 sphereColorSet : color of spheres
 *				 drawLastSphere : dummy right now
 */
function PolyCylinder (pointList, radius, cylinderColorSet, sphereColorSet, drawLastSphere) {
	this.pointList = pointList.slice(0);
	this.radius = radius;
	this.cylinderColors = cylinderColorSet;
	this.sphereColors = sphereColorSet;
	this.drawLastSphere = drawLastSphere;
	this.cylinder = new Cylinder(radius, radius, 1.0, 10, cylinderColorSet);
	this.sphere = new Sphere(radius, 10, sphereColorSet);
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
PolyCylinder.prototype.DumpToVertextArray = function (points, normals, colors, texCoords, tagents) {
	this.cylinder.DumpToVertextArray(points, normals, colors, texCoords, tagents);
	this.sphere.DumpToVertextArray(points, normals, colors, texCoords, tagents);
}

/* ----------------------------------------------------------------------- */
/* Function    : Render (mvMatrix, mvMatrixLoc)
 *
 * Description : Render polyCylinders
 *
 * Parameters  : mvMatrix : model view matrix
 * 			     mvMatrixLoc : location of mv matrix in shader
 */
PolyCylinder.prototype.Render = function (mvMatrix, projection) {
	var localMvMatrix = mvMatrix.slice(0);
	localMvMatrix.matrix = true;
	for (var i = 0; i < this.pointList.length - 1; i++) {
		var diff = subtract(this.pointList[i + 1], this.pointList[i]);
		var s = vec3Magnitude(diff);
		var direction = vec3Normalize(diff);
		var midPoint = vec3Divide(add(this.pointList[i], this.pointList[i + 1]), 2);
		var transMat = translate(midPoint[0], midPoint[1], midPoint[2]);
		var scaleMat = scalem(1.0, s, 1.0);
		var angle = Math.acos(dot(vec3(0, 1, 0), direction));
		var axis = vec3(0, 1, 0);
		while (angle > Math.PI / 2)
			angle -= Math.PI;
		if (Math.abs(angle) > 0.001 ) {
			axis = vec3Normalize(cross(vec3(0, 1, 0), direction));
		}
		var rotMat = rotate(angle * 180 / Math.PI, axis[0], axis[1], axis[2]);
		
		
		localMvMatrix = mult( mvMatrix, transMat );
		localMvMatrix = mult( localMvMatrix, rotMat );
		localMvMatrix = mult( localMvMatrix, scaleMat );
		
		this.shader.shaderScript(this.shader, localMvMatrix, projection, this.points, this.normals, this.colors, this.texCoords, this.tangents);
		
		gl.drawArrays( gl.TRIANGLES, this.cylinder.startIndex, this.cylinder.vertexNum );
		
		transMat = translate(this.points[i + 1][0], this.points[i + 1][1], this.points[i + 1][2]);
		localMvMatrix = mult( mvMatrix, transMat );
		gl.uniformMatrix4fv( this.shader.uMVMatrix, false, flatten( localMvMatrix ) );
		gl.drawArrays( gl.TRIANGLES, this.sphere.startIndex, this.sphere.vertexNum );
	}
}