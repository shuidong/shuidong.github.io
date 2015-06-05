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
//http://www.missyuan.com/thread-523180-1-1.html
//130,57,53
//137,190,178
//201,186,131
//222,211,140
//222,156,83
//vec4(201.0 / 255.0, 186.0 / 255.0, 131.0 / 255.0, b);
        if(u_color_value == 0.0)gl_FragColor = vec4(130.0 / 255.0, 57.0 / 255.0, 53.0 / 255.0, b);
        if(u_color_value == 1.0)gl_FragColor = vec4(137.0 / 255.0, 190.0 / 255.0, 178.0 / 255.0, b);
        if(u_color_value == 2.0)gl_FragColor = vec4(222.0 / 255.0, 211.0 / 255.0, 140.0 / 255.0, b);
        if(u_color_value == 3.0)gl_FragColor = vec4(222.0 / 255.0, 156.0 / 255.0, 83.0 / 255.0, b);
        //gl_FragCoord
    }
}                                                             

