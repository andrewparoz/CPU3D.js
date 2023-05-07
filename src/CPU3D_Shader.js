CPU3D_Core.prototype.CPU3D_Shader = function(render, id) {
	this.CPU3D_Shader(render, id);
}

///////////////////////////////////////////////////////////////////////////////
// Properites
///////////////////////////////////////////////////////////////////////////////
/** Stores a reference to the render object for shader programs to use. */
CPU3D_Core.prototype.CPU3D_Shader.prototype.render;

CPU3D_Core.prototype.CPU3D_Shader.prototype.properties;

CPU3D_Core.prototype.CPU3D_Shader.prototype.vertexLoop;
CPU3D_Core.prototype.CPU3D_Shader.prototype.createEdge;
CPU3D_Core.prototype.CPU3D_Shader.prototype.scanline;

CPU3D_Core.prototype.CPU3D_Shader.prototype.vertexFunction;
CPU3D_Core.prototype.CPU3D_Shader.prototype.pixelFunction;

CPU3D_Core.prototype.CPU3D_Shader.prototype.id;
CPU3D_Core.prototype.CPU3D_Shader.prototype.created;

CPU3D_Core.prototype.CPU3D_Shader.prototype.inputCount; //only need count. Types dont matter as user gets to choose what they do with them.
CPU3D_Core.prototype.CPU3D_Shader.prototype.outputCount; //only need count. Types dont matter as user gets to choose what they do with them.

CPU3D_Core.prototype.CPU3D_Shader.prototype.pixelVertexCount;
CPU3D_Core.prototype.CPU3D_Shader.prototype.pixelVertexOffset;

CPU3D_Core.prototype.CPU3D_Shader.prototype.pixelTexCoordCount;
CPU3D_Core.prototype.CPU3D_Shader.prototype.pixelTexCoordOffset;

CPU3D_Core.prototype.CPU3D_Shader.prototype.pixelOtherCount;
CPU3D_Core.prototype.CPU3D_Shader.prototype.pixelOtherOffset;

///////////////////////////////////////////////////////////////////////////////
// Input Constants
//////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
// Globals
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
// Constructor
///////////////////////////////////////////////////////////////////////////////
CPU3D_Core.prototype.CPU3D_Shader.prototype.CPU3D_Shader = function(render, id) {
	this.render = render;
	this.properties = new Array();
	this.created = false;
	this.id = id;
	
	eval("CPU3D_Core.prototype.vertexLoop_"+this.id+";");
	eval("CPU3D_Core.prototype.createEdge_"+this.id+";");
	eval("CPU3D_Core.prototype.scanline_"+this.id+";");

	eval("CPU3D_Core.prototype.vertexFunction_"+this.id+";");
	eval("CPU3D_Core.prototype.pixelFunction_"+this.id+";");

	return;
}

///////////////////////////////////////////////////////////////////////////////
// Methods
///////////////////////////////////////////////////////////////////////////////
CPU3D_Core.prototype.CPU3D_Shader.prototype.loadProperties = function(properties) {
	
	this.inputCount = 0;
	this.outputCount = 0;

	this.pixelVertexCount = 0;
	this.pixelVertexOffset = 0;

	this.pixelTexCoordCount = 0;
	this.pixelTexCoordOffset = 0;

	this.pixelOtherCount = 0;
	this.pixelOtherOffset = 0;
	
	var shader;
	var type;
	var length;
	var pixelOffset = 0;
	
	var hasPosition = false;
	
	for (var i = 0; i < properties.length; i++) {
		shader = properties[i].shader;
		type = properties[i].type;
		length = properties[i].length;
		if (shader == "vertex" || shader == "VERTEX") {
			this.inputCount += length;
			
		} else if (shader == "pixel" || shader == "PIXEL" || shader == "FRAGMENT") {
			if (type == "position" || type == "POSITION") {
				hasPosition = true;
				if (length != 4) {
					console.log("cpu3d Error: 'POSITION' property in addSBOVertexAttribute() must have a length of 4. {X, Y, Z, W}");
				}
				this.pixelVertexCount = 4;
				this.pixelVertexOffset = pixelOffset;
				
			} else if (type == "texcoord" || type == "TEXCOORD") {
				this.pixelTexCoordCount = length;
				this.pixelTexCoordOffset = pixelOffset;
				
			} else {
				this.pixelOtherCount += length;
				//this.pixelOtherOffset += pixelOffset;
			}
			pixelOffset += length;
			this.outputCount += length;
		} else {
			console.log("cpu3d Error: " + shader + " is an invalid shader for addSBOVertexAttribute().");
		}
	}
	
	//in the case that the pixel position offset is more then the texcoord offset, add 4 to the texcoord offset.
	//This is because in the pipeline, position is always ordered first.
	if (this.pixelTexCoordOffset < this.pixelVertexOffset) {
		this.pixelTexCoordOffset += 4;
	}
	
	if (!hasPosition) {
		console.log("cpu3d Error: A 'position' property must be included for the pixel shader");
		console.log('cpu3d Error: EG: {shader: "pixel", type: "position", length: 4}');
	}
}

