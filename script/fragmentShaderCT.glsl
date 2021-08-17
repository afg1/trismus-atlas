    // fragment shaders don't have a default precision so we need
    // to pick one. mediump is a good default
    precision highp float;
    uniform sampler2D u_image0[4];// CT image
    uniform sampler2D u_startTexture; // Startpage texture

    uniform int u_activeTextures[4];// Contains 1 where a texture is active

    uniform float u_level;
    uniform float u_window;

    uniform int u_startPage;

    varying vec2 v_texCoord;

    void main() {

        if(u_startPage == 1)
        {
            gl_FragColor = vec4(texture2D(u_startTexture, v_texCoord).rgb, 1.0);
        }
        else
        {
            for(int i=0; i < 4; i++)
            {
                if(u_activeTextures[i] == 1)
                {
                    gl_FragColor = ((texture2D(u_image0[i], v_texCoord) - u_window/2.0)/ u_level) + u_window/2.0;
                }
            }
        }
    }