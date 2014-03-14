

d3.cloudshapes.jsonContainer = function module() {
	var exports = {},
	dispatch = d3.dispatch('dataReady', 'dataLoading', 'dataLoadingError'),
	allData;

	exports.loadJsonData = function(_file) {
		var t_date = new Date();
		var t_time = t_date.getTime();
		_file = _file + "?xx=" + t_time;

		var loadJson = d3.json(_file);

		//On the progress event, dispatch the custom dataLoading event.
		loadJson.on('progress', function() {dispatch.dataLoading(d3.event.loaded);});

		loadJson.get(function (_err, _response) {
			if (_err != undefined)	{
				dispatch.dataLoadingError(_err);
				return;
			}

			//Assign the cleaned response to our data variable.
			allData = _response;

			//Dispatch our custom dataReady event passing in the cleaned data.
			dispatch.dataReady(_response);
		});

	};

	//Create a method to access all the data
	exports.getAllData = function () {
		return allData;
	};

	d3.rebind(exports, dispatch, 'on');
	return exports;
};





