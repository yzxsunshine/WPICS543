/* Module      : project2_2.js
 * Author      : Zhixin Yan
 * Email       : zyan@wpi.edu
 * Course      : CS 543
 *
 * Description : Main entry of project2_2
 *
 * Date        : 2015/11/10
 *
 * Special Usage : Before you include this file, you need include Lsystem.js and all its dependent files in your html file as well.
 * (c) Copyright 2008, Worcester Polytechnic Institute.
 */
 
/* -- GLOBAL VARIABLES --------------------------------------------------- */
var gl;

var points = [];
var colors = [];
var normals = [];
var texCoords = [];
var tangents = [];

var textureGround;
var texCounter = 0;
var textures = [];
var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];


var theta = [ 0.0, 0.0, 0.0 ];
var trans = [ 0.0, 0.0, 0.0 ];
var thetaLoc;
var transLoc;
var axis = 0;
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var near = 0.3;
var far = 300.0;
var radius = 50.0;
var camTheta  = 3.2;
var camPhi    = -2.7;
var dr = 5.0 * Math.PI/180.0;

var  fovy = 100.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect;       // Viewport aspect ratio

var mvMatrix, pMatrix;
var modelViewLoc, projectionLoc;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var ground;

var LAMP_HEIGHT = 10;
var TRASHBIN_HEIGHT = 3;

var TRANSLATION_UNIT = 1;
var ROTATION_UNIT = 0.2 * 1.0 / Math.PI;

var vertexColors = [
	[ 0.0, 0.0, 0.0, 1.0 ],  // black
	[ 1.0, 0.0, 0.0, 1.0 ],  // red
	[ 1.0, 1.0, 0.0, 1.0 ],  // yellow
	[ 0.0, 1.0, 0.0, 1.0 ],  // green
	[ 0.0, 0.0, 1.0, 1.0 ],  // blue
	[ 1.0, 0.0, 1.0, 1.0 ],  // magenta
	[ 0.0, 1.0, 1.0, 1.0 ],  // cyan
    [ 1.0, 1.0, 1.0, 1.0 ]   // white
];

var ColorLookup = new Object();
ColorLookup.black = vec4(0.0, 0.0, 0.0, 1.0);
ColorLookup.red = vec4(1.0, 0.0, 0.0, 1.0);
ColorLookup.yellow = vec4(1.0, 1.0, 0.0, 1.0);
ColorLookup.green = vec4(0.0, 1.0, 0.0, 1.0);
ColorLookup.blue = vec4(0.0, 0.0, 1.0, 1.0);
ColorLookup.magenta = vec4(1.0, 0.0, 1.0, 1.0);
ColorLookup.cyan = vec4(0.0, 1.0, 1.0, 1.0);
ColorLookup.magenta = vec4(1.0, 1.0, 1.0, 1.0);

// Texture size.
var texSize = 16;
// Number of squares per side of the checkerboard.
var squaresPerSide = 16;
var texelsPerSquareSide = texSize / squaresPerSide;
// Color depth.
var tDepth = 4;

var shiftPressed = 0;
var ctrlPressed = 0;

