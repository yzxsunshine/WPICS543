function vec3Add(u, v) {
	return vec3(u[0] + v[0], u[1] + v[1], u[2] + v[2]);
}

function vec3Subtract(u, v) {
	return vec3(u[0] - v[0], u[1] - v[1], u[2] - v[2]);
}

function vec3Scale(u, s) {
	return vec3(u[0] / s, u[1] / s, u[2] / s);
}

function vecDot(u, v) {
	return u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
}

function vec3CrossProduct (u, v) {
	return vec3(u[1] * v[2] - v[1] * u[2], u[2] * v[0] - v[2] * u[0], u[0] * v[1] - v[0] * u[1]);
}

function vec3Normalize(v) {
	var magnitude = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
	magnitude = Math.sqrt(magnitude);
	if(magnitude < 0.0001) {
		v = vec3Scale(v, 0);
		alert("Divide 0!");
	}
	else 
		v = vec3Scale(v, 1.0 / magnitude);
	return v;
}

function vec3UpgradeToVec4(u) {
	return vec4(u[0], u[1], u[2], 1.0);
}