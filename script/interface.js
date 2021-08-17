function  getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect(), // abs. size of element
      scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
      scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

  return {
    x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
    y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
  }
}

var zoom = 1.0;
var zoomStep = 1.0/16.0;
var imageLevel = 0.1875;
var imageWindow = 0.8125;
var levelWindowStep = 1.0/16.0;
var cacheTransparency = 0;
var panStatus = [0.0, 0.0, 0.0, 0.0];
var offset = 0.0;

var aMat = [
            zoom, 0, 0, 0,
            0, zoom, 0, 0,
            0, 0, 1, 0,
            panStatus[0] + offset, panStatus[1] + offset, 0, 1
        ];


function mouseWheel(glElements, event)
{
    event.preventDefault();

    if(event.wheelDelta > 0.0)
    {
        if(event.ctrlKey)
        {
            zoom += zoomStep;
        }
        else
        {
            sliceNo += 1;
        }
    }
    else
    {   if(event.ctrlKey)
        {
            zoom -= zoomStep;
        }
        else
        {
            sliceNo -= 1;
        }
    }
    sliceNo = Math.min(Math.max(sliceNo, 10), 73);

    offset = (glElements.ST.gl.canvas.width - glElements.ST.gl.canvas.width * zoom)/2;
    aMat = [
            zoom, 0, 0, 0,
            0, zoom, 0, 0,
            0, 0, 1, 0,
            panStatus[0] + offset, panStatus[1] + offset, 0, 1
        ];

    var matrixLocationCT = glElements.CT.gl.getUniformLocation(glElements.CT.program, "u_matrix");
    glElements.CT.gl.uniformMatrix4fv(matrixLocationCT, false, aMat);

    var matrixLocationST = glElements.ST.gl.getUniformLocation(glElements.ST.program, "u_matrix");
    glElements.ST.gl.uniformMatrix4fv(matrixLocationST, false, aMat);

    document.getElementById("sliceBox").value = sliceNo;
    // requestAnimationFrame(drawSliceWrapper);
}

function mouseLeave(event) // Clear the event when leaving the canvas
{
    selectedFunction = "";
}

