class Keyframe {
	///////////////////////////////////////////////////////////////////////////////
	// Properites
	///////////////////////////////////////////////////////////////////////////////
	#time;
	#position;
	#rotation;
	#scale;

	///////////////////////////////////////////////////////////////////////////////
	// Constructor
	///////////////////////////////////////////////////////////////////////////////
	constructor(data) {
		if (data == null) {
			this.time = 0;
			this.position = new Vector3D(0, 0, 0);
			this.rotation = new Vector3D(0, 0, 0);
			this.scale = new Vector3D(1, 1, 1);
		} else {
			this.time = data.time;
			this.position = new Vector3D(data.position[0], data.position[1], data.position[2])
			this.rotation = Utility.convertQuaterionToEular(data.rotation[0], data.rotation[1], data.rotation[2], data.rotation[3]);
			this.scale = new Vector3D(data.scale[0], data.scale[1], data.scale[2]);
		}
		return;
	}

	///////////////////////////////////////////////////////////////////////////////
	// Functions
	///////////////////////////////////////////////////////////////////////////////
	getTime() {
		return this.time;
	}
	setTime(time) {
		this.time = time;
		return;
	}
	getPosition() {
		return this.position;
	}
	setPosition(position) {
		this.position = position;
		return;
	}
	getRotation() {
		return this.rotation;
	}
	setRotation(rotation) {
		this.rotation = rotation;
		return;
	}
	getScale() {
		return this.scale;
	}
	setScale(scale) {
		this.scale = scale;
		return;
	}
}