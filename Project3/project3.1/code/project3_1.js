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
var program;

var points = [];
var colors = [];
var normals = [];
var texCoords = [];

var textureGround;
var texCounter = 0;

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

function configureRawDataTexture( image, width, height ) {
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0,
         gl.RGBA, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    
    gl.uniform1i(gl.getUniformLocation(program, "texture"), texCounter);
	texCounter++;
}

function configureImageTexture( image ) {
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, 
         gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    
    gl.uniform1i(gl.getUniformLocation(program, "texture"), texCounter);
	texCounter++;
}

/* ----------------------------------------------------------------------- */
/* Function    : InitializePointList ( lSystemObj )
 *
 * Description : add points to vertex buffer according to lsystem rules.
 *
 * Parameters  : lSystemObj : LSystem
 */
function InitializePointList () {
	ground = new Spirit3d();
	ground.SetTranslation(vec3(0, 0, 0));
	ground.mesh = new Quad(100, 100, vec4(0.5, 0.5, 0.4, 1.0));
	ground.DumpToVertextArray(points, normals, colors, texCoords);
	
	var cube = new Spirit3d();
	cube.SetTranslation(vec3(-30, 10.01, 0));
	cube.mesh = new Cube(20, 20, 20, vec4(1.0, 1.0, 1.0, 1.0));
	cube.DumpToVertextArray(points, normals, colors, texCoords);
	ground.AddChildren(cube);
	
	var sphere = new Spirit3d();
	sphere.SetTranslation(vec3(0, 10.01, 0));
	sphere.mesh = new Sphere(10, 10, vec4(1.0, 1.0, 1.0, 1.0));
	sphere.DumpToVertextArray(points, normals, colors, texCoords);
	ground.AddChildren(sphere);
	
	var cylinder = new Spirit3d();
	cylinder.SetTranslation(vec3(30, 10.01, 0));
	cylinder.mesh = new Cylinder(10, 10, 20, 10, vec4(1.0, 1.0, 1.0, 1.0));
	cylinder.DumpToVertextArray(points, normals, colors, texCoords);
	ground.AddChildren(cylinder);
}

function InitializeGLShader() {
	
	//
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW );
    
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

	var image = document.getElementById("texImage");
	configureRawDataTexture(image1, texSize, texSize);
	
	thetaLoc = gl.getUniformLocation(program, "theta");
	transLoc = gl.getUniformLocation(program, "trans");
	modelViewLoc = gl.getUniformLocation( program, "modelView" );
    projectionLoc = gl.getUniformLocation( program, "projection" );

    //event listeners for buttons

   /* document.getElementById( "xButton" ).onclick = function ( ) {
      axis = xAxis;
    };
    document.getElementById( "yButton" ).onclick = function ( ) {
      axis = yAxis;
    };
    document.getElementById( "zButton" ).onclick = function ( ) {
      axis = zAxis;
    };
	*/
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
	
    if (e.keyCode == '37') {	
        // left arrow
		if (ctrlPressed == 0) {
			eye[0] -= TRANSLATION_UNIT;
			at[0] -= TRANSLATION_UNIT;
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
			eye[0] += TRANSLATION_UNIT;
			at[0] += TRANSLATION_UNIT;
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
			eye[1] += TRANSLATION_UNIT;
			at[1] += TRANSLATION_UNIT;
		}
		else if (ctrlPressed == 1){
			var dir = subtract(at, eye);
			var newDir = vec3(dot(dir, xRotMatNeg[0]), dot(dir, xRotMatNeg[1]), dot(dir, xRotMatNeg[2]));
			at = add(eye, newDir);
			var upVec = vec3(dot(up, xRotMatNeg[0]), dot(up, xRotMatNeg[1]), dot(up, xRotMatNeg[2]));
			up = upVec;
		}
		else {
			eye[2] -= TRANSLATION_UNIT;
			at[2] -= TRANSLATION_UNIT;
		}
    }
    else if (e.keyCode == '40') {
        // down arrow
		if (shiftPressed == 0 && ctrlPressed == 0) {
			eye[1] -= TRANSLATION_UNIT;
			at[1] -= TRANSLATION_UNIT;
		}
		else if (ctrlPressed == 1){
			var dir = subtract(at, eye);
			var newDir = vec3(dot(dir, xRotMatPos[0]), dot(dir, xRotMatPos[1]), dot(dir, xRotMatPos[2]));
			at = add(eye, newDir);
			var upVec = vec3(dot(up, xRotMatPos[0]), dot(up, xRotMatPos[1]), dot(up, xRotMatPos[2]));
			up = upVec;
		}
		else {
			eye[2] += TRANSLATION_UNIT;
			at[2] += TRANSLATION_UNIT;
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
	InitializePointList();
	InitializeGLShader();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    //eye = vec3( radius * Math.sin( camTheta ) * Math.cos( camPhi ),
    //            radius * Math.sin( camTheta ) * Math.sin( camPhi ),
    //            radius * Math.cos( camTheta ) );
    mvMatrix = lookAt( eye, at , up );
    //var transMat = translate( 0.0, 0.0, 0.0 );
    //mvMatrix = mult( mvMatrix, transMat );
    pMatrix = perspective( fovy, aspect, near, far );
	gl.uniformMatrix4fv( modelViewLoc, false, flatten( mvMatrix ) );
	gl.uniformMatrix4fv( projectionLoc, false, flatten( pMatrix ) );
	
	//lamp.Render(mvMatrix, modelViewLoc);
	//for (var i = 0; i < trashBins.length; i++) {
		//trashBins[i].Render(mvMatrix, modelViewLoc);
	//}
	ground.Render(mvMatrix, modelViewLoc);
	requestAnimFrame( render );
}