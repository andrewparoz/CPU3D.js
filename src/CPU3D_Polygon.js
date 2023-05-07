///////////////////////////////////////////////////////////////////////////////
// Object Declaration
///////////////////////////////////////////////////////////////////////////////
CPU3D_Core.prototype.CPU3D_Polygon = function(vertices, width, height) {
	this.polygon(vertices, width, height);
}

///////////////////////////////////////////////////////////////////////////////
// Properites
///////////////////////////////////////////////////////////////////////////////
CPU3D_Core.prototype.CPU3D_Polygon.prototype.vertices;	//a list of the vertices, stored as vectors

CPU3D_Core.prototype.CPU3D_Polygon.prototype.vertexLength; //store how long a vertex is
CPU3D_Core.prototype.CPU3D_Polygon.prototype.verticesLength;
CPU3D_Core.prototype.CPU3D_Polygon.prototype.currentPosition;

///////////////////////////////////////////////////////////////////////////////
// Constructor
///////////////////////////////////////////////////////////////////////////////
CPU3D_Core.prototype.CPU3D_Polygon.prototype.polygon = function() {
	this.vertices = null;
	this.verticesLength = 0;
	this.currentPosition = 0;
}

///////////////////////////////////////////////////////////////////////////////
// Functions
///////////////////////////////////////////////////////////////////////////////
CPU3D_Core.prototype.CPU3D_Polygon.prototype.createPoylgon = function(vertices, width, height) {
	var withinFrame = this.withinFrame(vertices, width, height);
	var outOfFrame = this.outOfFrame(vertices, width, height);
	
	this.vertexLength = vertices[0].length;
	
	if (!withinFrame && !outOfFrame) { //it is neither compeltely in frame or out of frame.
		this.vertices = vertices;
		this.clipPolygon(this.vertices, width, height);
	} else if (withinFrame) { //just make a copy of the vertices
		var verticesLength = vertices.length;
		var newVertices = new Array();
		for (var i = 0; i < verticesLength; i++) {
			newVertices.push(vertices[i]);
		}
		this.vertices = newVertices;
	} else {		//out of screen. clear array.
		this.vertices = new Array();
	}
	
	return this.vertices;
}

/**
 * Returns true if the polygon given is within the screen bound by 0 - width, 0 - height.ca
 */
CPU3D_Core.prototype.CPU3D_Polygon.prototype.withinFrame = function(vertices, width, height) {	
	//v1 is always within the 
	for (var i = 0; i < vertices.length; i++) {
		var vertex = vertices[i];
		if (vertex[0] < 0) {				//left
			return false;
		} else if (vertex[0] >= width) {	//right
			return false;
		} else if (vertex[1] < 0) {			//top
			return false;
		} else if (vertex[1] >= height) {	//bottom
			return false;
		}
	}
	return true;
}

/**
 * Returns true if the polygon given is compeltely out of the frame screen bound by 0 - width, 0 - height.
 * Useful for threading when the screen is devided up.
 */
CPU3D_Core.prototype.CPU3D_Polygon.prototype.outOfFrame = function(vertices, width, height) {	
	var left = 0;
	var right = 0;
	var top = 0;
	var bottom = 0;
	var length = vertices.length;
	
	for (var i = 0; i < length; i++) {
		var vertex = vertices[i];
		//Check Left
		if (vertex[0] < 0) {
			left++;
		}
		
		//Check Right
		if (vertex[0] >= width) {
			right++;
		}
	
		//Check Top
		if (vertex[1] < 0) {
			top++;
		}
	
		//Check Bottom
		if (vertex[1] >= height) {
			bottom++;
		}
	}
	
	if (left == length || right == length || top == length || bottom == length) {
		return true;
	} else {
		return false;
	}
}

CPU3D_Core.prototype.CPU3D_Polygon.prototype.clipPolygon = function(vertices, width, height) {	
	var verticesOutput;
	var v0;
	var v1;
	var v2;

	var clip;
	var j;
	
	verticesOutput = new Array();
	for (var j = 0; j < this.vertices.length; j++) {
		v0 = j == 0 ? this.vertices[this.vertices.length-1] : this.vertices[j-1];
		v1 = this.vertices[j];
		v2 = this.vertices[(j+1)%this.vertices.length];

		//Left
		clip = this.clippingCheck(v1[0], v2[0], 0, false);	
		this.verticesModify(v1, v2, 0, 0, 0, height, clip, verticesOutput);
	}
	this.vertices = verticesOutput;
	
	verticesOutput = new Array();
	for (var j = 0; j < this.vertices.length; j++) {
		v0 = j == 0 ? this.vertices[this.vertices.length-1] : this.vertices[j-1];
		v1 = this.vertices[j];
		v2 = this.vertices[(j+1)%this.vertices.length];

		//Right
		clip = this.clippingCheck(v1[0], v2[0], width-1, true);
		this.verticesModify(v1, v2, width-1, 0, width-1, height, clip, verticesOutput);
	}
	this.vertices = verticesOutput;
	
	verticesOutput = new Array();
	for (var j = 0; j < this.vertices.length; j++) {
		v0 = j == 0 ? this.vertices[this.vertices.length-1] : this.vertices[j-1];
		v1 = this.vertices[j];
		v2 = this.vertices[(j+1)%this.vertices.length];

		//Top
		clip = this.clippingCheck(v1[1], v2[1], 0, false);
		this.verticesModify(v1, v2, 0, 0, width-1, 0, clip, verticesOutput);
	}
	this.vertices = verticesOutput;
	
	verticesOutput = new Array();
	for (var j = 0; j < this.vertices.length; j++) {
		v0 = j == 0 ? this.vertices[this.vertices.length-1] : this.vertices[j-1];
		v1 = this.vertices[j];
		v2 = this.vertices[(j+1)%this.vertices.length];
		
		//Bottom
		clip = this.clippingCheck(v1[1], v2[1], height, true);
		this.verticesModify(v1, v2, 0, height, width-1, height, clip, verticesOutput);
	}
	this.vertices = verticesOutput;
	
	return;
}

