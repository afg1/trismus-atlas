    // fragment shaders don't have a default precision so we need
    // to pick one. mediump is a good default
    precision highp float;
    uniform sampler2D u_structures[4];// Structures mask 

    uniform vec4 u_colours[16]; // Contains the display colour for each structure
    uniform int u_activeTextures[4];// Contains 1 where a texture is active

    uniform int u_activeStructures[16];// Contains 1 where a structure is active
    uniform vec4 structureMap[16];// Contains the mapping of structure -> mask value

    uniform float u_transparency;// Alpha value to use

    uniform float u_edgeDetect1[9];

    uniform int u_enableEdges;
    uniform vec2 u_textureSize;

    varying vec2 v_texCoord;

    void main() {
        for(int i=0; i < 4; i++)
        {
            if(u_activeTextures[i] == 1)
            {
                for(int j=0; j < 16; j++)
                {
                    if(u_activeStructures[j] == 1)
                    {
                        vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;
                        
                        if(u_enableEdges == 1)
                        {
                            vec4 colourSum = 
                            texture2D(u_structures[i], v_texCoord + onePixel * vec2(-1, -1)) * u_edgeDetect1[0] +
                            texture2D(u_structures[i], v_texCoord + onePixel * vec2(0, -1))  * u_edgeDetect1[1] +
                            texture2D(u_structures[i], v_texCoord + onePixel * vec2(1, -1))  * u_edgeDetect1[2] +
                            texture2D(u_structures[i], v_texCoord + onePixel * vec2(-1, 0))  * u_edgeDetect1[3] +
                            texture2D(u_structures[i], v_texCoord + onePixel * vec2(0, 0))   * u_edgeDetect1[4] +
                            texture2D(u_structures[i], v_texCoord + onePixel * vec2(1, 0))   * u_edgeDetect1[5] +
                            texture2D(u_structures[i], v_texCoord + onePixel * vec2(-1, 1))  * u_edgeDetect1[6] +
                            texture2D(u_structures[i], v_texCoord + onePixel * vec2(0, 1))   * u_edgeDetect1[7] +
                            texture2D(u_structures[i], v_texCoord + onePixel * vec2(1, 1))   * u_edgeDetect1[8];
                            if(length(texture2D(u_structures[i], v_texCoord)) == length(structureMap[j]))
                            {
                                if(length(abs(colourSum)) > 0.1)
                                    gl_FragColor = u_colours[j];
                            }
                        }
                        else
                        {
                            if(length(texture2D(u_structures[i], v_texCoord)) == length(structureMap[j]))
                            {
                                gl_FragColor = vec4(u_colours[j].rgb, u_transparency);
                            }
                        }
                    }
                }
            }
        }
    }