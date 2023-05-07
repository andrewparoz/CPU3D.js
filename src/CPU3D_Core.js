///////////////////////////////////////////////////////////////////////////////
// Object Declaration
///////////////////////////////////////////////////////////////////////////////
class CPU3D_Core {

	///////////////////////////////////////////////////////////////////////////////
	// Properites
	///////////////////////////////////////////////////////////////////////////////
	#pixelBuffer;
	#pixelBuffer_Uint8;
	#pixelBuffer_Uint32;		//used to edit the pixel data as we have 32-bit color
	#pixelBufferIntial_Uint32;	//This is the default image we load into the buffer.

	#depthBuffer_Float32;		//a Float32Array that holds the depth buffer
	#depthBufferIntial_Float32;	//This is a blank depth buffer that is copied in at the start of rendering.

	#vertexBank;			//Stores the model data for each object
	#textureBank;			//Stores the texture data for each material
	#defaultTexture;		//Stores the blank texture used when the real texture is still loading or not found

	#shaderBank;			//Stores each of the shader objects

	#width;					//Width of the rendering
	#height;				//Hieght of the rendering

	#viewportMatrix;		//Stores the viewport matrix for the render. Updated with screen size changes.

	#polygon;		//Stores a persisent Polygon_2D object

	///////////////////////////////////////////////////////////////////////////////
	// Input Constants
	//////////////////////////////////////////////////////////////////////////////
	#TEXTURE_0;		//Reference to the current Texture being used.
	#TEXTURE_1;
	#TEXTURE_3;
	#TEXTURE_4;
	#TEXTURE_5;
	#TEXTURE_6;
	#TEXTURE_7;

	#CONT_TEXTURE_COUNT = 8;

	#SHADER_shader0;	//Reference to the current shader being used.

	///////////////////////////////////////////////////////////////////////////////
	// Globals
	///////////////////////////////////////////////////////////////////////////////
	#PROP_ENABLE_TRIANGLE_OVERSCAN = false;
	#PROP_ENABLE_BACKFACECULL = true;
	#PROP_ENABLE_TRIANGLE_OUTLINE = false;
	#PROP_ENABLE_Z_BUFFER = true;

	#PROP_CLEAR_COLOUR = (0 << 24) | (0 << 16) | (0 <<  8) | 0;

	//Not all broswers support Uint8Clamped arrays, so if it is not available we have to revert back to Uint8 arrays.
	//Uint8Clamped arrays are faster.
	#CONT_USING_UINT8CLAMPED;

	///////////////////////////////////////////////////////////////////////////////
	// Constructor
	///////////////////////////////////////////////////////////////////////////////
	constructor() {	
		return;
	}

	///////////////////////////////////////////////////////////////////////////////
	// Methods
	///////////////////////////////////////////////////////////////////////////////

	initialise = function(width, height, startY, endY, uintClamped) {
		
		this.CONT_USING_UINT8CLAMPED = uintClamped;
		
		this.startY = startY;
		this.endY = endY;
		
		//Reset the screen
		this.resetScreen(width, height, startY, endY);
		
		//Clear the vertex, texture and light banks
		this.vertexBank = new Array();
		this.vertexBank.push(true);		//push so that 0 is not useable.
		this.textureBank = new Array();
		this.textureBank.push(true);
		this.shaderBank = new Array();
		this.shaderBank.push(true);
		
		//Create the black default texture
		this.defaultTexture = {data: new Uint32Array(1) , width: 1, height: 1};
		this.defaultTexture.data[0] = (255 << 24) | (0 << 16) | (0 <<  8) | 0;	
		
		return;
	}

	resetScreen = function(width, height, startY, endY) {

		//Update the width and height of the render
		this.width = width;
		this.height = this.endY - this.startY;

		//Generatethe viewport matrix and store it	
		this.viewportMatrix = this.createViewportMatrix(0, 0, width, height);
		
		//Create the pixel buffer we render to.			
		this.pixelBuffer = new ArrayBuffer(this.width*this.height*4); //times 4 as each colour is 4 bytes big
		if (this.CONT_USING_UINT8CLAMPED) {
			this.pixelBuffer_Uint8 = new Uint8ClampedArray(this.pixelBuffer);
		} else {
			this.pixelBuffer_Uint8 = new Uint8Array(this.pixelBuffer);
		}
		this.pixelBuffer_Uint32 = new Uint32Array(this.pixelBuffer);

		//Create the starting image for the render
		this.generateIntialPixelBuffer();
		
		//Create the starting blank depth buffer
		this.depthBuffer_Float32 = new Float32Array(this.width*this.height);
		this.depthBufferIntial_Float32 = new Float32Array(this.width*this.height);
		for (var i = 0; i < this.width * this.height; i++) {
			this.depthBufferIntial_Float32[i] = -1;
		}
		
		//Flip the blank buffer and prepare for rendering.
		this.clearBuffer(0);

		return;
	}

