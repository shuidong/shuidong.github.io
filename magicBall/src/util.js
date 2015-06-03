var util = util || {};
util.getArraySize = function(arr){
	var ret = 0;
	for(var k in arr){
		if(arr[k] != undefined)ret++;
	}
	return ret;
}