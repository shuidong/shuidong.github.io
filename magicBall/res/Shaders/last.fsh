#ifdef GL_ES                                               
precision lowp float;                                         
#endif                                                         
                                                             
varying vec4 v_fragmentColor;                                 
varying vec2 v_texCoord;                                     
uniform sampler2D u_texture;    
                    
uniform vec3 u_outlineColor;
uniform float u_threshold;
uniform float u_radius;

void main()
{
    ///////////
    float rx = 1.0/640.0;
    float ry = 1.0/960.0;

    vec4 texColor1 = texture2D(u_texture, vec2(v_texCoord.x - rx, v_texCoord.y));  
    vec4 texColor2 = texture2D(u_texture, vec2(v_texCoord.x + rx, v_texCoord.y));  

    vec4 texColor3 = texture2D(u_texture, vec2(v_texCoord.x, v_texCoord.y + ry));  
    vec4 texColor4 = texture2D(u_texture, vec2(v_texCoord.x, v_texCoord.y + ry));  
    
    if(

    (texColor1.r != texColor2.r && texColor1.g != texColor2.g && texColor1.b != texColor2.b)

    || 

    (texColor3.r != texColor4.r && texColor3.g != texColor4.g && texColor3.b != texColor4.b)

    ){
        gl_FragColor = vec4(0, 0, 0, 1);
    }else{
        gl_FragColor = texture2D(u_texture, vec2(v_texCoord.x, v_texCoord.y));
    }
}