var selectedFunction = "";
function mousemove(glElements, event) {
    event.preventDefault();
    var x = event.clientX;
    var y = event.clientY;

    var xy = getMousePos(event.target, event);
    x = xy.x;
    y = xy.y;
    

    var xp = ((x - (panStatus[0] + offset))/zoom);
    var yp = ((y - (panStatus[1] + offset))/zoom);


    glElements.ST.gl.bindFramebuffer(glElements.ST.gl.FRAMEBUFFER, fb);
    var canRead = (glElements.ST.gl.checkFramebufferStatus(glElements.ST.gl.FRAMEBUFFER) == glElements.ST.gl.FRAMEBUFFER_COMPLETE);
    if(canRead)
    {
        pixels = new Uint8Array(1*4);
        glElements.ST.gl.readPixels(xp, ((currentSlice - 1) % slicesPerTexture)*glElements.ST.gl.canvas.width + yp, 1, 1, glElements.ST.gl.RGBA, glElements.ST.gl.UNSIGNED_BYTE, pixels);
        var col = openglColor("#" + pixels[0].toString(16).toUpperCase() + pixels[1].toString(16).toUpperCase() + pixels[2].toString(16).toUpperCase());

        var structureUnderMouse = colourNameMap["#" + pixels[0].toString(16).toUpperCase() + pixels[1].toString(16).toUpperCase() + pixels[2].toString(16).toUpperCase()];
        // if(structureUnderMouse != null)
        {
            var index = Object.keys(colourNameMap).indexOf("#" + pixels[0].toString(16).toUpperCase() + pixels[1].toString(16).toUpperCase() + pixels[2].toString(16).toUpperCase());
            createHoverDisplay(glElements.ST.gl, glElements.ST.program, structureUnderMouse, index);
        }
        
    }
    glElements.ST.gl.bindFramebuffer(glElements.ST.gl.FRAMEBUFFER, null);

    if(mouseIsDown)
    {
        if(selectedFunction == "slices")// change slice number
        {
            if(Math.round((x - lastMouse.x)) > 0.0)
            {
                sliceNo += 1;
            }
            else
            {
                sliceNo -= 1;
            }
        }
        else if(selectedFunction == "zoom")
        {
            if(Math.round((y - lastMouse.y)) > 0.0)
            {
                zoom += zoomStep;
            }
            else
            {
                zoom -= zoomStep;
            }
            zoom = Math.max(0.0, zoom);

            offset = (glElements.ST.gl.canvas.width - glElements.ST.gl.canvas.width * zoom)/2;
            aMat = [
                zoom, 0, 0, 0,
                0, zoom, 0, 0,
                0, 0, 1, 0,
                offset + panStatus[0], offset + panStatus[1], 0, 1
            ];
            var matrixLocationCT = glElements.CT.gl.getUniformLocation(glElements.CT.program, "u_matrix");
            glElements.CT.gl.uniformMatrix4fv(matrixLocationCT, false, aMat);

            var matrixLocationST = glElements.ST.gl.getUniformLocation(glElements.ST.program, "u_matrix");
            glElements.ST.gl.uniformMatrix4fv(matrixLocationST, false, aMat);
        }
        else if(selectedFunction == "level" && !helpShowing)
        {
            // Level?
            if(Math.round((x - lastMouse.x)) > 0.0)
            {
                imageLevel += levelWindowStep;
            }
            else
            {
                imageLevel -= levelWindowStep;
            }
            var levelUniform = glElements.CT.gl.getUniformLocation(glElements.CT.program, "u_level");
            glElements.CT.gl.uniform1f(levelUniform, imageLevel);
        }
        else if(selectedFunction == "window" && !helpShowing)// Window
        {
            if(Math.round((y - lastMouse.y)) > 0.0)
            {
                imageWindow += levelWindowStep;
            }
            else
            {
                imageWindow -= levelWindowStep;
            }
            var windowUniform = glElements.CT.gl.getUniformLocation(glElements.CT.program, "u_window");
            glElements.CT.gl.uniform1f(windowUniform, imageWindow);
        }
        else if(selectedFunction == "pan")
        {
            panStatus[0] += event.movementX;///512.0;
            panStatus[1] += event.movementY;///512.0;

            aMat = [
                zoom, 0, 0, 0,
                0, zoom, 0, 0,
                0, 0, 1, 0,
                panStatus[0] + offset, panStatus[1] + offset, 0, 1
            ];
            var matrixLocationCT = glElements.CT.gl.getUniformLocation(glElements.CT.program, "u_matrix");
            glElements.CT.gl.uniformMatrix4fv(matrixLocationCT, false, aMat);

            var matrixLocationST = glElements.ST.gl.getUniformLocation(glElements.ST.program, "u_matrix");
            glElements.ST.gl.uniformMatrix4fv(matrixLocationST, false, aMat);
        }
        sliceNo = Math.min(Math.max(sliceNo, 10), 73);

        document.getElementById("sliceBox").value = sliceNo;

        lastMouse = getMousePos(event.target, event);
        // requestAnimationFrame(drawSliceWrapper);
    }
}

function mouseup(glElements, event) {
    event.preventDefault();
    selectedFunction = "";
    var key = event.which;
    mouseIsDown = false;
    lastMouse = getMousePos(event.target, event);

}

