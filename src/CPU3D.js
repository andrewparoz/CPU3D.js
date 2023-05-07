///////////////////////////////////////////////////////////////////////////////
// Object Declaration
///////////////////////////////////////////////////////////////////////////////
class CPU3D {
	
	///////////////////////////////////////////////////////////////////////////////
	// Properites
	///////////////////////////////////////////////////////////////////////////////
	#width;
	#height;

	#render;		//if threads are not being used, this is where the render object is stored.

	#callback;

	#threads;
	#threadCount;
	#threadResponseCount;

	#vertexBank;			//Stores a boolean for if an index is used. Mirrors what the render has.
	#textureBank;		//Stores a boolean for if an index is used. Mirrors what the render has.
	#shaderBank;			//Stores a boolean for if an index is used. Mirrors what the render has.

	#pixelBuffer_Uint8;	//stores the buffer that is returned piecemeal by the threads

	#messageQueue;

	#initialised; //flag set once initialise has been run. Stops any commands going through early.

	#canvas;
	#canvasContext;
	#imageData;

	#filepath; //stores the filepath to the library. May need to be edited if library is not in root and threads are used

	///////////////////////////////////////////////////////////////////////////////
	// Constants
	//////////////////////////////////////////////////////////////////////////////
	//Not all broswers support Uint8Clamped arrays, so if it is not available we have to revert back to Uint8 arrays.
	//Uint8Clamped arrays are faster.
	#CONT_USING_UINT8CLAMPED;

	//Not all broswers support the set function for typed array. this lets the interface know what to use, set or a manual copy.
	#CONT_USING_ARRAY_SET;

	//Determines if we are using a callback with pixel array or if we are drawings straight to the canvas.
	#CONT_USING_CALLBACK;
	#CONT_USING_CANVAS;

	//Lets us know if we are using threads for this rendering.
	#CONT_USING_THREADS;

	///////////////////////////////////////////////////////////////////////////////
	// Globals
	///////////////////////////////////////////////////////////////////////////////


	///////////////////////////////////////////////////////////////////////////////
	// Constructor
	///////////////////////////////////////////////////////////////////////////////
	constructor(canvas, callback, threadCount, filepath) {	
		
		this.CONT_USING_UINT8CLAMPED = false;
		this.CONT_USING_ARRAY_SET = false;
		this.CONT_USING_CALLBACK = false;
		this.CONT_USING_CANVAS = false;
		this.CONT_USING_THREADS = false;
		
		if (filepath != undefined && filepath != "") {
			this.filepath = filepath;
		} else {
			this.filepath = "./CPU3D.js"; //used in debugging mode.
		}
		
		this.pixelBuffer_Uint8 = new Uint8Array(0);
		
		this.initialised = false;
		this.width = 0;
		this.height = 0;
		
		if (typeof callback == "function") {
			this.callback = callback;
			this.CONT_USING_CALLBACK = true;
		}
		if (typeof canvas == "object") {
			this.canvas = canvas;
			this.canvasContext = this.canvas.getContext("2d");
			this.imageData = this.canvasContext.createImageData(this.canvas.width, this.canvas.height);
			this.CONT_USING_CANVAS = true;
		}
		
		if (!this.CONT_USING_CALLBACK && !this.CONT_USING_CANVAS) {
			console.log("CPU3D Error: CPU3DCore requires either a callback function or canvas element to work.");
			return;
		}
		
		//sometimes the typed array has set command, but the imagedata does not. if
		//we are using the canvas then we need to check the imagedata object instead.
		var testArray;
		if (this.CONT_USING_CANVAS) {
			testArray = this.canvasContext.getImageData(0, 0, 1, 1);
			testArray = testArray.data;
		} else {
			testArray= new Uint8Array(1);
		}
		if (testArray.set != undefined) {
			this.CONT_USING_ARRAY_SET = true;
		}
		
		if (threadCount > 0) {
			this.CONT_USING_THREADS = true;
			this.messageQueue = new Array();
			this.createThreads(threadCount);
		} else {
			this.CONT_USING_THREADS = false;
			this.render = new CPU3D_Core();
		}
		return;
	}

	///////////////////////////////////////////////////////////////////////////////
	// Methods
	///////////////////////////////////////////////////////////////////////////////
	createThreads = function(count) {
		this.threadCount = count;

		this.threads = new Array();
		for(var i = 0; i < this.threadCount; i++) {
			var thread = new Worker(this.filepath);
			thread.addEventListener('message', this.threadResponse, false);
			thread.postMessage([{id: 1, index: i, threadCount: this.threadCount}]);
			this.threads.push(thread);
		}

		return;
	}

