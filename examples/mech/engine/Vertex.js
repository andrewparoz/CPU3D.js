class Vertex {
	///////////////////////////////////////////////////////////////////////////////
	// Properites
	///////////////////////////////////////////////////////////////////////////////
	#position;
	#normal;
	#bones;

	///////////////////////////////////////////////////////////////////////////////
	// Constructor
	///////////////////////////////////////////////////////////////////////////////
	constructor(data) {

		if (data == null) {
			this.position = new Vector3D(0, 0, 0);
			this.normal = new Vector3D(0, 0, 0);
			this.bones = [new Bone(), new Bone()];
			return;
		}

		this.position = new Vector3D(data.position[0], data.position[1], data.position[2]);
		this.normal = new Vector3D(data.normal[0], data.normal[1], data.normal[2]);
		this.bones = new Array();
		for(let i = 0; i < data.bones.length; i++) {
			this.bones.push(new BoneReference(data.bones[i]));
		}
		return;
	}

	///////////////////////////////////////////////////////////////////////////////
	// Functions
	///////////////////////////////////////////////////////////////////////////////
	getPosition = function() {
		return this.position;
	}
	getBoneByIndex = function(index) {
		return this.bones[index];
	}
}