function mousedown(glElements, event) {
    event.preventDefault();
    var key = event.which;
    console.log(glElements.ST.gl.canvas.width)
    if(event.button == 2)
    {
        mouseIsDown = true;
    }
    
    if((event.button == 0 || event.button == 2) && (startPageActive || helpShowing))
    {
        startPageActive = false;
        helpShowing = false;

        var u_startPageActive = glElements.CT.gl.getUniformLocation(glElements.CT.program, "u_startPage");
        glElements.CT.gl.uniform1i(u_startPageActive, 0);

        var u_activeTexture = glElements.CT.gl.getUniformLocation(glElements.CT.program, "u_activeTextures[0]");
        glElements.CT.gl.uniform1i(u_activeTexture, 1);

        u_activeTexture = glElements.ST.gl.getUniformLocation(glElements.ST.program, "u_activeTextures[0]");
        glElements.ST.gl.uniform1i(u_activeTexture, 1);
        // sliceNo = 10;

        document.getElementById("sliceDisplay").style.display = "block";
        document.getElementById("structureInfoDiv").innerHTML = "";


        // requestAnimationFrame(drawSliceWrapper);
        return;
    }
    firstMouse = getMousePos(event.target, event);
    var xy = getMousePos(event.target, event);
    x = xy.x;
    y = xy.y;

    if(y < 60)// change slice number
    {
        if(x < 60 || x > (glElements.ST.gl.canvas.width - 60))
        {
            selectedFunction = "";
        }
        else
        {
            selectedFunction = "slices";
        }
    }
    else if(x < 60)// Zoom
    {
        if(y < 60 || y > (glElements.ST.gl.canvas.height - 60))
        {
            selectedFunction = "";
        }
        else
        {
            selectedFunction = "zoom";
        }
    }
    else if(y > (glElements.ST.gl.canvas.height - 60))//(512 - 60) // Level
    {
        if(x > (glElements.ST.gl.canvas.width - 60) || x < 60)// Window
        {
            selectedFunction = "";
        }
         selectedFunction = "level";
    }
    else if(x > (glElements.ST.gl.canvas.width - 60))// Window
    {
        if(y > (glElements.ST.gl.canvas.height - 60) || y < 60)// Window
        {
            selectedFunction = "";
        }
        else
        {
            selectedFunction = "window";
        }
    }
    else // Pan
    {
        selectedFunction = "pan";
    }

    var xp = ((x - (panStatus[0] + offset))/zoom);
    var yp = ((y - (panStatus[1] + offset))/zoom);

    if(!mouseIsDown)
    {
        glElements.ST.gl.bindFramebuffer(glElements.ST.gl.FRAMEBUFFER, fb);

        var canRead = (glElements.ST.gl.checkFramebufferStatus(glElements.ST.gl.FRAMEBUFFER) == glElements.ST.gl.FRAMEBUFFER_COMPLETE);
        if(canRead)
        {
            pixels = new Uint8Array(1*4);
            glElements.ST.gl.readPixels(xp, (currentSlice % slicesPerTexture -1 )*glElements.ST.gl.canvas.height + yp, 1, 1, glElements.ST.gl.RGBA, glElements.ST.gl.UNSIGNED_BYTE, pixels);
            var col = openglColor("#" + pixels[0].toString(16).toUpperCase() + pixels[1].toString(16).toUpperCase() + pixels[2].toString(16).toUpperCase());

            var structureUnderMouse = colourNameMap["#" + pixels[0].toString(16).toUpperCase() + pixels[1].toString(16).toUpperCase() + pixels[2].toString(16).toUpperCase()];

            
            displayInformation(structureUnderMouse);

            if(structureUnderMouse != null)
            {
                var aChkBox = document.getElementById(structureUnderMouse + "Selected")
                if(aChkBox.checked)
                {
                    aChkBox.checked = false;
                }
                else
                {
                    aChkBox.checked = true;
                }
            }
        }

        glElements.ST.gl.bindFramebuffer(glElements.ST.gl.FRAMEBUFFER, null);
    }
}



