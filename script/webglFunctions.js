function initWebGL(canvas) {
	var agl = null;
	
	// Try to grab the standard context. If it fails, fallback to experimental.
	agl = canvas.getContext('webgl', {alpha: true, preMultipliedAlpha: true})  || canvas.getContext('experimental-webgl');
	
	// If we don't have a GL context, give up now
	if (!agl) {
		alert('Unable to initialize WebGL. Your browser may not support it.');
	}
	agl.viewport(0, 0, canvas.width, canvas.height);
  
	agl.enable( agl.BLEND );
	agl.blendEquation( agl.FUNC_ADD );
	agl.blendFunc( agl.SRC_ALPHA, agl.ONE_MINUS_SRC_ALPHA );

	return agl;
}

function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = false;
  success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  console.log("Failed to compile shader ", type);
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

function getProgram(gl, vertID, fragID)
{
	var vertexShaderSource = document.getElementById(vertID).text;
	var fragmentShaderSource = document.getElementById(fragID).text;
	var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
	var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
	var program = createProgram(gl, vertexShader, fragmentShader);
	return program;
}

function prepareGLContext(glObject)
{
	glObject.gl.useProgram(glObject.program);

	var positionAttributeLocation = glObject.gl.getAttribLocation(glObject.program, "a_position");// Current draw position
	var positionBuffer = glObject.gl.createBuffer();
	glObject.gl.bindBuffer(glObject.gl.ARRAY_BUFFER, positionBuffer);
	setRectangle(glObject.gl, 0, 0, glObject.gl.canvas.width, glObject.gl.canvas.height);

	glObject.gl.enableVertexAttribArray(positionAttributeLocation)
	glObject.gl.bindBuffer(glObject.gl.ARRAY_BUFFER, positionBuffer);       
	
	// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
	var size = 2;          // 2 components per iteration
	var type = glObject.gl.FLOAT;   // the data is 32bit floats
	var normalize = false; // don't normalize the data
	var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
	var offset = 0;        // start at the beginning of the buffer
	glObject.gl.vertexAttribPointer(
		positionAttributeLocation, size, type, normalize, stride, offset);


	glObject.gl.viewport(0, 0, glObject.gl.canvas.width, glObject.gl.canvas.height);

	// Clear the canvas
	glObject.gl.clearColor(0, 0, 1, 0);
	glObject.gl.clear(glObject.gl.COLOR_BUFFER_BIT);
}

function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2,
  ]), gl.STATIC_DRAW);
}

function openglColor(hexcode){
	var hex,r,g,b,glr,glb,glb;

		if(hexcode[0]=="#")
		{
			hex=hexcode.substring(1);
			r=parseInt(hex.substring(0,2),16);
			g=parseInt(hex.substring(2,4),16);
			b=parseInt(hex.substring(4,6),16);
		}
		else{
			hex=hexcode;
			r=parseInt(hex.substring(0,2),16);
			g=parseInt(hex.substring(2,4),16);
			b=parseInt(hex.substring(4,6),16);
		}

	glr=((1/255)*r).toFixed(10);
	glg=((1/255)*g).toFixed(10);
	glb=((1/255)*b).toFixed(10);
	
	return new Float32Array([glr, glg, glb]);
}



function initializeScene()
{

}

function updateColours(gl, program, atlasStructures, otherStructures)
{
	var numberOfStructures = atlasStructures.length + otherStructures.length;
	for(i=0; i < atlasStructures.length; i++)
	{
		var currColour = gl.getUniformLocation(program, "u_colours[" + i + "]");
		var aColour = openglColor(document.getElementById(atlasStructures[i]+"Colour").value);
		gl.uniform4f(currColour, aColour[0], aColour[1], aColour[2], 1.0);
	}

	for(i=0; i < otherStructures.length; i++)
	{
		var currColour = gl.getUniformLocation(program, "u_colours[" + (i + atlasStructures.length )+ "]");
		var aColour = openglColor(document.getElementById(otherStructures[i]+"Colour").value);
		gl.uniform4f(currColour, aColour[0], aColour[1],aColour[2], 1.0);
	}

}

