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

var theta = [ 0.0, 0.0, 0.0 ];
var trans = [ 0.0, 0.0, 0.0 ];
var thetaLoc;
var transLoc;
var axis = 0;
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var near = 0.3;
var far = 100.0;
var radius = 18.0;
var camTheta  = 0.0;
var camPhi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var  fovy = 100.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect;       // Viewport aspect ratio

var mvMatrix, pMatrix;
var modelViewLoc, projectionLoc;

var eye;
var at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var ground;

var LAMP_HEIGHT = 10;
var TRASHBIN_HEIGHT = 3;

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

/* ----------------------------------------------------------------------- */
/* Function    : InitializePointList ( lSystemObj )
 *
 * Description : add points to vertex buffer according to lsystem rules.
 *
 * Parameters  : lSystemObj : LSystem
 */
function InitializePointList () {
	var lamp = new Lamp(vec3(5.0, 0.5 * LAMP_HEIGHT, 3), LAMP_HEIGHT, 0.3, ColorLookup.black, ColorLookup.black);
	lamp.DumpToVertextArray(points, normals, colors);
	
	var trashBin1 = new Spirit3d();
	trashBin1.SetTranslation(vec3(4.8, TRASHBIN_HEIGHT/2, 0));
	trashBin1.mesh = new Cylinder(TRASHBIN_HEIGHT*0.3, TRASHBIN_HEIGHT*0.3, TRASHBIN_HEIGHT, 10, ColorLookup.black);
	trashBin1.DumpToVertextArray(points, normals, colors);
	
	var trashBin2 = new Spirit3d();
	trashBin2.SetTranslation(vec3(4.8, TRASHBIN_HEIGHT/2, 0 + TRASHBIN_HEIGHT*0.6));
	trashBin2.mesh = new Cylinder(TRASHBIN_HEIGHT*0.3, TRASHBIN_HEIGHT*0.3, TRASHBIN_HEIGHT, 10, ColorLookup.green);
	trashBin2.DumpToVertextArray(points, normals, colors);
	
	var building = new Spirit3d();
	building.SetTranslation(vec3(0, 0, -48));
	building.mesh = new Cube(80, 30, 30, vec4(1.0, 1.0, 0.9, 1.0));
	building.DumpToVertextArray(points, normals, colors);
	
	ground = new Spirit3d();
	ground.SetTranslation(vec3(0, 0, 0));
	ground.mesh = new Cube(100, 0.1, 100, vec4(0.5, 0.5, 0.4, 1.0));
	ground.DumpToVertextArray(points, normals, colors);
	
	ground.AddChildren(lamp);
	ground.AddChildren(trashBin1);
	ground.AddChildren(trashBin2);
	ground.AddChildren(building);
}

function InitializeGLShader() {
	
	//
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
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
/* ----------------------------------------------------------------------- */
/* Function    : checkKey (  )
 *
 * Description : add key event to change camera
 */
function checkKey(e) {

    e = e || window.event;

    if (e.keyCode == '38') {	
        // up arrow
		radius += 0.1;
    }
    else if (e.keyCode == '40') {
        // down arrow
		radius -= 0.1;
    }

	if (e.keyCode == '81') {
		camPhi += 0.1;
	}
	
	if (e.keyCode == '87') {
		camPhi -= 0.1;
	}
	
	if (e.keyCode == '65') {
		camTheta += 0.1;
	}
	
	if (e.keyCode == '83') {
		camTheta -= 0.1;
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
	
	InitializePointList();
	InitializeGLShader();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    eye = vec3( radius * Math.sin( camTheta ) * Math.cos( camPhi ),
                radius * Math.sin( camTheta ) * Math.sin( camPhi ),
                radius * Math.cos( camTheta ) );
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