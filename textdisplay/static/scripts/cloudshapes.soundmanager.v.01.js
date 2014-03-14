

d3.cloudshapes.soundmanager = function module() {
	var soundOnFlag=true;
	var nSounds;
	var sounds_json_array = [];
	var sounds_objects = {};

	var dispatch = d3.dispatch('cs_soundprogress');

	var exports = function(_sound_array){

		nSounds = _sound_array.length;

		var t_none_loaded = true;
		for (var i=0; i < nSounds; i++)	{
			var sound_name = _sound_array[i].name;
			if (sounds_objects[sound_name] == undefined)	{
				t_none_loaded = false;
				var sound_filenames = _sound_array[i].filenames; 
				sounds_json_array.push([sound_name, sound_filenames]);

				// Create the Howl sound object.
				var temp_sound_object = new Howl({
				  urls: sound_filenames,
				  onload: (function()	{exports.sound_loaded();})
				})
				sounds_objects[sound_name] = temp_sound_object;
			}
		}
		if (t_none_loaded == true)	{
			dispatch.cs_soundprogress(100);	
		}
	};

	exports.sound_loaded = function ()	{
		// Here call calc_loaded (variation on all_loaded below).
		// calc_loaded will return how many loaded.
		// From there calc. percentage, and pop-out event with cs_soundprogress, and % loaded. 
		var t_nLoaded = exports.calc_loaded();
		var t_percent_loaded = Math.floor((t_nLoaded/nSounds)*100);

		dispatch.cs_soundprogress(t_percent_loaded);	
	}


	exports.calc_loaded = function()	{
		var t_nLoaded = 0;
		for (var i=0; i < sounds_json_array.length; i++)	{
			var t_sound_object = sounds_objects[sounds_json_array[i][0]];
			if ((t_sound_object != undefined)&&(t_sound_object._loaded == true))	{
				t_nLoaded++;
			}
		}
		return t_nLoaded;
	}


	exports.play = function(_sound_name)	{
		var t_sound_object = sounds_objects[_sound_name];
		if ((t_sound_object != undefined)&&(soundOnFlag==true))	{
 			t_sound_object.play();
		}
	}

	exports.loop = function(_sound_name)	{
		var t_sound_object = sounds_objects[_sound_name];
		if ((t_sound_object != undefined)&&(soundOnFlag==true))	{
			t_sound_object._loop = true;
 			t_sound_object.play();
		}
	}


	exports.stop = function(_sound_name)	{
		var t_sound_object = sounds_objects[_sound_name];
		if ((t_sound_object != undefined)&&(soundOnFlag==true))	{
 			t_sound_object.stop();
		}
	}

	exports.soundFlag = function(_flag) {
		if (!arguments.length) return soundOnFlag;
		soundOnFlag = _flag;

		if (soundOnFlag == true)
			Howler.unmute();
		else
			Howler.mute();
		return this;
	};

	d3.rebind(exports, dispatch, "on");
	return exports;
};





