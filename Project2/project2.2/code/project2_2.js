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

var near = 0.1;
var far = 1000.0;
var radius = 80.0;
var camTheta  = 0.1;
var camPhi    = 0.1;
var dr = 5.0 * Math.PI/180.0;

var  fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect;       // Viewport aspect ratio

var mvMatrix, pMatrix;
var modelViewLoc, projectionLoc;

var eye;
const at = vec3( 0.0, 0.0, 0.0 );
const up = vec3( 0.0, 1.0, 0.0 );

var cylinder;
var sphere;
var polyCylinder;
var pointList;
var pcRadius = 0.1;
var lSystems = [];
var treeTrans = [];
var terrain = 0;
var numTrees = 10;

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
	
/* ----------------------------------------------------------------------- */
/* Function    : InitializePointList ( lSystemObj )
 *
 * Description : add points to vertex buffer according to lsystem rules.
 *
 * Parameters  : lSystemObj : LSystem
 */
function InitializePointList (lSystemObj) {
	polyCylinder = lSystemObj.BuildPolyCylinder(pcRadius, vec4(0.8, 0.6, 0.1, 1.0), vec4(0.2, 1.0, 0.4, 1.0));
	polyCylinder.DumpToVertextArray(points, normals, colors);
}

/* ----------------------------------------------------------------------- */
/* Function    : InitializeTerrain (  )
 *
 * Description : initialize terrain.
 */
function InitializeTerrain() {
	terrain = new Terrain(rawData, 64, 64, 32, 32, vec4(0.5, 0.6, 0.3, 1.0));
	terrain.DumpToVertextArray(points, normals, colors);
}

/* ----------------------------------------------------------------------- */
/* Function    : InitializeTerrain (  )
 *
 * Description : initialize webgl shaders.
 */
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
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
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

/* ----------------------------------------------------------------------- */
/* Function    : LoadFile ( f )
 *
 * Description : load files for LSystem
 */
function LoadFile (f) {
	var r = new FileReader();
	r.onload = function(e) { 
		var lines = r.result.split('\n');
		var len = 0;
		var iter = 0;
		var rot = vec3(0, 0, 0);
		var rep = [];
		var start = "";
		var rules = [];
		for (var i = 0; i < lines.length; i++) {
			if (lines[i][0] == '#') {
				continue;
			}
			var items = lines[i].split(' ');
			if (items[0] == "len:") {
				len = parseInt(items[1]);
			}
			else if (items[0] == "iter:") {
				iter = parseInt(items[1]);
			}
			else if (items[0] == "rot:") {
				rot[0] = parseFloat(items[1]);
				rot[1] = parseFloat(items[2]);
				rot[2] = parseFloat(items[3]);
			}
			else if (items[0] == "rep:") {
				items[1].replace('\r', '');
				items[1].replace('\n', '');
				items[1].replace(' ', '');
				var replaces = items[1].split(',');
				if (replaces.length > 1) {
					rep.push(replaces[0] + replaces[1]);
				}
				else {
					rep.push(replaces[0]);
				}
			}
			else if (items[0] == "start:") {
				start = items[1];
			}
			else if (items.length > 1) {
				items[1].replace('\r', '');
				items[1].replace('\n', '');
				items[1].replace(' ', '');
				var isDefined = 0;
				for (var j = 0; j < rules.length; j++) {
					if (rules[j].repCharacter == items[0][0]) {
						var prob = parseFloat(items[0].substring(2, items[0].length - 2));
						rules[j].AddRule(prob, items[1]);
						isDefined = 1;
						break;
					}
				}
				if(isDefined == 0) {
					if (items[0][1] == "(") {
						var prob = parseFloat(items[0].substring(2, items[0].length - 2));
						rules.push(new rulesProbability(items[0][0], prob, items[1]));
					}
					else {
						rules.push(new rulesProbability(items[0][0], 1, items[1]));
					}
				}
				//rules.push(items[0][0] + items[1]);
			}
		}
		
		InitializeTerrain();
		for (var i = 0; i < numTrees; i++) {
			var lSystem = new LSystem(len, iter, rot, rep, start, rules);
			var xCoord = Math.floor(Math.random() * terrain.numRows);
			var zCoord = Math.floor(Math.random() * terrain.numCols);
			var pos = terrain.GetVertices(xCoord, zCoord);
			lSystems.push(lSystem);
			treeTrans.push(pos);
		}
		InitializePointList(lSystems[0]);
		InitializeGLShader();
		//
		//document.getElementById("LSystemOutput").innerText = lSystem.finalString;
		document.getElementById("LSystemOutput").innerHTML = "<p>" + lSystem.finalString + "</p>";
	}
	r.readAsText(f);
}

function LoadLSystemFile (evt) {
	var f = evt.target.files[0]; 
    if (f) {
		LoadFile(f);
		
    } 
	else { 
      alert("Failed to load file!");
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
	//InitializeTerrain();
	//InitializeGLShader();
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
	
	if (terrain != 0) {
		gl.drawArrays( gl.TRIANGLES, terrain.startIndex, terrain.vertexNum );
	}
	if (lSystems.length > 0) {
		
		for (var i = 0; i < numTrees; i++) {
			var localMat = mvMatrix.slice(0);
			localMat.matrix = true;
			var transMat = translate(treeTrans[i][0], treeTrans[i][1], treeTrans[i][2]);
			localMat = mult( localMat, transMat );
			var rotMat = rotate(-90, 1.0, 0.0, 0.0 );
			localMat = mult( localMat, rotMat );
			lSystems[i].ExecuteTurtleString(polyCylinder, localMat, modelViewLoc);
		}
	}
	
	//polyCylinder.Render(mvMatrix, modelViewLoc);
	
	requestAnimFrame( render );
}