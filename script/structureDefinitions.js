// This file contains definitions of all the structures in the atlas, and their mapping to grayscale colour in the textures.
// It also defines the texture pack names.

var atlasStructures = [
    "leftLateralPterygoid",
    "leftMasseter",
    "leftMedialPterygoid",
    /*"leftParotid",//*/
    "leftTemporalis",
    "leftTMJ",

    "rightLateralPterygoid",
    "rightMasseter",
    "rightMedialPterygoid",
    /*"rightParotid",//*/
    "rightTemporalis",
    "rightTMJ"
];

var atlasColours = [
    "#FF00FF",
    "#C8BDE6",
    "#FFFF00",
    "#D1FF00",
    "#FF0000",

    "#118311",
    "#FC9301",
    "#00FFFF",
    "#0083FF",
    "#8000FF"
];

var otherStructures = [
    // "brainstem",
    // "spinalCord",
    // "mandible",
    // "larynx"
];

var atlasStructureMasks = [
    "#E0E0E0",
    "#D0D0D0",
    "#C0C0C0",
    /*"#B0B0B0",//*/
    "#A0A0A0",
    "#909090",

    "#808080",
    "#707070",
    "#606060",
    /*"#505050",//*/
    "#404040",
    "#303030"
]; 

var colourNameMap = {};
colourNameMap["#E0E0E0"] = "leftLateralPterygoid";
colourNameMap["#D0D0D0"] = "leftMasseter";
colourNameMap["#C0C0C0"] = "leftMedialPterygoid";
// colourNameMap["#B0B0B0"] = "leftParotid";
colourNameMap["#A0A0A0"] = "leftTemporalis";
colourNameMap["#909090"] = "leftTMJ";

colourNameMap["#808080"] = "rightLateralPterygoid";
colourNameMap["#707070"] = "rightMasseter";
colourNameMap["#606060"] = "rightMedialPterygoid";
// colourNameMap["#505050"] = "rightParotid";
colourNameMap["#404040"] = "rightTemporalis";
colourNameMap["#303030"] = "rightTMJ";

// colourNameMap["#FFFFFF"] = "brainstem";
// colourNameMap["#202020"] = "spinalCord";
// colourNameMap["#101010"] = "mandible";
// colourNameMap["#F0F0F0"] = "larynx";

// var otherStructureMasks = [
//     "#FFFFFF",
//     "#202020",
//     "#101010",
//     "#F0F0F0"
// ];
// When mandibles show up, they will be #101010

var atlasSliceMap = {};
atlasSliceMap["leftLateralPterygoid"] = 46;
atlasSliceMap["leftMasseter"] = 52;
atlasSliceMap["leftMedialPterygoid"] = 54;
atlasSliceMap["leftTemporalis"] = 35;
atlasSliceMap["leftTMJ"] = 45;


atlasSliceMap["rightLateralPterygoid"] = 45;
atlasSliceMap["rightMasseter"] = 50;
atlasSliceMap["rightMedialPterygoid"] = 52;
atlasSliceMap["rightTemporalis"] = 35;
atlasSliceMap["rightTMJ"] = 42;



var textureNames = [
    "texPack0.png",
    "texPack1.png",
    "texPack2.png",
    "texPack3.png"
];


// Here is the HTML contents for all the structures...
var structureInfoHTMLs = {};
loadHTMLToString("leftMedialPterygoid", "structureInfo/medialPterygoid.html");
loadHTMLToString("rightMedialPterygoid", "structureInfo/medialPterygoid.html");
loadHTMLToString("leftLateralPterygoid", "structureInfo/lateralPterygoid.html");
loadHTMLToString("rightLateralPterygoid", "structureInfo/lateralPterygoid.html");
loadHTMLToString("leftMasseter",  "structureInfo/masseter.html");
loadHTMLToString("rightMasseter", "structureInfo/masseter.html");
loadHTMLToString("leftTemporalis",  "structureInfo/temporalis.html");
loadHTMLToString("rightTemporalis", "structureInfo/temporalis.html");
loadHTMLToString("leftTMJ",  "structureInfo/tmj.html");
loadHTMLToString("rightTMJ", "structureInfo/tmj.html");
loadHTMLToString("instructions", "structureInfo/startInstructions.html");