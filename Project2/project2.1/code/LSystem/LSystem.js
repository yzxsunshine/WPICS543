function rulesProbability(prob, str) {
	this.probability = [];
	this.string = [];
	this.probability.push(prob);
	this.string.push(str);
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
			  else if (item.length > 1) {
				  items[1].replace('\r', '');
				  items[1].replace('\n', '');
				  items[1].replace(' ', '');
				  if(typeof rules[items[0][0]] == undefined || typeof rules[items[0][0]] == null) {
					  if (items[0][1] == "(") {
						  var prob = parseFloat(items[0].substring(2, items[0].length - 2));
						  var newRule = new Probability(prob, items[1]);
						  rules[items[0][0]] = {newRule};
					  }
					  else {
						  var newRule = new Probability(1, items[1]);
						  rules[items[0][0]] = {newRule};
					  }
				  }
				  else {
					  var prob = parseFloat(items[0].substring(2, items[0].length - 2));
					  var newRule = new Probability(prob, items[1]);
					  rules[items[0][0]].push(newRule);
				  }
				  //rules.push(items[0][0] + items[1]);
			  }
		  }
		  lSystem = new LSystem(len, iter, rot, rep, start, rules);
		  //document.getElementById("LSystemOutput").innerText = lSystem.finalString;
		  document.getElementById("LSystemOutput").innerHTML = "<p>" + lSystem.finalString + "</p>";
      }
      r.readAsText(f);
    } 
	else { 
      alert("Failed to load file!");
    }
}

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
					if(this.ruleString[k][1] == "(") {
						
					}
					else {
						nextIterString = nextIterString + this.ruleString[k].slice(1);	// nor stochastic
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