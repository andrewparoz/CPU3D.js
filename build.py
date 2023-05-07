import os
from jsmin import jsmin

PATH_SRC = "\\src\\"
PATH_BUILD = "\\build\\"
BUILD_NAME = "cpu3d.min.js"
DELETE_MARKER = "//DELETE_WHEN_MERGE"

def CombineAndMinify():
	#combine all the js files into one
	code = ""
	for filename in os.listdir(os.getcwd()+PATH_SRC):
		with open(os.path.join(os.getcwd()+PATH_SRC, filename), 'r') as f:
			print("Loading " + filename)
			code += f.read()
			code += "\n"
			f.close()

	#remove delete markers
	index1 = 0;
	index2 = 0;
	while index1 > -1:
		index1 = code.find(DELETE_MARKER)
		if index1 > -1:
			index2 = code.find(DELETE_MARKER, index1+1) + len(DELETE_MARKER)
			code = code[0:index1] + code[index2:]
	

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