CPU3D_Core.prototype.CPU3D_Shader.prototype.setVertexFunction = function(vertexFunction) {
	this.vertexFunction = vertexFunction;
	if (this.vertexFunction == undefined) {
		console.log("cpu3d Error: "+vertexFunction+" vertex shader function is undefined");
		return;
	}
	this.render["vertexFunction_"+this.id] = this.vertexFunction;
}

CPU3D_Core.prototype.CPU3D_Shader.prototype.setPixelFunction = function(pixelFunction) {
	this.pixelFunction = pixelFunction;
	if (this.pixelFunction == undefined) {
		console.log("cpu3d Error: "+pixelFunction+" fragment shader function is undefined");
		return;
	}
	this.render["pixelFunction_"+this.id] = this.pixelFunction;
}

CPU3D_Core.prototype.CPU3D_Shader.prototype.addSBOVertexAttribute = function(shader, type, length) {
	this.properties.push({shader: shader, type: type, length: length});
}

CPU3D_Core.prototype.CPU3D_Shader.prototype.createShader = function() {
	this.created = true;
	
	this.loadProperties(this.properties);
	
	this.vertexLoopCreation(this.id);
	this.createEdgeCreation(this.properties, this.id);
	this.scanlineCreation(this.properties, this.id);
	
	this.vertexLoop = this.render["vertexLoop_"+this.id];
	this.createEdge = this.render["createEdge_"+this.id];
	this.scanline = this.render["scanline_"+this.id];
	
}

CPU3D_Core.prototype.CPU3D_Shader.prototype.useShader = function() {
	this.render.vertexLoop = this.vertexLoop;
	this.render.createEdge = this.createEdge;
}

CPU3D_Core.prototype.CPU3D_Shader.prototype.vertexLoopCreation = function(shaderID) {

	var numVariables = this.inputCount;

	var functionString = ""
+"CPU3D_Core.prototype.vertexLoop_"+shaderID+" = function(vertexBuffer, startIndex, endIndex, faceVertices, intputVertex, inputLength) {"

+"	var outputVertex;"

+"	var i = startIndex;"
+"	var v;"
+"	while (i < endIndex) {"
+"		for (v = 0; (v < 3) && (i < endIndex); v++) {";

	for (var i = 0; i < numVariables; i++) {
		functionString += "			intputVertex["+i+"] = vertexBuffer[i+"+i+"];";
	}
	functionString += ""
+"			outputVertex = faceVertices[v];"
+"			this.vertexFunction_"+shaderID+"(this, intputVertex, outputVertex);"
+"			i += inputLength;"
+"		}"
+"		this.pipeline(faceVertices);"

+"	}"
+"}";

	//console.log(functionString);
	
	eval(functionString);

}

CPU3D_Core.prototype.CPU3D_Shader.prototype.createEdgeCreation = function(propertiesList, shaderID) {
	var xIndex = 0;
	var yIndex = 1;
	
	var numVariables = this.outputCount;
	
	var functionString = ""
+"CPU3D_Core.prototype.createEdge_"+shaderID+" = function(vertices, indexTopL, indexTopR, yEnd, direction) {"

+"	var vL = vertices[indexTopL];"
+"	var vR = vertices[indexTopR];"
+"	var steps = 0.0;"
	
+"	var indexL = indexTopL;"
+"	var countL = 0;"
+"	var v1L = vL;"
+"	var v2L = vL;"
	
+"	var indexR = indexTopR;"
+"	var countR = 0;"
+"	var v1R;"
+"	var v2R = vR;"
	
	//x and y are used for checks, so they must be recorded special.
+"		var _xL = v2L["+xIndex+"];"
+"		var _xLChange = 0.0;"
+"		var _xR = v2R["+xIndex+"];"
+"		var _xRChange = 0.0;"

+"		var y = vL["+yIndex+"];";
	
	for (var i = 0; i < numVariables; i++) {
		if (i != xIndex && i != yIndex) {
			functionString += "			var _p"+i+"L = v2L["+i+"];";
			functionString += "			var _p"+i+"LChange = 0.0;";
			functionString += "			var _p"+i+"R = v2R["+i+"];";
			functionString += "			var _p"+i+"RChange = 0.0;";
		}
	}
	functionString += ""
	
+"	var verticesLength = vertices.length;"

+"	for (y; y < yEnd; y) {"
+"		while (countL == 0) {"
+"			indexL = (indexL + direction) % verticesLength;"
+"			indexL = indexL < 0 ? indexL = verticesLength - 1 : indexL;"
+"			v1L = v2L;"
+"			v2L = vertices[indexL];"
+"			countL = v2L["+yIndex+"] - v1L["+yIndex+"];"
+"			if (countL > 0) {"
+"				steps = 1 / countL;"
+"				_xLChange = (v2L[0] - _xL) * steps;";
				
	for (var i = 0; i < numVariables; i++) {
		if (i != xIndex && i != yIndex) {
			functionString += "			_p"+i+"LChange = (v2L["+i+"] - _p"+i+"L) * steps;";
		}
	}
	functionString += ""

+"			}"
+"		}"
+"		while (countR == 0) {"
+"			indexR = (indexR - direction) % verticesLength;"
+"			indexR = indexR < 0 ? indexR = verticesLength - 1 : indexR;"
+"			v1R = v2R;"
+"			v2R = vertices[indexR];"
+"			countR = v2R["+yIndex+"] - v1R["+yIndex+"];"
+"			if (countR > 0) {"
+"				steps = 1 / countR;"
+"				_xRChange = (v2R[0] - _xR) * steps;"
				
	for (var i = 0; i < numVariables; i++) {
		if (i != xIndex && i != yIndex) {
			functionString += "			_p"+i+"RChange = (v2R["+i+"] - _p"+i+"R) * steps;";
		}
	}
	functionString += ""

+"			}"
+"		}"
+"		for (y; countL > 0 && countR > 0; y++) {"

+"			this.scanline_"+shaderID+"("
	for (var i = 0; i < numVariables; i++) {
		if (i == xIndex) {
			functionString += "_xL<<0, _xR<<0";
		} else if (i == yIndex) {
			functionString += "y, y";
		} else {
			functionString += "_p"+i+"L, _p"+i+"R";
		}
		if (i+1 != numVariables) {
			functionString += ", ";
		}
	}
	functionString += ");"
	
+"			countL--;"
+"			countR--;"
+"			_xL += _xLChange;"
+"			_xR += _xRChange;";
	
	for (var i = 0; i < numVariables; i++) {
		if (i != xIndex && i != yIndex) {
			functionString += "			_p"+i+"L += _p"+i+"LChange;";
			functionString += "			_p"+i+"R += _p"+i+"RChange;";
		}
	}
	functionString += ""

+"		}"
+"	}"
+"}";

	//console.log(functionString);
	
	eval(functionString);
}

