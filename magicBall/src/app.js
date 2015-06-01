
var StageLayer = cc.Layer.extend({
    backGround: null,//背景图片
    bottlePng: null,
    //world: null,
    size: null,//
    space: null,//物理世界
    _debugNode: null,

    renderTexture: null,//用于充当临时绘制的缓冲区 每次对色球进行批量绘制
    mainTexture: null,//将多种球体的渲染结果再合成到这里

    shader: null,
    mainShader: null,

    balls: null,//球体集合管理

    ctor: function () {
        this._super();
        this.size = cc.winSize;

        this.backGround = new cc.Sprite(res.bg_png);
        this.backGround.attr({
            x: this.size.width / 2,
            y: this.size.height / 2
        });
        this.addChild(this.backGround, 0);

        //add the bottle
        this.bottlePng = new cc.Sprite(res.bottle_png);
        this.bottlePng.attr({
            x: 0,
            y: 0
        });
        this.bottlePng.anchorX = 0;
        this.bottlePng.anchorY = 0;
        this.addChild(this.bottlePng, 2);

        this.balls = new Array();

        this.setupWorld();


        this.setupClickEvent();

        this.setupGL();

        this.scheduleUpdate();
        return true;
    },

    setupGL: function () {
        //debugger;
        if ('opengl' in cc.sys.capabilities) {
            var t = 0;
            this.shader = new cc.GLProgram(res.vsh, res.fsh);
            this.shader.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
            this.shader.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
            this.shader.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);

            this.shader.link();
            this.shader.updateUniforms();
            this.shader.use();

            this.shader.setUniformLocationWith1f(this.shader.getUniformLocationForName('u_alpha_value'), 0.19);//0.25
            this.shader.setUniformLocationWith1f(this.shader.getUniformLocationForName('u_color_value'), 0.0);


//setting for mainTex
            this.mainShader = new cc.GLProgram(res.vsh2, res.fsh2);
            this.mainShader.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
            this.mainShader.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
            this.mainShader.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);

            this.mainShader.link();
            this.mainShader.updateUniforms();
            this.mainShader.use();

            this.mainShader.setUniformLocationWith1f(this.mainShader.getUniformLocationForName('u_threshold'), 1.75);
            this.mainShader.setUniformLocationWith3f(this.mainShader.getUniformLocationForName('u_outlineColor'), 0 / 255, 255 / 255, 0 / 255);
///////////////
        }

        this.mainTexture = new cc.RenderTexture(this.size.width, this.size.height, cc.Texture2D.PIXEL_FORMAT_RGBA4444);//PIXEL_FORMAT_RGBA4444
        this.mainTexture.getSprite().shaderProgram = this.mainShader;
        this.mainTexture.setAnchorPoint(cc.p(0.5, 0.5));
        this.mainTexture.setPosition(this.size.width / 2, this.size.height / 2);
        this.addChild(this.mainTexture, 6);

        this.renderTexture = new cc.RenderTexture(this.size.width, this.size.height, cc.Texture2D.PIXEL_FORMAT_RGBA4444);//PIXEL_FORMAT_RGBA8888
        this.renderTexture.setPosition(this.size.width / 2.0, this.size.height / 2.0);
        this.renderTexture.retain();
    },

    setupClickEvent: function () {
        var root = this;
        if ('mouse' in cc.sys.capabilities)
            cc.eventManager.addListener({
                event: cc.EventListener.MOUSE,
                onMouseDown: function (event) {
                    var pp = event.getLocation();
                    //cc.log("@debug: click x=" + pp.x + "; y=" + pp.y);
                    if (pp.y < root.size.height * 0.6)return;
                    root.addNewBall(pp, ballR);
                }
            }, this);
    },

    addNewBall: function (pos, r) {
        var radius = r;
        var mass = 100;
        var body = this.space.addBody(new cp.Body(mass, cp.momentForCircle(mass, 0, radius, cp.v(0, 0))));
        body.setPos(cp.v(pos.x, pos.y));
        var circle = this.space.addShape(new cp.CircleShape(body, radius, cp.v(0, 0)));
        circle.setElasticity(0);
        circle.setFriction(1);//1

        var sp = new cc.Sprite(res.ball_png);
        sp.setPosition(pos.x, pos.y);
        sp.setScale(ballScale);//1.3
        sp.retain();

        var m_color = 0;
        var tmp = Math.random();
        if (tmp >= 0.25) m_color = 1;
        if (tmp >= 0.5) m_color = 2;
        if (tmp >= 0.75) m_color = 3;
        //cc.log("@debug: m_color=" +m_color );
        this.balls.push({x: pos.x, y: pos.y, z: sp, b: body, c: m_color});
    },

    setupDebugNode: function () {
        // debug only
        this._debugNode = new cc.PhysicsDebugNode(this.space);
        this._debugNode.visible = true;
        this.addChild(this._debugNode, 5);
    },

    doColor: function (clo) {

        this.renderTexture.clear(0, 0, 0, 0);
        this.renderTexture.begin();

        for (var j = 0; j < this.balls.length; j++) {
            var tmp = this.balls[j];
            var tsp = tmp.z;
//debugger;
            if (tmp.c != clo)continue;
            var poss = tmp.b.p;
            tsp.setAnchorPoint(0.5, 0.5);
            tsp.setPosition(poss.x, poss.y);
            tsp.visit();
        }

        this.renderTexture.end();

        var xsprite = new cc.Sprite(this.renderTexture.getSprite().texture);
        xsprite.setAnchorPoint(cc.p(0.5, 0.5));
        xsprite.setPosition(this.size.width / 2, this.size.height / 2);
        xsprite.shaderProgram = this.shader;
        xsprite.setScaleY(-1);

        this.shader.use();
        this.shader.setUniformLocationWith1f(this.shader.getUniformLocationForName('u_color_value'), clo);
        this.shader.updateUniforms();


        this.mainShader.use();
        this.mainShader.setUniformLocationWith1f(this.mainShader.getUniformLocationForName('u_radius'), 0.8);
        this.mainShader.updateUniforms();

        this.mainTexture.begin();
        xsprite.visit();
        this.mainTexture.end();
    },

    update: function (dt) {
        this.space.step(dt);

        this.mainTexture.clear(0, 0, 0, 0);

        /////////////////for ZERO=red
        this.doColor(0);
        this.doColor(1);
        this.doColor(2);
        this.doColor(3);

    },

    installPosLine: function (arr) {
        for (var i = 0; i < arr.length; i++) {
            if (i + 1 == arr.length)break;
            var next = arr[i + 1];
            var pre = arr[i];

            var floor = this.space.addShape(new cp.SegmentShape(this.space.staticBody, cp.v(pre.x, pre.y), cp.v(next.x, next.y), 0));
            floor.setElasticity(0.3);
            floor.setFriction(1);
            floor.setLayers(NOT_GRABABLE_MASK);
        }
    },

    setupWorld: function () {
        cc.log("@debug: begin setupWorld");

        this.space = new cp.Space();
        if(debugFlg) this.setupDebugNode();

        this.space.iterations = 60;
        this.space.gravity = cp.v(0, -110);
        this.space.sleepTimeThreshold = 0.5;
        this.space.collisionSlop = 0.5;
        this.space.sleepTimeThreshold = 0.5;

        var pos = new Array(
            {x: 460.000, y: 957.500},
            {x: 412.500, y: 871.000},
            {x: 415.500, y: 721.000},
            {x: 610.500, y: 257.000},
            {x: 642.000, y: 960.000}
        );

        var pos2 = new Array(
            {x: 226.500, y: 879.000},
            {x: 172.000, y: 960.500},
            {x: 2.000, y: 959.000},
            {x: 31.500, y: 266.000},
            {x: 220.500, y: 704.000},
            {x: 226.500, y: 879.000}
        );

        var pos3 = new Array(
            {x: 642.000, y: 960.000},
            {x: 610.500, y: 257.000},
            {x: 635.000, y: -1.000}
        );

        var pos4 = new Array(
            {x: 610.500, y: 257.000},
            {x: 597.500, y: 87.000},
            {x: 635.000, y: -1.000}
        );

        var pos5 = new Array(
            {x: 597.500, y: 87.000},
            {x: 516.000, y: 33.500},
            {x: 635.000, y: -1.000}
        );

        var pos6 = new Array(
            {x: 516.000, y: 33.500},
            {x: 216.000, y: 21.500},
            {x: -1.000, y: 1.000},
            {x: 635.000, y: -1.000}
        );

        var pos7 = new Array(
            {x: 216.000, y: 21.500},
            {x: 68.500, y: 54.000},
            {x: -1.000, y: 1.000}
        );

        var pos8 = new Array(
            {x: 68.500, y: 54.000},
            {x: 28.500, y: 117.000},
            {x: -1.000, y: 1.000}
        );

        var pos9 = new Array(
            {x: 28.500, y: 117.000},
            {x: 31.500, y: 266.000},
            {x: 2.000, y: 959.000},
            {x: -1.000, y: 1.000}
        );

        this.installPosLine(pos);
        this.installPosLine(pos2);
        this.installPosLine(pos3);
        this.installPosLine(pos4);
        this.installPosLine(pos5);
        this.installPosLine(pos6);
        this.installPosLine(pos7);
        this.installPosLine(pos8);
        this.installPosLine(pos9);

        for (var i = 1; i <= 10; i++) {
            this.addNewBall({x: this.size.width / 2, y: this.size.height * 0.8}, ballR);
        }
    }
});

var StageScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        var layer = new StageLayer();
        this.addChild(layer);
    }
});
