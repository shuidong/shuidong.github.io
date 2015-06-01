#ifdef GL_ES                                               
precision lowp float;                                         
#endif                                                         
                                                             
varying vec4 v_fragmentColor;                                 
varying vec2 v_texCoord;                                     
uniform sampler2D u_texture;    
                             
uniform        float u_alpha_value;                             
uniform        float u_color_value;                                                     
void main()                                                     
{                                                             
    vec4 texColor = texture2D(u_texture, v_texCoord);
    float r = 	texture2D(u_texture, v_texCoord).r;
    float g = 	texture2D(u_texture, v_texCoord).g;
    float b = 	texture2D(u_texture, v_texCoord).b;
    float a = 	texture2D(u_texture, v_texCoord).a;

    if (a <= (u_alpha_value))    {
        discard;
    }else{
        float b = 1.0 ;

        if(u_color_value == 0.0)gl_FragColor = vec4(1.0 , 102.0/255.0 , 153.0/255.0 , b); //255 102 153
        if(u_color_value == 1.0)gl_FragColor = vec4( 153.0/255.0, 1.0 , 51.0/255.0 , b); //15325551
        if(u_color_value == 2.0)gl_FragColor = vec4( 102.0/255.0, 204.0/255.0 , 1.0 , b); //102 204 255
        if(u_color_value == 3.0)gl_FragColor = vec4(1.0 , 1.0 , 102.0/255.0 , b); //255255102
        //gl_FragCoord
    }
}                                                             