	destroyThreads = function(count) {
		if (this.CONT_USING_THREADS) {
			for(var i = 0; i < this.threadCount; i++) {
				this.threads[i].terminate();
			}
			this.CONT_USING_THREADS = false;
			this.initialised = false;
			this.render = new CPU3D_Core();
		}
		return true;
	}

	sendMessage = function(messageData) {
		for(var i = 0; i < this.threadCount; i++) {
			var thread = this.threads[i];
			thread.postMessage(messageData);
		}
		return;
	}

	sendMessages = function() {
		if (this.CONT_USING_THREADS) {
			for(var i = 0; i < this.threadCount; i++) {
				var thread = this.threads[i];
				thread.postMessage(this.messageQueue);
			}
			this.messageQueue = new Array();
		}
		return;
	}

	addMessageToQueue = function(messageData) {
		this.messageQueue.push(messageData);
		return;
	}

	interpretMessage = function(event) {
		//document.getElementById("CPU3DCoreTestError").innerHTML = event.data;
		var offset = (event.data.offset*this.width)*4;
		this.getBufferProcessing(event.data.data, offset);
		return;
	}

	/////////////////////////////////////////////////////////////////////////////////
	getBufferProcessing = function(pixels, offset) {
		//using the canvas, draw our pixels straight to the canvas
		if 			(this.CONT_USING_CANVAS && !this.CONT_USING_CALLBACK && !this.CONT_USING_THREADS) {
			this.getBufferCanvas(pixels);
		} else if 	(this.CONT_USING_CANVAS && !this.CONT_USING_CALLBACK && this.CONT_USING_THREADS) {
			this.getBufferCanvasThreaded(pixels, offset);
		} else if 	(!this.CONT_USING_CANVAS && this.CONT_USING_CALLBACK && !this.CONT_USING_THREADS) {
			this.getBufferCallback(pixels);
		} else if 	(!this.CONT_USING_CANVAS && this.CONT_USING_CALLBACK && this.CONT_USING_THREADS) {
			this.getBufferCallbackThreaded(pixels, offset);
		} else if 	(this.CONT_USING_CANVAS && this.CONT_USING_CALLBACK && !this.CONT_USING_THREADS) {
			this.getBufferCanvasCallback(pixels);
		} else if 	(this.CONT_USING_CANVAS && this.CONT_USING_CALLBACK && this.CONT_USING_THREADS) {
			this.getBufferCanvasCallbackThreaded(pixels, offset);
		}
	}

	getBufferCanvas = function(pixels) {
		//put the pixel map in to the imageData object
		if (this.CONT_USING_ARRAY_SET) {
			this.imageData.data.set(pixels);
		} else {
			var data = this.imageData.data;
			var length = data.length;
			for (var i = 0; i < length; i++) {
				data[i] = pixels[i];
			}
		}
		
		//load this render into the on-screen canvas
		this.canvasContext.putImageData(this.imageData, 0, 0);
		
		return;
	}

	getBufferCanvasThreaded = function(pixels, offset) {
		//put the pixel map in to the imageData object
		if (this.CONT_USING_ARRAY_SET) {
			this.imageData.data.set(pixels, offset);
		} else {
			var data = this.imageData.data;
			var length = pixels.length;
			var i = offset;
			var j = 0;
			while(j < length) {
				data[i] = pixels[j];
				i++;
				j++;
			}
		}
		
		this.threadResponseCount++;
		if (this.threadResponseCount == this.threadCount) {
			this.canvasContext.putImageData(this.imageData, 0, 0);
		}
		
		return;
	}

	getBufferCallback = function(pixels) {
		this.callback(pixels);
		return;
	}

	getBufferCallbackThreaded = function(pixels, offset) {
		if (this.CONT_USING_ARRAY_SET) {
			this.pixelBuffer_Uint8.set(pixels, offset);
		
		} else {
			var buffer = this.pixelBuffer_Uint8;
			var length = pixels.length;
			
			var i = offset;
			var j = 0;
			while (j < length) {
				buffer[i] = pixels[j];
				i++;
				j++;
			}
		}
		
		this.threadResponseCount++;
		if (this.threadResponseCount == this.threadCount) {
			this.callback(this.pixelBuffer_Uint8);
		}
		return;
	}

