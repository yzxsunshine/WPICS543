Lamp.prototype = new Spirit3d();
Lamp.prototype.constructor = Lamp;

function Lamp (offset, lampHeight, radius, tubeColor, shadeColor) {
	this.height = lampHeight;
	this.tubeRadius = radius;
	this.ShadeRadius = 3 * radius;
	offset[1] = 0; //lampHeight / 2;
	this.SetTranslation(offset);
	var pointList = [];
	pointList.push(vec3(0, 0, 0));
	pointList.push(vec3(0, 0.8 * this.height, 0));
	pointList.push(vec3(0.2 * this.height, this.height, 0));
	pointList.push(vec3(0.35 * this.height, this.height, 0));
	pointList.push(vec3(0.4 * this.height, 0.9 * this.height, 0));
	var shade = new Spirit3d();
	shade.mesh = new Cylinder(this.tubeRadius, this.ShadeRadius, 0.1 * this.height, 10, tubeColor);
	shade.SetTranslation(vec3(0.4 * this.height, 0.875 * this.height, 0));
	shade.SetRotation(15, vec3(0, 0, 1));
	this.children.push(shade);
	var tube = new PolyCylinder(pointList, this.tubeRadius, tubeColor, tubeColor, 0);
	this.children.push(tube);
}