function keyDown(event){
    const keyName = event.key;

    if (keyName === 'Control') {
        // not alert when only Control key is pressed.
        return;
    }
    else if(keyName == " ")
    {
        if(document.getElementById("structureTransparency").value > 0)
        {
            cacheTransparency = document.getElementById("structureTransparency").value;
            document.getElementById("structureTransparency").value = 0;
        }
        else
        {
            document.getElementById("structureTransparency").value = cacheTransparency;
        }
    }
    else if(keyName == "w")
    {
        panStatus[1] -= 1.0;
    }
    else if(keyName == "s")
    {
        panStatus[1] += 1.0;
    }
    else if(keyName == "d")
    {
        panStatus[0] += 1.0;
    }
    else if(keyName == "a")
    {
        panStatus[0] -= 1.0;
    }
    else if(keyName == "W")
    {
        panStatus[1] -= 10.0;
    }
    else if(keyName == "S")
    {
        panStatus[1] += 10.0;
    }
    else if(keyName == "D")
    {
        panStatus[0] += 10.0;
    }
    else if(keyName == "A")
    {
        panStatus[0] -= 10.0;
    }
    else if(keyName == "i")
    {
        zoom += 0.5;
        offset = (glElements.ST.gl.canvas.width - glElements.ST.gl.canvas.width * zoom)/2;
    }
    else if(keyName == "o")
    {
        zoom -= 0.5;
        offset = (glElements.ST.gl.canvas.width - glElements.ST.gl.canvas.width * zoom)/2;
    }
    else if(keyName == "I")
    {
        zoom += 1;
        offset = (glElements.ST.gl.canvas.width - glElements.ST.gl.canvas.width * zoom)/2;
    }
    else if(keyName == "O")
    {
        zoom -= 1;
        offset = (glElements.ST.gl.canvas.width - glElements.ST.gl.canvas.width * zoom)/2;
    }
    else if(keyName == "r")// reset
    {
        panStatus[0] = 0.0;
        panStatus[1] = 0.0;
        offset = 0;
        zoom = 1.0;
        imageWindow = 0.8125;
        imageLevel = 0.1875;

        var levelUniform = glElements.CT.gl.getUniformLocation(glElements.CT.program, "u_level");
        var windowUniform = glElements.CT.gl.getUniformLocation(glElements.CT.program, "u_window");
        glElements.CT.gl.uniform1f(windowUniform, imageWindow);
        glElements.CT.gl.uniform1f(levelUniform, imageLevel);

        aMat = [
                zoom, 0, 0, 0,
                0, zoom, 0, 0,
                0, 0, 1, 0,
                panStatus[0] + offset, panStatus[1] + offset, 0, 1
            ];
    }
    else if(keyName == "b")
    {
        var box = document.getElementById("boneWindow");
        box.checked = box.checked ^ true;
        toggleBoneWindow(box);
    }
    else if(keyName == "e")
    {
        var box = document.getElementById("edgeDetect")
        box.checked = box.checked ^ true;
        toggleEdgeDetection(box);
    }
    else if(keyName == "g")
    {
        // launch go-to propmt
        if(window.process != undefined)
        {
            window.alert("This function does not work in the app. Sorry.");
        }
        var slice = window.prompt("Go to slice:", "10");
        if (slice == null || slice == "") 
        {
            // Nothing to be done, so do nothing
        } 
        else // Call goToSlice(n)
        {
            goToSlice(slice);
        }
    }
    else if(keyName == "Enter" && startPageActive)
    {
        startPageActive = false;
        helpShowing = false;
        var u_startPageActive = glElements.CT.gl.getUniformLocation(glElements.CT.program, "u_startPage");
        glElements.CT.gl.uniform1i(u_startPageActive, 0);
        // sliceNo = 10;

        document.getElementById("sliceDisplay").style.display = "block";
        document.getElementById("structureInfoDiv").innerHTML = "";
    }
    else if(keyName == "h")
    {
        if(helpShowing)// Help already up, toggle it off
        {
            helpShowing = false;
            var u_startPageActive = glElements.CT.gl.getUniformLocation(glElements.CT.program, "u_startPage");
            glElements.CT.gl.uniform1i(u_startPageActive, 0);
            document.getElementById("sliceDisplay").style.display = "block";
            document.getElementById("structureInfoDiv").innerHTML = "";
        }
        else
        {
            helpShowing = true;
            var u_startPageActive = glElements.CT.gl.getUniformLocation(glElements.CT.program, "u_startPage");
            glElements.CT.gl.uniform1i(u_startPageActive, 1);
            document.getElementById("structureInfoDiv").innerHTML = structureInfoHTMLs["instructions"];
            document.getElementById("sliceDisplay").style.display = "none";
        }
    }
    else if(keyName == "ArrowUp")
    {
        sliceNo += 1;
    }
    else if(keyName == "ArrowDown")
    {
        sliceNo -= 1;
    }

    sliceNo = Math.min(Math.max(sliceNo, 10), 73);

    aMat = [
                zoom, 0, 0, 0,
                0, zoom, 0, 0,
                0, 0, 1, 0,
                offset + panStatus[0], offset + panStatus[1], 0, 1
            ];
    var matrixLocationCT = glElements.CT.gl.getUniformLocation(glElements.CT.program, "u_matrix");
    glElements.CT.gl.uniformMatrix4fv(matrixLocationCT, false, aMat);

    var matrixLocationST = glElements.ST.gl.getUniformLocation(glElements.ST.program, "u_matrix");
    glElements.ST.gl.uniformMatrix4fv(matrixLocationST, false, aMat);

//   requestAnimationFrame(drawSliceWrapper);
}





