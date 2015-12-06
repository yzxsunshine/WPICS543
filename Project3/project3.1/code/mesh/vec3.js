function vec3Add(u, v) {
	return vec3(u[0] + v[0], u[1] + v[1], u[2] + v[2]);
}

function vec3Subtract(u, v) {
	return vec3(u[0] - v[0], u[1] - v[1], u[2] - v[2]);
}

function vec3Multiply(u, s) {
	return vec3(u[0] * s, u[1] * s, u[2] * s);
}

function vec3Divide(u, s) {
	return vec3(u[0] / s, u[1] / s, u[2] / s);
}

function vec3DotProduct(u, v) {
	return u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
}

function vec3CrossProduct (u, v) {
	return vec3(u[1] * v[2] - v[1] * u[2], u[2] * v[0] - v[2] * u[0], u[0] * v[1] - v[0] * u[1]);
}

function vec3Magnitude (v) {
	var magnitude = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
	return Math.sqrt(magnitude);
}

function vec3Normalize(v) {
	var magnitude = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
	magnitude = Math.sqrt(magnitude);
	if(magnitude < 0.0001) {
		v = vec3Multiply(v, 0);
		alert("Divide 0!");
	}
	else 
		v = vec3Divide(v, magnitude);
	return v;
}

function vec3UpgradeToVec4(u) {
	return vec4(u[0], u[1], u[2], 1.0);
}

function vec3MultMatrix3x3 (m, u) {
	var v = vec3(0, 0, 0);
	for (var i = 0; i < 3; i++)
		v[i] = m[i][0] * u[0] + m[i][1] * u[1] + m[i][2] * u[2];
	return v;
}