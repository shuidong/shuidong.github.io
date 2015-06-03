effectMgr = function(){
	//
	this.update = function(dt){
		for(var ballId in ballMgr.balls){
			var ball = ballMgr.balls[ballId];
			if(ball.effectTime <= 0)continue;

			ball.effectTime -= dt;
			if(ball.effectTime <= 0){
				ball.effectTime = 0;
				ball.z.setScale(gameCfg.ballScale);
				if(ball.destoryCb != undefined){
					//debugger;
					ball.destoryCb(ball, ballId);
				}
			}else{
				var currentScale = ball.z.getScale();
				if(ball.effectTime > gameCfg.effTimeLength/2.0){
					currentScale -= 0.02;
				}else{
					currentScale += 0.02;
				}
				
				ball.z.setScale(currentScale);				
			}
			
		}
	}
};

var effMgr = new effectMgr();