function buildDropdownMenu(atlasStructures, otherStructures)
{
    var menuList = document.createElement("ul"); 

    colours = [
        "#FF00FF",
        "#00FFFF",
        "#0000FF",/*????*/
        "#008000",
        "#00FF00",
        "#808000",
        "#800080",
        "#FF0000",
        "#008080",
        "#FFFF00"
    ];




    // Generic menu items
    var mainMenu = document.createElement("li");
    mainMenu.setAttribute("class", "dropdown");

    var mainMenuButton = document.createElement("button");
    var buttonText = document.createTextNode("Menu");
    mainMenuButton.setAttribute("class", "dropbtn");
    mainMenuButton.appendChild(buttonText);

    var mainMenuDiv = document.createElement("div");
    mainMenuDiv.setAttribute("class", "dropdown-content");
    var mainMenuTable = document.createElement("table");

    // Here is where the main menu is built. 
    // The order of items is the same as the order of definitions here
    
    var overviewRow = mainMenuTable.insertRow();
    var cell = overviewRow.insertCell();
    cell.innerHTML = "<a href='#' onclick=\"launchAtlasOverviewDialog();\">Atlas Overview</a>";
    cell.setAttribute("align", "left");

    var structOverviewRow = mainMenuTable.insertRow();
    var cell = structOverviewRow.insertCell();
    cell.innerHTML = "<a href='#' onclick=\"launchStructureOverviewDialog();\">Structures Overview</a>";
    cell.setAttribute("align", "left");

    // var fileRow = mainMenuTable.insertRow();
    // var cell = fileRow.insertCell();
    // cell.innerHTML = "<a href='#' onclick=\"launchHelpDialog();\">Help</a>";
    // cell.setAttribute("align", "left");



    // Add a menu item to tunr on/off edge detection
    var boneWindowRow = mainMenuTable.insertRow();
    var cell = boneWindowRow.insertCell();
    var chkBoxi = document.createElement("input");
    chkBoxi.setAttribute("type", "checkbox");
    chkBoxi.setAttribute("id", "boneWindow");
    chkBoxi.setAttribute("name", "boneWindowBox");
    chkBoxi.setAttribute("onclick", "toggleBoneWindow(this)");
    chkBoxi.setAttribute("align", "left");
    cell.appendChild(chkBoxi);
    
    cell = boneWindowRow.insertCell();
    cell.innerHTML = "Bone Window";
    cell.setAttribute("align", "left");



    var closeRow = mainMenuTable.insertRow();
    var cell = closeRow.insertCell();
    cell.innerHTML = "<a href='#' onclick=\"window.close();\">Close</a>";
    cell.setAttribute("align", "left");


    mainMenuDiv.appendChild(mainMenuTable);
    mainMenuButton.appendChild(mainMenuDiv);
    mainMenu.appendChild(mainMenuButton);

    // Atlas structures
    var atlasChunk = document.createElement("li");
    atlasChunk.setAttribute("class", "dropdown");

    var atlasButton = document.createElement("button");
    var buttonText = document.createTextNode("Atlas Structures");
    atlasButton.setAttribute("class", "dropbtn");
    atlasButton.appendChild(buttonText);

    var atlasDiv = document.createElement("div");
    atlasDiv.setAttribute("class", "dropdown-content");
    var atlasTable = document.createElement("table");

    //  Add a "select all box"
    var rowi = atlasTable.insertRow();
    var checkboxCell = rowi.insertCell();
    var nameCell = rowi.insertCell();
    var colourCell = rowi.insertCell();

    var chkBoxi = document.createElement("input");
    chkBoxi.setAttribute("type", "checkbox");
    chkBoxi.setAttribute("id", "SelectAllAtlas");
    chkBoxi.setAttribute("name", "SelectAll");
    chkBoxi.setAttribute("onclick", "updateSelectedStructures(this)");
    checkboxCell.appendChild(chkBoxi);

    nameCell.innerHTML = "Select All"

    for(i in atlasStructures)
    {
        var rowi = atlasTable.insertRow();
        var checkboxCell = rowi.insertCell();
        var nameCell = rowi.insertCell();
        var colourCell = rowi.insertCell();

        var chkBoxi = document.createElement("input");
        chkBoxi.setAttribute("type", "checkbox");
        chkBoxi.setAttribute("id", atlasStructures[i] + "Selected");
        chkBoxi.setAttribute("name", atlasStructures[i]);
        chkBoxi.setAttribute("onclick", "updateSelectedStructures(this)");
        checkboxCell.appendChild(chkBoxi);

        nameCell.innerHTML = atlasStructures[i];
        nameCell.setAttribute("align", "left");
        nameCell.addEventListener("click", function(){goToSlice(atlasSliceMap[this.innerHTML]); displayInformation(this.innerHTML);})

        var colouri = document.createElement("input");
        colouri.setAttribute("type", "color");
        colouri.setAttribute("id", atlasStructures[i] + "Colour");
        colouri.setAttribute("value", atlasColours[i % atlasColours.length]);// Just loop round if we have more structures
        // colouri.setAttribute("oninput", "requestAnimationFrame(drawSliceWrapper);");
        colourCell.setAttribute("align", "right");
        colourCell.appendChild(colouri);
    }

    // Add a menu item to tunr on/off edge detection
    var edgeDetectRow = atlasTable.insertRow();
    var cell = edgeDetectRow.insertCell();
    var chkBoxi = document.createElement("input");
    chkBoxi.setAttribute("type", "checkbox");
    chkBoxi.setAttribute("id", "edgeDetect");
    chkBoxi.setAttribute("name", "edgeDetectionBox");
    chkBoxi.setAttribute("onclick", "toggleEdgeDetection(this)");
    
    cell.appendChild(chkBoxi);
    cell = edgeDetectRow.insertCell();
    cell.innerHTML = "Edges only";
    cell.setAttribute("align", "left");

    var transparencyRow = atlasTable.insertRow();
    var cell = transparencyRow.insertCell();
    var transparencySlider = document.createElement("input");
    transparencySlider.setAttribute("type", "range");
    transparencySlider.setAttribute("id", "structureTransparency");
    transparencySlider.setAttribute("min", "0.0");
    transparencySlider.setAttribute("max", "1.0");
    transparencySlider.setAttribute("step", "0.01");
    transparencySlider.setAttribute("value", "0.75");
    transparencySlider.setAttribute("name", "structureTransparencySlider");
    // transparencySlider.setAttribute("oninput", "requestAnimationFrame(drawSliceWrapper);");
    cell.appendChild(transparencySlider)
    var cell2 = transparencyRow.insertCell();
    cell2.innerHTML = "Transparency";
    cell2.setAttribute("align", "left");

    atlasDiv.appendChild(atlasTable);
    atlasButton.appendChild(atlasDiv);
    atlasChunk.appendChild(atlasButton);




    // Other structures
    if(otherStructures.length > 0)
    {
        var othersChunk = document.createElement("li");
        othersChunk.setAttribute("class", "dropdown");

        var othersButton = document.createElement("button");
        var buttonTextOthers = document.createTextNode("Other Structures");
        othersButton.setAttribute("class", "dropbtn");
        othersButton.appendChild(buttonTextOthers);

        var othersDiv = document.createElement("div");
        othersDiv.setAttribute("class", "dropdown-content");
        var othersTable = document.createElement("table");

        var rowi = othersTable.insertRow();
        var checkboxCell = rowi.insertCell();
        var nameCell = rowi.insertCell();
        var colourCell = rowi.insertCell();
        var chkBoxi = document.createElement("input");
        chkBoxi.setAttribute("type", "checkbox");
        chkBoxi.setAttribute("id", "SelectAllOther");
        chkBoxi.setAttribute("name", "SelectAll");
        chkBoxi.setAttribute("onclick", "updateSelectedStructures(this)");
        checkboxCell.appendChild(chkBoxi);

        nameCell.innerHTML = "Select All"

        for(i=0; i < otherStructures.length; i++)
        {
            var rowi = othersTable.insertRow();
            var checkboxCell = rowi.insertCell();
            var nameCell = rowi.insertCell();
            var colourCell = rowi.insertCell();

            var chkBoxi = document.createElement("input");
            chkBoxi.setAttribute("type", "checkbox");
            chkBoxi.setAttribute("id", otherStructures[i] + "Selected");
            chkBoxi.setAttribute("onclick", "updateSelectedStructures(this)");
            checkboxCell.appendChild(chkBoxi);

            nameCell.innerHTML = otherStructures[i];
            nameCell.setAttribute("align", "left");

            var colouri = document.createElement("input");
            colouri.setAttribute("type", "color");
            colouri.setAttribute("id", otherStructures[i] + "Colour");
            colouri.setAttribute("value", colours[i % colours.length]);// Just loop round if we have more structures
            colourCell.setAttribute("align", "right");
            colourCell.appendChild(colouri);
        }

        othersDiv.appendChild(othersTable);
        othersButton.appendChild(othersDiv);
        othersChunk.appendChild(othersButton);
    }

    // Put things into the page

    menuList.appendChild(mainMenu);
    menuList.appendChild(atlasChunk);
    if(otherStructures.length > 0)
    {
        menuList.appendChild(othersChunk);
    }
    

    document.body.appendChild(menuList);
}


