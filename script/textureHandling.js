function bindImageToTexture(gl, image, activeTexture){
  gl.activeTexture(activeTexture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  return texture;
}


function loadStructuresTexture(glObject, textureNames)
{

  var textures = [];
  var images = [];

  

  gl = glObject.gl;
  program = glObject.program;
  gl.useProgram(program);

  var hiddenImage = document.createElement("img");
  hiddenImage.setAttribute("style", "display:none");
  hiddenImage.setAttribute("id", "structTexture"+ 0);
  hiddenImage.addEventListener("load", function(){structureTextures[0] = bindImageToTexture(glElements.ST.gl, this, glElements.ST.gl.TEXTURE0 + 0);});// As soon as the image loads, bind it to the GPU
  hiddenImage.setAttribute("src", "images/structures/" + textureNames[0]);
  document.body.appendChild(hiddenImage);

  hiddenImage = document.createElement("img");
  hiddenImage.setAttribute("style", "display:none");
  hiddenImage.setAttribute("id", "structTexture"+ 1);
  hiddenImage.addEventListener("load", function(){structureTextures[1] = bindImageToTexture(glElements.ST.gl, this, glElements.ST.gl.TEXTURE0 + 1);});// As soon as the image loads, bind it to the GPU
  hiddenImage.setAttribute("src", "images/structures/" + textureNames[1]);
  document.body.appendChild(hiddenImage);

  hiddenImage = document.createElement("img");
  hiddenImage.setAttribute("style", "display:none");
  hiddenImage.setAttribute("id", "structTexture"+ 2);
  hiddenImage.addEventListener("load", function(){structureTextures[2] = bindImageToTexture(glElements.ST.gl, this, glElements.ST.gl.TEXTURE0 + 2 );});// As soon as the image loads, bind it to the GPU
  hiddenImage.setAttribute("src", "images/structures/" + textureNames[2]);
  document.body.appendChild(hiddenImage);


  hiddenImage = document.createElement("img");
  hiddenImage.setAttribute("style", "display:none");
  hiddenImage.setAttribute("id", "structTexture"+ 3);
  hiddenImage.addEventListener("load", function(){structureTextures[3] = bindImageToTexture(glElements.ST.gl, this, glElements.ST.gl.TEXTURE0 + 3);});// As soon as the image loads, bind it to the GPU
  hiddenImage.setAttribute("src", "images/structures/" + textureNames[3]);
  document.body.appendChild(hiddenImage);

  return textures;
}

function loadCTTextures(glObject, textureNames)
{
  var textures = [];
  var images = [];

  gl = glObject.gl;
  program = glObject.program;

  gl.useProgram(program);

  var hiddenImage = document.createElement("img");
  hiddenImage.setAttribute("style", "display:none");
  hiddenImage.setAttribute("id", "ctTexture"+ 0);
  hiddenImage.addEventListener("load", function(){ctTextures[0] =bindImageToTexture(gl, this, gl.TEXTURE0 + 0);});// As soon as the image loads, bind it to the GPU
  hiddenImage.setAttribute("src", "images/ct/" + textureNames[0]);
  document.body.appendChild(hiddenImage);

  hiddenImage = document.createElement("img");
  hiddenImage.setAttribute("style", "display:none");
  hiddenImage.setAttribute("id", "ctTexture"+ 1);
  hiddenImage.addEventListener("load", function(){ctTextures[1] = bindImageToTexture(gl, this, gl.TEXTURE0 + 1);});// As soon as the image loads, bind it to the GPU
  hiddenImage.setAttribute("src", "images/ct/" + textureNames[1]);
  document.body.appendChild(hiddenImage);

  hiddenImage = document.createElement("img");
  hiddenImage.setAttribute("style", "display:none");
  hiddenImage.setAttribute("id", "ctTexture"+ 2);
  hiddenImage.addEventListener("load", function(){ctTextures[2] = bindImageToTexture(gl, this, gl.TEXTURE0 + 2);});// As soon as the image loads, bind it to the GPU
  hiddenImage.setAttribute("src", "images/ct/" + textureNames[2]);
  document.body.appendChild(hiddenImage);


  hiddenImage = document.createElement("img");
  hiddenImage.setAttribute("style", "display:none");
  hiddenImage.setAttribute("id", "ctTexture"+ 3);
  hiddenImage.addEventListener("load", function(){ctTextures[3] = bindImageToTexture(gl, this, gl.TEXTURE0 + 3);});// As soon as the image loads, bind it to the GPU
  hiddenImage.setAttribute("src", "images/ct/" + textureNames[3]);
  document.body.appendChild(hiddenImage);
  return textures;
  
}


function loadOverviewImages(glObject)
{
  gl = glObject.gl;
  program = glObject.program;

  gl.useProgram(program);

  var hiddenImage = document.createElement("img");
  hiddenImage.setAttribute("style", "display:none");
  hiddenImage.setAttribute("id", "softTissueOverviewImage");
  hiddenImage.setAttribute("src", "images/overview/SoftTissueOverview.png");
  document.body.appendChild(hiddenImage);

  hiddenImage = document.createElement("img");
  hiddenImage.setAttribute("style", "display:none");
  hiddenImage.setAttribute("id", "boneOverviewImage");
  hiddenImage.setAttribute("src", "images/overview/BoneOverview.png");
  document.body.appendChild(hiddenImage);


  var textureToReturn;
  hiddenImage = document.createElement("img");
  hiddenImage.setAttribute("style", "display:none");
  hiddenImage.setAttribute("id", "startpage");
  hiddenImage.addEventListener("load", function(){textureToReturn = bindImageToTexture(gl, this, gl.TEXTURE0 + 4);});// As soon as the image loads, bind it to the GPU
  hiddenImage.setAttribute("src", "images/overview/startpage.png");
  document.body.appendChild(hiddenImage);

  return textureToReturn;
}
