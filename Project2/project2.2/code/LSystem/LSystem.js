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
				if (this.finalString[j] == this.ruleString[k][0]) {
					nextIterString = nextIterString + this.ruleString[k].slice(1);
					replaceNum++;
					break;
				}
			}
			if (replaceNum == 0 && this.finalString[j] != '\n' && this.finalString[j] != '\r' && this.finalString[j] != '\0') {
				nextIterString = nextIterString + this.finalString[j];
			}
		}
		this.finalString = nextIterString;
		alert(this.finalString);
	}
	
	var repStr = "";
	for (var i = 0; i < this.finalString.length; i++) {
		var replaced = 0;
		for (var j = 0; j < this.replaceString.length; j++) {
			if (this.finalString[i] == this.replaceString[j][0]) {
				repStr += this.replaceString[j][1];
				replaced = 1;
				break;
			}
		}
		if (replaced == 0 && this.finalString[j] != '\n' && this.finalString[j] != '\r' && this.finalString[j] != '\0') {
			repStr += this.finalString[i];
		}
	}
	this.finalString = repStr;
	
	alert(this.finalString);
}

LSystem.prototype.BuildPolyCylinder = function (radius, cylinderColorSet, sphereColorSet) {
	var pointList = [];
	pointList.push(vec3(0, 0, 0));
	pointList.push(vec3(0, 0, this.stepLength));
	var polyCylinder = new PolyCylinder(pointList, radius, cylinderColorSet, sphereColorSet, 1);
	return polyCylinder;
}

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
		}
	}
}