function checkCTTexturesForSlice(gl, program, sliceNo, ctTextures)
{

	for(i=0; i< 4; i++)
	{
		gl.activeTexture(gl.TEXTURE0 + i);
		gl.bindTexture(gl.TEXTURE_2D, ctTextures[i]);
	}
	// If we try to get a slice outside the range, set back to min/max
	sliceNo = Math.min(Math.max(10, sliceNo), 73);
	sliceOffset = 9

	// Set up a framebuffer where we can bind the texture being used
	
	currentSlice = sliceNo - sliceOffset;
	if(currentSlice <= 16 )
	{
		// Activate texture 0 and texture 0 + structOffset
		var activeStructure = gl.getUniformLocation(program, "u_activeTextures[0]");
		gl.uniform1i(activeStructure, 1);
		// deactivate all the others
		for(i=1; i < 4; i++)
		{
			var deActiveStructurei = gl.getUniformLocation(program, "u_activeTextures[" + i + "]");
			gl.uniform1i(deActiveStructurei, 0);
		}

	}
	else if(currentSlice > 16 && currentSlice <= 32)// Slice between 16 and 32
	{
		// deactivate all the others
		for(i=0; i < 4; i++)
		{
			var deActiveStructurei = gl.getUniformLocation(program, "u_activeTextures[" + i + "]");
			gl.uniform1i(deActiveStructurei, 0);
		}
		// Activate texture 1 and texture 1 + structOffset
		var activeStructure = gl.getUniformLocation(program, "u_activeTextures[1]");
		gl.uniform1i(activeStructure, 1);
	}
	else if(currentSlice > 32 && currentSlice <= 48)// Slice between 32 and 48
	{
		// deactivate all the others
		for(i=0; i < 4; i++)
		{
			var deActiveStructurei = gl.getUniformLocation(program, "u_activeTextures[" + i + "]");
			gl.uniform1i(deActiveStructurei, 0);
		}
		// Activate texture 1 and texture 1 + structOffset
		var activeStructure = gl.getUniformLocation(program, "u_activeTextures[2]");
		gl.uniform1i(activeStructure, 1);
	}
	else if(currentSlice > 48 && currentSlice <=73)// Slice between 16 and 32
	{
		// deactivate all the others
		for(i=0; i < 4; i++)
		{
			var deActiveStructurei = gl.getUniformLocation(program, "u_activeTextures[" + i + "]");
			gl.uniform1i(deActiveStructurei, 0);
		}
		// Activate texture 1 and texture 1 + structOffset
		var activeStructure = gl.getUniformLocation(program, "u_activeTextures[3]");
		gl.uniform1i(activeStructure, 1);
	}

	return currentSlice;
}