function updateSelectedStructures(chkBox)
{
    var values = Object.keys(colourNameMap).map(function(e) {return colourNameMap[e]})

    var gl = glElements.ST.gl;
    var program = glElements.ST.program;

    gl.useProgram(program);

    if(chkBox != null)
    {
        if(chkBox.id == "SelectAllAtlas")
        {
            if(chkBox.checked == true)
            {
                for(i = 0; i < atlasStructures.length; i++)
                {
                    var aChkBox = document.getElementById(atlasStructures[i] + "Selected")
                    aChkBox.checked = true;
                    var activeStructurei = gl.getUniformLocation(program, "u_activeStructures[" + i + "]");
                    gl.uniform1i(activeStructurei, 1);
                }
            }
            else
            {
                for(i = 0; i < atlasStructures.length; i++)
                {
                    var aChkBox = document.getElementById(atlasStructures[i] + "Selected")
                    aChkBox.checked = false;
                    var activeStructurei = gl.getUniformLocation(program, "u_activeStructures[" + i + "]");
                    gl.uniform1i(activeStructurei, 0);
                }
            }
            // requestAnimationFrame(drawSliceWrapper);
            return;
        }
        else if(chkBox.id == "SelectAllOther")
        {
            if(chkBox.checked == true)
            {
                for(i = 0; i < otherStructures.length; i++)
                {
                    var aChkBox = document.getElementById(otherStructures[i] + "Selected")
                    aChkBox.checked = true;
                    var activeStructurei = gl.getUniformLocation(program, "u_activeStructures[" + (i + atlasStructures.length)+ "]");
                    gl.uniform1i(activeStructurei, 1);
                }
            }
            else
            {
                for(i = 0; i < otherStructures.length; i++)
                {
                    var aChkBox = document.getElementById(otherStructures[i] + "Selected")
                    aChkBox.checked = false;
                    var activeStructurei = gl.getUniformLocation(program, "u_activeStructures[" + (i + atlasStructures.length) + "]");
                    gl.uniform1i(activeStructurei, 0);
                }
            }
            // requestAnimationFrame(drawSliceWrapper);
            return;
        }
    }

    for(i=0; i < atlasStructures.length; i++)
    {
        var aChkBox = document.getElementById(atlasStructures[i] + "Selected")
        if(aChkBox.checked)
        {
            var activeStructurei = gl.getUniformLocation(program, "u_activeStructures[" + i + "]");
            gl.uniform1i(activeStructurei, 1);
        }
        else
        {
            var activeStructurei = gl.getUniformLocation(program, "u_activeStructures[" + i + "]");
            gl.uniform1i(activeStructurei, 0);
        }
    }

    for(i=0; i < otherStructures.length; i++)
    {
        var aChkBox = document.getElementById(otherStructures[i] + "Selected")
        if(aChkBox.checked)
        {
            var activeStructurei = gl.getUniformLocation(program, "u_activeStructures[" + (i +atlasStructures.length) + "]");
            gl.uniform1i(activeStructurei, 1);
        }
        else
        {
            var activeStructurei = gl.getUniformLocation(program, "u_activeStructures[" + (i +atlasStructures.length) + "]");
            gl.uniform1i(activeStructurei, 0);
        }
    }
    // requestAnimationFrame(drawSliceWrapper);
}