	getBufferCanvasCallback = function(pixels) {
		//put the pixel map in to the imageData object
		if (this.CONT_USING_ARRAY_SET) {
			this.imageData.data.set(pixels);
		} else {
			var data = this.imageData.data;
			var length = data.length;
			for (var i = 0; i < length; i++) {
				data[i] = pixels[i];
			}
		}
		
		//load this render into the on-screen canvas
		this.canvasContext.putImageData(this.imageData, 0, 0);
		
		this.callback(this.imageData.data);
		
		return;
	}

	getBufferCanvasCallbackThreaded = function(pixels, offset) {
		//put the pixel map in to the imageData object
		if (this.CONT_USING_ARRAY_SET) {
			this.imageData.data.set(pixels, offset);
		} else {
			var data = this.imageData.data;
			var length = pixels.length;
			var i = offset;
			var j = 0;
			while(j < length) {
				data[i] = pixels[j];
				i++;
				j++;
			}
		}
		
		this.threadResponseCount++;
		if (this.threadResponseCount == this.threadCount) {
			this.canvasContext.putImageData(this.imageData, 0, 0);
			this.callback(this.imageData.data);
		}
		
		return;
	}

	setCanvas = function(canvas) {
		if (typeof canvas == "object") {
			this.canvas = canvas;
			this.canvasContext = this.canvas.getContext("2d");
			this.imageData = this.canvasContext.createImageData(this.canvas.width, this.canvas.height);
			this.CONT_USING_CANVAS = true;
		} else {
			this.CONT_USING_CANVAS = false;
		}
		return;
	}

	/////////////////////////////////////////////////////////////////////////////////

	initialise = function(width, height) {

		//make sure our input is correct.
		width = width << 0;
		height = height << 0;
		if (width < 1) {
			width = 1;
			console.log("CPU3D Error: initialise requires a width more then 0.");
			return 0;
		}
		if (height < 1) {
			height = 1;
			console.log("CPU3D Error: initialise requires a height more then 0.");
			return 0;
		}

		this.CONT_USING_UINT8CLAMPED = true;
		try {
			if (Uint8ClampedArray == "undefined") {
			}
		} catch(err) {
			this.CONT_USING_UINT8CLAMPED = false;
		}	
		
		this.width = width;
		this.height = height;
		this.arrayLength = this.width*this.height*4;
		
		this.vertexBank = new Array();
		this.vertexBank.push(true);		//push so that 0 is not useable.
		this.textureBank = new Array();
		this.textureBank.push(true);
		this.shaderBank = new Array();
		this.shaderBank.push(true);
		
		if (this.CONT_USING_THREADS) {
			if (this.CONT_USING_UINT8CLAMPED) {
				this.pixelBuffer_Uint8 = new Uint8ClampedArray(this.arrayLength);
			} else {
				this.pixelBuffer_Uint8 = new Uint8Array(this.arrayLength);
			}
			this.addMessageToQueue({id: 2, width: width, height: height, uint8Clamped: this.CONT_USING_UINT8CLAMPED});
		} else {
			//the 0, height,  indicates to the renderer that there is only one thrad and this is a first segment which goes the full 0-height.
			this.render.initialise(width, height, 0, height, this.CONT_USING_UINT8CLAMPED);	
		}
		
		this.initialised = true;
		
		return true;
	}

	resetScreen = function(width, height) {
		//make sure our input is correct.
		width = width << 0;
		height = height << 0;
		if (width < 1) {
			width = 1;
			console.log("CPU3D Error: initialise requires a width more then 0.");
			return 0;
		}
		if (height < 1) {
			height = 1;
			console.log("CPU3D Error: initialise requires a height more then 0.");
			return 0;
		}
		
		this.width = width;
		this.height = width;
		this.arrayLength = this.width*this.height*4;
		
		if (this.CONT_USING_THREADS) {
			this.pixelBuffer_Uint8 = new Uint8ClampedArray(width*height*4);
			this.addMessageToQueue({id: 3, width: width, height: height});
		} else {
			this.render.resetScreen(width, height, 1);
		}
		return true;
	}

	draw = function(vboID, start, length) {	
		if (this.CONT_USING_THREADS) {
			this.addMessageToQueue({id: 4, vbo: vboID, start: start, length: length});
		} else {
			this.render.draw(vboID, start, length);
		}
		
		return true;
	}

