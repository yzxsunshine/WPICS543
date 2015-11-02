
var gl;
var points = [];
var colors = [];
var normals = [];

var theta = [ 0.0, 0.0, 0.0 ];
var thetaLoc;
var axis = 0;
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var near = 0.1;
var far = 10.0;
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
var lSystem;


window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    

    // And, add our initial point into our array of points
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
	
	//cylinder = new Cylinder(0.3, 0.5, 0.6, 10, [1.0, 0.0, 0.0, 1.0]);
    cylinder = new Cylinder(0.3, 0.5, 0.6, 10, vertexColors);
	cylinder.DumpToVertextArray(points, normals, colors, 0);
    gl.viewport( 0, 0, canvas.width, canvas.height );

    aspect = canvas.width/canvas.height;

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable( gl.DEPTH_TEST );
    
    gl.enable(gl.DEPTH_TEST);

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
	modelViewLoc = gl.getUniformLocation( program, "modelView" );
    projectionLoc = gl.getUniformLocation( program, "projection" );

    //event listeners for buttons

    document.getElementById( "xButton" ).onclick = function ( ) {
      axis = xAxis;
    };
    document.getElementById( "yButton" ).onclick = function ( ) {
      axis = yAxis;
    };
    document.getElementById( "zButton" ).onclick = function ( ) {
      axis = zAxis;
    };
	
    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    eye = vec3( radius * Math.sin( camTheta ) * Math.cos( camPhi ),
                radius * Math.sin( camTheta ) * Math.sin( camPhi ),
                radius * Math.cos( camTheta ) );
    mvMatrix = lookAt( eye, at , up );
    var transMat = translate( 0.0, 0.0, 0.0 );
    mvMatrix = mult( mvMatrix, transMat );
    pMatrix = perspective( fovy, aspect, near, far );

    gl.uniformMatrix4fv( modelViewLoc, false, flatten( mvMatrix ) );
    gl.uniformMatrix4fv( projectionLoc, false, flatten( pMatrix ) );

    // Update the rotation.
    theta[axis] += 2.0;
    gl.uniform3fv( thetaLoc, theta );
	
	gl.drawArrays( gl.TRIANGLES, cylinder.startIndex, cylinder.vertexNum );
	requestAnimFrame( render );
}