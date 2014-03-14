
////////////////////////////////////////////////////////////////////////////////////
// CONSTANTS: 
var C_CURVY_TEXT_G_CLASS = "cs_curvy_text";
var C_CURVY_TEXTPATH_CLASS = "cs_curvy_textpath";

var C_CURVY_TEXT_MEASURE_CLASS = "cs_curvy_measuretext";

var C_CURVY_TEXT_G_ID = "cs_curvy_text_";
var C_CURVY_TEXT_PATH_ID = "cs_curvy_text_path_";
var C_CURVY_TEXT_TEXT_ID = "cs_curvy_text_text_";
var C_CURVY_TEXT_TEXTPATH_ID = "cs_curvy_text_textpath_";

var C_MINIMUM_FONT = 10;
var C_FONT_RANGE = 100;
var C_COLOR_RANGE = 20;

var C_CO_FADE_TIME = 4000;

// CO Status Flags:
var C_CO_CREATED = 1;
var C_CO_PRE_MOVE = 2;
var C_CO_MOVE = 3;
var C_CO_FADE = 5;
var C_CO_FINISHED = 6;



// UTILITY FUNCTIONS:
function remove_nonalphanumeric(t_str)	{
	return t_str.replace(/[^a-zA-Z0-9]/g, '');
}

function makeTextPathID(t_id)	{
	var t_ret_string = "#" + C_CURVY_TEXT_PATH_ID + t_id;
	return t_ret_string;
}

function makeText_TextPathID(t_id)	{
	var t_ret_string = "#" + C_CURVY_TEXT_TEXTPATH_ID + t_id;
	return t_ret_string;
}


function calcTimedPoint(sp,ep,t)	{
	var t_ret_p = Math.round(sp + ((ep - sp)*t));

	var t_max = ep;
	var t_min = sp;
	if (ep < sp)	{
		t_max = sp;
		t_min = ep;
	}

	if (t_ret_p < t_min) t_ret_p = t_min;	
	if (t_ret_p > t_max) t_ret_p = t_max;	

	return t_ret_p;
}

function createCurvePathStr(sx,sy,mx,my,ex,ey, radius, angle)	{
	// A rx ry x-axis-rotation large-arc-flag sweep-flag x y

	t_path_string = "M " + sx + "," + sy + " A " + radius + "," + radius + " 0 0 1 " + ex + "," + ey;
	if (angle > Math.PI)
		t_path_string = "M " + sx + "," + sy + " A " + radius + "," + radius + " 0 1 1 " + ex + "," + ey;
	return t_path_string;
}






