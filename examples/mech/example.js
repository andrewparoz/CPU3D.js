var canvas;
var render;
var vbo;
var verticesLength;
var tbo;

var timeCounter = 0;

function main() {
	canvas = document.getElementById("screen");
	
	render = new CPU3D(canvas, callback, 0, "cpu3d.min.js");
	render.initialise(canvas.width, canvas.height);
	render.clearColor(0, 0, 0, 0);

	var shaderID = render.getSBOId();
	render.assignSBOVertexShader(shaderID, "index.js", "vertexShader");
	render.assignSBOPixelShader(shaderID, "index.js", "fragmentShader");
	render.addSBOVertexAttribute(shaderID, "VERTEX", "position", 3);
	render.addSBOVertexAttribute(shaderID, "VERTEX", "normal", 3);
	render.addSBOVertexAttribute(shaderID, "VERTEX", "texcoord", 2);
	render.addSBOVertexAttribute(shaderID, "PIXEL", "position", 4);
	render.addSBOVertexAttribute(shaderID, "PIXEL", "texcoord", 2);
	render.addSBOVertexAttribute(shaderID, "PIXEL", "none", 1);
	render.loadSBO(shaderID);
	render.bindSBO(shaderID);

	vbo = render.getVBOId();
	loadModel(vbo);

	tbo = render.getTBOId();
	loadTexture(tbo);

	this.render.setProperty("PROP_ENABLE_BACKFACECULL", true);
	this.render.setProperty("PROP_ENABLE_Z_BUFFER", true);
	this.render.setProperty("PROP_ENABLE_TRIANGLE_OUTLINE", false);
	this.render.setProperty("PROP_ENABLE_TRIANGLE_OVERSCAN", false);
	
	var persMatrix = new CPU3D_Matrix()
	persMatrix.makePrespectiveMatrix(85, canvas.width/canvas.height, 0.1, 100);

	render.setShaderVariable("VERTEX_perspectiveMatrix", persMatrix);
	
	draw();

	return;
}

//----------------------------------------------------------------
// Draw Loop
//----------------------------------------------------------------
function draw() {
	timeCounter += 0.01;

	var objectMatrix = new CPU3D_Matrix();
	objectMatrix.makeTranslationMatrix(0, 0, -10);
	objectMatrix.makeXRotationMatrix(0.6);
	objectMatrix.makeYRotationMatrix(timeCounter/5);
	render.setShaderVariable("VERTEX_objectMatrix", objectMatrix);
	
	render.bindTBO(tbo, 0);
	
	render.clearBuffer(0);
	render.draw(vbo, 0, verticesLength);
	render.getBuffer();
}

function callback() {
	setTimeout(draw, 0);
}

//----------------------------------------------------------------
// Shaders
//----------------------------------------------------------------
var VERTEX_objectMatrix;
var VERTEX_perspectiveMatrix;

var VERTEX_normal = new Float32Array(4);

var VERTEX_light = [1/3, 1/3, 1/3, 1];

function vertexShader(render, inputVertex, outputVertex) {
	outputVertex[0] = inputVertex[0]; //x
	outputVertex[1] = inputVertex[1]; //y
	outputVertex[2] = inputVertex[2]; //z
	outputVertex[3] = 1;			  //w	
	outputVertex[4] = inputVertex[6]; //u
	outputVertex[5] = inputVertex[7]; //v

	//render.vecByMatrixCol(outputVertex, VERTEX_objectMatrix.data, 0);	
	//render.vecByMatrixCol(outputVertex, VERTEX_cameraProjectionMatrix.data, 0);	

	render.vecByMatrixCol(outputVertex, VERTEX_objectMatrix.data, 0);
	render.vecByMatrixCol(outputVertex, VERTEX_perspectiveMatrix.data, 0);
	
	//do checks on the normal map here
	VERTEX_normal[0] = inputVertex[3];
	VERTEX_normal[1] = inputVertex[4];
	VERTEX_normal[2] = inputVertex[5];
	VERTEX_normal[3] = 1;	
	//render.vecByMatrixCol(VERTEX_normal, VERTEX_normalMatrix.data, 0);	

	light = dotProduct(VERTEX_normal, VERTEX_light) * 2;
	if (light < 0.25) {
		light = 0.25;
	}
	if (light > 1) {
		light = 1;
	}
	
	outputVertex[6] = light;
}