// bump map
var lightPosition = vec4(0.0, 2.0, 0.0, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialDiffuse = vec4( 0.7, 0.7, 0.7, 1.0 );

function mat4ToInverseMat3(mat) {
    dest = mat3();
	var a00 = mat[0][0], a01 = mat[0][1], a02 = mat[0][2];
	var a10 = mat[1][0], a11 = mat[1][1], a12 = mat[1][2];
	var a20 = mat[2][0], a21 = mat[2][1], a22 = mat[2][2];
	
	var b01 = a22*a11-a12*a21;
	var b11 = -a22*a10+a12*a20;
	var b21 = a21*a10-a11*a20;
		
	var d = a00*b01 + a01*b11 + a02*b21;
	if (!d) { return null; }
	var id = 1/d;
	
	
	dest[0][0] = b01*id;
	dest[0][1] = (-a22*a01 + a02*a21)*id;
	dest[0][2] = (a12*a01 - a02*a11)*id;
	dest[1][0] = b11*id;
	dest[1][1] = (a22*a00 - a02*a20)*id;
	dest[1][2] = (-a12*a00 + a02*a10)*id;
	dest[2][0] = b21*id;
	dest[2[1]] = (-a21*a00 + a01*a20)*id;
	dest[2][2] = (a11*a00 - a01*a10)*id;
	
	return dest;
};

// Create a checkerboard pattern using floats
var image1 = new Uint8Array( tDepth * texSize * texSize );
for( var i = 0; i < texSize; i++ )  {
  for( var j = 0; j < texSize; j++ )  {
    // Compute the Black/White color, switching every texelsPerSquareSide texels.
    var bw = ( ( ( i & texelsPerSquareSide ) == 0 ) ^ ( ( j & texelsPerSquareSide )  == 0 ) );
    for( var k = 0; k < tDepth-1; k++ )  {
      image1[ ( tDepth * texSize * i ) + ( tDepth * j ) + k ] = ( 255 * bw );
    }
    // Set the alpha to 1.
    image1[ ( tDepth * texSize * i ) + ( tDepth * j ) + k ] = ( 255 * 1.0 );
  }
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}

function steupTextureFilteringAndMips(width, height) {
  if (isPowerOf2(width) && isPowerOf2(height)) {
    // the dimensions are power of 2 so generate mips and turn on 
    // tri-linear filtering.
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  } else {
    // at least one of the dimensions is not a power of 2 so set the filtering
    // so WebGL will render it.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }
}

function configureRawDataTexture( program, image, width, height, texName, id) {
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0,
         gl.RGBA, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    
    gl.uniform1i(gl.getUniformLocation(program, texName), id);
	textures.push(texture);
	return texture;
	//texCounter++;
}

function configureImageTexture( program, image, texName, id) {
    var tex = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, tex );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, 
         gl.RGB, gl.UNSIGNED_BYTE, image );
    //gl.generateMipmap( gl.TEXTURE_2D );
    steupTextureFilteringAndMips(image.width, image.height);
    
    gl.uniform1i(gl.getUniformLocation(program, texName), id);
	//texCounter++;
	textures.push(tex);
	return tex;
}

function configureCubeMap (img) {
	var texID = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texID);
	var targets = [
	   gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 
	   gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 
	   gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z 
	];
	for (var j = 0; j < 6; j++) {
		gl.texImage2D(targets[j], 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img[j]);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	}
	gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
	return texID;
}

function BindShaderData (program, pts, norms, cols, texs, tangs) {
    var vColor = gl.getAttribLocation( program, "vColor" );
	if (vColor >= 0) {
		var cBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(cols), gl.STATIC_DRAW );
		gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vColor );
	}
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
	if (vPosition >= 0) {
		var vBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(pts), gl.STATIC_DRAW );
		gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vPosition );
	}
   

    var vNormal = gl.getAttribLocation( program, "vNormal" );
	if (vNormal >= 0) {
		var nBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(norms), gl.STATIC_DRAW );
		gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vNormal );
	}
   
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
	if (vTexCoord >= 0) {
		var tBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(texs), gl.STATIC_DRAW );
	    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vTexCoord );
	}
	
	var aTangent = gl.getAttribLocation( program, "aTangent" );
	if (aTangent >= 0) {
		var tangentBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, tangentBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(tangs), gl.STATIC_DRAW );
		gl.vertexAttribPointer( aTangent, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( aTangent );
	}
}

function initLights(shader){
    gl.uniform3fv(shader.uLightDirection,   [0.0, -1.0, 1.0]);
    gl.uniform4fv(shader.uLightAmbient, [0.1,0.1,0.1,1.0]);
    gl.uniform4fv(shader.uLightDiffuse,  [1.0,1.0,1.0,1.0]); 
    gl.uniform4fv(shader.uLightSpecular,  [1.0,1.0,1.0,1.0]);
    gl.uniform4fv(shader.uMaterialAmbient, [1.0,1.0,1.0,1.0]); 
    gl.uniform4fv(shader.uMaterialDiffuse, [1.0,1.0,1.0,1.0]);
    gl.uniform4fv(shader.uMaterialSpecular,[1.0,1.0,1.0,1.0]);
    gl.uniform1f(shader.uShininess, 230.0);
}

function BumpMapShaderScript (shader, mvMatrix, projMatrix, pts, norms, cols, texs, tangs) {
	gl.useProgram( shader.program );
	BindShaderData(shader.program, pts, norms, cols, texs, tangs);
	gl.uniformMatrix4fv( shader.uMVMatrix, false, flatten( mvMatrix ) );
	gl.uniformMatrix4fv( shader.uProjMatrix, false, flatten( projMatrix ) );
	var normalMatrix = mat4ToInverseMat3(mvMatrix);
    gl.uniformMatrix3fv( shader.uNormalMatrix, false, flatten(normalMatrix));
	initLights(shader);
	
	var bumpMapImg = document.getElementById("bumpMapImg");
	var bumpMapNormal = document.getElementById("bumpMapNormal");
    gl.uniform2fv( gl.getUniformLocation(shader.program, "bumpmapSize"),flatten(vec2(bumpMapImg.width, bumpMapImg.height)));	
	var texBumpImg = configureImageTexture(shader.program, bumpMapImg, "texture", 0);
	var texBumpNormal = configureImageTexture(shader.program, bumpMapNormal, "bumpMap", 1);
	gl.activeTexture(gl.TEXTURE0);  // or gl.TEXTURE0 + 7
	gl.bindTexture(gl.TEXTURE_2D, texBumpImg);
	
	gl.activeTexture(gl.TEXTURE1);  // or gl.TEXTURE0 + 7
	gl.bindTexture(gl.TEXTURE_2D, texBumpNormal);
}