////////////////////////////////////////////////////////////////////////////////////
d3.cloudshapes.curvyTextObjectManager = function module() {
	var curvyTextObjects = [];
	var targetSvg;
	var dispatch = d3.dispatch('readyToRender', 'finishedRender');
	var runTimerFlag = false;

	function exports(_selection) {
		_selection.each(function(_data) {
			if (!targetSvg) {
				targetSvg = d3.select(this);
			}
			var t_defs = targetSvg.select("defs");
			if (t_defs.empty())
				targetSvg.append("defs");
		});

		// On receiving the "readyToRender" event, render the curvy text objects: 
		dispatch.on('readyToRender', exports.readyToRender);
		dispatch.on('finishedRender', exports.removeCurvyTextObject);
	}


	// ['linear-in-out', 'cubic-in-out', 'bounce-in-out', 'back-in-out', 'sin-in-out', 'quad-in-out']
	exports.addCurvyTextObject = function(_text, sx1,sy1,mx1,my1,ex1,ey1, sx2,sy2,mx2,my2,ex2,ey2, startRadius, endRadius, angle, timescale, startFontSize, endFontSize, fontColour, opacity) {
		var t_obj = d3.map();

		// Create a unique ID:
		var t_first_two_chars = _text.substring(0,2);
		// Need to "slugify" the first two chars ....
		t_first_two_chars = remove_nonalphanumeric(t_first_two_chars);
		var t_idstr = "_" + t_first_two_chars+"_"+(new Date().getTime());

		t_obj.set("id", t_idstr);
		t_obj.set("text", _text);

		t_obj.set("timescale", timescale);

		t_obj.set("sx1", sx1);
		t_obj.set("sy1", sy1);
		t_obj.set("mx1", mx1);
		t_obj.set("my1", my1);
		t_obj.set("ex1", ex1);
		t_obj.set("ey1", ey1);

		t_obj.set("sx2", sx2);
		t_obj.set("sy2", sy2);
		t_obj.set("mx2", mx2);
		t_obj.set("my2", my2);
		t_obj.set("ex2", ex2);
		t_obj.set("ey2", ey2);

		t_obj.set("startRadius", startRadius);
		t_obj.set("endRadius", endRadius);

		t_obj.set("angle", angle);

		t_obj.set("startFontSize", startFontSize);
		t_obj.set("endFontSize", endFontSize);
		t_obj.set("fontColour", fontColour);

		t_obj.set("status", C_CO_CREATED);
		t_obj.set("startTime", -1);

		if (opacity == undefined)
			opacity = 1;
		t_obj.set("opacity", opacity);

		// Add to curvyTextObjects
		curvyTextObjects.push(t_obj);

		exports.curvyObjectsEnter(t_obj);
		return t_idstr; 
	}

	exports.curvyObjectsEnter = function(t_obj) {
		var t_co_colours = d3.scale.category20().domain(d3.range(0,21));

		/////// ENTER: /////////////////////////////////////////////////////
		// ENTER: For new curvy text objects:

		// ENTER: For new path objects, associated with curvy objects:
		var t_defs = targetSvg.select("defs");
		var t_new_paths = t_defs.selectAll("path." + C_CURVY_TEXT_G_CLASS)
			.data(curvyTextObjects, function(d)	{ return d.get('id');})
			.enter()
				.append("path")
				.attr("class", C_CURVY_TEXT_G_CLASS)
				.attr("id", function(d)	{ return C_CURVY_TEXT_PATH_ID + d.get('id');})

		// ENTER: For new curvy text objects:
		var t_new_co = targetSvg.selectAll("g." + C_CURVY_TEXT_G_CLASS)
			.data(curvyTextObjects, function(d)	{ return d.get('id');})
			.enter()
				.append("svg:g")
				.attr("class", C_CURVY_TEXT_G_CLASS)
				.attr("id", function(d)	{ return C_CURVY_TEXT_G_CLASS + d.get('id');})

		// Append text and textPath objects 
		t_new_co.append("text")
			.attr("id", function(d)	{	return C_CURVY_TEXT_TEXT_ID +  d.get('id');})
			.attr("class", C_CURVY_TEXT_G_CLASS)
			.append("textPath")
				.attr("id", function(d)	{	return C_CURVY_TEXT_TEXTPATH_ID +  d.get('id');})
				.attr("class", C_CURVY_TEXTPATH_CLASS)
				.attr("xlink:href", function(d)	{	return makeTextPathID(d.get('id'));	}) 
			        .attr("font-size", function(d){
					var t_d_fontSize = d.get('startFontSize');
					if (t_d_fontSize == -1)	{
						t_d_fontSize = Math.round((Math.random() * C_FONT_RANGE) + C_MINIMUM_FONT);
					}
					return t_d_fontSize;
				})
				.style("fill-opacity", function(d)	{
					return d.get('opacity');
				})
				.style("fill", function (d) { 
					var t_d_fontColour = d.get('fontColour');
					if (t_d_fontColour == -1)	{
						var t_colour_index = Math.round(Math.random() * C_COLOR_RANGE);
						t_d_fontColour = t_co_colours(t_colour_index);
					}
					return t_d_fontColour;
				})
				.text(function(d)	{	return d.get('text');	})

		t_obj.set("status", C_CO_PRE_MOVE);
		// Post event, with item ID (original ID).
		dispatch.readyToRender(t_obj.get('id'));

	}

	exports.measureText = function(_text, _fontSize, _colour)	{
		var tempText = targetSvg.append("text")
			.attr("class", C_CURVY_TEXT_MEASURE_CLASS)
			.style("opacity", 0) 
		        .attr("font-size", _fontSize)
			.style("fill", _colour)
			.text(_text);

		// Here, measure text.
		var tempTextBox = tempText.node().getBBox();
		tempText.remove();

		return tempTextBox;
	}


	exports.readyToRender = function(_id)	{
		var shouldTimerRunFlag = false;
		for (var i=0; i < curvyTextObjects.length; i++)	{
			if (curvyTextObjects[i].get('id') == _id)	{
				curvyTextObjects[i].set('status', C_CO_MOVE);
			}

			// If just one CO has its status to 'move' or 'fade', then the timer should be running: 
			if ((curvyTextObjects[i].get('status') == C_CO_MOVE)||(curvyTextObjects[i].get('status') == C_CO_FADE))	{
				shouldTimerRunFlag = true;
			}
		}

		// If the timer should be running, but it isn't, then set flag to run, and kick-off timer. 
		if ((shouldTimerRunFlag) && (!runTimerFlag))	{
			runTimerFlag = true;
			d3.timer(exports.tickFunction);
		}
	}


	exports.tickFunction=function(_elapsed)	{
		timer_elapsed = _elapsed;

		// Iterate through curvyObjects:
		for (var i=0; i < curvyTextObjects.length; i++)	{

			var t_cobj = curvyTextObjects[i];

			switch (t_cobj.get('status'))	{


				case C_CO_FADE:
					// If status is set to fade:
					var t_obj_startTime = t_cobj.get('startTime');
					if (t_obj_startTime == -1)	{
						t_cobj.set('startTime', timer_elapsed);
						t_obj_startTime = timer_elapsed;
					}

					var t_obj_time_elapsed = timer_elapsed - t_obj_startTime;
					var t = t_obj_time_elapsed / C_CO_FADE_TIME;
					if (t > 1)	t == 1;

					if (timeSinceEpoch() < t_cobj.get('endOfFadeTime'))	{
					
						// Here change opacity: 
						var t_textpath_id_str = makeText_TextPathID(t_cobj.get('id'));
						var t_textpath_element = targetSvg.select(t_textpath_id_str);
						if (!t_textpath_element.empty())	{
							var t_current_opacity = t_textpath_element.style("fill-opacity");
							if (t_current_opacity >= 0)	{
								var t_param_fill_opacity = t_cobj.get('opacity');
								t_current_opacity = t_param_fill_opacity * (1 - t);
								t_textpath_element.style("fill-opacity", t_current_opacity)
							}
						}
					}	else	{
						t = 1;
					}


					// If CO has finished fading:
					// reset startTime, set status to finished, and send event.
					if (t >= 1)	{
						// Finished moving.
						t_cobj.set('startTime', -1);
						curvyTextObjects[i].set('status', C_CO_FADE);
						// If fade is finished, set status to C_CO_FINISHED:
						t_cobj.set('status', C_CO_FINISHED);

						// Post event. 
						dispatch.finishedRender(t_cobj.get('id'));				
					}
					break;



				case C_CO_MOVE:
				// If a CO has its status set to move, then move it baby:
	
					// Here, move the text: (by altering the text path): 
					var t_path_id_str = makeTextPathID(t_cobj.get('id'));
					var t_path_element = targetSvg.select("path" + t_path_id_str);

					var t_obj_startTime = t_cobj.get('startTime');
					if (t_obj_startTime == -1)	{
						t_cobj.set('startTime', timer_elapsed);
						t_obj_startTime = timer_elapsed;
					}

					var t_obj_time_elapsed = timer_elapsed - t_obj_startTime;
					var t = t_obj_time_elapsed / t_cobj.get('timescale');
					if (t > 1)	t == 1;

					// OK, so now we have 't', so calculate new positions ....: 
					if (!t_path_element.empty())	{
						var t_x = calcTimedPoint(t_cobj.get('sx1'), t_cobj.get('sx2'), t);
						var t_y = calcTimedPoint(t_cobj.get('sy1'), t_cobj.get('sy2'), t);
						var t_mx = calcTimedPoint(t_cobj.get('mx1'), t_cobj.get('mx2'), t);
						var t_my = calcTimedPoint(t_cobj.get('my1'), t_cobj.get('my2'), t);
						var t_ex = calcTimedPoint(t_cobj.get('ex1'), t_cobj.get('ex2'), t);
						var t_ey = calcTimedPoint(t_cobj.get('ey1'), t_cobj.get('ey2'), t);

						var t_radius = calcTimedPoint(t_cobj.get('startRadius'), t_cobj.get('endRadius'), t);

						var t_angle = t_cobj.get('angle');
						// Create the new updated path: 
						var t_temp_path_string = createCurvePathStr(t_x,t_y,t_mx,t_my,t_ex,t_ey, t_radius, t_angle);			

/*
			targetSvg
				.append("path")
				.attr("class", "tweet_box")
				.attr("d", t_temp_path_string)
*/


						t_path_element
							.attr("d", t_temp_path_string);

						// Repeatedly set the textPath’s xlink:href attribute:
						// See: http://bl.ocks.org/mbostock/3151228
						var t_textpath_id_str = makeText_TextPathID(t_cobj.get('id'));
						var t_textpath_element = targetSvg.select(t_textpath_id_str);
						if (!t_textpath_element.empty())	{
							t_textpath_element
								.attr({
									"xlink:href": t_path_id_str
								});
						}
					}

					// Make the size of the text grow over time: 
					var t_textpath_id_str = makeText_TextPathID(t_cobj.get('id'));
					var t_textpath_element = targetSvg.select(t_textpath_id_str);
					if (!t_textpath_element.empty())	{
						t_textpath_element.attr("font-size", function(d){
							var t_d_startFontSize = d.get('startFontSize');
							var t_d_endFontSize = d.get('endFontSize');
							var t_ret_fontsize = t_d_startFontSize + ((t_d_endFontSize - t_d_startFontSize)*t);
							return t_ret_fontsize;
						})
					}

					// If CO has finished moving, reset startTime, and set its status to C_CO_FADE:
					if (t >= 1)	{
						// Finished moving.
						t_cobj.set('startTime', -1);
						curvyTextObjects[i].set('status', C_CO_FADE);

						// Here set end of fade time: ....
						t_cobj.set('endOfFadeTime', timeSinceEpoch() + C_CO_FADE_TIME);
					}
					break;
			}

		}

		// Returning true stops the timer.
		// So, if the timer flag is set to false, then stop it running.
		return !runTimerFlag;
	}


	exports.removeCurvyTextObject = function(id) {
		// Remove from curvyTextObjects
		// Iterate through trying to find that curvy object
		for (var i=0; i < curvyTextObjects.length; i++)	{
			if (curvyTextObjects[i].get('id') == id)	{
				delete curvyTextObjects[i];
				curvyTextObjects[i] = undefined;
				curvyTextObjects.splice(i, 1);
			}
		}

		exports.curvyObjectsExit();

		// Iterate through again - if there are none with status set to 
		var shouldTimerRunFlag = false;
		for (var i=0; i < curvyTextObjects.length; i++)	{
			if ((curvyTextObjects[i].get('status') == C_CO_MOVE)||(curvyTextObjects[i].get('status') == C_CO_FADE))	{
				shouldTimerRunFlag = true;
			}
		}
		runTimerFlag = shouldTimerRunFlag;
	}


	exports.curvyObjectsExit = function(t_obj) {
		////////////////////////////////////////////////////////////
		// EXIT: For curvy text objects being deleted:
		var t_exit_co = targetSvg.selectAll("g." + C_CURVY_TEXT_G_CLASS)
			.data(curvyTextObjects, function(d)	{ return d.get('id');})
			.exit()
				.remove();

		// EXIT: For path objects, associated with curvy objects:
		var t_defs = targetSvg.select("defs");
		var t_exit_paths = t_defs.selectAll("path." + C_CURVY_TEXT_G_CLASS)
			.data(curvyTextObjects, function(d)	{ return d.get('id');})
			.exit()
				.remove();
	}


	exports.getCurvyTextObjects = function()	{
		return curvyTextObjects;
	}


	d3.rebind(exports, dispatch, "on");
	return exports;
};

////////////////////////////////////////////////////////////////////////////////////