function checkStructureTexturesForSlice(gl, program, sliceNo, structureTextures)
{

	// for(i=0; i< 4; i++)
	// {
	// 	gl.activeTexture(gl.TEXTURE0 + i);
	// 	gl.bindTexture(gl.TEXTURE_2D, structureTextures[i])
	// }
	// If we try to get a slice outside the range, set back to min/max
	sliceNo = Math.min(Math.max(10, sliceNo), 73);
	sliceOffset = 9

	// Set up a framebuffer where we can bind the texture being used
	
	gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

	currentSlice = sliceNo - sliceOffset;
	if(currentSlice <= 16 )
	{
		

		// Activate texture 0 and texture 0 + structOffset
		var activeStructure = gl.getUniformLocation(program, "u_activeTextures[0]");
		gl.uniform1i(activeStructure, 1);

		gl.activeTexture(gl.TEXTURE0);
		// deactivate all the others
		var deactiveStructure = gl.getUniformLocation(program, "u_activeTextures[1]");
		gl.uniform1i(deactiveStructure, 0);
		deactiveStructure = gl.getUniformLocation(program, "u_activeTextures[2]");
		gl.uniform1i(deactiveStructure, 0);
		deactiveStructure = gl.getUniformLocation(program, "u_activeTextures[3]");
		gl.uniform1i(deactiveStructure, 0);

		// Activate texture 0 and texture 0 + structOffset
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, structureTextures[0], 0);// Binds the right texture to the framebuffer
	}
	else if(currentSlice > 16 && currentSlice <= 32)// Slice between 16 and 32
	{

		// Activate texture 0 and texture 0 + structOffset
		var activeStructure = gl.getUniformLocation(program, "u_activeTextures[1]");
		gl.uniform1i(activeStructure, 1);

		gl.activeTexture(gl.TEXTURE1);
		// deactivate all the others
		var deactiveStructure = gl.getUniformLocation(program, "u_activeTextures[0]");
		gl.uniform1i(deactiveStructure, 0);
		deactiveStructure = gl.getUniformLocation(program, "u_activeTextures[2]");
		gl.uniform1i(deactiveStructure, 0);
		deactiveStructure = gl.getUniformLocation(program, "u_activeTextures[3]");
		gl.uniform1i(deactiveStructure, 0);

		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, structureTextures[1], 0);// Binds the right texture to the framebuffer
	}
	else if(currentSlice > 32 && currentSlice <= 48)// Slice between 32 and 48
	{

		// Activate texture 0 and texture 0 + structOffset
		var activeStructure = gl.getUniformLocation(program, "u_activeTextures[2]");
		gl.uniform1i(activeStructure, 1);

		gl.activeTexture(gl.TEXTURE2);
		// deactivate all the others
		var deactiveStructure = gl.getUniformLocation(program, "u_activeTextures[0]");
		gl.uniform1i(deactiveStructure, 0);
		deactiveStructure = gl.getUniformLocation(program, "u_activeTextures[1]");
		gl.uniform1i(deactiveStructure, 0);
		deactiveStructure = gl.getUniformLocation(program, "u_activeTextures[3]");
		gl.uniform1i(deactiveStructure, 0);

		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, structureTextures[2], 0);// Binds the right texture to the framebuffer

	}
	else if(currentSlice > 48 && currentSlice <=73)// Slice between 16 and 32
	{

		// Activate texture 0 and texture 0 + structOffset
		var activeStructure = gl.getUniformLocation(program, "u_activeTextures[3]");
		gl.uniform1i(activeStructure, 1);

		gl.activeTexture(gl.TEXTURE3);
		// deactivate all the others
		var deactiveStructure = gl.getUniformLocation(program, "u_activeTextures[0]");
		gl.uniform1i(deactiveStructure, 0);
		deactiveStructure = gl.getUniformLocation(program, "u_activeTextures[1]");
		gl.uniform1i(deactiveStructure, 0);
		deactiveStructure = gl.getUniformLocation(program, "u_activeTextures[2]");
		gl.uniform1i(deactiveStructure, 0);

		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, structureTextures[3], 0);// Binds the right texture to the framebuffer
	}

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function updateTransparency(gl, program)
{
	var transparencyValue = document.getElementById("structureTransparency").value;
	var transparency = gl.getUniformLocation(program, "u_transparency");
	gl.uniform1f(transparency, transparencyValue);
}

function setUpCommonContext(glObject)
{
	glObject.gl.useProgram(glObject.program);

	var gl = glObject.gl;
	var program = glObject.program;

	// These are actually common to both
	var positionAttributeLocation = gl.getAttribLocation(program, "a_position");// Current draw position
	var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");// drawing resolution, to calculate clipspace in pixels
	var texCoordLocation = gl.getAttribLocation(program, "a_texCoord");// texture coordinate
	var matrixLocation = gl.getUniformLocation(program, "u_matrix"); // Matrix does all the pan and zoom (even rotation, but not yet)


	gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
	gl.uniformMatrix4fv(matrixLocation, false, aMat);


	// Buffer for 2D clipspace
	// These three lines set up the 2D clipspace. We work in pixels, so it runs from 0 -> 512 in both axes.
	// This defines the drawing area for webgl
	var positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	setRectangle(gl, 0, 0, gl.canvas.width, gl.canvas.height);

	gl.enableVertexAttribArray(positionAttributeLocation)
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);       
	
	// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
	var size = 2;          // 2 components per iteration
	var type = gl.FLOAT;   // the data is 32bit floats
	var normalize = false; // don't normalize the data
	var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
	var offset = 0;        // start at the beginning of the buffer
	gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);


	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	// Clear the canvas
	gl.clearColor(0, 0, 1, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);
}

