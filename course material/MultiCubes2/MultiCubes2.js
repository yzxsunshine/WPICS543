"use strict";

var canvas;
var gl;

var NumVertices  = 36;

var points = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0.0, 0.0, 0.0 ];
var trans = [ 0.0, 0.0, 0.0 ];

var prog1 = [];
var prog2 = [];

var thetaLoc1;
var thetaLoc2;
var transLoc1;
var transLoc2;

var near = 0.1;
var far = 10.0;
var radius = 4.0;
var camTheta  = 0.0;
var camPhi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var  fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect;       // Viewport aspect ratio

var mvMatrix, pMatrix;
var modelViewLoc1, projectionLoc1;
var modelViewLoc2, projectionLoc2;

var eye;
const at = vec3( 0.0, 0.0, 0.0 );
const up = vec3( 0.0, 1.0, 0.0 );

window.onload = function init( )
{
    var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5, -0.5, -0.5, 1.0 )
    ];

    var vertexColors1 = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];

    var vertexColors2 = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
    ];

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube( vertices, vertexColors1, points, colors );
    colorCube( vertices, vertexColors2, points, colors );

    gl.viewport( 0, 0, canvas.width, canvas.height );

    aspect = canvas.width/canvas.height;

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable( gl.DEPTH_TEST );

    // Load the shader pair for the first cube.
    prog1 = initShaders( gl, "vertex-shader1", "fragment-shader1" );
    gl.useProgram( prog1 );

    modelViewLoc1 = gl.getUniformLocation( prog1, "modelView" );
    projectionLoc1 = gl.getUniformLocation( prog1, "projection" );
    thetaLoc1 = gl.getUniformLocation( prog1, "theta" );
    transLoc1 = gl.getUniformLocation( prog1, "trans" );

    // Create a color buffer.
    var cBuffer = gl.createBuffer( );
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( prog1, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    // Create a vertex buffer.
    var vBuffer = gl.createBuffer( );
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( prog1, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Load the shader pair for the second cube.
    prog2 = initShaders( gl, "vertex-shader2", "fragment-shader2" );
    gl.useProgram( prog2 );

    modelViewLoc2 = gl.getUniformLocation( prog2, "modelView" );
    projectionLoc2 = gl.getUniformLocation( prog2, "projection" );
    thetaLoc2 = gl.getUniformLocation( prog2, "theta" );
    transLoc2 = gl.getUniformLocation( prog2, "trans" );

    // Create a color buffer.
    var cBuffer = gl.createBuffer( );
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( prog2, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    // Create a vertex buffer.
    var vBuffer = gl.createBuffer( );
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( prog2, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    gl.useProgram( prog1 );

    //
    //  Load shaders and initialize attribute buffers
    //
    
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

    render( );
}

  function colorCube( inVertPts, inVertCols, pts, cols )
{
    quad( 1, 0, 3, 2, inVertPts, inVertCols, pts, cols );
    quad( 2, 3, 7, 6, inVertPts, inVertCols, pts, cols );
    quad( 3, 0, 4, 7, inVertPts, inVertCols, pts, cols );
    quad( 6, 5, 1, 2, inVertPts, inVertCols, pts, cols );
    quad( 4, 5, 6, 7, inVertPts, inVertCols, pts, cols );
    quad( 5, 4, 0, 1, inVertPts, inVertCols, pts, cols );
}

function quad(a, b, c, d, inVertices, inColors, outPtList, outColList )
{
    // We need to partition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
      outPtList.push( inVertices[indices[i]] );

      // for solid colored faces use
      outColList.push( inColors[a] );
    }
}

function render( )
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    eye = vec3( radius * Math.sin( camTheta ) * Math.cos( camPhi ),
                radius * Math.sin( camTheta ) * Math.sin( camPhi ),
                radius * Math.cos( camTheta ) );
    mvMatrix = lookAt( eye, at , up );
    var transMat = translate( 0.0, 0.0, 0.0 );

    pMatrix = perspective( fovy, aspect, near, far );

    // Draw the first cube, with the first set of shaders.
    gl.useProgram( prog1 );
    mvMatrix = mult( mvMatrix, transMat );

    gl.uniformMatrix4fv( modelViewLoc1, false, flatten( mvMatrix ) );
    gl.uniformMatrix4fv( projectionLoc1, false, flatten( pMatrix ) );

    // Update the rotation.
    theta[axis] += 2.0;
    gl.uniform3fv( thetaLoc1, theta );

    // Update the translation.
    trans = [ 0.0, 0.0, 0.0 ];
    gl.uniform3fv( transLoc1, trans );

    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    // Draw the second cube, with the second set of shaders.
    gl.useProgram( prog2 );

    transMat = translate( 1.5, 0.0, 0.0 );
    mvMatrix = mult( mvMatrix, transMat );
 
    gl.uniformMatrix4fv( modelViewLoc2, false, flatten( mvMatrix ) );
    gl.uniformMatrix4fv( projectionLoc2, false, flatten( pMatrix ) );

    gl.uniform3fv( thetaLoc2, theta );

    // Update the translation.
    trans = [ 0.0, 0.0, 0.0 ];
    gl.uniform3fv( transLoc2, trans );

    //    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
    gl.drawArrays( gl.TRIANGLES, NumVertices, NumVertices );

    requestAnimFrame( render );
}
