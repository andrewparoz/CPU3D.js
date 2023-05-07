///////////////////////////////////////////////////////////////////////////////
// Object Declaration
///////////////////////////////////////////////////////////////////////////////
CPU3D_Core.prototype.CPU3D_Matrix = function() {
	this.CPU3D_Matrix();
}

///////////////////////////////////////////////////////////////////////////////
// Properites
///////////////////////////////////////////////////////////////////////////////
/** Stores the 16 values of the array*/
CPU3D_Core.prototype.CPU3D_Matrix.prototype.data;

//Temp array used when mmultiplying
CPU3D_Core.prototype.CPU3D_Matrix.prototype.mulTemp;

//Temp array used to store the matrices that are made before multiplying
CPU3D_Core.prototype.CPU3D_Matrix.prototype.matTemp;

///////////////////////////////////////////////////////////////////////////////
// Constructor
///////////////////////////////////////////////////////////////////////////////
CPU3D_Core.prototype.CPU3D_Matrix.prototype.CPU3D_Matrix = function() {
	this.data = new Array(16);
	this.makeIndentityCPU3D_Matrix();
	
	this.mulTemp = new Array(16);
	this.matTemp = {data: new Array(16)};
}

CPU3D_Core.prototype.CPU3D_Matrix.prototype.copyCPU3D_Matrix = function() {

	var newCPU3D_Matrix = new CPU3D_Matrix();

	newCPU3D_Core.prototype.CPU3D_Matrix.data = new Array(16);
	newCPU3D_Core.prototype.CPU3D_Matrix.data[0] = this.data[0];
	newCPU3D_Core.prototype.CPU3D_Matrix.data[1] = this.data[1];
	newCPU3D_Core.prototype.CPU3D_Matrix.data[2] = this.data[2];
	newCPU3D_Core.prototype.CPU3D_Matrix.data[3] = this.data[3];
	newCPU3D_Core.prototype.CPU3D_Matrix.data[4] = this.data[4];
	newCPU3D_Core.prototype.CPU3D_Matrix.data[5] = this.data[5];
	newCPU3D_Core.prototype.CPU3D_Matrix.data[6] = this.data[6];
	newCPU3D_Core.prototype.CPU3D_Matrix.data[7] = this.data[7];
	newCPU3D_Core.prototype.CPU3D_Matrix.data[8] = this.data[8];
	newCPU3D_Core.prototype.CPU3D_Matrix.data[9] = this.data[9];
	newCPU3D_Core.prototype.CPU3D_Matrix.data[10] = this.data[10];
	newCPU3D_Core.prototype.CPU3D_Matrix.data[11] = this.data[11];
	newCPU3D_Core.prototype.CPU3D_Matrix.data[12] = this.data[12];
	newCPU3D_Core.prototype.CPU3D_Matrix.data[13] = this.data[13];
	newCPU3D_Core.prototype.CPU3D_Matrix.data[14] = this.data[14];
	newCPU3D_Core.prototype.CPU3D_Matrix.data[15] = this.data[15];
	
	return newCPU3D_Matrix;
}

///////////////////////////////////////////////////////////////////////////////
// Functions
///////////////////////////////////////////////////////////////////////////////
CPU3D_Core.prototype.CPU3D_Matrix.prototype.get = function(x, y) {
	return this.data[x + y*4];
}

CPU3D_Core.prototype.CPU3D_Matrix.prototype.set = function(x, y, value) {
	this.data[x + y*4] = value;
	return;
}