	generateIntialPixelBuffer = function() {
		this.pixelBufferIntial_Uint32 = new Uint32Array(this.width*this.height);
		for (var i = 0; i < this.height; i++) {
			for (var j = 0; j < this.width; j++) {	
				this.pixelBufferIntial_Uint32[i*this.width+j] = this.PROP_CLEAR_COLOUR;
			}
		}
	}

	updateUint8Clamped = function(Uint8Clamped) {
		this.CONT_USING_UINT8CLAMPED = Uint8Clamped;
		if (this.CONT_USING_UINT8CLAMPED) {
			this.pixelBuffer_Uint8 = new Uint8ClampedArray(this.pixelBuffer);
		} else {
			this.pixelBuffer_Uint8 = new Uint8Array(this.pixelBuffer);
		}
	}

	/** Returns a reference to the current buffer for the application can load it into a canvas. Returns the 8-bit version. */
	getBuffer = function() {	
		return this.pixelBuffer_Uint8;
	}

	/** Clears the given buffer. if 0 or no buffer is given, all buffers are cleared. */
	clearBuffer = function(buffer) {	

		if (buffer == undefined || buffer == 0) {	//clear all buffers
			this.pixelBuffer_Uint32.set(this.pixelBufferIntial_Uint32);
			this.depthBuffer_Float32.set(this.depthBufferIntial_Float32);
			
		} else if (buffer == 1) {	//reset the pixel buffer	
			this.pixelBuffer_Uint32.set(this.pixelBufferIntial_Uint32);
			
		} else if (buffer == 2) {//reset the depth buffer
			this.depthBuffer_Float32.set(this.depthBufferIntial_Float32);
		}
		
		return true;
	}

	clearColor = function(red, green, blue, alpha) {	
		this.PROP_CLEAR_COLOUR = (alpha << 24) | (blue << 16) | (green <<  8) | red;
		this.generateIntialPixelBuffer();
		return;
	}

	draw = function(vbo, start, length) {
		if (this.SHADER_shader0 == null) {
			console.log("cpu3d Error: No shader is bound.");
			return;
		}
		
		var vertexBuffer = this.vertexBank[vbo];

		var inputLength = this.SHADER_shader0.inputCount;
		this.VERTEX_LENGTH = this.SHADER_shader0.outputCount;
		
		var startIndex = (start * inputLength) << 0;
		var endIndex = ((start + length) * inputLength) << 0;
		if (vbo >= this.vertexBank.length) {
			return;
		}
		
		var faceVertices = [new Float32Array(this.VERTEX_LENGTH), new Float32Array(this.VERTEX_LENGTH), new Float32Array(this.VERTEX_LENGTH)];
		var intputVertex = new Float32Array(inputLength);
		this.polygon = new CPU3D_Polygon();
		
		//this is a generated function.
		//This is written like this so that the array creation is outside of the generated code to aviod slowdowns.	
		this.vertexLoop(vertexBuffer, startIndex, endIndex, faceVertices, intputVertex, inputLength);
	}

	pipeline = function(faceVertices) {

		//reorder the data so that xyzw is first in the data. This allows for faster/simplier lookup through the code
		var vertexOffset = this.SHADER_shader0.pixelVertexOffset;
		if (vertexOffset > 0) {	
			var reorderArray = new Float32Array(vertexOffset);
			for (var i = 0; i < 3; i++) {
				
				for (var j = 0; j < vertexOffset; j++) {
					reorderArray[j] = faceVertices[i][j];
				}
				
				faceVertices[i][0] = faceVertices[i][vertexOffset];
				faceVertices[i][1] = faceVertices[i][vertexOffset+1];
				faceVertices[i][2] = faceVertices[i][vertexOffset+2];
				faceVertices[i][3] = faceVertices[i][vertexOffset+3];
				
				for (var j = 4; j < vertexOffset+4; j++) {
					faceVertices[i][j] = reorderArray[j-4];
				}
			}
		}
		
		//Eliminate as many faces as possible here;
		var clippingValue = this.insideFrustum(faceVertices);
		if (clippingValue > -1) {

			//later on we want the UV coords above 0, we find the lowest coord of the three vertices and
			if (this.SHADER_shader0.pixelTexCoordCount > 0) {
				this.UVMapAdjustment(faceVertices);
			}
			
			if (clippingValue > 0) {
				//Clip the face with the near plane
				this.clipNearPlane(faceVertices, clippingValue);
			}
			
			//--------------
			//From this point forward, there may be 3 or 4 vertices making up the face.
			//--------------
			//Do perpective division and viewport transform.
			this.perspectiveDivision(faceVertices);
			
			//If Backface culling is turned on, check the z value for the face.
			if (!this.PROP_ENABLE_BACKFACECULL || this.backfaceCull(faceVertices[0], faceVertices[1], faceVertices[2])) {
				
				//do the viewport transformation
				this.viewportTransform(faceVertices);

				//round the X and Y values so that match screen coordinates
				this.roundScreenValues(faceVertices);
				
				if (this.PROP_ENABLE_TRIANGLE_OUTLINE) {
					for (var i = 0; i < faceVertices.length; i++) {
						var v1 = faceVertices[i];
						var v2 = faceVertices[(i+1)%faceVertices.length];
						this.drawLine(v1[0], v2[0], v1[1], v2[1]);
					}
				}
				
				this.polygon.createPoylgon(faceVertices, this.width, this.height);

				this.generateEdges(this.polygon.vertices);
			}
		}
		while (faceVertices.length > 3) {
			faceVertices.pop();
		}
	}

