import os
from jsmin import jsmin

PATH_SRC = "\\src\\"
PATH_BUILD = "\\build\\"
BUILD_NAME = "cpu3d.min.js"

def CombineAndMinify():
	#combine all the js files into one
	code = ""
	for filename in os.listdir(os.getcwd()+PATH_SRC):
		with open(os.path.join(os.getcwd()+PATH_SRC, filename), 'r') as f:
			print("Loading " + filename)
			code += f.read()
			code += "\n"
			f.close()
	
	#minify
	print("Combining...")
	minified = jsmin(code)

	#write to a min.js file
	output = os.getcwd() + PATH_BUILD + BUILD_NAME;
	print("Writing to " + output)
	file = open(output, "w")
	file.write(minified)
	file.close()
	print("Finished")

CombineAndMinify()