function fragmentShader(render, x, y, z, w, u, v, lit) {

	var pixelColor = render.getTexturePixelColor(u, v, render.TEXTURE_0) << 0;
	
	var cr = (pixelColor & 255) * lit;
	var cg = ((pixelColor & 65280) >>> 8) * lit;
	var cb = ((pixelColor & 16711680) >>> 16) * lit;

	return (4278190080) | (cb << 16) | (cg <<  8) | cr;

}

function dotProduct(vertex1, vertex2) {
	var result = (vertex1[0] * vertex2[0]) + (vertex1[1] * vertex2[1]) + (vertex1[2] * vertex2[2]);
	return result;
}

//----------------------------------------------------------------
// Texture Loading Code
//----------------------------------------------------------------
function loadTexture(tbo) {	

	//resize canvas to size of texture
	var originalWidth = canvas.width;
	var originalHeight = canvas.height;
	canvas.width = 256;
	canvas.height = 256;

	//drawing the texture onto our canvas.
	var context = canvas.getContext("2d");

	//draw the texture
	context.strokeStyle = "green";
	context.lineWidth = 32;
	context.beginPath();
	context.moveTo(0, 0);
	context.strokeRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = "#A3B9B0";
	context.fillRect(0, 0, canvas.width, canvas.height);
	
	//grab the pixel array
	var textureData = context.getImageData(0, 0, canvas.width, canvas.height);
	
	canvas.width = originalWidth;
	canvas.height = originalHeight;
	
	//load the texture into cpu3d
	render.loadTBO(tbo, textureData.data, textureData.width, textureData.height);

	return;
}

//----------------------------------------------------------------
// Model Creating Code
//----------------------------------------------------------------
function loadModel() {

	//Place any model loading code here.
	$.getJSON("./mech.json", "", modelLoaded);
	verticesLength = 36;
	render.loadVBO(vbo, []);

}

var modelLoaded = function(req) {
		
	//vbo = render.getVBOId();

	model = new Model(req);

	verticesLength = model.faces.length*3;
	let verticesData = new Float32Array(verticesLength*8);

	let i = 0;
	for (let j = 0; j < model.faces.length; j++) {
		let face = model.getFaceByIndex(j);
		let normal = face.getNormal();
		for (let k = 0; k < 3; k++) {
			let vertex = model.getVertexByIndex(face.getVertexByIndex(k));
			verticesData[i] = vertex.getPosition().getX();
			i++;
			verticesData[i] = vertex.getPosition().getY();
			i++;
			verticesData[i] = vertex.getPosition().getZ();
			i++;

			verticesData[i] = normal.getX();
			i++;
			verticesData[i] = normal.getY();
			i++;
			verticesData[i] = normal.getZ();
			i++;

			let uv = face.getUVByIndex(k);
			verticesData[i] = uv.getX();
			i++;
			verticesData[i] = uv.getY();
			i++;
		}
	}

	render.loadVBO(vbo, verticesData);	
	return;
}

var imageLoaded = function(e) {
	
	var source = e.target;
	if (source == undefined) {	//for IE
		source = e.srcElement;
	}

	var id = (source.id).split(":")[0];
	
	var texture = source;
	
	var textureLoader = document.getElementById("textureLoader");
	textureLoader.width = texture.width;
	textureLoader.height = texture.height;
	var loaderContext = textureLoader.getContext("2d");
	
	loaderContext.clearRect(0, 0, texture.width, texture.height);
	loaderContext.drawImage(texture, 0, 0);
	var textureData = loaderContext.getImageData(0, 0, texture.width, texture.height);
	
	textureLoader.width = 0;
	textureLoader.height = 0;
	
	render.loadTBO(id, textureData.data, textureData.width, textureData.height);
	
	return;

}