class Bone {
	///////////////////////////////////////////////////////////////////////////////
	// Properites
	///////////////////////////////////////////////////////////////////////////////
	#name;
	#parent;
	#parentIndex;

	#position;
	#positionWorld;
	#rotation;

	///////////////////////////////////////////////////////////////////////////////
	// Constructor
	///////////////////////////////////////////////////////////////////////////////
	constructor(data) {

		if (data == null) {
			this.name = "";
			this.parent = "";
			this.parentIndex = -1;
			this.position = new Vector3D(0, 0, 0);
			this.positionWorld = new Vector3D(0, 0, 0);
			this.rotation = new Vector3D(0, 0, 0);
			return;
		}

		this.name = data.name;
		this.parent = data.parent;
		this.parentIndex = -1; //this is filled in later
		this.position = new Vector3D(data.position[0], data.position[1], data.position[2]);
		this.positionWorld = new Vector3D(data.positionWorld[0], data.positionWorld[1], data.positionWorld[2]);
		this.rotation = new Vector3D(0, 0, 0);

		return;
	}

	///////////////////////////////////////////////////////////////////////////////
	// Functions
	///////////////////////////////////////////////////////////////////////////////
	getName() {
		return this.name;
	}
	setName(name) {
		this.name = name;
		return;
	}
	getParent() {
		return this.parent;
	}
	setParent(parent) {
		this.parent = parent;
		return;
	}
	getParentIndex() {
		return this.parentIndex;
	}
	setParentIndex(parentIndex) {
		this.parentIndex = parentIndex;
		return;
	}
	getPosition() {
		return this.position;
	}
	setPosition(position) {
		this.position = position;
		return;
	}
	getPositionWorld() {
		return this.positionWorld;
	}
	setPositionWorld(positionWorld) {
		this.positionWorld = positionWorld;
		return;
	}
	getRotation() {
		return this.rotation;
	}
	setRotation(rotation) {
		this.rotation = rotation;
		return;
	}

}