function EnvMapShaderScript (shader, mvMatrix, projMatrix, pts, norms, cols, texs, tangs) {
	gl.useProgram( shader.program );
	BindShaderData(shader.program, pts, norms, cols, texs, tangs);
	gl.uniformMatrix4fv( shader.uMVMatrix, false, flatten( mvMatrix ) );
	gl.uniformMatrix4fv( shader.uProjMatrix, false, flatten( projMatrix ) );
	var normalMatrix = mat4ToInverseMat3(mvMatrix);
    gl.uniformMatrix3fv( shader.uNormalMatrix, false, flatten(normalMatrix));
	//initLights(shader);
	
}

function GroundShaderScript (shader, mvMatrix, projMatrix, pts, norms, cols, texs, tangs) {
	gl.useProgram( shader.program );
	BindShaderData(shader.program, pts, norms, cols, texs, tangs);
	
	gl.uniformMatrix4fv( shader.uMVMatrix, false, flatten( mvMatrix ) );
	gl.uniformMatrix4fv( shader.uProjMatrix, false, flatten( projMatrix ) );
	var normalMatrix = mat4ToInverseMat3(mvMatrix);
    gl.uniformMatrix3fv( shader.uNormalMatrix, false, flatten(normalMatrix));
	initLights(shader);
	
	var texGround = configureRawDataTexture(shader.shader, image1, texSize, texSize, "texture", 0);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texGround);
}

function InitializeGLShader() {
	
	//
    //  Load shaders and initialize attribute buffers
    //
    var programGround = initShaders( gl, "vertex-shader-ground", "fragment-shader-ground" );
    gl.useProgram( programGround );
    var modelViewLocGround = gl.getUniformLocation( programGround, "modelView" );
    var projectionLocGround = gl.getUniformLocation( programGround, "projection" );
	ground = new Spirit3d();
	ground.SetTranslation(vec3(0, 0, 0));
	ground.mesh = new Quad(100, 100, vec4(0.5, 0.5, 0.4, 1.0));
	ground.DumpToVertextArray(points, normals, colors, texCoords, tangents);
	ground.SetShader(gl, programGround, modelViewLocGround, projectionLocGround, points, normals, colors, texCoords, tangents, GroundShaderScript);
	
	

	var programCube= initShaders( gl, "vertex-shader-bumpmap", "fragment-shader-bumpmap" );
    gl.useProgram( programCube );
    var modelViewLocCube = gl.getUniformLocation( programCube, "modelView" );
    var projectionLocCube = gl.getUniformLocation( programCube, "projection" );
	var cube = new Spirit3d();
	cube.SetTranslation(vec3(-30, 10.01, 0));
	cube.mesh = new Cube(20, 20, 20, vec4(1.0, 1.0, 1.0, 1.0));
	cube.DumpToVertextArray(points, normals, colors, texCoords, tangents);
	cube.SetShader(gl, programCube, modelViewLocCube, projectionLocCube, points, normals, colors, texCoords, tangents, BumpMapShaderScript);
	ground.AddChildren(cube);
	
	var programSphere= initShaders( gl, "vertex-shader-envmap", "fragment-shader-envmap" );
    gl.useProgram( programSphere );
    var modelViewLocSphere = gl.getUniformLocation( programSphere, "modelView" );
    var projectionLocSphere = gl.getUniformLocation( programSphere, "projection" );
	var sphere = new Spirit3d();
	sphere.SetTranslation(vec3(0, 10.01, 0));
	sphere.mesh = new Sphere(10, 10, vec4(1.0, 1.0, 1.0, 1.0));
	sphere.DumpToVertextArray(points, normals, colors, texCoords, tangents);
	sphere.SetShader(gl, programSphere, modelViewLocSphere, projectionLocSphere, points, normals, colors, texCoords, tangents, EnvMapShaderScript);
	ground.AddChildren(sphere);
	
	var programCylinder= initShaders( gl, "vertex-shader-parallelmap", "fragment-shader-parallelmap" );
    gl.useProgram( programCylinder );
    var modelViewLocCylinder = gl.getUniformLocation( programCylinder, "modelView" );
    var projectionLocCylinder = gl.getUniformLocation( programCylinder, "projection" );
	var cylinder = new Spirit3d();
	cylinder.SetTranslation(vec3(30, 10.01, 0));
	cylinder.mesh = new Cylinder(10, 10, 20, 10, vec4(1.0, 1.0, 1.0, 1.0));
	cylinder.DumpToVertextArray(points, normals, colors, texCoords, tangents);
	cylinder.SetShader(gl, programCylinder, modelViewLocCylinder, projectionLocCylinder, points, normals, colors, texCoords, tangents, GroundShaderScript);
	ground.AddChildren(cylinder);

	
	gl.useProgram( programGround );
	BindShaderData(programGround, points, normals, colors, texCoords, tangents);
	
	gl.useProgram( programCube );
	BindShaderData(programCube, points, normals, colors, texCoords, tangents);
	
	
	gl.useProgram( programSphere );
	BindShaderData(programSphere, points, normals, colors, texCoords, tangents);
	var cubeMapArray = [document.getElementById("posx"),
						document.getElementById("negx"),
						document.getElementById("posy"),
						document.getElementById("negy"),
						document.getElementById("posz"),
						document.getElementById("negz")];
	var cubeTex = configureCubeMap(cubeMapArray);
	//configureRawDataTexture(programSphere, image1, texSize, texSize, "texture");
	
	gl.useProgram( programCylinder );
	BindShaderData(programCylinder, points, normals, colors, texCoords, tangents);
	//configureRawDataTexture(programCylinder, image1, texSize, texSize, "texture");
	
    render();
}