	/** if threads are used, this function returns nothing and once the image is created the callback is called.
	* if there are no threads, it will immediately call the callback function. If there is no callback function or
	* the callback is null/undefined then it will return the pixelarray.
	*/
	getBuffer = function() {
		var buffer = 1;

		if (this.initialised == false) {
			console.log("CPU3D Error: CPU3DCore has not been initialised yet. Use setTimeout or setInterval to delay draw commands after initialing.");
			return;
		}
		if (this.CONT_USING_THREADS) {
			this.threadResponseCount = 0;
			this.addMessageToQueue({id: 5, buffer: buffer});
			this.sendMessages();
		} else {
			this.getBufferProcessing(this.render.getBuffer(buffer), 0);
		}
		return;
	}

	clearBuffer = function(buffer) {
		if (this.initialised == false) {
			console.log("CPU3D Error: CPU3DCore has not been initialised yet. Use setTimeout or setInterval to delay draw commands after initialing.");
			return;
		}
		if (this.CONT_USING_THREADS) {
			this.addMessageToQueue({id: 6, buffer: buffer});
		} else {
			this.render.clearBuffer(buffer);
		}

		return;
	}

	clearColor = function(red, green, blue, alpha) {
		if (this.initialised == false) {
			console.log("CPU3D Error: CPU3DCore has not been initialised yet. Use setTimeout or setInterval to delay draw commands after initialing.");
			return;
		}
		if (this.CONT_USING_THREADS) {
			this.addMessageToQueue({id: 19, red: red, green: green, blue: blue, alpha: alpha});
		} else {
			this.render.clearColor(red, green, blue, alpha);
		}
		return;
	}

	getVBOId = function() {
		if (this.initialised == false) {
			console.log("CPU3D Error: CPU3DCore has not been initialised yet. Use setTimeout or setInterval to delay draw commands after initialing.");
			return;
		}
		if (this.CONT_USING_THREADS) {		
			var found = false;
			var i = 0;
			for (i; i < this.vertexBank.length; i++) {
				if (this.vertexBank[i] == false) {
					this.vertexBank[i] = true;
					found = true;
				}
			}
			if (!found) {
				this.vertexBank.push(true);
			}
			
			this.addMessageToQueue({id: 7});
			return this.vertexBank.length-1;
		} else {
			return this.render.getVBOId();
		}
		return 0;
	}

	loadVBO = function(vbo, data) {
		if (this.initialised == false) {
			console.log("CPU3D Error: CPU3DCore has not been initialised yet. Use setTimeout or setInterval to delay draw commands after initialing.");
			return;
		}
		if (this.CONT_USING_THREADS) {
			this.addMessageToQueue({id: 8, vboID: vbo, vertexData: data});
		} else {
			this.render.loadVBO(vbo, data);
		}
		return;
	}

	clearVBO = function(vbo) {
		if (this.initialised == false) {
			console.log("CPU3D Error: CPU3DCore has not been initialised yet. Use setTimeout or setInterval to delay draw commands after initialing.");
			return;
		}
		if (this.CONT_USING_THREADS) {
			this.vertexBank[vbo] = false;
			this.addMessageToQueue({id: 9, vboID: vbo});
		} else {
			this.render.clearVBO(vbo);
		}
		return;
	}

	getTBOId = function() {
		if (this.initialised == false) {
			console.log("CPU3D Error: CPU3DCore has not been initialised yet. Use setTimeout or setInterval to delay draw commands after initialing.");
			return;
		}
		if (this.CONT_USING_THREADS) {
			
			var found = false;
			var i = 0;
			for (i; i < this.textureBank.length; i++) {
				if (this.textureBank[i] == false) {
					this.textureBank[i] = true;
					found = true;
				}
			}
			if (!found) {
				this.textureBank.push(true);
			}
			
			this.addMessageToQueue({id: 10});
			return this.textureBank.length-1;
		} else {
			return this.render.getTBOId();
		}
	}

	loadTBO = function(tbo, data, width, height) {
		if (this.initialised == false) {
			console.log("CPU3D Error: CPU3DCore has not been initialised yet. Use setTimeout or setInterval to delay draw commands after initialing.");
			return;
		}
		if (this.CONT_USING_THREADS) {
			this.addMessageToQueue({id: 11, tboID: tbo, data: data, width: width, height: height});
		} else {
			this.render.loadTBO(tbo, data, width, height);
		}
		return;
	}

	bindTBO = function(tbo, textureSlot) {

		if (this.initialised == false) {
			console.log("CPU3D Error: CPU3DCore has not been initialised yet. Use setTimeout or setInterval to delay draw commands after initialing.");
			return;
		}
		if (this.CONT_USING_THREADS) {
			this.addMessageToQueue({id: 12, tboID: tbo, textureSlot: textureSlot});
		} else {
			this.render.bindTBO(textureSlot, tbo);
		}
		
		return;
	}

