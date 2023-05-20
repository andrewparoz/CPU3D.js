class Utility {
	///////////////////////////////////////////////////////////////////////////////
	// Properites
	///////////////////////////////////////////////////////////////////////////////

	///////////////////////////////////////////////////////////////////////////////
	// Constructor
	///////////////////////////////////////////////////////////////////////////////
	constructor(data) {
		return;
	}

	///////////////////////////////////////////////////////////////////////////////
	// Functions
	///////////////////////////////////////////////////////////////////////////////
	static convertQuaterionToEular(x, y, z, w) {
        /*
        Convert a quaternion into euler angles (roll, pitch, yaw)
        roll is rotation around x in radians (counterclockwise)
        pitch is rotation around y in radians (counterclockwise)
        yaw is rotation around z in radians (counterclockwise)
		source: https://automaticaddison.com/how-to-convert-a-quaternion-into-euler-angles-in-python/
        */

        let t0 = 2.0 * (w * x + y * z);
        let t1 = 1.0 - 2.0 * (x * x + y * y);
        let roll_x = Math.atan2(t0, t1);
     
        let t2 = 2.0 * (w * y - z * x);
		if (t2 > 1.0) {
        	t2 = 1.0;
		} else if (t2 < -1.0) {
			t2 = -1.0;
		}
        let pitch_y = Math.asin(t2)
     
        let t3 = +2.0 * (w * z + x * y)
        let t4 = +1.0 - 2.0 * (y * y + z * z)
        let yaw_z = Math.atan2(t3, t4)

        return new Vector3D(roll_x, pitch_y, yaw_z);
	}
}