	generateEdges = function(vertices) {

		//check for vertex duplicates that may have occured during rounding (points so similar they get rounded to the same).
		for (var i = 1; i < vertices.length; i++) {
			var vCurrent = vertices[i];
			var vPrev = vertices[i-1];
			if ((vPrev[0] == vCurrent[0]) && (vPrev[1] == vCurrent[1])) {
				vertices.splice(i-1, 1);
			}
		}
		
		//see if we still have a valid traingle.
		// INSTERT CODE HERE LATER FOR 1 AND 2 POINT SHAPES	
		if (vertices.length < 3) {
			return;
		}
		
		//take the first 3 points, find the area of the triangle and make sure its valid.
		var a = vertices[0];
		var b = vertices[1];
		var c = vertices[2];
		var ax = a[0];
		var ay = a[1];
		var bx = b[0];
		var by = b[1];
		var cx = c[0];
		var cy = c[1];
		var area = ( ax*(by-cy) + bx*(cy-ay) + cx*(ay-by) );// / 2;	//since we only care that the triangle has area > 0, we dont need to divide by 2.
		
		if (area == 0) {
			return;
		}
		//sometimes the direction of the points changes on tiny triangles when rounding the xy values.
		//we just run another check now to see what direction they are now.
		var direction = this.backfaceCull(vertices[0], vertices[1], vertices[2]) ? -1 : 1;
		
		//find the topmost point for each side
		var validTriangle = 0;
		var topLMostIndex = 0;
		var topRMostIndex = 0;
		
		var topLMostX = vertices[topLMostIndex][0];
		var topRMostX = topLMostX;
		
		var topLMostY = vertices[topLMostIndex][1];
		var topRMostY = topLMostY;
		
		var yEnd = vertices[0][1];
		for (var i = 1; i < vertices.length; i++) {
			var vertex = vertices[i];
			var vertexX = vertex[0];
			var vertexY = vertex[1];
			
			//topmost checks
			if (vertexY < topLMostY) {
				topLMostIndex = i;
				topRMostIndex = i;
				topLMostX = vertexX;
				topRMostX = vertexX;
				topLMostY = vertexY;
				topRMostY = vertexY;
			} else if (vertexY == topLMostY) {
				if (vertexX < topLMostX) {
					topLMostIndex = i;
					topLMostX = vertexX;
				}
				if (vertexX > topRMostX) {
					topRMostIndex = i;
					topRMostX = vertexX;
				}
			}
			if (yEnd < vertexY) {
				yEnd = vertexY;
			}
		}

		this.createEdge(vertices, topLMostIndex, topRMostIndex, yEnd << 0, direction);
		
		return;
	}

	//Mupltiple versions of this function are generated and the code for it is within the shader file.
	createEdge;

	//Mupltiple versions of this function are generated and the code for it is within the shader file.
	scanline;

	getTexturePixelColor = function(x, y, texture) {

		var data = texture.data;

		var width = texture.width;
		var height = texture.height;
		
		var xB = ((x*width) << 0) % width;
		var yB = ((y*height) << 0) % height;
		var index = ((yB*width) + xB);
		
		//return ((255 << 24) + 255) >>> 0;
		return data[index];

	}

	setPixelIndex = function(array, i, red, green, blue, alpha) {
		array[i] =
			(alpha << 24) |	// alpha
			(blue << 16) |	// blue
			(green << 8) |	// green
			red;			// red
		return;
	}

	pointToIndex = function(x, y) {
		return (y * this.width) + x;
	}

	getRandomColor = function() {
		var color = new Color(0, 0, 0, 255);
		color.r = Math.floor(Math.random()*256);
		color.g = Math.floor(Math.random()*256);
		color.b = Math.floor(Math.random()*256);
		return color;
	}

