///////////////////////////////////////////////////////////////////////////////
// Object Declaration
///////////////////////////////////////////////////////////////////////////////
class CPU3D_Matrix {

	///////////////////////////////////////////////////////////////////////////////
	// Properites
	///////////////////////////////////////////////////////////////////////////////
	/** Stores the 16 values of the array*/
	#data;

	//Temp array used when mmultiplying
	#mulTemp;

	//Temp array used to store the matrices that are made before multiplying
	#matTemp;

	///////////////////////////////////////////////////////////////////////////////
	// Constructor
	///////////////////////////////////////////////////////////////////////////////
	constructor() {
		this.data = new Array(16);
		this.makeIndentityMatrix();
		
		this.mulTemp = new Array(16);
		this.matTemp = {data: new Array(16)};
	}

	copyMatrix = function() {

		var newMatrix = new CPU3D_Matrix();

		this.data = new Array(16);
		this.data[0] = this.data[0];
		this.data[1] = this.data[1];
		this.data[2] = this.data[2];
		this.data[3] = this.data[3];
		this.data[4] = this.data[4];
		this.data[5] = this.data[5];
		this.data[6] = this.data[6];
		this.data[7] = this.data[7];
		this.data[8] = this.data[8];
		this.data[9] = this.data[9];
		this.data[10] = this.data[10];
		this.data[11] = this.data[11];
		this.data[12] = this.data[12];
		this.data[13] = this.data[13];
		this.data[14] = this.data[14];
		this.data[15] = this.data[15];
		
		return newMatrix;
	}

	///////////////////////////////////////////////////////////////////////////////
	// Functions
	///////////////////////////////////////////////////////////////////////////////
	get = function(x, y) {
		return this.data[x + y*4];
	}

	set = function(x, y, value) {
		this.data[x + y*4] = value;
		return;
	}

	multiplyWithMatrix = function(m2) {
		//0
		this.mulTemp[0]  = m2.data[0] * this.data[0]  + m2.data[1] * this.data[4]  + m2.data[2] * this.data[8]   + m2.data[3] * this.data[12];
		this.mulTemp[1]  = m2.data[0] * this.data[1]  + m2.data[1] * this.data[5]  + m2.data[2] * this.data[9]   + m2.data[3] * this.data[13];
		this.mulTemp[2]  = m2.data[0] * this.data[2]  + m2.data[1] * this.data[6]  + m2.data[2] * this.data[10]  + m2.data[3] * this.data[14];
		this.mulTemp[3]  = m2.data[0] * this.data[3]  + m2.data[1] * this.data[7]  + m2.data[2] * this.data[11]  + m2.data[3] * this.data[15];
		//4
		this.mulTemp[4]  = m2.data[4] * this.data[0]  + m2.data[5] * this.data[4]  + m2.data[6] * this.data[8]   + m2.data[7] * this.data[12];
		this.mulTemp[5]  = m2.data[4] * this.data[1]  + m2.data[5] * this.data[5]  + m2.data[6] * this.data[9]   + m2.data[7] * this.data[13];
		this.mulTemp[6]  = m2.data[4] * this.data[2]  + m2.data[5] * this.data[6]  + m2.data[6] * this.data[10]  + m2.data[7] * this.data[14];
		this.mulTemp[7]  = m2.data[4] * this.data[3]  + m2.data[5] * this.data[7]  + m2.data[6] * this.data[11]  + m2.data[7] * this.data[15];
		//8
		this.mulTemp[8]  = m2.data[8] * this.data[0]  + m2.data[9] * this.data[4]  + m2.data[10] * this.data[8]  + m2.data[11] * this.data[12];
		this.mulTemp[9]  = m2.data[8] * this.data[1]  + m2.data[9] * this.data[5]  + m2.data[10] * this.data[9]  + m2.data[11] * this.data[13];
		this.mulTemp[10] = m2.data[8] * this.data[2]  + m2.data[9] * this.data[6]  + m2.data[10] * this.data[10] + m2.data[11] * this.data[14];
		this.mulTemp[11] = m2.data[8] * this.data[3]  + m2.data[9] * this.data[7]  + m2.data[10] * this.data[11] + m2.data[11] * this.data[15];
		//12
		this.mulTemp[12] = m2.data[12] * this.data[0] + m2.data[13] * this.data[4] + m2.data[14] * this.data[8]  + m2.data[15] * this.data[12];
		this.mulTemp[13] = m2.data[12] * this.data[1] + m2.data[13] * this.data[5] + m2.data[14] * this.data[9]  + m2.data[15] * this.data[13];
		this.mulTemp[14] = m2.data[12] * this.data[2] + m2.data[13] * this.data[6] + m2.data[14] * this.data[10] + m2.data[15] * this.data[14];
		this.mulTemp[15] = m2.data[12] * this.data[3] + m2.data[13] * this.data[7] + m2.data[14] * this.data[11] + m2.data[15] * this.data[15];
			
		//copy the data from mulTemp back into this.data
		this.data[0] = this.mulTemp[0];
		this.data[1] = this.mulTemp[1];
		this.data[2] = this.mulTemp[2];
		this.data[3] = this.mulTemp[3];
		this.data[4] = this.mulTemp[4];
		this.data[5] = this.mulTemp[5];
		this.data[6] = this.mulTemp[6];
		this.data[7] = this.mulTemp[7];
		this.data[8] = this.mulTemp[8];
		this.data[9] = this.mulTemp[9];
		this.data[10] = this.mulTemp[10];
		this.data[11] = this.mulTemp[11];
		this.data[12] = this.mulTemp[12];
		this.data[13] = this.mulTemp[13];
		this.data[14] = this.mulTemp[14];
		this.data[15] = this.mulTemp[15];

		return;
	}