CPU3D_Core.prototype.CPU3D_Matrix.prototype.multiplyWithCPU3D_Matrix = function(m2) {
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

CPU3D_Core.prototype.CPU3D_Matrix.prototype.debugPrint = function() {
	console.log("|"+this.get(0,0)+"|"+this.get(0,1)+"|"+this.get(0,2)+"|"+this.get(0,3)+"|");
	console.log("|"+this.get(1,0)+"|"+this.get(1,1)+"|"+this.get(1,2)+"|"+this.get(1,3)+"|");
	console.log("|"+this.get(2,0)+"|"+this.get(2,1)+"|"+this.get(2,2)+"|"+this.get(2,3)+"|");
	console.log("|"+this.get(3,0)+"|"+this.get(3,1)+"|"+this.get(3,2)+"|"+this.get(3,3)+"|");
	return;
}

CPU3D_Core.prototype.CPU3D_Matrix.prototype.matTempIndentity = function () {
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

CPU3D_Core.prototype.CPU3D_Matrix.prototype.makeIndentityCPU3D_Matrix = function() {
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

CPU3D_Core.prototype.CPU3D_Matrix.prototype.makeTranslationCPU3D_Matrix = function(x, y, z) {
	this.matTempIndentity();
	this.matTemp.data[12] = x;
	this.matTemp.data[13] = y;
	this.matTemp.data[14] = z;
	this.multiplyWithCPU3D_Matrix(this.matTemp);
	return;
}

CPU3D_Core.prototype.CPU3D_Matrix.prototype.makeXRotationCPU3D_Matrix = function(angle) {
	this.matTempIndentity();
	this.matTemp.data[5] = Math.cos(angle);
	this.matTemp.data[9] = -Math.sin(angle);
	this.matTemp.data[6] = Math.sin(angle);
	this.matTemp.data[10] = Math.cos(angle);
	this.multiplyWithCPU3D_Matrix(this.matTemp);
	return;
}

CPU3D_Core.prototype.CPU3D_Matrix.prototype.makeYRotationCPU3D_Matrix = function(angle) {
	this.matTempIndentity();
	this.matTemp.data[10] = Math.cos(angle);
	this.matTemp.data[2] = -Math.sin(angle);
	this.matTemp.data[8] = Math.sin(angle);
	this.matTemp.data[0] = Math.cos(angle);
	this.multiplyWithCPU3D_Matrix(this.matTemp);
	return;
}

CPU3D_Core.prototype.CPU3D_Matrix.prototype.makeZRotationCPU3D_Matrix = function(angle) {
	this.matTempIndentity();
	this.matTemp.data[0] = Math.cos(angle);
	this.matTemp.data[4] = -Math.sin(angle);
	this.matTemp.data[1] = Math.sin(angle);
	this.matTemp.data[5] = Math.cos(angle);
	this.multiplyWithCPU3D_Matrix(this.matTemp);
	return;
}

CPU3D_Core.prototype.CPU3D_Matrix.prototype.makeScaleCPU3D_Matrix = function(x, y, z) {
	this.matTempIndentity();
	this.matTemp.data[0] = x;
	this.matTemp.data[5] = y;
	this.matTemp.data[10] = z;
	this.multiplyWithCPU3D_Matrix(this.matTemp);
	return;
}

CPU3D_Core.prototype.CPU3D_Matrix.prototype.makeInverseTranslationCPU3D_Matrix = function(x, y, z) {
	this.matTempIndentity();
	this.matTemp.data[12] = -x;
	this.matTemp.data[13] = -y;
	this.matTemp.data[14] = -z;
	this.multiplyWithCPU3D_Matrix(this.matTemp);
	return;
}

CPU3D_Core.prototype.CPU3D_Matrix.prototype.makeInverseXRotationCPU3D_Matrix = function(angle) {
	this.matTempIndentity();
	this.matTemp.data[5] = Math.cos(angle);
	this.matTemp.data[9] = Math.sin(angle);
	this.matTemp.data[6] = -Math.sin(angle);
	this.matTemp.data[10] = Math.cos(angle);
	this.multiplyWithCPU3D_Matrix(this.matTemp);
	return;
}

CPU3D_Core.prototype.CPU3D_Matrix.prototype.makeInverseYRotationCPU3D_Matrix = function(angle) {
	this.matTempIndentity();
	this.matTemp.data[10] = Math.cos(angle);
	this.matTemp.data[2] = Math.sin(angle);
	this.matTemp.data[8] = -Math.sin(angle);
	this.matTemp.data[0] = Math.cos(angle);
	this.multiplyWithCPU3D_Matrix(this.matTemp);
	return;
}

CPU3D_Core.prototype.CPU3D_Matrix.prototype.makeInverseZRotationCPU3D_Matrix = function(angle) {
	this.matTempIndentity();
	this.matTemp.data[0] = Math.cos(angle);
	this.matTemp.data[4] = Math.sin(angle);
	this.matTemp.data[1] = -Math.sin(angle);
	this.matTemp.data[5] = Math.cos(angle);
	this.multiplyWithCPU3D_Matrix(this.matTemp);
	return;
}

CPU3D_Core.prototype.CPU3D_Matrix.prototype.makeInverseScaleCPU3D_Matrix = function(x, y, z) {
	this.matTempIndentity();
	this.matTemp.data[0] = 1/x;
	this.matTemp.data[5] = 1/y;
	this.matTemp.data[10] = 1/z;
	this.multiplyWithCPU3D_Matrix(this.matTemp);
	return;
}

CPU3D_Core.prototype.CPU3D_Matrix.prototype.makeRotation = function(angle, v) {

	var result = new CPU3D_Matrix();
	var angle1;
	var angle2;

	if (v.z != 0) {
		//First rotate around x axis so vector is on plane z-x
		angle1 = Math.atan(v.y/v.z);
		result.makeXRotationCPU3D_Matrix(angle1);
		//Rotate around y axis so vector is on z axis
		angle2 = Math.atan(v.x/v.z);
		result.makeYRotationCPU3D_Matrix(angle2);
		//Apply rotation that was fed in
		result.makeZRotationCPU3D_Matrix(angle);
		//Undo the x and y rotations
		result.makeInverseYRotationCPU3D_Matrix(angle2);
		result.makeInverseXRotationCPU3D_Matrix(angle1);
		
	} else if (v.x != 0) {
		//Rotate around z axis so vector is on x axis
		angle2 = Math.atan(v.y/v.x);
		result.makeZRotationCPU3D_Matrix(angle2);
		
		//Apply rotation that was fed in
		result.makeXRotationCPU3D_Matrix(angle);
		
		//Undo the z rotation
		result.makeInverseZRotationCPU3D_Matrix(angle2);
	} else {
		result.makeYRotationCPU3D_Matrix(angle);
	}
	this.multiplyWithCPU3D_Matrix(result);
	return;
}