	/** 
	* Takes in an array of three vertices and checks to see if they are 
	* within the viewing frustum. Returns -1 if they are outside, else it 
	* returns a value indicating any vertex are outside the near plane.
	* -1: 
	* 0: No vertices outside
	* 1: v1 is out
	* 2: v2 is out
	* 3: v1 and v2 are out
	* 4: v3 is out
	* 5: v1 and v3 are out
	* 6: v2 and v3 are out
	* These value are used by the clipNearPlane function.
	*/
	insideFrustum = function(vertices) {
		
		var v1FrusValue = 0 << 0;
		var v2FrusValue = 0 << 0;
		var v3FrusValue = 0 << 0;
		var w = 0;
		
		var vertex1 = vertices[0];
		var vertex2 = vertices[1];
		var vertex3 = vertices[2];
		
		var zCheck = true;
		if (vertex1[3] == 1 && vertex1[3] == 1 && vertex1[3] == 1) {
			zCheck = false;
			//this is the case during an orthographic view.
			//This is because we have a w of 1 and the z clipping area would be check between -1 < x < -1
		}
		
		//Vertex 1
		w = vertex1[3];
		if (vertex1[0] < -w) {
			v1FrusValue += 1;	//Left
		} else if (vertex1[0] > w) {
			v1FrusValue += 2;	//Right
		}
		if (vertex1[1] > w) {
			v1FrusValue += 4;	//Top
		} else if (vertex1[1] < -w) {
			v1FrusValue += 8;	//Bottom
		}
		if (zCheck) {
			if (vertex1[2] > -1) {
				v1FrusValue += 16;	//Near
			} else if (vertex1[2] < -w) {
				v1FrusValue += 32;	//Far
			}
		}
		
		//Vertex 2
		w = vertex2[3];
		if (vertex2[0] < -w) {
			v2FrusValue += 1;	//Left
		} else if (vertex2[0] > w) {
			v2FrusValue += 2;	//Right
		}
		if (vertex2[1] > w) {
			v2FrusValue += 4;	//Top
		} else if (vertex2[1] < -w) {
			v2FrusValue += 8;	//Bottom
		}
		if (zCheck) {
			if (vertex2[2] > -1) {
				v2FrusValue += 16;	//Near
			} else if (vertex2[2] < -w) {
				v2FrusValue += 32;	//Far
			}
		}
		
		//Vertex 3
		w = vertex3[3];
		if (vertex3[0] < -w) {
			v3FrusValue += 1;	//Left
		} else if (vertex3[0] > w) {
			v3FrusValue += 2;	//Right
		}
		if (vertex3[1] > w) {
			v3FrusValue += 4;	//Top
		} else if (vertex3[1] < -w) {
			v3FrusValue += 8;	//Bottom
		}
		if (zCheck) {
			if (vertex3[2] > -1) {
				v3FrusValue += 16;	//Near
			} else if (vertex3[2] < -w) {
				v3FrusValue += 32;	//Far
			}
		}
		
		//Assumble the frustum that evaluates for the whole face.	
		var frustumCheck = 	(v1FrusValue & 1) & (v2FrusValue & 1) & (v3FrusValue & 1) | 
							(v1FrusValue & 2) & (v2FrusValue & 2) & (v3FrusValue & 2) |
							(v1FrusValue & 4) & (v2FrusValue & 4) & (v3FrusValue & 4) |
							(v1FrusValue & 8) & (v2FrusValue & 8) & (v3FrusValue & 8) |
							(v1FrusValue & 16) & (v2FrusValue & 16) & (v3FrusValue & 16) |
							(v1FrusValue & 32) & (v2FrusValue & 32) & (v3FrusValue & 32);
		
		if (frustumCheck > 0) {	//face is outside
			return -1;
		} else {
			var nearPlaneValue = 0;
			if ((v1FrusValue & 16) == 16) {
				nearPlaneValue += 1;
			}
			if ((v2FrusValue & 16) == 16) {
				nearPlaneValue += 2;
			}
			if ((v3FrusValue & 16) == 16) {
				nearPlaneValue += 4;
			}
			return nearPlaneValue;
		}
		
		return -1;
	}

	/**
	* This takes in the three vertices of a face and makes the UV mapping
	* upwards of 0. That way when repositioning we only need to move downwards.
	*/
	UVMapAdjustment = function(vertices) {

		var index = this.SHADER_shader0.pixelTexCoordOffset;
		var count = index + this.SHADER_shader0.pixelTexCoordCount;
		
		for (index; index < count; index++) {
			var lowest;
			var v0 = vertices[0][index];
			var v1 = vertices[1][index]
			var v2 = vertices[2][index];
			
			if (v0 <= v1 && v0 <= v2) {
				lowest = v0;
			} else if (v1 <= v0 && v1 <= v2) {
				lowest = v1;
			} else if (v2 <= v0 && v2 <= v1) {
				lowest = v2;
			}
			
			//Move values upwards if it is in the negatives
			while(lowest < 0) {
				lowest = lowest + 1;
				v0 = v0 + 1;
				v1 = v1 + 1;
				v2 = v2 + 1;
			}
			//Move values downwards if they are off to the right of the texture.
			while(lowest >= 1) {
				lowest = lowest - 1;
				v0 = v0 - 1;
				v1 = v1 - 1;
				v2 = v2 - 1;
			}
			
			vertices[0][index] = v0;
			vertices[1][index] = v1;
			vertices[2][index] = v2;
		}
		return;
	}

