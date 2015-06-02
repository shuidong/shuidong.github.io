/**
 * Created by develop on 2015/6/1.
 */
var GRABABLE_MASK_BIT = 1 << 31;
var NOT_GRABABLE_MASK = ~GRABABLE_MASK_BIT;

var gameCfg = gameCfg || {
        ballR : 20,//30 小球的物理半径
        ballScale : 1.0,//小球素材的放大比率 1.2
        debugFlg : true,//标志位用于 显示/隐藏 物理引擎调试图

        layer_bkGround : 0,
        layer_phyDebug : 10,
        layer_balls : 20,
        layer_bound : 30,
        layer_lineDebug : 40

    };

