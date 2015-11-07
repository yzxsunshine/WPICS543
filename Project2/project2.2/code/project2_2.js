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
var far = 100.0;
var radius = 4.0;
var camTheta  = 0.0;
var camPhi    = 0.0;
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
var lSystem = 0;
var terrain = 0;

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
	
function GeneratePointList() {
	pointList = [];
	pointList.push(vec3(-1, -1, 0));
	pointList.push(vec3(0, 0, 0));
	pointList.push(vec3(1, 0, 1));
	pointList.push(vec3(0, 1, 0));
	return pointList;
}

function InitializePointList () {
	polyCylinder = lSystem.BuildPolyCylinder(pcRadius, vertexColors, vertexColors);
	polyCylinder.DumpToVertextArray(points, normals, colors);
}

function InitializeTerrain() {
	terrain = new Terrain(4, 4, 10, 10, vertexColors);
	terrain.DumpToVertextArray(points, normals, colors);
}

function InitializeGLShader() {
	
	//cylinder = new Cylinder(0.3, 0.5, 0.6, 10, [1.0, 0.0, 0.0, 1.0]);
    //cylinder = new Cylinder(0.3, 0.5, 0.6, 10, vertexColors);
	//cylinder.DumpToVertextArray(points, normals, colors, 0);
	
	//sphere = new Sphere(0.3, 10, vertexColors);
	//sphere.DumpToVertextArray(points, normals, colors, 1);
	//pointList = GeneratePointList();
	//polyCylinder = new PolyCylinder(pointList, pcRadius, vertexColors, vertexColors, 1);
	//polyCylinder.DumpToVertextArray(points, normals, colors);
	
	//polyCylinder = lSystem.BuildPolyCylinder(pcRadius, vertexColors, vertexColors);
	//polyCylinder.DumpToVertextArray(points, normals, colors);
	
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

function LoadLSystemFile (evt) {
	var f = evt.target.files[0]; 
    if (f) {
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
				  rot[0] = parseFloat(items[2]);
				  rot[0] = parseFloat(items[3]);
			  }
			  else if (items[0] == "rep:") {
				  items[1].replace('\r', '');
				  items[1].replace('\n', '');
				  items[1].replace(' ', '');
				  var replaces = items[1].split(',');
				  rep.push(replaces[0] + replaces[1]);
			  }
			  else if (items[0] == "start:") {
				  start = items[1];
			  }
			  else {
				  items[1].replace('\r', '');
				  items[1].replace('\n', '');
				  items[1].replace(' ', '');
				  rules.push(items[0][0] + items[1]);
			  }
		  }
		  lSystem = new LSystem(len, iter, rot, rep, start, rules);
		  InitializePointList();
		  InitializeGLShader();
		  //
		  //document.getElementById("LSystemOutput").innerText = lSystem.finalString;
		  document.getElementById("LSystemOutput").innerHTML = "<p>" + lSystem.finalString + "</p>";
      }
      r.readAsText(f);
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

	InitializeTerrain();
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
	
	if (terrain != 0) {
		gl.drawArrays( gl.TRIANGLES, terrain.startIndex, terrain.vertexNum );
	}
	if (lSystem != 0) {
		lSystem.ExecuteTurtleString(polyCylinder, mvMatrix, modelViewLoc);
	}
	
	//polyCylinder.Render(mvMatrix, modelViewLoc);
	
	requestAnimFrame( render );
}