	/**
	 * Takes in an array of vectors representing vertices that are in Clip 
	 * Coordinates (had the projection matrix applied). Adds and removes 
	 * vertices if the face clips across the near plane.
	 */
	clipNearPlane = function(vertexVectors, clippingValue) {
		
		if (clippingValue == 1 || clippingValue == 2 || clippingValue == 4) {	//One vertex out, clip along both lines to other vertices. Makes a 4 point polygon.
			//find the vertex that is out.
			var vertex1 = null;		//is out
			var vertex2;			//is in
			var vertex3;			//is in
			
			var vertex1a = new Float32Array(this.VERTEX_LENGTH);			//The resulting clipped vertex of 1-2
			var vertex1b = new Float32Array(this.VERTEX_LENGTH);			//The resulting clipped vertex of 1-3
			
			if (clippingValue == 1) {
				vertex1 = vertexVectors[0];
				vertex2 = vertexVectors[1];
				vertex3 = vertexVectors[2];
			} else if (clippingValue == 2) {
				vertex1 = vertexVectors[1];
				vertex2 = vertexVectors[2];
				vertex3 = vertexVectors[0];
			} else if (clippingValue == 4) {
				vertex1 = vertexVectors[2];
				vertex2 = vertexVectors[0];
				vertex3 = vertexVectors[1];
			}
			
			var difference;
			var percentage1;
			var i;
			
			//Find the 0 intersect point for 1-2
			difference = vertex2[2] - vertex1[2];			//difference = vertex2.z - vertex1.z;
			percentage1 = (-1 - vertex1[2])/difference;		//percentage1 = (-1 - vertex1.z)/difference;
			for (i = 0; i < this.VERTEX_LENGTH; i++) {
				vertex1a[i] = vertex1[i] + ((vertex2[i] - vertex1[i]) * percentage1);
			}
			vertex1a[2] = -1;								//vertex1a.z = -1;
			
			//Find the 0 intersect point for 1-3
			difference = vertex3[2] - vertex1[2];
			percentage1 = (-1 - vertex1[2])/difference;
			for (i = 0; i < this.VERTEX_LENGTH; i++) {
				vertex1b[i] = vertex1[i] + ((vertex3[i] - vertex1[i]) * percentage1);
			}
			vertex1b[2] = -1;

			//Store the new vertices, leaving out the clipped one.
			vertexVectors[0] = vertex3;
			vertexVectors[1] = vertex1b;
			vertexVectors[2] = vertex1a;
			vertexVectors.push(vertex2);
			
		} else {	//Two vertices out, clip along both lines to the vertice that isnt. Makes a valid triangle.
			//find the vertex that is not out.
			var vertex1 = null;		//is in
			var vertex2;			//is out
			var vertex3;			//is out
			
			if (clippingValue == 3) {
				vertex1 = vertexVectors[2];
				vertex2 = vertexVectors[0];
				vertex3 = vertexVectors[1];
			} else if (clippingValue == 5) {
				vertex1 = vertexVectors[1];
				vertex2 = vertexVectors[2];
				vertex3 = vertexVectors[0];
			} else if (clippingValue == 6) {
				vertex1 = vertexVectors[0];
				vertex2 = vertexVectors[1];
				vertex3 = vertexVectors[2];
			}
			
			var difference;
			var percentage1;
			var percentage2;
			
			//Find the 1 intersect point for 1-2. This becomes vertex 2.
			difference = vertex1[2] - vertex2[2];
			percentage1 = (-1 - vertex2[2])/difference;
			for (i = 0; i < this.VERTEX_LENGTH; i++) {
				vertex2[i] = vertex2[i] + ((vertex1[i] - vertex2[i]) * percentage1);
			}
			vertex2[2] = -1;
			
			//Find the 1 intersect point for 1-2. This becomes vertex 3.
			difference = vertex1[2] - vertex3[2];
			percentage1 = (-1 - vertex3[2])/difference;
			for (i = 0; i < this.VERTEX_LENGTH; i++) {
				vertex3[i] = vertex3[i] + ((vertex1[i] - vertex3[i]) * percentage1);
			}
			vertex3[2] = -1;

		}
		return;
	}

