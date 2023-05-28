class GameReference extends GameObject {
	///////////////////////////////////////////////////////////////////////////////
	// Properites
	///////////////////////////////////////////////////////////////////////////////
	#position;
	#rotation;
	#scale;

	#baseObject;

	///////////////////////////////////////////////////////////////////////////////
	// Constructor
	///////////////////////////////////////////////////////////////////////////////
	constructor(data) {

		super("REF");

		if (data == null) {
			this.position = new Vector3D(0, 0, 0);
			this.rotation = new Vector3D(0, 0, 0);
			this.scale = new Vector3D(1, 1, 1);
			this.baseObject = -1;
			return;
		}

		this.position = data.position;
		this.rotation = data.rotation;
		this.scale = data.scale;
		this.baseObject = data.baseObject;

		return;
	}

	///////////////////////////////////////////////////////////////////////////////
	// Functions
	///////////////////////////////////////////////////////////////////////////////
	getPosition = function() {
		return this.position;
	}
	setPosition = function(x, y, z) {
		this.position = new Vector3D(x, y, z);
		return;
	}
	getRotation = function() {
		return this.rotation;
	}
	setRotation = function(x, y, z) {
		this.rotation = new Vector3D(x, y, z);
		return;
	}
	getScale = function() {
		return this.scale;
	}
	setScale = function(x, y, z) {
		this.scale = new Vector3D(x, y, z);
		return;
	}
	getBaseObject = function() {
		return this.baseObject;
	}
	setBaseObject = function(obj) {
		this.baseObject = obj;
		return;
	}
}