function setUpCTContext(glObject)
{
	glObject.gl.useProgram(glObject.program);

	var gl = glObject.gl;
	var program = glObject.program;

	var levelUniform = gl.getUniformLocation(program, "u_level");
	var windowUniform = gl.getUniformLocation(program, "u_window");
	var u_startPageActive = gl.getUniformLocation(program, "u_startPage");
	gl.uniform1i(u_startPageActive, 1);

	gl.uniform1f(levelUniform, 0.1875);
	gl.uniform1f(windowUniform, 0.8125);


	var i = 0;
	for(i=0; i< 4; i++)
	{
		gl.activeTexture(gl.TEXTURE0 + i);
		gl.bindTexture(gl.TEXTURE_2D, ctTextures[i]);
		var u_image0Location = gl_ct.getUniformLocation(program_CT, "u_image0[" + i + "]");
		gl.uniform1i(u_image0Location, 0 + i);// CT slices
	}

	gl.activeTexture(gl.TEXTURE0 + 4);
	gl.bindTexture(gl.TEXTURE_2D, startpage);

	var u_startImageLocation = gl.getUniformLocation(program, "u_startTexture");
	gl.uniform1i(u_startImageLocation, 4);
}

function setUpStructureContext(glObject)
{
	glObject.gl.useProgram(glObject.program);

	var gl = glObject.gl;
	var program = glObject.program;

	var transparency = gl.getUniformLocation(program, "u_transparency");
	gl.uniform1f(transparency, 0.75);

	// Flag to enable edge detection
	var enableEdges = gl.getUniformLocation(program, "u_enableEdges");
	gl.uniform1i(enableEdges, 0);


	// Edge detection matrix
	var edgeDetect = [-0.125, -0.125, -0.125,
					-0.125, 1, -0.125,
					-0.125, -0.125, -0.125];
	for(i=0; i < 9; i++)
	{
		var kerneli = gl.getUniformLocation(program, "u_edgeDetect1[" + i + "]");
		gl.uniform1f(kerneli, edgeDetect[i]);
	}

		// Load the atlas structure masks into the program_CT
	for(i=0; i < atlasStructures.length; i++)
	{
		var maskVali = gl.getUniformLocation(program, "structureMap[" + i + "]");
		var thisColour = openglColor(atlasStructureMasks[i]);
		gl.uniform4f(maskVali, thisColour[0], thisColour[1], thisColour[2], 1.0);
	}

	// Load the other structure masks into the program
	for(i=0; i < otherStructures.length ; i++)
	{
		var maskVali = gl.getUniformLocation(program, "structureMap[" + (i + atlasStructures.length) + "]");
		var thisColour = openglColor(otherStructureMasks[i]);
		console.log(colourNameMap[otherStructureMasks[i]], thisColour[0])
		gl.uniform4f(maskVali, thisColour[0], thisColour[1], thisColour[2], 1.0);
	}

	for(i=0; i < 16; i++)
	{
		var activeStructurei = gl.getUniformLocation(program, "u_activeStructures[" + i + "]");
		gl.uniform1i(activeStructurei, 0);
	}


	var i = 0;
	for(i=0; i< 4; i++)
	{
		gl.activeTexture(gl.TEXTURE0 + i);
		gl.bindTexture(gl.TEXTURE_2D, structureTextures[i]);

		var u_image1Location = gl.getUniformLocation(program, "u_structures[" + i + "]");
		gl.uniform1i(u_image1Location, i); // structure mask
	}

	var textureSize = gl.getUniformLocation(program, "u_textureSize"); // Texture size, needed for clipspace conversion
	gl.uniform2f(textureSize, 512.0, 8192.0);

}