CPU3D_Core.prototype.CPU3D_Polygon.prototype.clippingCheck = function(v1, v2, value, side) {
	
	var v1In = true;
	var v2In = true;
	
	if (side) {	//Greater than
		if (v1 > value) {
			v1In = false;
		}
		if (v2 > value) {
			v2In = false;
		}
	} else {	//Less than
		if (v1 < value) {
			v1In = false;
		}
		if (v2 < value) {
			v2In = false;
		}
	}
	
	if (!v1In && v2In) {
		return 0;
	} else if (v1In && v2In) {
		return 1;
	} else if (v1In && !v2In) {
		return 2;
	} else if (!v1In && !v2In) {
		return 3;
	}
}

/** Input:
	v1 - vertex1
	v2 - vertex2
	value - clipping value
	side - true is greater than, false is less than
	
	Returns:
	0: First vertex is outside and the second is inside
	1: Both the vertices are inside
	2: First vertex is inside, the second outside
	3: Both vertices are outside
*/
CPU3D_Core.prototype.CPU3D_Polygon.prototype.verticesModify = function(v1, v2, b1x, b1y, b2x, b2y, clip, output) {
	if (clip == 0) {
		output.push(this.getIntersection(v1, v2, b1x, b1y, b2x, b2y));
		output.push(v2);
	} else if (clip == 1) {
		output.push(v2);
	} else if (clip == 2) {
		output.push(this.getIntersection(v1, v2, b1x, b1y, b2x, b2y));
	} else if (clip == 3) {
	}
}

CPU3D_Core.prototype.CPU3D_Polygon.prototype.getIntersection = function(v1, v2, b1x, b1y, b2x, b2y) {
	var x;
	var y;

	var eqM;
	var eqC;
	
	if (v2[0] != v1[0]) {		//line v1-v2 is not vertical
		eqM = (v2[1]-v1[1]) / (v2[0]-v1[0]);
		eqC = v1[1]-eqM*v1[0];

		if (b1x == b2x) {		//line b1-b2 is Vertical
			x = b1x;
			y = eqM*b1x+eqC;
		} else if (b1y == b2y) {	//line b1-b2 is Horizontal
			x = (b1y-eqC)/eqM;
			y = b1y;
		}
	} else {
		x = v1[0];
		y = b1y;
	}

	//we cannot assume when using 64-bit float that the numbers will be the exasct same.
	//we compare the difference to 0.5 to check if they are actually different.
	var xDifference = this.getDifference(v1[0], v2[0]);
	var yDifference = this.getDifference(v1[1], v2[1]);
	var percentage = 0;
	if (yDifference > 0.1) {
		percentage = y > v1[1] ? (y-v1[1])/yDifference : (v1[1]-y)/yDifference;
	} else {	
		percentage = x > v1[0] ? (x-v1[0])/xDifference : (v1[0]-x)/xDifference;
	}
	
	var newVertex = new Float32Array(this.vertexLength);
	newVertex[0] = (x+0.5) >> 0;
	newVertex[1] = (y+0.5) >> 0;
	for (var i = 2; i < this.vertexLength; i++) {
		var difference = this.getDifference(v1[i], v2[i])
		newVertex[i] = v1[i] < v2[i] ? v1[i]+(difference*percentage) : v1[i]-(difference*percentage);
	}
	return newVertex;
}

CPU3D_Core.prototype.CPU3D_Polygon.prototype.getDifference = function(n1, n2) {
	
	if (n1 >= 0 && n2 >= 0) {
		return (n2 > n1) ? (n2 - n1) : (n1 - n2);
	} else if (n1 < 0 && n2 >= 0) {
		return (-n1) + n2;
	} else if (n2 < 0 && n1 >= 0) {
		return (-n2) + n1;
	} else if (n1 < 0 && n2 < 0) {
		return (n2 < n1) ? (-(n2 - n1)) : (-(n1 - n2));
	}
}