document.onkeydown = checkKey;
document.onkeyup = cancelKey;
var rotCos = Math.cos(ROTATION_UNIT);
var rotSin = Math.sin(ROTATION_UNIT);
var xRotMatPos = [];
xRotMatPos.push(vec3(1, 0, 0));
xRotMatPos.push(vec3(0, rotCos, -rotSin));
xRotMatPos.push(vec3(0, rotSin, rotCos));

var yRotMatPos = [];
yRotMatPos.push(vec3(rotCos, 0, rotSin));
yRotMatPos.push(vec3(0, 1, 0));
yRotMatPos.push(vec3(-rotSin, 0, rotCos));

var zRotMatPos = [];
zRotMatPos.push(vec3(rotCos, -rotSin, 0));
zRotMatPos.push(vec3(rotSin, rotCos, 0));
zRotMatPos.push(vec3(0, 0, 1));

rotCos = Math.cos(-ROTATION_UNIT);
rotSin = Math.sin(-ROTATION_UNIT);
var xRotMatNeg = [];
xRotMatNeg.push(vec3(1, 0, 0));
xRotMatNeg.push(vec3(0, rotCos, -rotSin));
xRotMatNeg.push(vec3(0, rotSin, rotCos));

var yRotMatNeg = [];
yRotMatNeg.push(vec3(rotCos, 0, rotSin));
yRotMatNeg.push(vec3(0, 1, 0));
yRotMatNeg.push(vec3(-rotSin, 0, rotCos));

var zRotMatNeg = [];
zRotMatNeg.push(vec3(rotCos, -rotSin, 0));
zRotMatNeg.push(vec3(rotSin, rotCos, 0));
zRotMatNeg.push(vec3(0, 0, 1));

function ResetCamera() {
	eye = vec3(0, 10, 50);
	at = vec3(0, 10, 0);
	up = vec3(0, 1, 0);
}
/* ----------------------------------------------------------------------- */
/* Function    : checkKey (  )
 *
 * Description : add key event to change camera
 */