// Note: this construct limits the drawing to a given framerate.
// Higher framerates will be more likely to induce flickering and other artefacts
// A good compromise seems to be about 48 fps
var now;
var then = Date.now();
var startTime = then;
var frameCount = 0;
var frameRate = 24; // frames per second
var fpsInterval = 1000/frameRate;

var drawing = false;

function drawSliceWrapper()
{
	if(!drawing)
	{
		startTime = Date.now();
		drawing = true;
	}
	now = Date.now();
	var elapsed = now - then;
	if(elapsed > fpsInterval)
	{
		then = now - (elapsed % fpsInterval);
		currentSlice = checkCTTexturesForSlice(glElements.CT.gl, glElements.CT.program, sliceNo, ctTextures);
		checkStructureTexturesForSlice(glElements.ST.gl, glElements.ST.program, sliceNo, structureTextures);

		updateTransparency(glElements.ST.gl, glElements.ST.program);
		updateColours(glElements.ST.gl, glElements.ST.program, atlasStructures, otherStructures);


		drawSlice(glElements.CT);
		drawSlice(glElements.ST);

		// var sinceStart = now - startTime;
		// var currentFps = Math.round(1000 / (sinceStart / ++frameCount) * 100)/100;
		// console.log("Current FPS: ", currentFps);
	}

	requestAnimationFrame(drawSliceWrapper);
}

function drawSlice(glObject)
{
	glObject.gl.useProgram(glObject.program);

	var gl = glObject.gl;
	var program = glObject.program;

	var texCoordLocation = gl.getAttribLocation(program, "a_texCoord");// texture coordinate
	if(helpShowing || startPageActive)
	{
		var texCoordBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
		var positions = [
			0.0,  0.0,
			1.0,  0.0,
			0.0,  1.0,
			0.0,  1.0,
			1.0,  0.0,
			1.0,  1.0,
		]
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);


		gl.enableVertexAttribArray(texCoordLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
		gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
		// Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
		var size = 2;          // 2 components per iteration
		var type = gl.FLOAT;   // the data is 32bit floats
		var normalize = false; // don't normalize the data
		var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
		var offset = 0;        // start at the beginning of the buffer
		gl.vertexAttribPointer(texCoordLocation, size, type, normalize, stride, offset)

			

		var primitiveType = gl.TRIANGLES;
		var offset = 0;
		var count = 6;
		gl.drawArrays(primitiveType, offset, count);

		return;
	}




	document.getElementById("sliceDisplay").innerHTML = "Slice: " +  sliceNo;
	// Next function should set up a framebuffer with the texture we are about to use
	
	// These lines create the buffer for the texture coordinates.
	// The texture coordinates depend on the slice to be diplayed. 
	// Note: the x coordinate isn't changing - that's because the texture is long and thin. A square texture would need x to change too.
	var texCoordBuffer = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
	var positions = [
		0.0,  ((currentSlice - 1.0) /slicesPerTexture),
		1.0,  ((currentSlice - 1.0) /slicesPerTexture),
		0.0,  ( currentSlice / slicesPerTexture),
		0.0,  ( currentSlice / slicesPerTexture),
		1.0,  ((currentSlice - 1.0) /slicesPerTexture),
		1.0,  ( currentSlice / slicesPerTexture),
	]
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);


	gl.enableVertexAttribArray(texCoordLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
	gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
	// Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
	var size = 2;          // 2 components per iteration
	var type = gl.FLOAT;   // the data is 32bit floats
	var normalize = false; // don't normalize the data
	var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
	var offset = 0;        // start at the beginning of the buffer
	gl.vertexAttribPointer(texCoordLocation, size, type, normalize, stride, offset)

		

	var primitiveType = gl.TRIANGLES;
	var offset = 0;
	var count = 6;
	gl.drawArrays(primitiveType, offset, count);

}