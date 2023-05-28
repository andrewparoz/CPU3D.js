class Controls {
	///////////////////////////////////////////////////////////////////////////////
	// Properites
	///////////////////////////////////////////////////////////////////////////////

	//pointer to the canvas since that what the listners are attached to.
	#canvas;

	#CONT_FORWARD = 87;		//W
	#CONT_BACKWARD = 83;		//S
	#CONT_LEFT = 65;			//A
	#CONT_RIGHT = 68;			//D
	#CONT_UP = 82;			//R
	#CONT_DOWN = 70;			//F
	#CONT_SHIFT = 16;			//SHIFT
	#CONT_JUMP = 32;			//SPACE

	#CONT_ACTION = 2;			//LEFT MOUSE
	#CONT_LOOK = 0;			//RIGHT MOUSE

	controlMoveForward;
	controlMoveBackward;
	controlMoveLeft;
	controlMoveRight;
	controlMoveUp;
	controlMoveDown;
	controlShift;
	controlJump;

	controlAction;
	controlLook;

	mouseX;
	mouseY;
	mouseXDelta;
	mouseYDelta;

	constructor() {
		this.reset();
		return;
	}
	
	reset = function() {
		window.addEventListener('keydown', this.keyDownEvent, false);
		window.addEventListener('keyup', this.keyUpEvent, false);
		this.clear();
	}

	keyDownEvent = function(event) {
		if (event.keyCode == this.CONT_FORWARD) {			//Forward
			this.controlMoveForward = true;
		} else if (event.keyCode == this.CONT_BACKWARD) {	//Back
			this.controlMoveBackward = true;
		} else if (event.keyCode == this.CONT_LEFT) {		//Left
			this.controlMoveLeft = true;
		} else if (event.keyCode == this.CONT_RIGHT) {		//Right
			this.controlMoveRight = true;
		} else if (event.keyCode == this.CONT_UP) {			//Up
			this.controlMoveUp = true;
		} else if (event.keyCode == this.CONT_DOWN) {		//Down
			this.controlMoveDown = true;
		} else if (event.keyCode == this.CONT_SHIFT) {		//Shift
			this.controlShift = true;
		} else if (event.keyCode == this.CONT_JUMP) {		//Jump
			this.controlJump = true;
		}
	}
	
	keyUpEvent = function(event) {
		if (event.keyCode == this.CONT_FORWARD) {			//Forward
			this.controlMoveForward = false;
		} else if (event.keyCode == this.CONT_BACKWARD) {	//Back
			this.controlMoveBackward = false;
		} else if (event.keyCode == this.CONT_LEFT) {		//Left
			this.controlMoveLeft = false;
		} else if (event.keyCode == this.CONT_RIGHT) {		//Right
			this.controlMoveRight = false;
		} else if (event.keyCode == this.CONT_UP) {			//Up
			this.controlMoveUp = false;
		} else if (event.keyCode == this.CONT_DOWN) {		//Down
			this.controlMoveDown = false;
		} else if (event.keyCode == this.CONT_SHIFT) {		//Shift
			this.controlShift = false;
		} else if (event.keyCode == this.CONT_JUMP) {		//Jump
			this.controlJump = false;
		}
	}	

	update = function() {
		this.mouseXDelta = 0;
		this.mouseYDelta = 0;
		return;
	}
	
	updateMousePosition = function(x, y) {
		if (this.mouseX == null) {
			this.mouseX = x;
			this.mouseY = y;
		} else {
			this.mouseXDelta = x - this.mouseX;
			this.mouseYDelta = y - this.mouseY;
			this.mouseX = x;
			this.mouseY = y;
		}
		return;
	}
	
	clear = function() {
		this.controlMoveForward = false;
		this.controlMoveBackward = false;
		this.controlMoveLeft = false;
		this.controlMoveRight = false;
		this.controlMoveUp = false;
		this.controlMoveDown = false;
		this.controlShift = false;
		this.controlJump = false;
		
		this.controlAction = false;
		this.controlLook = false;
		
		this.mouseX = null;
		this.mouseY = null;
		this.mouseXDelta = 0;
		this.mouseYDelta = 0;
		return;
	}
}



///////////////////////////////////////////////////////////////////////////////
// Constructor
///////////////////////////////////////////////////////////////////////////////
/**
*
*/