	/**
	 * This takes in the vertex array of 3D points and applies the perspective division.
	 * At this point there could be 3 or 4 points in the array if 3D clipping happened.
	 */
	perspectiveDivision = function(vertices) {

		var verticesLength = vertices.length;
		var vertexLength = this.VERTEX_LENGTH;

		for (var i = 0; i < verticesLength; i++) {
			var invertedW = 1/vertices[i][3];
			var vertex = vertices[i];
			
			for (var j = 0; j < vertexLength; j++) {
				vertex[j] = vertex[j] * invertedW;
			}
			
			vertices[i][3] = invertedW;						//store the inverted W value here for now as we need it for perspective correcting later.
		}
	}

	/**
	 * Returns true if z direction of normal is positive (hence at camera), negative if it is 
	 * negative or 0. Used for backface culling.
	 */
	backfaceCull = function(vertex1, vertex2, vertex3) {
		var z = (vertex2[0] - vertex1[0])*(vertex3[1]- vertex1[1]) - (vertex2[1] - vertex1[1])*(vertex3[0]- vertex1[0]);
		if (z < 0) {
			return false
		} else {
			return true;
		}
	}

	/**
	 * Applies the viewport matrix to each vertex
	 */
	viewportTransform = function(vertices) {
		for (var j = 0; j < vertices.length; j++) {
			//since we are storing the invertedW value in w, and w is supposed to be 1 at this point, switch it out
			//until after the viewport transform.
			var invertedW = vertices[j][3];
			vertices[j][3] = 1;
			
			this.multiplyVectorWithMatrixViewportTransform(vertices[j], this.viewportMatrix);
			
			//restore it here.
			vertices[j][3] = invertedW;
		}
	}

	roundScreenValues = function(vertices) {
		if (this.PROP_ENABLE_OVERSCAN) {
			//round the x and y values now and apply any threads offseting
			//find center of shape (avg of all points
			var avgX = 0;
			var avgY = 0;
			for (var i = 0; i < vertices.length; i++) {
				avgX = avgX + vertices[i][0];
				avgY = avgY + vertices[i][1];
			}
			avgX = avgX/vertices.length;
			avgY = avgY/vertices.length;
			
			for (var i = 0; i < vertices.length; i++) {
				//if the vertex is less (left) of the avg we want to round down.
				//if the vertex is more (right) of the avg we want to round up.
				var x = vertices[i][0];	
				x = x < avgX ? (x << 0) : (x+1)<<0;
				vertices[i][0] = x;
				
				//if the vertex is less (higher) of the avg we want to round down.
				//if the vertex is more (lower) of the avg we want to round up.
				var y = vertices[i][1];	
				y = y < avgY ? (y << 0) : (y+1)<<0;
				vertices[i][1] = y - this.startY;			
			}
		} else {
			for (var i = 0; i < vertices.length; i++) { 
				vertices[i][0] = (vertices[i][0]+0.5)<<0;
				vertices[i][1] = ((vertices[i][1]+0.5)<<0) - this.startY;
			}
		}
		return;
	}

	createViewportMatrix = function(x, y, width, height) {	
		var result = new CPU3D_Matrix();	
		result.set(0, 0, width/2);
		result.set(1, 1, -height/2);

		result.set(0, 3, (x+width)/2);
		result.set(1, 3, (y+height)/2);
		
		return result;
	}

	getVBOId = function() {
		
		for (var i = 0; i < this.vertexBank.length; i++) {
			if (this.vertexBank[i] == null) {
				this.vertexBank[i] == new Float32Array(0);
				return i;
			}
		}
		
		//if there was no empty places, that loop will finish and this code will run
		var id = this.vertexBank.length;
		this.vertexBank.push(new Float32Array(0));
		return id;
		
	}

	/**
	 * Takes in a VBO id and float32Array and stores the values
	 * from the vertexdata into the vertex buffer
	 */
	loadVBO = function(vboID, vertexData) {
		this.vertexBank[vboID] = new Float32Array(vertexData.length);
		this.vertexBank[vboID].set(vertexData);
		
		return;
	}

	clearVBO = function(vboID) {
		this.vertexBank[vboID] = null;
		return;
	}

	getTBOId = function() {
		
		for (var i = 0; i < this.textureBank.length; i++) {
			if (this.textureBank[i] == null) {
				this.textureBank[i] == this.defaultTexture;
				return i;
			}
		}
		
		//if there was no empty places, that loop will finish and this code will run
		var id = this.textureBank.length;
		this.textureBank.push(this.defaultTexture);
		return id;
	}