var indexCache = -1;
var highlightedStructure = "";
var cacheActive = false;
function createHoverDisplay(gl, program, structureName, index)
{
    // Get the div to the right of the canvas, that's where the information will be displayed.
    var theCanvas = document.getElementById("structureCanvas");
    var doUpdate = false;
    // deactivate everything not checked
    for(i=0; i < atlasStructures.length; i++)
    {
        if(!document.getElementById(atlasStructures[i] + "Selected").checked)
        {
            var activeStructurei = gl.getUniformLocation(program, "u_activeStructures[" + i + "]");
            gl.uniform1i(activeStructurei, 0);
        }
    }


    // activate the structure we are over
    var activeStructurei = gl.getUniformLocation(program, "u_activeStructures[" + index + "]");
    if(structureName != undefined && structureName != "undefined" )
    {
        theCanvas.setAttribute("title", structureName);
    }

    gl.uniform1i(activeStructurei, 1);

    // requestAnimationFrame(drawSliceWrapper);
}

function displayInformation(structureName)
{
    var theDiv = document.getElementById("structureInfoDiv");
    if(structureName == undefined)
    {
        htmlString = "";
    }
    else
    {
        htmlString = structureInfoHTMLs[structureName];
    }


    if(htmlString == undefined)
    {
        return;
    }

    theDiv.innerHTML = htmlString;
}

function launchHelpDialog()
{
    var helpDialog = document.getElementById("helpDisplay");
    helpDialog.style.display = "block";

    var span = document.getElementById("helpClose");
    span.onclick = function() {helpDialog.style.display = "none";}

    window.onclick = function(event) {
        if (event.target == helpDialog) {
            helpDialog.style.display = "none";
        }
    }
}


