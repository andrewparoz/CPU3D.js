class Quaternion {
	///////////////////////////////////////////////////////////////////////////////
	// Properites
	///////////////////////////////////////////////////////////////////////////////
	#data;

	///////////////////////////////////////////////////////////////////////////////
	// Constructor
	///////////////////////////////////////////////////////////////////////////////
	constructor(x, y, z, w) {
		this.data = [x, y, z, w];
		return;
	}

	///////////////////////////////////////////////////////////////////////////////
	// Functions
	///////////////////////////////////////////////////////////////////////////////
	getX = function() {
		return this.data[0];
	}
	setX = function(x) {
		this.data[0] = x;
		return;
	}
	getY = function() {
		return this.data[1];
	}
	setY = function(y) {
		this.data[1] = y;
		return;
	}
	getZ = function() {
		return this.data[2];
	}
	setZ = function(z) {
		this.data[2] = z;
		return;
	}
	getW = function() {
		return this.data[3];
	}
	setW = function(w) {
		this.data[3] = w;
		return;
	}

	static convertToEular(quat) {
        /*
        Convert a quaternion into euler angles (roll, pitch, yaw)
        roll is rotation around x in radians (counterclockwise)
        pitch is rotation around y in radians (counterclockwise)
        yaw is rotation around z in radians (counterclockwise)
		source: https://automaticaddison.com/how-to-convert-a-quaternion-into-euler-angles-in-python/
        */
        let t0 = 2.0 * (quat.getW() * quat.getX() + quat.getY() * quat.getZ());
        let t1 = 1.0 - 2.0 * (quat.getX() * quat.getX() + quat.getY() * quat.getY());
        let roll_x = Math.atan2(t0, t1);
     
        let t2 = 2.0 * (quat.getW() * quat.getY() - quat.getZ() * quat.getX());
		if (t2 > 1.0) {
        	t2 = 1.0;
		} else if (t2 < -1.0) {
			t2 = -1.0;
		}
        let pitch_y = Math.asin(t2)
     
        let t3 = +2.0 * (quat.getW() * quat.getZ() + quat.getX() * quat.getY())
        let t4 = +1.0 - 2.0 * (quat.getY() * quat.getY() + quat.getZ() * quat.getZ())
        let yaw_z = Math.atan2(t3, t4)

        return new Vector3D(roll_x, pitch_y, yaw_z);
	}
}