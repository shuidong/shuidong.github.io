var StageLayer = cc.Layer.extend({
    backGround: null,//背景图片
    bottlePng: null,
    //world: null,
    size: null,//
    space: null,//物理世界
    _debugNode: null,
    _lineDebugNode:null,

    renderTexture: null,//用于充当临时绘制的缓冲区 每次对色球进行批量绘制
    mainTexture: null,//将多种球体的渲染结果再合成到这里

    shader: null,
    mainShader: null,

    //balls: null,//球体集合管理
    //ballMgr : null,

    ctor: function () {
        this._super();
        this.size = cc.winSize;

        this.backGround = new cc.Sprite(res.bg_png);
        this.backGround.attr({
            x: this.size.width / 2,
            y: this.size.height / 2
        });
        this.addChild(this.backGround, gameCfg.layer_bkGround);

        //add the bottle
        this.bottlePng = new cc.Sprite(res.bottle_png);
        this.bottlePng.attr({
            x: 0,
            y: 0
        });
        this.bottlePng.anchorX = 0;
        this.bottlePng.anchorY = 0;
        this.addChild(this.bottlePng, gameCfg.layer_bound);

        //this.balls = new Array();
        //this.ballMgr = new ballMgr();

        this.setupWorld();

        this.setupClickEvent();

        this.setupGL();

        this.setupMenu();

        this.scheduleUpdate();
        return true;
    },

    setupGL: function () {
        //debugger;
        if ('opengl' in cc.sys.capabilities) {
            //var t = 0;
            if(cc.sys.isNative){
                this.shader = new cc.GLProgram(res.vsh, res.fsh);
                this.shader.link();
                this.shader.updateUniforms();

                var glProgram_state = cc.GLProgramState.getOrCreateWithGLProgram(this.shader);
                glProgram_state.setUniformFloat("u_alpha_value", gameCfg.alphaThold);
                glProgram_state.setUniformFloat("u_color_value", 0.0);
                //this.sprite.setGLProgramState(glProgram_state);

                this.mainShader = new cc.GLProgram(res.vsh2, res.fsh2);
                this.mainShader.link();
                this.mainShader.updateUniforms();
            }
            else{
                this.shader = new cc.GLProgram(res.vsh, res.fsh);
                this.shader.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                this.shader.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
                this.shader.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);

                this.shader.link();
                this.shader.updateUniforms();
                this.shader.use();

                this.shader.setUniformLocationWith1f(this.shader.getUniformLocationForName('u_alpha_value'), gameCfg.alphaThold);//0.25
                this.shader.setUniformLocationWith1f(this.shader.getUniformLocationForName('u_color_value'), 0.0);

                //setting for mainTex
                this.mainShader = new cc.GLProgram(res.vsh2, res.fsh2);
                this.mainShader.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                this.mainShader.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
                this.mainShader.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);

                this.mainShader.link();
                this.mainShader.updateUniforms();
                this.mainShader.use();
            }
///////////////
        }

        this.mainTexture = new cc.RenderTexture(this.size.width, this.size.height, cc.Texture2D.PIXEL_FORMAT_RGBA4444);//PIXEL_FORMAT_RGBA4444
        
        
        if(cc.sys.isNative){
            var glProgram_state = cc.GLProgramState.getOrCreateWithGLProgram(this.mainShader);
            this.mainTexture.getSprite().setGLProgramState(glProgram_state);
        }else{
            this.mainTexture.getSprite().shaderProgram = this.mainShader;
        }

        this.mainTexture.setAnchorPoint(cc.p(0.5, 0.5));
        this.mainTexture.setPosition(this.size.width / 2, this.size.height / 2);
        this.addChild(this.mainTexture, gameCfg.layer_balls);

        this.renderTexture = new cc.RenderTexture(this.size.width, this.size.height, cc.Texture2D.PIXEL_FORMAT_RGBA4444);//PIXEL_FORMAT_RGBA8888
        this.renderTexture.setPosition(this.size.width / 2.0, this.size.height / 2.0);
        this.renderTexture.retain();
    },

    onMenuAddBallClicked: function(sender) {
        //cc.log('@debug: onMenuAddBallClicked');
        this.addNewBall({x: this.size.width / 2, y: this.size.height * 0.7}, gameCfg.ballR);
        this.addNewBall({x: this.size.width / 2 - 20, y: this.size.height * 0.6}, gameCfg.ballR);
        this.addNewBall({x: this.size.width / 2 + 20, y: this.size.height * 0.8}, gameCfg.ballR);
    },

    onMenuDm1Clicked: function(sender) {
        if(gameCfg.lineDebug){//close debug mode
            this._lineDebugNode.visible = false;
        }else{
            this._lineDebugNode.visible = true;
        }
        gameCfg.lineDebug = !gameCfg.lineDebug;
    },

    onMenuDm2Clicked: function(sender) {
        if(gameCfg.debugFlg){//close debug mode
            this._debugNode.visible = false;
        }else{
            this._debugNode.visible = true;
        }
        gameCfg.debugFlg = !gameCfg.debugFlg;        
    },

    setupMenu : function(){
        var ctrlMenu = new cc.Menu();
        ctrlMenu.x = 0;
        ctrlMenu.y = 0;
        this.addChild(ctrlMenu, gameCfg.layer_menu);
        
        var addBallTxt = new cc.LabelTTF("click here to add balls", "Arial", 40);
        var itemAddBall = new cc.MenuItemLabel(addBallTxt, this.onMenuAddBallClicked, this);
        itemAddBall.x = this.size.width / 2;
        itemAddBall.y = this.size.height - 50;
        ctrlMenu.addChild(itemAddBall);
        
        var dmode1Txt = new cc.LabelTTF("debugMode(link line ON/OFF)", "Arial", 30);
        var itemDmode1 = new cc.MenuItemLabel(dmode1Txt, this.onMenuDm1Clicked, this);
        itemDmode1.x = this.size.width / 2;
        itemDmode1.y = this.size.height - 100;
        ctrlMenu.addChild(itemDmode1);

        var dmode2Txt = new cc.LabelTTF("debugMode(body visiable ON/OFF)", "Arial", 30);
        var itemDmode2 = new cc.MenuItemLabel(dmode2Txt, this.onMenuDm2Clicked, this);
        itemDmode2.x = this.size.width / 2;
        itemDmode2.y = this.size.height - 150;
        ctrlMenu.addChild(itemDmode2);

        var introTxt = new cc.LabelTTF("HowToPlay=click the balls' chain(balls' count >= 3) to destory them!", "Arial", 20);
        introTxt.x = this.size.width / 2;
        introTxt.y = this.size.height - 200;
        this.addChild(introTxt, gameCfg.layer_menu);
    },

    setupClickEvent: function () {
        var root = this;
        if ('mouse' in cc.sys.capabilities)
            cc.eventManager.addListener({
                event: cc.EventListener.MOUSE,
                onMouseDown: function (event) {
                    var pp = event.getLocation();
                    //cc.log("@debug: click x=" + pp.x + "; y=" + pp.y);
                    if (true || pp.y < root.size.height * 0.6){
                        ballMgr.clickBallID = ballMgr.getBallIDByPos(pp);
                        // cc.log("@debug: ball clicked id=" + ballMgr.clickBallID);
                        if(-1 == ballMgr.clickBallID)return;//如果没有击中小球则不处理
                        
                        var ballsSet = [];
                        var vistedFlgs = [];

                        //先加入最原始的结点
                        ballsSet[ballMgr.clickBallID] = ballMgr.clickBallID;
                        ballMgr.BFSForTree(ballMgr.clickBallID, ballsSet, vistedFlgs);

                        var nodeCount = util.getArraySize(ballsSet);
                        //cc.log('@debug: nodeCount='+ nodeCount);
                        ballMgr.destoryBalls(ballsSet, root.space, nodeCount >= gameCfg.minNodeCount);
                        return;
                    };
                    //root.addNewBall(pp, gameCfg.ballR);
                }
            }, this);
    },

    addNewBall: function (pos, r) {
        var radius = r;
        var mass = 1;
        var body = this.space.addBody(new cp.Body(mass, cp.momentForCircle(mass, 0, radius, cp.v(0, 0))));
        body["bid"] = ballMgr.getNextBallID();
        body.setPos(cp.v(pos.x, pos.y));
        
        var m_color = 0;
        var tmp = Math.random();
        if (tmp >= 0.25) m_color = 1;
        if (tmp >= 0.5) m_color = 2;
        if (tmp >= 0.75) m_color = 3;
        //cc.log("@debug: m_color=" +m_color );

        var _shape = new cp.CircleShape(body, radius, cp.v(0, 0));
        _shape.setCollisionType(-1);

        var circle = this.space.addShape(_shape);
        circle.setElasticity(0);
        circle.setFriction(1);//1

        var _sensor = new cp.CircleShape(body, radius * gameCfg.sensorScale, cp.v(0, 0));
        this.space.addShape(_sensor);
        _sensor.setSensor(true);
        _sensor.setCollisionType(m_color);

        var sp = new cc.Sprite(res.ball_png);
        sp.setAnchorPoint(0.5, 0.5);
        sp.setPosition(pos.x, pos.y);
        sp.setScale(gameCfg.ballScale);//1.3
        sp.retain();

        //ballMgr.
        var tmpBall = new ballClass();
        tmpBall.z = sp;
        tmpBall.b = body;
        tmpBall.c = m_color;
        tmpBall.sensor = _sensor;
        tmpBall.sshape = _shape;

        ballMgr.addBall(tmpBall);
        //this.balls.push({z: sp, b: body, c: m_color});//x: pos.x, y: pos.y,
    },

    setupDebugNode: function () {
        // debug only
        this._debugNode = new cc.PhysicsDebugNode(this.space);
        this._debugNode.visible = gameCfg.debugFlg;
        this.addChild(this._debugNode, gameCfg.layer_phyDebug); 
        // if(gameCfg.debugFlg) {
                       
        // }
        this._lineDebugNode = new cc.DrawNode();
        this._lineDebugNode.visible = gameCfg.lineDebug;
        this.addChild(this._lineDebugNode, gameCfg.layer_lineDebug);
        // if(gameCfg.lineDebug){
            
        // }
        
    },

    doColor: function (clo) {

        this.renderTexture.clear(0, 0, 0, 0);
        this.renderTexture.begin();

        ballMgr.forAllBalls(function(tmp){
            if (tmp.c != clo)return;
            var poss = tmp.b.p;
            
            var tsp = tmp.z;
            tsp.setPosition(poss.x, poss.y);
            tsp.visit();
        });

        this.renderTexture.end();

        var xsprite = new cc.Sprite(this.renderTexture.getSprite().texture);
        xsprite.setAnchorPoint(cc.p(0.5, 0.5));
        xsprite.setPosition(this.size.width / 2, this.size.height / 2);
        xsprite.setScaleY(-1);
        if(cc.sys.isNative){
            var glProgram_state3 = cc.GLProgramState.getOrCreateWithGLProgram(this.shader);
            xsprite.setGLProgramState(glProgram_state3);
            xsprite.getGLProgramState().setUniformFloat("u_color_value", clo);
        }else{
            xsprite.shaderProgram = this.shader;
            this.shader.use();
            this.shader.setUniformLocationWith1f(this.shader.getUniformLocationForName('u_color_value'), clo);
            this.shader.updateUniforms();
            //this.mainShader.use();
            //this.mainShader.updateUniforms();
        }

        this.mainTexture.begin();
        xsprite.visit();
        this.mainTexture.end();
    },

    update: function (dt) {
        this.space.step(dt);
        
        if(gameCfg.lineDebug && this._lineDebugNode != undefined){
            var root = this;
            this._lineDebugNode.clear();
            ballMgr.doForAllABs(function(kk){
                var ids = kk.split("_");
                var bodya = ballMgr.getBallByID(ids[0]);
                var bodyb = ballMgr.getBallByID(ids[1]);

                root._lineDebugNode.drawSegment(bodya.b.p, bodyb.b.p, 2, cc.color(0, 0, 0, 255));
            });
            
        }

        this.mainTexture.clear(0, 0, 0, 0);

        /////////////////for ZERO=red
        this.doColor(0);
        this.doColor(1);
        this.doColor(2);
        this.doColor(3);

        effMgr.update(dt);
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
        this.setupDebugNode();

        this.space.iterations = 20;//60
        this.space.gravity = cp.v(0, -98);
        this.space.sleepTimeThreshold = 0.1;//0.5
        this.space.collisionSlop = 0.1;

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

        for (var i = 1; i <= gameCfg.initBallCount / 2; i++) {
            this.addNewBall({x: this.size.width / 2, y: this.size.height * 0.8}, gameCfg.ballR);
            this.addNewBall({x: this.size.width / 2 + 20, y: this.size.height * 0.5}, gameCfg.ballR);
        }

        for(var tt = 0; tt < 4; tt++){
            this.space.addCollisionHandler(tt, tt, null, this.xcollisionPre, null, this.xcollisionSeparate);
        }
        
    },

    onExit : function() {
        //TODO cp.spaceRemoveCollisionHandler( this.space, 0, 1, 2, 3 );
        cp.spaceFree( this.space );
        StageLayer.prototype.onExit.call(this);
    },

    xcollisionBegin : function ( arbiter, space ) {
        //cc.log('@debug :collision begin');
        //var bodies = cp.arbiterGetBodies( arbiter );
        var shapes = arbiter.getShapes();

        var bodyA = shapes[0].body;
        var bodyB = shapes[1].body;
        if(bodyA["bid"] === undefined || bodyB["bid"] === undefined){
            //debugger;
            //cc.log("@warning: found a bid equals undefined.");
            return true;
        }
        ballMgr.insertAB(bodyA, bodyB);
        return true;
    },

    xcollisionPre : function ( arbiter, space ) {
        var shapes = arbiter.getShapes();

        var bodyA = shapes[0].body;
        var bodyB = shapes[1].body;
        if(bodyA["bid"] === undefined || bodyB["bid"] === undefined){
            //debugger;
            //cc.log("@warning: found a bid equals undefined.");
            return true;
        }
        ballMgr.insertAB(bodyA, bodyB);
        return true;
    },

    xcollisionPost : function ( arbiter, space ) {
    },

    xcollisionSeparate : function ( arbiter, space ) {
        //cc.log('@debug :collision separate');
        var shapes = arbiter.getShapes();

        var bodyA = shapes[0].body;
        var bodyB = shapes[1].body;

        if(bodyA["bid"] === undefined || bodyB["bid"] === undefined){
            //debugger;
            //cc.log("@warning: found a bid equals undefined(remove).");
            return;
        }
        ballMgr.removeAB(bodyA, bodyB);        
    }
});

var StageScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        var layer = new StageLayer();
        this.addChild(layer);
    }
});
