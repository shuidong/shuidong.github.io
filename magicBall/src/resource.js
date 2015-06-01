var res = {
    bg_png : "res/bg.png",
    ball_png : "res/ball.png",
    bottle_png :"res/bottle.png",
    vsh:"res/Shaders/mix.vsh",
    fsh:"res/Shaders/mix.fsh",

    vsh2:"res/Shaders/example_Outline.vsh",
    fsh2:"res/Shaders/example_Outline.fsh"
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}