	clearTBO = function(tbo) {
		if (this.initialised == false) {
			console.log("CPU3D Error: CPU3DCore has not been initialised yet. Use setTimeout or setInterval to delay draw commands after initialing.");
			return;
		}
		if (this.CONT_USING_THREADS) {
			this.textureBank[tbo] = false;
			this.addMessageToQueue({id: 13, tboID: tbo});
		} else {
			this.render.clearTBO(tbo);
		}
		return;
	}

	getSBOId = function() {
		if (this.initialised == false) {
			console.log("CPU3D Error: CPU3DCore has not been initialised yet. Use setTimeout or setInterval to delay draw commands after initialing.");
			return;
		}
		if (this.CONT_USING_THREADS) {		
			var found = false;
			var i = 0;
			for (i; i < this.shaderBank.length; i++) {
				if (this.shaderBank[i] == false) {
					this.shaderBank[i] = true;
					found = true;
				}
			}
			if (!found) {
				this.shaderBank.push(true);
			}
			
			this.addMessageToQueue({id: 14});
			return this.shaderBank.length-1;
		} else {
			return this.render.getSBOId();
		}
		return id;
	}

	loadSBO = function(sbo) {
		if (this.initialised == false) {
			console.log("CPU3D Error: CPU3DCore has not been initialised yet. Use setTimeout or setInterval to delay draw commands after initialing.");
			return;
		}
		if (this.CONT_USING_THREADS) {
			this.addMessageToQueue({id: 15, shaderID: sbo});
		} else {
			this.render.loadSBO(sbo);
		}
		return;
	}

	bindSBO = function(sbo) {
		if (this.initialised == false) {
			console.log("CPU3D Error: CPU3DCore has not been initialised yet. Use setTimeout or setInterval to delay draw commands after initialing.");
			return;
		}
		if (this.CONT_USING_THREADS) {
			this.addMessageToQueue({id: 16, shaderID: sbo});
		} else {
			this.render.bindSBO(sbo);
		}
		return;
	}

	clearSBO = function(sbo) {
		if (this.initialised == false) {
			console.log("CPU3D Error: CPU3DCore has not been initialised yet. Use setTimeout or setInterval to delay draw commands after initialing.");
			return;
		}
		if (this.CONT_USING_THREADS) {
			this.shaderBank[sbo] = false;
			this.addMessageToQueue({id: 17, sboID: sbo});
		} else {
			this.render.clearSBO(sbo);
		}
		return;
	}

	assignSBOVertexShader = function(sbo, filepath, functionName) {
		
		if (this.initialised == false) {
			console.log("CPU3D Error: CPU3DCore has not been initialised yet. Use setTimeout or setInterval to delay draw commands after initialing.");
			return;
		}
		
		if (this.CONT_USING_THREADS) {
			this.addMessageToQueue({id: 18, shaderID: sbo, filepath: filepath, functionName: functionName});
		} else {
			this.render.assignSBOVertexFunction(sbo, window[""+functionName]);
		}
		return;
	}

	assignSBOPixelShader = function(sbo, filepath, functionName) {
		if (this.initialised == false) {
			console.log("CPU3D Error: CPU3DCore has not been initialised yet. Use setTimeout or setInterval to delay draw commands after initialing.");
			return;
		}
		if (this.CONT_USING_THREADS) {
			this.addMessageToQueue({id: 19, shaderID: sbo, filepath: filepath, functionName: functionName});
		} else {
			this.render.assignSBOPixelFunction(sbo, window[""+functionName]);
		}
		return;
	}

	addSBOVertexAttribute = function(sbo, shader, type, length) {
		if (this.initialised == false) {
			console.log("CPU3D Error: CPU3DCore has not been initialised yet. Use setTimeout or setInterval to delay draw commands after initialing.");
			return;
		}
		if (this.CONT_USING_THREADS) {
			this.addMessageToQueue({id: 20, shaderID: sbo, shader: shader, type: type, length: length});
		} else {
			this.render.addSBOVertexAttribute(sbo, shader, type, length);
		}
		
		return;
	}

	setShaderVariable = function(name, value) {
		if (this.initialised == false) {
			console.log("CPU3D Error: CPU3DCore has not been initialised yet. Use setTimeout or setInterval to delay draw commands after initialing.");
			return;
		}
		if (this.CONT_USING_THREADS) {
			this.addMessageToQueue({id: 21, name: name, value: value});
		} else {
			window[""+name] = value;
		}
		
		return;
	}

