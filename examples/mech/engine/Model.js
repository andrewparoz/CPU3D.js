class Model {

	///////////////////////////////////////////////////////////////////////////////
	// Properites
	///////////////////////////////////////////////////////////////////////////////
	#skeleton;
	#skeletonLoaded;

	#vertices;
	#faces;
	#bones;
	#animations;
	#materials;	//replaced texture paths with tbo's

	///////////////////////////////////////////////////////////////////////////////
	// Constructor
	///////////////////////////////////////////////////////////////////////////////
	constructor(data) {

		if (data == null) {
			this.vertices = [];
			this.faces = [];
			this.bones = [];
			this.materials = [];
			return;
		}

		this.vertices = new Array();
		for(let i = 0; i < data.vertices.length; i++) {
			this.vertices.push(new Vertex(data.vertices[i]))
		}
		this.faces = new Array();
		for(let i = 0; i < data.faces.length; i++) {
			this.faces.push(new Face(data.faces[i]))
		}
		this.bones = new Array();
		for(let i = 0; i < data.bones.length; i++) {
			this.bones.push(new Bone(data.bones[i]))
		}
		this.updateBoneIndices();
		this.animations = new Array();
		for(let i = 0; i < data.animations.length; i++) {
			this.animations.push(new Anim(data.animations[i]))
		}
		this.materials = new Array();
		
		/*
		this.materials = new Array(data.materials.length);
		for (var i = 0; i < data.materials.length; i++) {
			this.materials[i] = {
				"color": data.materials[i].color,
				"texture": data.materials[i].texture,
				"alpha": 0
			}
			if (data.materials[i].glow) {
				this.materials[i].glow = data.materials[i].glow;
			} else {
				this.materials[i].glow = 0;
			}
		}
		//The Root bone is always first.
		var rootIndex = 0;
		
		//this is here since some early models did not have the 'bones' data included. Adds the root bone and sets all vertices to it.
		if (this.bones == undefined) {
			this.bones = new Array();
			this.bones.unshift({"index": 0, "name": "Root", x: 0, y: 0, z: 0, parent: 0});
		} else if (this.bones[rootIndex].parent == undefined) {	//set the root's values if this model does not have a skeleton.
			this.bones[rootIndex] = {"index": 0, "name": "Root", x: 0, y: 0, z: 0, parent: 0};
		}
		for (var i = 0; i < this.vertices.length; i++) {
			if (this.vertices[i].bone == undefined) {
				this.vertices[i].bone = 0;
			}
		}
		*/
	}

	///////////////////////////////////////////////////////////////////////////////
	// Functions
	///////////////////////////////////////////////////////////////////////////////
	getVertexByIndex = function(index) {
		return this.vertices[index];
	}
	getFaceByIndex = function(index) {
		return this.faces[index];
	}
	getBoneByIndex = function(index) {
		return this.bone[index];
	}
	getAnimationByIndex = function(index) {
		return this.animations[index];
	}


	//updates the indexs for bones
	updateBoneIndices = function() {
		
		for(let i = 0; i < this.bones.length; i++) {
			let found = false;
			let parentName = this.bones[i].getParent();
			for(let j = 0; j < this.bones.length && !found; j++) {
				if (parentName === this.bones[j]) {
					this.bones[i].setParentIndex(j);
					found = true;
				}
			}
		}
	}

	getBoneAnimMatrixs = function(animation, time) {

		let anim = this.getAnimationByIndex(animation);

		//generate matrix for each bone
		let boneMatrixs = new Array(this.bones.length);
		for(let i = 0; i < this.bones.length; i++) {
			let bone = this.bones[i];
			
			let matT = new CPU3D_Matrix();
			matT.makeTranslationMatrix(bone.getPosition().getX(), bone.getPosition().getY(), bone.getPosition().getZ());
			//transform.translate(key.x, key.y, key.z);
			//transform.multiplyWithMatrix(&Animation::convertQuatToMatrix(&key.rx, &key.ry, &key.rz, &key.rw));
			//transform.scale(key.sx, key.sy, key.sz);

			let aBone = anim.getBoneByIndex(i);
			let key = aBone.getKeyframeByIndex(time % 30);

			//get Animation matrix for each bone
			let animT = new CPU3D_Matrix();
			animT.makeTranslationMatrix(key.getPosition().getX(), key.getPosition().getY(), key.getPosition().getZ());

			matT.multiplyWithMatrix(animT);
			boneMatrixs[i] = matT;
		}

		//calculate bone heiarchy
		for(let i = 0; i < this.bones.length; i++) {

		}

		return boneMatrixs;
	}
}