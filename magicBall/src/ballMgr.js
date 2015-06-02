ballMgrClass = function() {

	this.relation = [];
	this.balls = [];
	this.ballMaxID = 0;

	this.getABString = function(a, b){
		//if(a === undefined)debugger;
		var tmp = '';
		if(a < b){
			tmp = tmp + a;
			tmp = tmp + "_" + b;
		}else{
			tmp = tmp + b;
			tmp = tmp + "_" + a;
		}
		return tmp;
	};

	this.insertAB = function(a, b){
		//debugger;
		var tmp = this.getABString(a, b);
		this.relation[tmp] = tmp;
	};

	this.removeAB  =  function(a, b){
		var tmp = this.getABString(a, b);
		this.relation[tmp] = undefined;
		delete this.relation[tmp];
	};

	this.doForAllABs = function(doFun){
		for(var obj in this.relation){
			doFun(obj);
		}
	};

	this.getBallByID  =  function(id){
		return this.balls[id];
	};

	this.addBall = function(ball){
		var id = ball.b["bid"];
		if(id === undefined){
			cc.log("@error: found a undefined bid when addBall."); 
		}
		this.balls[id] = ball;
	};

	this.forAllBalls = function(doFun){
		for(var ballId in this.balls){
			doFun(this.balls[ballId]);
		}
	};

	this.getNextBallID = function(){
		var t = this.ballMaxID++; 
		//cc.log("@debug: t =" + t);
		return t;
	}
};

var ballMgr = new ballMgrClass();