	debugPrint = function() {
		console.log("|"+this.get(0,0)+"|"+this.get(0,1)+"|"+this.get(0,2)+"|"+this.get(0,3)+"|");
		console.log("|"+this.get(1,0)+"|"+this.get(1,1)+"|"+this.get(1,2)+"|"+this.get(1,3)+"|");
		console.log("|"+this.get(2,0)+"|"+this.get(2,1)+"|"+this.get(2,2)+"|"+this.get(2,3)+"|");
		console.log("|"+this.get(3,0)+"|"+this.get(3,1)+"|"+this.get(3,2)+"|"+this.get(3,3)+"|");
		return;
	}

	matTempIndentity = function () {
		this.matTemp.data[0] = 1;
		this.matTemp.data[1] = 0;
		this.matTemp.data[2] = 0;
		this.matTemp.data[3] = 0;
		this.matTemp.data[4] = 0;
		this.matTemp.data[5] = 1;
		this.matTemp.data[6] = 0;
		this.matTemp.data[7] = 0;
		this.matTemp.data[8] = 0;
		this.matTemp.data[9] = 0;
		this.matTemp.data[10] = 1;
		this.matTemp.data[11] = 0;
		this.matTemp.data[12] = 0;
		this.matTemp.data[13] = 0;
		this.matTemp.data[14] = 0;
		this.matTemp.data[15] = 1;
	}

	makeIndentityMatrix = function() {
		this.data[0] = 1;
		this.data[1] = 0;
		this.data[2] = 0;
		this.data[3] = 0;
		this.data[4] = 0;
		this.data[5] = 1;
		this.data[6] = 0;
		this.data[7] = 0;
		this.data[8] = 0;
		this.data[9] = 0;
		this.data[10] = 1;
		this.data[11] = 0;
		this.data[12] = 0;
		this.data[13] = 0;
		this.data[14] = 0;
		this.data[15] = 1;
	}

	makeTranslationMatrix = function(x, y, z) {
		this.matTempIndentity();
		this.matTemp.data[12] = x;
		this.matTemp.data[13] = y;
		this.matTemp.data[14] = z;
		this.multiplyWithMatrix(this.matTemp);
		return;
	}

	makeXRotationMatrix = function(angle) {
		this.matTempIndentity();
		this.matTemp.data[5] = Math.cos(angle);
		this.matTemp.data[9] = -Math.sin(angle);
		this.matTemp.data[6] = Math.sin(angle);
		this.matTemp.data[10] = Math.cos(angle);
		this.multiplyWithMatrix(this.matTemp);
		return;
	}

	makeYRotationMatrix = function(angle) {
		this.matTempIndentity();
		this.matTemp.data[10] = Math.cos(angle);
		this.matTemp.data[2] = -Math.sin(angle);
		this.matTemp.data[8] = Math.sin(angle);
		this.matTemp.data[0] = Math.cos(angle);
		this.multiplyWithMatrix(this.matTemp);
		return;
	}

