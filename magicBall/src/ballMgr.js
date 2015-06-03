ballMgrClass = function() {
	this.relation = [];
	this.balls = [];
	this.ballMaxID = 0;

	this.clickBallID = -1;

	// this.maxTreeID = 0;
	//this.trees = [];

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
		var tmp = this.getABString(a['bid'], b['bid']);
		this.relation[tmp] = tmp;

		/*
		//连接了需要合并两颗树
		var bOldTid = b['tid'];
		var treeA = this.trees[a['tid']];//引用
		var treeB = this.trees[bOldTid];
//debugger;
		try{
			for(var t in treeB){
				treeA.push(treeB[t]);
				this.getBallByID(treeB[t]).b['tid'] = a['tid'];
			}
		}catch(e){
			debugger
		}

			delete this.trees[bOldTid];
		*/
		};

	this.removeAB  =  function(a, b){
		var tmp = this.getABString(a['bid'], b['bid']);
		this.relation[tmp] = undefined;
		delete this.relation[tmp];

		/*
		//断开连接则需要新生成一棵树
		var bOldTid = b['tid'];
		var treeA = this.trees[a['tid']];//引用
		var treeB = this.trees[bOldTid];

		try{
			for(var t in treeB){
				treeA.push(treeB[t]);
				this.getBallByID(treeB[t]).b['tid'] = a['tid'];
			}
		}catch(e){
			debugger
		}

			delete this.trees[bOldTid];
		};
		*/
	};

	this.doForAllABs = function(doFun){
		for(var obj in this.relation){
			doFun(obj);
		}
	};

	this.removeRelationByID = function(rid){
		//debugger;
		for(var obj in this.relation){
			var ids = obj.split("_");
			if(ids[0] == rid || ids[1] == rid){
				cc.log('@debug: remove relation ' + obj);
				this.relation[obj] = undefined;
				delete this.relation[obj];
			}
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

		//小球新创建时，独立一棵树，树上就一个节点
		// var tid = this.maxTreeID++;
		// this.trees[tid] = [];
		// this.trees[tid].push(ball.b["bid"]);
		// ball.b['tid'] = tid;//树id
	};

	this.removeBall = function(bid){

		delete this.balls[bid];
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
	};

	this.getBallIDByPos = function(pos){
		for(var ballId in this.balls){
			var tmp = this.balls[ballId];
			var ballCenter = tmp.b.p;

			var dltx = Math.abs(ballCenter.x - pos.x);
			var dlty = Math.abs(ballCenter.y - pos.y);

			if(dltx * dltx + dlty * dlty <= gameCfg.ballR * gameCfg.ballR ){
				return tmp.b['bid'];
			}
		}
		return -1;
	};

	this.doForRelationWithID = function(bid){
		if(-1 == bid)return;
		//0_9,3_9,9_8,
		var ret = [];
		ret.push(bid); 
		for(var k in this.relation){
			var ids = k.split("_");
			if(ids[0] == bid){
				ret.push(ids[1]);
			}else if(ids[1] == bid){
				ret.push(ids[0]);
			}
		}//for

		cc.log("@debug: click tree=" + ret.toString());
	};

	//获取某结点邻接的所有结点
	this.getLinkNodes = function(bid){
		if(-1 == bid)return undefined;
		var ret = [];
		for(var k in this.relation){
			var ids = k.split("_");
			if(ids[0] == bid){
				ret.push(ids[1]);
			}else if(ids[1] == bid){
				ret.push(ids[0]);
			}
		}
		if(ret.length != 0)return ret;
		return undefined;
	};

	this.BFSForTree = function(rootBid, ballsSet, vistedFlgs){
		var links = this.getLinkNodes(rootBid);
		if(links === undefined)return;
		for(var k in links){
			var lkNode = links[k];

			var key1 = lkNode + "_" + rootBid;
			var key2 = rootBid + "_" + lkNode;

			if(vistedFlgs[key1] == true || 
				vistedFlgs[key2] == true){
				//该图边关系曾经被访问过
				continue;
			}else{
				vistedFlgs[key1] = true;
				if(ballsSet[lkNode] == undefined){//为了避免重复
					ballsSet[lkNode] = lkNode;
				}
				//ballsSet.push(lkNode);

				var tt = this;
				tt.BFSForTree(lkNode, ballsSet, vistedFlgs);
			}
		}
	};

	// this.destoryBall = function(ball){
	// 	this.space.removeShape(ball.sensor);
	// 	this.space.removeShape(ball.sshape);
	// 	this.space.removeBody(ball.b);

	// 	this.removeBall(id);
	// 	this.removeRelationByID(id);
	// };


	this.destoryBalls = function(ids, space, canDestory){
		for(var idk in ids){
			var id = ids[idk];

			var ball = this.getBallByID(id);
			ball.effectTime = gameCfg.effTimeLength;
			var rt = this;

			if(!canDestory)return;
			//只有允许删除才会添加删除回调函数
			ball.destoryCb = function(xball, xid){
			//之所以这样传参数是避免闭包导致的不清晰调用
				space.removeShape(xball.sensor);
				space.removeShape(xball.sshape);
				space.removeBody(xball.b);

				rt.removeBall(xid);
				rt.removeRelationByID(xid);
			};
		}
	};


};

var ballMgr = new ballMgrClass();