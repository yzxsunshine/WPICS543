/* Module      : LSystem
 * Author      : Zhixin Yan
 * Email       : zyan@wpi.edu
 * Course      : CS 543
 *
 * Description : The file contains two classes, one is LSystem which could generate a turtle string and execute it; 
 *				 the other is rulesProbability class, which is a data structure for stochastic LSystem
 *
 * Date        : 2015/11/10
 *
 * Special Usage : Before you include this file, you need include PolyCylinder.js in your html file as well.
 * (c) Copyright 2008, Worcester Polytechnic Institute.
 */

/* ----------------------------------------------------------------------- */
/* Function    : rulesProbability ( char rep, float prob, string str )
 *
 * Description : constructor of rulesProbability, which initialize a probabilistic rule for LSystem
 *
 * Parameters  : rep : the character to be replaced
 *				 prob : probability of replace the character with the following string	
 *				 str : the replacement string
 */
function rulesProbability(rep, prob, str) {
	this.repCharacter = rep;
	this.probability = [];
	this.replacement = [];
	this.probability.push(prob);
	this.replacement.push(str);
}

/* ----------------------------------------------------------------------- */
/* Function    : AddRule ( float prob, string str )
 *
 * Description : add a replacement with certain probability to current rule
 *
 * Parameters  : prob : probability of replace the character with the following string	
 *				 str : the replacement string
 */
rulesProbability.prototype.AddRule = function (prob, str) {
	this.probability.push(prob);
	this.replacement.push(str);
}

/* ----------------------------------------------------------------------- */
/* Function    : LSystem (len, iter, rot, rep, start, rules)
 *
 * Description : constructor of LSystem. Iteratively replace characters based on rules to generate turtle string
 *
 * Parameters  : len : length of each step to draw
 *				 iter : number of iterations
 *				 rot : rotation degrees on x, y, z axis 
 * 				 rep : replace rules (for final turtle string, not in iterations)
 *				 start : the string in first iterations
 *				 rules : an array of rulesProbability
 */
function LSystem (len, iter, rot, rep, start, rules) {
	this.stepLength = len;
	this.iterNum = iter;
	this.rotationAngles = rot.slice(0);
	this.replaceString = rep.slice(0);
	this.startString = start;
	this.finalString = start;
	this.ruleString = rules.slice(0);	// first item save the character to be replaced while the others are replacements
	
	for (var i = 0; i < this.iterNum; i++) {
		var nextIterString = "";
		for (var j = 0; j < this.finalString.length; j++) {
			var replaceNum = 0;
			for (var k = 0; k < this.ruleString.length; k++) {
				if (this.finalString[j] == this.ruleString[k].repCharacter) {
					var randNum = Math.random();
					var count = 0;
					for (var l = 0; l < this.ruleString[k].replacement.length; l++) {
						count += this.ruleString[k].probability[l];
						if (randNum < count) {
							nextIterString = nextIterString + this.ruleString[k].replacement[l].slice(0);
							break;
						}
					}
					replaceNum++;
					break;
				}
			}
			if (replaceNum == 0 && this.finalString[j] != '\n' && this.finalString[j] != '\r' && this.finalString[j] != '\0') {
				nextIterString = nextIterString + this.finalString[j];
			}
		}
		this.finalString = nextIterString;
		//alert(this.finalString);
	}
	
	var repStr = "";
	for (var i = 0; i < this.finalString.length; i++) {
		var replaced = 0;
		for (var j = 0; j < this.replaceString.length; j++) {
			if (this.finalString[i] == this.replaceString[j][0]) {
				if (this.replaceString[j].length > 1) {
					repStr += this.replaceString[j][1];
				}
				replaced = 1;
				break;
			}
		}
		if (replaced == 0 && this.finalString[j] != '\n' && this.finalString[j] != '\r' && this.finalString[j] != '\0') {
			repStr += this.finalString[i];
		}
	}
	this.finalString = repStr;
	
	//alert(this.finalString);
}

/* ----------------------------------------------------------------------- */
/* Function    : BuildPolyCylinder (radius, cylinderColorSet, sphereColorSet)
 *
 * Description : return a PolyCylinder with certain radius and color
 *
 * Parameters  : radius : radius of cylinders	
 *				 cylinderColorSet : color for cylinders
 * 			     sphereColorSet : color for spheres
 */
LSystem.prototype.BuildPolyCylinder = function (radius, cylinderColorSet, sphereColorSet) {
	var pointList = [];
	pointList.push(vec3(0, 0, 0));
	pointList.push(vec3(0, 0, this.stepLength));
	var polyCylinder = new PolyCylinder(pointList, radius, cylinderColorSet, sphereColorSet, 1);
	return polyCylinder;
}

/* ----------------------------------------------------------------------- */
/* Function    : ExecuteTurtleString (polyCylinder, mvMatrix, mvMatrixLoc)
 *
 * Description : Render polyCylinders according to turtle string
 *
 * Parameters  : polyCylinder : the object to be rendered	
 *				 mvMatrix : model view matrix
 * 			     mvMatrixLoc : location of mv matrix in shader
 */
LSystem.prototype.ExecuteTurtleString = function (polyCylinder, mvMatrix, mvMatrixLoc) {
	var mvMatrixStack = [];
	var curMVMatrix = mvMatrix.slice(0);
	curMVMatrix.matrix = true;
	var transMat = translate(0, 0, this.stepLength);
	
	var xPositiveRotMat = rotate(this.rotationAngles[0], 1, 0, 0);
	var xNegativeRotMat = rotate(-this.rotationAngles[0], 1, 0, 0);
	
	var yPositiveRotMat = rotate(this.rotationAngles[1], 0, 1, 0);
	var yNegativeRotMat = rotate(-this.rotationAngles[1], 0, 1, 0);	
	
	var zPositiveRotMat = rotate(this.rotationAngles[2], 0, 0, 1);
	var zNegativeRotMat = rotate(-this.rotationAngles[2], 0, 0, 1);
	
	var turnAroundRotMat = rotate(180, 0, 1, 0);	
	
	for (var i = 0; i < this.finalString.length; i++) {
		switch (this.finalString[i]) {
		case 'F':
			polyCylinder.Render(curMVMatrix, mvMatrixLoc);
			curMVMatrix = mult(curMVMatrix, transMat);
			break;
		case 'f':
			curMVMatrix = mult(curMVMatrix, transMat);
			break;
		case '+':
			curMVMatrix = mult(curMVMatrix, xPositiveRotMat);
			break;
		case '-':
			curMVMatrix = mult(curMVMatrix, xNegativeRotMat);
			break;
		case '&':
			curMVMatrix = mult(curMVMatrix, yPositiveRotMat);
			break;
		case '^':
			curMVMatrix = mult(curMVMatrix, yNegativeRotMat);
			break;
		case '\\':
			curMVMatrix = mult(curMVMatrix, zPositiveRotMat);
			break;
		case '/':
			curMVMatrix = mult(curMVMatrix, zNegativeRotMat);
			break;
		case '|':
			curMVMatrix = mult(curMVMatrix, turnAroundRotMat);
			break;
		case '[':
			mvMatrixStack.push(curMVMatrix.slice(0));
			break;
		case ']':
			curMVMatrix = mvMatrixStack[mvMatrixStack.length - 1];
			curMVMatrix.matrix = true;
			mvMatrixStack.pop();
			break;
		default :
			//alert(this.finalString[i]);
			break;
		}
	}
}