function checkKey(e) {

    e = e || window.event;

	if (e.keyCode == '16') {	
        // up arrow
		shiftPressed = 1;
    }
	
	if (e.keyCode == '17') {	
        // up arrow
		ctrlPressed = 1;
    }
	var invMV = mat4ToInverseMat3(mvMatrix);
	var xTrans = vec3(1, 0, 0);
	var yTrans = vec3(0, 1, 0);
	var zTrans = vec3(0, 0, 1);
    if (e.keyCode == '37') {	
        // left arrow
		if (ctrlPressed == 0) {
			var transInWorld = vec3MultMatrix3x3(invMV, negate(xTrans));
			eye = add(eye, transInWorld);
			at = add(at, transInWorld);
		}
		else if (ctrlPressed == 1){
			var dir = subtract(at, eye);
			var newDir = vec3(dot(dir, yRotMatNeg[0]), dot(dir, yRotMatNeg[1]), dot(dir, yRotMatNeg[2]));
			at = add(eye, newDir);
			var upVec = vec3(dot(up, yRotMatNeg[0]), dot(up, yRotMatNeg[1]), dot(up, yRotMatNeg[2]));
			up = upVec;
		}
		
    }
	else if (e.keyCode == '39') {
        // right arrow
		if (ctrlPressed == 0) {
			var transInWorld = vec3MultMatrix3x3(invMV, xTrans);
			eye = add(eye, transInWorld);
			at = add(at, transInWorld);
		}
		else {
			var dir = subtract(at, eye);
			var newDir = vec3(dot(dir, yRotMatPos[0]), dot(dir, yRotMatPos[1]), dot(dir, yRotMatPos[2]));
			at = add(eye, newDir);
			var upVec = vec3(dot(up, yRotMatPos[0]), dot(up, yRotMatPos[1]), dot(up, yRotMatPos[2]));
			up = upVec;
		}
    }
	
	if (e.keyCode == '38') {	
        // up arrow
		if (shiftPressed == 0 && ctrlPressed == 0) {
			var transInWorld = vec3MultMatrix3x3(invMV, yTrans);
			eye = add(eye, transInWorld);
			at = add(at, transInWorld);
		}
		else if (ctrlPressed == 1){
			var dir = subtract(at, eye);
			var newDir = vec3(dot(dir, xRotMatNeg[0]), dot(dir, xRotMatNeg[1]), dot(dir, xRotMatNeg[2]));
			at = add(eye, newDir);
			var upVec = vec3(dot(up, xRotMatNeg[0]), dot(up, xRotMatNeg[1]), dot(up, xRotMatNeg[2]));
			up = upVec;
		}
		else {
			var transInWorld = vec3MultMatrix3x3(invMV, negate(zTrans));
			eye = add(eye, transInWorld);
			at = add(at, transInWorld);
		}
    }
    else if (e.keyCode == '40') {
        // down arrow
		if (shiftPressed == 0 && ctrlPressed == 0) {
			var transInWorld = vec3MultMatrix3x3(invMV, negate(yTrans));
			eye = add(eye, transInWorld);
			at = add(at, transInWorld);
		}
		else if (ctrlPressed == 1){
			var dir = subtract(at, eye);
			var newDir = vec3(dot(dir, xRotMatPos[0]), dot(dir, xRotMatPos[1]), dot(dir, xRotMatPos[2]));
			at = add(eye, newDir);
			var upVec = vec3(dot(up, xRotMatPos[0]), dot(up, xRotMatPos[1]), dot(up, xRotMatPos[2]));
			up = upVec;
		}
		else {
			var transInWorld = vec3MultMatrix3x3(invMV, zTrans);
			eye = add(eye, transInWorld);
			at = add(at, transInWorld);
		}
    }
	
	if (e.keyCode == '188' || e.keyCode == '<' ) {
		var dir = subtract(at, eye);
		var newDir = vec3(dot(dir, zRotMatPos[0]), dot(dir, zRotMatPos[1]), dot(dir, zRotMatPos[2]));
		at = add(eye, newDir);
		var upVec = vec3(dot(up, zRotMatPos[0]), dot(up, zRotMatPos[1]), dot(up, zRotMatPos[2]));
		up = upVec.slice();
	}
	else if (e.keyCode == '190' || e.keyCode == '>' ) {
		var dir = subtract(at, eye);
		var newDir = vec3(dot(dir, zRotMatNeg[0]), dot(dir, zRotMatNeg[1]), dot(dir, zRotMatNeg[2]));
		at = add(eye, newDir);
		var upVec = vec3(dot(up, zRotMatNeg[0]), dot(up, zRotMatNeg[1]), dot(up, zRotMatNeg[2]));
		up = upVec.slice();
	}
	
	if (e.keyCode == '82') {
		ResetCamera();
	}
}

function cancelKey(e) {

    e = e || window.event;

    if (e.keyCode == '16') {	
        // up arrow
		shiftPressed = 0;
    }
	
	if (e.keyCode == '17') {	
        // up arrow
		ctrlPressed = 0;
    }
}

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    aspect = canvas.width/canvas.height;

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable( gl.DEPTH_TEST );
    
    gl.enable(gl.DEPTH_TEST);
	
	ResetCamera();
	InitializeGLShader();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
    mvMatrix = lookAt( eye, at , up );
  
    pMatrix = perspective( fovy, aspect, near, far );

	ground.Render(mvMatrix, pMatrix);
	requestAnimFrame( render );
}