	clearColor = function(red, green, blue, alpha) {
		if (this.initialised == false) {
			console.log("CPU3D Error: CPU3DCore has not been initialised yet. Use setTimeout or setInterval to delay draw commands after initialing.");
			return;
		}
		if (this.CONT_USING_THREADS) {
			this.addMessageToQueue({id: 22, red: red, green: green, blue: blue, alpha: alpha});
		} else {
			this.render.clearColor(red, green, blue, alpha);
		}
		return true;
	}

	setProperty = function(name, value) {
		if (this.initialised == false) {
			console.log("CPU3D Error: CPU3DCore has not been initialised yet. Use setTimeout or setInterval to delay draw commands after initialing.");
			return false;
		}
		//check if name is actually a property
		if (name[0] != 'P' || name[1] != 'R' || name[2] != 'O' || name[3] != 'P') {
			console.log("CPU3D Error: " + name + " is not a property.");
			return false;
		}
		if (this.CONT_USING_THREADS) {
			this.addMessageToQueue({id: 23, name: name, value: value});
		} else {
			this.render[""+name] = value;
		}
		
		return true;
	}
}
//--------------------------------------------------------------------------------------------------

try{
	Window.document; //will fail if loaded as thread.
} catch(err) {
	
	//DELETE_WHEN_MERGE
	importScripts("CPU3D_Core.js");
	importScripts("CPU3D_Polygon.js");
	importScripts("CPU3D_Matrix.js");
	importScripts("CPU3D_Shader.js");
	//DELETE_WHEN_MERGE

	var index;
	var startY;
	var endY;
	var totalY;
	var threadCount;
	var render = new CPU3D_Core();
	function recieveMessage(event) {
		var messages = event.data;
		for (var i = 0; i < messages.length; i++) {
			interpretMessage(messages[i]);
		}
	}
	addEventListener('message', recieveMessage, false);

	var l;
	var w;
	var h;

	function interpretMessage(messageData) {
		var data = messageData;
		var id = data.id;

		if (id == undefined || id == 0) {
			//do nothing, ERROR
		} else if (id == 1) {
			index = data.index;
			threadCount = data.threadCount;
		} else if (id == 2) {
			//we need to work out how many lines this thread is responsible for.
			//if we always rounds downwards when dividing the screen it will means thread space should not overlap
			//it may mean the final thead is slightly larger.
			totalY = data.height;
			var segmentSize = (totalY / threadCount) << 0;
			startY = segmentSize * index;
			endY = index == threadCount-1 ? totalY : segmentSize * (index+1);
			
			render.initialise(data.width, data.height, startY, endY, data.uint8Clamped);
		} else if (id == 3) {
			render.resetScreen(data.width, data.height, threadCount);
		} else if (id == 4) {
			render.draw(data.vbo, data.start, data.length);
		} else if (id == 5) {
			var pixels = render.getBuffer();
			postMessage({index: index, offset: render.startY, data: pixels});
		} else if (id == 6) {
			render.clearBuffer(data.buffer);
		} else if (id == 7) {
			render.getVBOId();
		} else if (id == 8) {
			render.loadVBO(data.vboID, data.vertexData);
		} else if (id == 9) {
			render.clearVBO();
		} else if (id == 10) {
			render.getTBOId();
		} else if (id == 11) {
			render.loadTBO(data.tboID, data.data, data.width, data.height);
		} else if (id == 12) {
			render.bindTBO(data.textureSlot, data.tboID);
		} else if (id == 13) {
			render.clearTBO();
		} else if (id == 14) {
			render.getSBOId();
		} else if (id == 15) {
			render.loadSBO(data.shaderID);
		} else if (id == 16) {
			render.bindSBO(data.shaderID);
		} else if (id == 17) {
			render.clearSBO();
		} else if (id == 18) {
			importScripts(data.filepath);
			this.render.assignSBOVertexFunction(data.shaderID, self[""+data.functionName]);
		} else if (id == 19) {
			importScripts(data.filepath);
			this.render.assignSBOPixelFunction(data.shaderID, self[""+data.functionName]);
		} else if (id == 20) {
			this.render.addSBOVertexAttribute(data.shaderID, data.shader, data.type, data.length);
		} else if (id == 21) {
			self[""+data.name] = data.value;
		} else if (id == 22) {
			this.render.clearColor(data.red, data.green, data.blue, data.alpha);
		} else if (id == 23) {
			render[""+data.name] = data.value;
		}
		return;
	}
}