CPU3D_Core.prototype.CPU3D_Shader.prototype.scanlineCreation = function(propertiesList, shaderID) {
	
	var numVariables = this.outputCount;
	
	var xIndex = 0;
	var yIndex = 1;
	var zIndex = 2;
	var wIndex = 3;
	
	var functionString = ""
+"CPU3D_Core.prototype.scanline_"+shaderID+" = function(";

	for (var i = 0; i < numVariables; i++) {
		functionString += "_p"+i+"L, ";
		functionString += "_p"+i+"R";
		if (i < numVariables-1) {
			functionString += ", ";
		}
	}
	functionString += ""

+") {"

+"	var x = _p"+xIndex+"L;"

+"	var y = _p"+yIndex+"L;"

+"	var indexStart = (y * this.width) + _p"+xIndex+"L;"
+"	var indexEnd = ((y * this.width) + _p"+xIndex+"R) + 1;"
+"	var invertedXChange = 1/((_p"+xIndex+"R - _p"+xIndex+"L) + 1);"

+"	var z = _p"+zIndex+"L;"
+"	var zChange = ((_p"+zIndex+"R - _p"+zIndex+"L) * invertedXChange);"

+"	var w = _p"+wIndex+"L;"
+"	var wChange = (_p"+wIndex+"R - _p"+wIndex+"L) * invertedXChange;";

	for (var i = 0; i < numVariables; i++) {
		if (i != xIndex && i != yIndex && i != zIndex && i != wIndex) {
			functionString += "	var _p"+i+" = _p"+i+"L;";
			functionString +="	var _p"+i+"Change = (_p"+i+"R - _p"+i+"L) * invertedXChange;";
		}
	}

	functionString += ""
+"	var pixelBuffer = this.pixelBuffer_Uint32;"
+"	var depthBuffer = this.depthBuffer_Float32;"
+"	var i = indexStart;"
+"	var useDepthBuffer = this.PROP_ENABLE_Z_BUFFER;"
+"	while (i < indexEnd) {		"	
+"		if (!useDepthBuffer || z > this.depthBuffer_Float32[i]) {"
+"			var wInvert = 1/w;";

	functionString += "			var colour = this.pixelFunction_"+shaderID+"(this, "
	for (var i = 0; i < numVariables; i++) {
		if (i == xIndex) {
			functionString += "x";
		} else if (i == yIndex) {
			functionString += "y";
		} else if (i == zIndex) {
			functionString += "z";
		} else if (i == wIndex) {
			functionString += "w";
		} else {
			functionString += "_p"+i+"*wInvert";
		}
		if (i < numVariables-1) {
			functionString += ", ";
		}
	}
	functionString += ") >>> 0;";
	
	functionString += ""
+"			if (colour > 0) {"
+"				depthBuffer[i] = z;"
+"				pixelBuffer[i] = colour;"
+"			}"
+"		}"
+"		i++;"
+"		x++;"
+"		z += zChange;"
+"		w += wChange;"

	for (var i = 0; i < numVariables; i++) {
		if (i != xIndex && i != yIndex && i != zIndex && i != wIndex) {
			functionString += "_p"+i+" += _p"+i+"Change;";
		}
	}

	functionString += ""
+"	}"
+"	return;"
+"}";
	
	//console.log(functionString);
	
	eval(functionString);
}