var canvas;
var render;
var vbo;
var verticesLength;
var tbo;

var timeCounter = 0;

function main() {
	canvas = document.getElementById("screen");
	
	render = new CPU3D(canvas, callback, 0, "./cpu3d.min.js");
	render.initialise(canvas.width, canvas.height);
	render.clearColor(0, 0, 0, 0);

	var shaderID = render.getSBOId();
	render.assignSBOVertexShader(shaderID, "index.js", "vertexShader");
	render.assignSBOPixelShader(shaderID, "index.js", "fragmentShader");
	render.addSBOVertexAttribute(shaderID, "vertex", "position", 3);
	render.addSBOVertexAttribute(shaderID, "vertex", "texcoord", 2);
	render.addSBOVertexAttribute(shaderID, "pixel", "position", 4);
	render.addSBOVertexAttribute(shaderID, "pixel", "texcoord", 2);
	render.loadSBO(shaderID);
	render.bindSBO(shaderID);

	vbo = render.getVBOId();
	loadModel(vbo);

	tbo = render.getTBOId();
	loadTexture(tbo);
	
	render.setProperty("PROP_ENABLE_BACKFACECULL", false);
	
	var persMatrix = createPrespectiveMatrix(85, canvas.width/canvas.height, 0.1, 100);
	render.setShaderVariable("VERTEX_perspectiveMatrix", persMatrix);
	draw();
	
	return;
}

//----------------------------------------------------------------
// Draw Loop
//----------------------------------------------------------------
function draw() {
	timeCounter += 0.01;

	var objectMatrix = new Matrix();
	objectMatrix.makeTranslationMatrix(0, 0, -3);
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

function vertexShader(render, inputVertex, outputVertex) {
	outputVertex[0] = inputVertex[0];
	outputVertex[1] = inputVertex[1];
	outputVertex[2] = inputVertex[2];
	outputVertex[3] = 1;
	outputVertex[4] = inputVertex[3];
	outputVertex[5] = inputVertex[4];
	
	render.vecByMatrixCol(outputVertex, VERTEX_objectMatrix.data, 0);
	render.vecByMatrixCol(outputVertex, VERTEX_perspectiveMatrix.data, 0);
}

function fragmentShader(render, x, y, z, w, u, v) {
	return render.getTexturePixelColor(u, v, render.TEXTURE_0);
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
	
	//This example uses a cube which data is in the following array.
	var vertices=[-1,-1,1,0,1,1,-1,1,1,1,1,1,1,1,0,-1,-1,1,0,1,1,1,1,1,0,-1,1,1,
	0,0,-1,-1,-1,1,1,1,1,-1,0,0,1,-1,-1,0,1,-1,-1,-1,1,1,-1,1,-1,1,0,1,1,-1,0,0,
	-1,1,-1,0,0,-1,1,1,0,1,1,1,1,1,1,-1,1,-1,0,0,1,1,1,1,1,1,1,-1,1,0,-1,-1,-1,
	0,1,1,-1,1,1,0,-1,-1,1,0,0,-1,-1,-1,0,1,1,-1,-1,1,1,1,-1,1,1,0,1,-1,-1,1,1,
	1,1,-1,1,0,1,1,1,0,0,1,-1,-1,1,1,1,1,1,0,0,1,-1,1,0,1,-1,-1,-1,0,1,-1,1,1,1,
	0,-1,1,-1,0,0,-1,-1,-1,0,1,-1,-1,1,1,1,-1,1,1,1,0];
	verticesLength = 36;
	render.loadVBO(vbo, vertices);
}

//----------------------------------------------------------------
// Perspective Matrix
//----------------------------------------------------------------
function createPrespectiveMatrix(fieldOfView, aspectRatio, near, far) {	
	var top = near*Math.tan(fieldOfView * 3.14159265/360);
	var bottom = -top;	
	var right = top*aspectRatio;
	var left = -right;
	
	var result = new Matrix();
	result.set(0, 0, (2*near) / (right-left));
	result.set(1, 1, (2*near) / (top-bottom));
	result.set(2, 2, (near+far) / (far-near));
	result.set(3, 2, -1);
	result.set(2, 3, (2*near*far)/(far-near));
	result.set(3, 3, 0);
	
	return result;
}