	loadTBO = function(tboID, data, width, height) {

		if (this.textureCheck(tboID, "loadTBO")) {
			var length = data.length/4;

			var textureBuffer = new Uint32Array(length);
			for (var i = 0; i < length; i++) {
				var red = i*4 + 0;
				var green = i*4 + 1;
				var blue = i*4 + 2;
				var alpha = i*4 + 3;
				textureBuffer[i] = (data[alpha] << 24) | (data[blue] << 16) | (data[green] <<  8) | (data[red]);
			}	
			this.textureBank[tboID] = {data: textureBuffer, width: width, height: height};
		}
		return;
	}

	bindTBO = function(textureSlot, textureIndex) {

		if (textureSlot == undefined || textureSlot < 0 || textureSlot > 7) {
			console.log("cpu3d Error: BindTexture(textureSlot, textureIndex), texture slot must be in range 0 - 7. It is "+textureSlot);
		}
		
		if (textureIndex == undefined) {
			console.log("cpu3d Error: BindTexture(textureSlot, tbo). TBO is "+textureIndex);
		}
		
		if (textureIndex > -1) {
			this["TEXTURE_"+textureSlot] = this.textureBank[textureIndex];
		} else {
			this["TEXTURE_"+textureSlot] = null;
		}
		return;
	}

	clearTBO = function(tboID) {
		if (this.textureCheck(tboID, "clearTBO")) {
			var texture = this.textureBank[tboID];
			for (var i = 0; i < this.CONT_TEXTURE_COUNT; i++) {
				if (this["TEXTURE_"+i] == texture) {
					this["TEXTURE_"+i] = null;
				}
			}
			this.textureBank[tboID] = null;
		}
		return;
	}

	textureCheck = function(id, functionName) {
		if (id < 0 && id >= this.textureBank.length) {
			console.log("cpu3d Error: Texture with ID " + id + " does not exist. Used in " + functionName + "()");
			return false;
		}
		var texture = this.textureBank[id];
		if (texture == null) {
			console.log("cpu3d Error: Texture with ID " + id + " does not exist. Used in " + functionName + "()");
			return false;
		}
		return true;
	}

	getSBOId = function() {
		
		for (var i = 0; i < this.shaderBank.length; i++) {
			if (this.shaderBank[i] == null) {
				this.shaderBank[i] == new this.CPU3D_Shader(this, i);
				return i;
			}
		}
		
		//if there was no empty places, that loop will finish and this code will run
		var shaderID = this.shaderBank.length;
		this.shaderBank.push(new CPU3D_Shader(this, shaderID));
		return shaderID;
	}

	loadSBO = function(shaderID) {
		
		if (shaderID < 1 && shaderID >= this.shaderBank.length) {
			console.log("cpu3d Error: Shader with ID " + shaderID + " does not exist. Used in loadSBO()");
			return;
		}		
		var shader = this.shaderBank[shaderID];
		if (shader == null) {
			console.log("cpu3d Error: Shader with ID " + shaderID + " does not exist. Used in loadSBO()");
			return;
		}	
		
		shader.createShader();
		return;
	}

	bindSBO = function(shaderID) {
		if (shaderID == 0) {
			this.SHADER_shader0 = null;
		}
		if (this.shaderCheck(shaderID, "bindSBO")) {
			var shader = this.shaderBank[shaderID];
			if (shader.created == false) {
				console.log("cpu3d Error: Shader "+ shaderID +" has not been loaded. Used in " + functionName + "()");
				return false;
			}
			this.SHADER_shader0 = null;
			this.SHADER_shader0 = shader;		
			this.SHADER_shader0.useShader();
		}

		return;
	}

	clearSBO = function(shaderID) {	
		if (this.shaderCheck(shaderID, "clearSBO")) {
			var shader = this.shaderBank[shaderID];
			if (this.SHADER_shader0 == shader) {
				this.SHADER_shader0 = null;
			}
			this.shaderBank[shaderID] = null;
		}
		return;
	}

	assignSBOVertexFunction = function(shaderID, vertexFunction) {
		if (this.shaderCheck(shaderID, "assignSBOVertexFunction")) {
			var shader = this.shaderBank[shaderID];
			shader.setVertexFunction(vertexFunction);
		}
		return;
	}

	assignSBOPixelFunction = function(shaderID, pixelFunction) {
		if (this.shaderCheck(shaderID, "assignSBOPixelFunction")) {
			var shader = this.shaderBank[shaderID];
			shader.setPixelFunction(pixelFunction);
		}
		return;
	}

	addSBOVertexAttribute = function(shaderID, shader, type, length) {
		if (this.shaderCheck(shaderID, "addSBOVertexAttribute")) {
			var shaderRef = this.shaderBank[shaderID];
			shaderRef.addSBOVertexAttribute(shader, type, length);
		}
		return;
	}

