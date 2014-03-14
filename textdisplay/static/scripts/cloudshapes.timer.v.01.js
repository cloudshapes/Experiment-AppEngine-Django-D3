

d3.cloudshapes.timer = function module() {
	var timer = undefined, timeperiod, externalcallbackfunction, repeatFlagValue;

	var exports = function(_timeperiod, _externalcallbackfunction, _repeatFlagValue){
		timeperiod = _timeperiod,
		externalcallbackfunction = _externalcallbackfunction,
		repeatFlagValue = _repeatFlagValue;
	};

	exports.start = function()	{
		exports.stop();

		if (timer == undefined)	{
			    timer = setTimeout(exports.internal_callbackfunction, timeperiod);
		}
	}

	exports.stop = function()	{
		if (timer != undefined)	{
			clearTimeout(timer);
			timer = undefined;
		}
	}

	exports.internal_callbackfunction = function() {
		if (externalcallbackfunction != undefined)	{
			externalcallbackfunction();
		}
		if (repeatFlagValue == true)	{
			exports.start();
		}
	};

	exports.repeatFlag = function(_repeatFlag) {
		if (!arguments.length) return repeatFlagValue;
		repeatFlagValue = _repeatFlag;
		return this;
	};

	return exports;
};





