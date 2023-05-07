# CPU3D.js
CPU3D is a Javacript library that was started in 2014, to order to draw 3D computer garphics to a webpage using a Canvas element. It’s aims were to render real time 3D scenes on a webpage using only Javascript and native HTML5 components to maximise compatibility.

CPU3D.js is styled after OpenGL 2, with vertex and texture objects, vertex and fragment shader hooks and multi-threading rendering. It is a much smaller library, but that give enough flexibility for most basic 3D rendering. Check out the examples to see what can be done.

While in 2014 when this library was first built it would struggle with a complex scene on even desktop computers. Now a smart phone can run a decent real time 3D scene thanks to improvements in browsers and device hardware. There are still some pretty obvious limits, but effects like lighting, shadows and texture mapping shouldn’t be a problem now.

# Why use this over WebGL?
In short, you shouldn’t if WebGL is available. At the time this project was started, WebGL was still unsupported by several browsers, however that changed within the next few years. Hardware acceleration will always be superior to software rendering, however that does require the browser has access to the hardware in order to use WebGL. 

As CPU3D.js is completely written in Javascript without any external plugins or requirements, it will run on basically anything, including older browsers and more locked down devices. If it can draw a HTML5 Canvas, this library can probably draw 3D graphics to it.

# Future Updates
Since this was started in 2014, and development stopped in 2016, the library needs considerable updating to more modern JavaScript standards. This is the main priority at the moment, as well as providing more examples of work using the library for other developers to learn from.
