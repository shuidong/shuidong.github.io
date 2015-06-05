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
    float rx = 1.0/640.0 * 1.0;
    float ry = 1.0/960.0 * 1.0;

    float radius = u_radius;
    vec4 accum = vec4(0.0);
    vec4 normal = vec4(0.0);
    normal = texture2D(u_texture, vec2(v_texCoord.x, v_texCoord.y));
    
    accum += texture2D(u_texture, vec2(v_texCoord.x - rx, v_texCoord.y - ry));
    accum += texture2D(u_texture, vec2(v_texCoord.x + rx, v_texCoord.y - ry));
    accum += texture2D(u_texture, vec2(v_texCoord.x + rx, v_texCoord.y + ry));
    accum += texture2D(u_texture, vec2(v_texCoord.x - rx, v_texCoord.y + ry));
    
    accum *= 1.1;
    accum.rgb = vec3(201.0/255.0, 186.0/255.0, 131.0/255.0) * accum.a;
    accum.rgb = vec3(0, 0, 0) * accum.a;
    
    normal = ( accum * (1.0 - normal.a)) + (normal * normal.a);
    
    gl_FragColor = v_fragmentColor * normal;

    //if(gl_FragColor.r == 0.0 && gl_FragColor.g == 0.0 && gl_FragColor.b == 0.0){
      //  gl_FragColor.a = 0.8;    
    //}
    




    
}