	shaderCheck = function(shaderID, functionName) {
		if (shaderID < 0 && shaderID >= this.shaderBank.length) {
			console.log("cpu3d Error: Shader with ID " + shaderID + " does not exist. Used in " + functionName + "()");
			return false;
		}		
		var shader = this.shaderBank[shaderID];
		if (shader == null) {
			console.log("cpu3d Error: Shader with ID " + shaderID + " does not exist. Used in " + functionName + "()");
			return false;
		}
		return true;
	}

	vecByMatrixCol = function(vector, matrix, offset) {

		var xIndex = offset;
		var yIndex = offset+1;
		var zIndex = offset+2;
		var wIndex = offset+3;

		var x = (vector[xIndex] * matrix[0]) + (vector[yIndex] * matrix[4]) + (vector[zIndex] * matrix[8]) + (vector[wIndex] * matrix[12]);
		var y = (vector[xIndex] * matrix[1]) + (vector[yIndex] * matrix[5]) + (vector[zIndex] * matrix[9]) + (vector[wIndex] * matrix[13]);
		var z = (vector[xIndex] * matrix[2]) + (vector[yIndex] * matrix[6]) + (vector[zIndex] * matrix[10]) + (vector[wIndex] * matrix[14]);
		var w = (vector[xIndex] * matrix[3]) + (vector[yIndex] * matrix[7]) + (vector[zIndex] * matrix[11]) + (vector[wIndex] * matrix[15]);
		
		vector[xIndex] = x;
		vector[yIndex] = y;
		vector[zIndex] = z;
		vector[wIndex] = w;
		
		return;
	}

	vecByMatrixRow = function(vector, matrix, offset) {

		var xIndex = offset;
		var yIndex = offset+1;
		var zIndex = offset+2;
		var wIndex = offset+3;

		var x = (vector[xIndex] * matrix[0]) + (vector[yIndex] * matrix[1]) + (vector[zIndex] * matrix[2]) + (vector[wIndex] * matrix[3]);
		var y = (vector[xIndex] * matrix[4]) + (vector[yIndex] * matrix[5]) + (vector[zIndex] * matrix[6]) + (vector[wIndex] * matrix[7]);
		var z = (vector[xIndex] * matrix[8]) + (vector[yIndex] * matrix[9]) + (vector[zIndex] * matrix[10]) + (vector[wIndex] * matrix[11]);
		var w = (vector[xIndex] * matrix[12]) + (vector[yIndex] * matrix[13]) + (vector[zIndex] * matrix[14]) + (vector[wIndex] * matrix[15]);
		
		vector[xIndex] = x;
		vector[yIndex] = y;
		vector[zIndex] = z;
		vector[wIndex] = w;
		
		return;
	}

	/** For some reason, there is a thread slowdown if viewportTransform uses the first multiplyVectorWithMatrix,
	 * so this is a duplicate so that it runs at the right speed. No idea why this is.
	 */
	multiplyVectorWithMatrixViewportTransform = function(vector, m2) {
		
		var x = (vector[0] * m2.data[0]) + (vector[1] * m2.data[4]) + (vector[2] * m2.data[8]) + (vector[3] * m2.data[12]);
		var y = (vector[0] * m2.data[1]) + (vector[1] * m2.data[5]) + (vector[2] * m2.data[9]) + (vector[3] * m2.data[13]);
		var z = (vector[0] * m2.data[2]) + (vector[1] * m2.data[6]) + (vector[2] * m2.data[10]) + (vector[3] * m2.data[14]);
		var w = (vector[0] * m2.data[3]) + (vector[1] * m2.data[7]) + (vector[2] * m2.data[11]) + (vector[3] * m2.data[15]);
		
		vector[0] = x;
		vector[1] = y;
		vector[2] = z;
		vector[3] = w;
		
		return;
	}

	getDifference = function(n1, n2) {
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

	getCardinalDifference = function(x1, y1, x2, y2) {
		var s1 = this.getDifference(x1, x2);
		var s2 = this.getDifference(y1, y2);
		
		var distance = Math.sqrt(s1*s1 + s2*s2);
		
		return distance;
	}

	getCardinalDifference3D = function(x1, y1, z1, x2, y2, z2) {
		var s1 = this.getDifference(x1, x2);
		var s2 = this.getDifference(y1, y2);
		
		var distance = Math.sqrt(s1*s1 + s2*s2);
		
		return distance;
	}

	drawLine = function(x1, x2, y1, y2) {
		
		if (x1 > x2) {
			var temp = x1;
			x1 = x2;
			x2 = temp;
			
			temp = y1;
			y1 = y2;
			y2 = temp;
		}
		
		var m = (y2-y1)/(x2-x1);
		var c = y1-(m*x1);
		
		for (var x=x1; x <= x2; x++) {
			var y = m*x + c;
			var index = this.pointToIndex(x, y<<0);
			this.pixelBuffer_Uint32[index] = (255 << 24) | (255 << 16) | (255 <<  8) | 255;
		}
		return;
	}
}