function launchAtlasOverviewDialog()
{
    var atlasDialog = document.getElementById("atlasOverview");
    atlasDialog.style.display = "block";

    var span = document.getElementById("atlasOVClose");
    span.onclick = function() {atlasDialog.style.display = "none";}

    window.onclick = function(event) {
        if (event.target == atlasDialog) {
            atlasDialog.style.display = "none";
        }
    }
}

function launchStructureOverviewDialog()
{
    var atlasDialog = document.getElementById("overviewImages");
    atlasDialog.style.display = "block";

    var span = document.getElementById("imagesOVClose");
    span.onclick = function() {atlasDialog.style.display = "none";}

    window.onclick = function(event) {
        if (event.target == atlasDialog) {
            atlasDialog.style.display = "none";
        }
    }


    var canvasForImages = document.getElementById("overviewImageCanvas");
    var softTissueImage = document.getElementById("softTissueOverviewImage");
    var boneTissueImage = document.getElementById("boneOverviewImage");

    context = canvasForImages.getContext('2d');

    context.drawImage(softTissueImage, 0, 0, softTissueImage.width, softTissueImage.height, 
                        0, 0, canvasForImages.width, canvasForImages.height);

    var softTissueButton = document.getElementById("softTissueButton");
    softTissueButton.focus();
}

function switchActiavtion(btn)
{
    var canvasForImages = document.getElementById("overviewImageCanvas");
    var softTissueImage = document.getElementById("softTissueOverviewImage");
    var boneImage = document.getElementById("boneOverviewImage");

    context = canvasForImages.getContext('2d');

    if(btn.id == "softTissueButton")
    {
        context.drawImage(softTissueImage, 0, 0, softTissueImage.width, softTissueImage.height, 
                        0, 0, canvasForImages.width, canvasForImages.height);
    }
    else if(btn.id == "boneButton")
    {
        context.drawImage(boneImage, 0, 0, boneImage.width, boneImage.height, 
                        0, 0, canvasForImages.width, canvasForImages.height);
    }

    btn.focus();

}


function toggleEdgeDetection(box)
{
    var gl = glElements.ST.gl;
    var program = glElements.ST.program;
    gl.useProgram(program);


    var edgeLocation = gl.getUniformLocation(program, "u_enableEdges");
    if(box.checked)
        gl.uniform1i(edgeLocation, 1);
    else
        gl.uniform1i(edgeLocation, 0);

    // requestAnimationFrame(drawSliceWrapper);

}

function toggleBoneWindow(box)
{
    var levelUniform = gl.getUniformLocation(program, "u_level");
    var windowUniform = gl.getUniformLocation(program, "u_window");
    if(box.checked)
    {
        gl.uniform1f(levelUniform, 0.6875);
        gl.uniform1f(windowUniform, 2.25);
    }
    else
    {
        gl.uniform1f(levelUniform, 0.1875);
        gl.uniform1f(windowUniform, 0.8125);
    }
    // requestAnimationFrame(drawSliceWrapper);
}

function displayInfo(el)
{
    var variableName = el.id + "Info";

    var documentElement = document.getElementById(variableName);
    if(documentElement.style.display == "")
    {
        documentElement.style.display = "block";
        if(el.id == "origin")
        {
            el.innerHTML = "Origin &#9662;"
        }
        else if(el.id == "insertion")
        {
            el.innerHTML = "Insertion &#9662;"
        }
        else if(el.id == "innervation")
        {
            el.innerHTML = "Innervation &#9662;"
        }
        else if(el.id == "bloodSupply")
        {
            el.innerHTML = "Blood supply &#9662;"
        }
        else if(el.id == "function")
        {
            el.innerHTML = "Function &#9662;"
        }
    }
    else if(documentElement.style.display == "block")
    {
        documentElement.style.display = ""
        if(el.id == "origin")
        {
            el.innerHTML = "Origin &#9655;"
        }
        else if(el.id == "insertion")
        {
            el.innerHTML = "Insertion &#9655;"
        }
        else if(el.id == "innervation")
        {
            el.innerHTML = "Innervation &#9655;"
        }
        else if(el.id == "bloodSupply")
        {
            el.innerHTML = "Blood supply &#9655;"
        }
        else if(el.id == "function")
        {
            el.innerHTML = "Function &#9655;"
        }
    }
}

function goToSlice(n)
{
    var nLimited = Math.max(10, Math.min(n, 73));
    document.getElementById("sliceBox").value = nLimited;
    sliceNo = nLimited;
    // requestAnimationFrame(drawSliceWrapper);
}