	makeZRotationMatrix = function(angle) {
		this.matTempIndentity();
		this.matTemp.data[0] = Math.cos(angle);
		this.matTemp.data[4] = -Math.sin(angle);
		this.matTemp.data[1] = Math.sin(angle);
		this.matTemp.data[5] = Math.cos(angle);
		this.multiplyWithMatrix(this.matTemp);
		return;
	}

	makeScaleMatrix = function(x, y, z) {
		this.matTempIndentity();
		this.matTemp.data[0] = x;
		this.matTemp.data[5] = y;
		this.matTemp.data[10] = z;
		this.multiplyWithMatrix(this.matTemp);
		return;
	}

	makeInverseTranslationMatrix = function(x, y, z) {
		this.matTempIndentity();
		this.matTemp.data[12] = -x;
		this.matTemp.data[13] = -y;
		this.matTemp.data[14] = -z;
		this.multiplyWithMatrix(this.matTemp);
		return;
	}

	makeInverseXRotationMatrix = function(angle) {
		this.matTempIndentity();
		this.matTemp.data[5] = Math.cos(angle);
		this.matTemp.data[9] = Math.sin(angle);
		this.matTemp.data[6] = -Math.sin(angle);
		this.matTemp.data[10] = Math.cos(angle);
		this.multiplyWithMatrix(this.matTemp);
		return;
	}

	makeInverseYRotationMatrix = function(angle) {
		this.matTempIndentity();
		this.matTemp.data[10] = Math.cos(angle);
		this.matTemp.data[2] = Math.sin(angle);
		this.matTemp.data[8] = -Math.sin(angle);
		this.matTemp.data[0] = Math.cos(angle);
		this.multiplyWithMatrix(this.matTemp);
		return;
	}

	makeInverseZRotationMatrix = function(angle) {
		this.matTempIndentity();
		this.matTemp.data[0] = Math.cos(angle);
		this.matTemp.data[4] = Math.sin(angle);
		this.matTemp.data[1] = -Math.sin(angle);
		this.matTemp.data[5] = Math.cos(angle);
		this.multiplyWithMatrix(this.matTemp);
		return;
	}

	makeInverseScaleMatrix = function(x, y, z) {
		this.matTempIndentity();
		this.matTemp.data[0] = 1/x;
		this.matTemp.data[5] = 1/y;
		this.matTemp.data[10] = 1/z;
		this.multiplyWithMatrix(this.matTemp);
		return;
	}

	makeRotation = function(angle, v) {

		var result = new CPU3D_Matrix();
		var angle1;
		var angle2;

		if (v.z != 0) {
			//First rotate around x axis so vector is on plane z-x
			angle1 = Math.atan(v.y/v.z);
			result.makeXRotationMatrix(angle1);
			//Rotate around y axis so vector is on z axis
			angle2 = Math.atan(v.x/v.z);
			result.makeYRotationMatrix(angle2);
			//Apply rotation that was fed in
			result.makeZRotationMatrix(angle);
			//Undo the x and y rotations
			result.makeInverseYRotationMatrix(angle2);
			result.makeInverseXRotationMatrix(angle1);
			
		} else if (v.x != 0) {
			//Rotate around z axis so vector is on x axis
			angle2 = Math.atan(v.y/v.x);
			result.makeZRotationMatrix(angle2);
			
			//Apply rotation that was fed in
			result.makeXRotationMatrix(angle);
			
			//Undo the z rotation
			result.makeInverseZRotationMatrix(angle2);
		} else {
			result.makeYRotationMatrix(angle);
		}
		this.multiplyWithMatrix(result);
		return;
	}

	makePrespectiveMatrix(fieldOfView, aspectRatio, near, far) {	
		var top = near*Math.tan(fieldOfView * 3.14159265/360);
		var bottom = -top;
		var right = top*aspectRatio;
		var left = -right;
		
		var result = new CPU3D_Matrix();
		result.set(0, 0, (2*near) / (right-left));
		result.set(1, 1, (2*near) / (top-bottom));
		result.set(2, 2, (near+far) / (far-near));
		result.set(3, 2, -1);
		result.set(2, 3, (2*near*far)/(far-near));
		result.set(3, 3, 0);
		
		this.matTempIndentity();
		this.multiplyWithMatrix(result);
		return;
	}
}