/**
 * Created by develop on 2015/6/1.
 */
var GRABABLE_MASK_BIT = 1 << 31;
var NOT_GRABABLE_MASK = ~GRABABLE_MASK_BIT;

var ballR = 25;//30 小球的物理半径
var ballScale = 1.2;//小球素材的放大比率
var debugFlg = false;//标志位用于 显示/隐藏 物理引擎调试图