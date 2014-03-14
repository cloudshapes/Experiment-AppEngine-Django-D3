


////////////////////////////////////////////////////////////////////
// PROGRESSDISPLAY MODULE
var	PTEXT_CLASS_PREFIX = "pclass";
var 	LOADING_CLASS_NAME="progressclass";
var 	C_PROGRESS_QUIT_TRANSITION_TIME = 1000;

d3.cloudshapes.progressDisplay = function module() {
	var faceSvg;
	var g_progressdisplay_g;
	var n_sections, section_name_array;
	var progressDataArray, progressElementManager;
	var progressConfigObject;
	var finishedFlag = false;
	var waitForClickFlag = false;

	var dispatch = d3.dispatch('quitComplete', 'pulseClickToStartFinished');

    function exports(_selection, _progress_config_object) {
	progressConfigObject = _progress_config_object;
	n_sections = progressConfigObject.image_n_sections;
	section_name_array = progressConfigObject.image_section_array;

	
	if ((progressConfigObject.waitForClickFlag != undefined) && (progressConfigObject.waitForClickFlag == "y"))	{
		waitForClickFlag = true;
	}

	_selection.each(function(_data) {
		if (!faceSvg) {
			faceSvg = d3.select(this);
		}

		faceSvg
			.on("mousedown", function(d){
				if ((finishedFlag == true) && (waitForClickFlag == true))	{
					exports.finish();
				}
			})
			.on("touchstart", function(d){
				if ((finishedFlag == true) && (waitForClickFlag == true))	{
					exports.finish();
				}
			})


		// Append 'g' :		
		g_progressdisplay_g = faceSvg
			.append("svg:g")
			.attr("class", "progressdisplay_g")
			.attr("transform", function(d) {return "translate(" + ((progressConfigObject['screen_width']/2)-(progressConfigObject.image_width_height/2)) + "," + ((progressConfigObject['screen_height']/2)-(progressConfigObject.image_width_height/2)) + ")";});

		// Define the data for the main element used in the progress display:
		var t_progressData = {};
		t_progressData.bgnd = progressConfigObject.image_bgnd;
		t_progressData.bgnd_opacity = progressConfigObject.image_bgnd_opacity;
		t_progressData.eye_target = undefined;
		t_progressData.id_str = "progress" + 'q1';
		t_progressData.imgd = progressConfigObject.image_width_height;
		t_progressData.image = progressConfigObject.image_loading_image;

		t_progressData.name = progressConfigObject.image_loading_name;
		t_progressData.surname = progressConfigObject.image_loading_surname;

		t_progressData.name_width = undefined;
		t_progressData.radius = progressConfigObject.image_radius;
		t_progressData.scale = progressConfigObject.image_scale;
		t_progressData.scaled_radius = progressConfigObject.image_scaled_radius;

		t_progressData.sound = undefined;

		t_progressData.x = (progressConfigObject['screen_width']/2);
		t_progressData.y = (progressConfigObject['screen_height']/2);
		t_progressData.eyes = [];
		t_progressData.eyes.push(progressConfigObject.image_left_eye);
		t_progressData.eyes.push(progressConfigObject.image_right_eye);

		progressDataArray = [t_progressData];
		progressElementManager = d3.cloudshapes.facesManager();
		faceSvg
			.call(progressElementManager, progressConfigObject['screen_width'], progressConfigObject['screen_height'], progressDataArray,  LOADING_CLASS_NAME);
		progressElementManager.transform();

		g_progressdisplay_g.selectAll("text")
			.data(section_name_array)
			.enter()
				.append("text")
				.attr("id", function(d,i) {return PTEXT_CLASS_PREFIX + i;})
				.attr("class", function(d,i) {return PTEXT_CLASS_PREFIX;});


		var t_g_progressdisplay_g = d3.select("g.progressdisplay_g");


		// Add Title and Sub-Title:
		var t_title, t_subtitle;
		if ((progressConfigObject['title'] != undefined) && (progressConfigObject['title'] != ""))	{
			t_title = progressConfigObject['title']; 
		}
		if ((progressConfigObject['sub_title'] != undefined) && (progressConfigObject['sub_title'] != ""))	{
			t_subtitle = progressConfigObject['sub_title'];
		}

		var t_face_g = faceSvg.select("g." + LOADING_CLASS_NAME);
		if ((t_face_g != undefined) && (!t_face_g.empty()))	{
			var t_face_bbox = t_face_g.node().getBBox();
			var t_faceW = progressConfigObject.image_width_height;
			
			// Always add a sub-title element: 
			t_g_progressdisplay_g = d3.select("g.progressdisplay_g");
			t_g_progressdisplay_g
				.append("text")
				.attr("id", "pclass_subtitle")
				.attr("class", "pclass_subtitle");

			// Add sub-title:
			if (t_subtitle != undefined)	{
				t_g_progressdisplay_g = d3.select("g.progressdisplay_g");
				var t_subtitleElement = t_g_progressdisplay_g.select("text#pclass_subtitle");
				t_subtitleElement
					.text(t_subtitle);
			}

			// Add title:
			if (t_title != undefined)	{
				t_g_progressdisplay_g = d3.select("g.progressdisplay_g");
				t_g_progressdisplay_g
					.append("text")
					.attr("id", "pclass_title")
					.attr("class", "pclass_title")
					.text(t_title)
			}


			// NOTE: We've moved the measuring and moving of subtitle and title
			// because off odd bug on Mac/Chrome, whereby measuring seemed to
			// need a bit of time following the rendering of the title and sub-title.
			// So, we've separated the two function calls. Odd, but hey ....

			// Measure and move subtitle:
			if (t_subtitle != undefined)	{
				var t_subtitleElementBox = t_subtitleElement.node().getBBox();
				t_subtitleElement
					.attr("y", function(d)	{
						return -15;
					})
					.attr("x", function(d)	{
						var t_subtitleX2 = (t_faceW/2) - (t_subtitleElementBox.width/2);
						return t_subtitleX2;
					})
			}

			// Measure and move title:
			if (t_title != undefined)	{
				t_g_progressdisplay_g = d3.select("g.progressdisplay_g");
				var t_titleElement = t_g_progressdisplay_g.select("text#pclass_title");
				var t_titleElementBox;
				t_titleElement.each(function() {
					t_titleElementBox = this.getBBox();
				});


				var t_subtitleElement = t_g_progressdisplay_g.select("text#pclass_subtitle");
				var t_subtitleElementBox = t_subtitleElement.node().getBBox();
				t_titleElement
					.attr("y", function(d)	{
						return t_subtitleElementBox.y - 7; 
					})
					.attr("x", function(d)	{
						var t_titleX2 =(t_faceW/2) - (t_titleElementBox.width/2);
						return t_titleX2;
					})
			}
		}
		exports.on('pulseClickToStartFinished', exports.pulseClickToStart);
        });
    };

    exports.update=function(_section_number, _percentage)	{
		var t_percentage_per_section = 100 / n_sections;
		var t_section_percentage = (_section_number-1) * t_percentage_per_section;
		var t_total_current_percentage = Math.round(t_section_percentage + ((_percentage/100)*t_percentage_per_section));


		// Move the images's eyes:
		var t_progressData = progressDataArray[0];
		var t_angle = (-Math.PI/2) + ((2 * Math.PI) * (t_total_current_percentage/100)); 

		// Iterate through each eye:
		for (var j=0; j < t_progressData.eyes.length; j++)	{
			var t_eye_object = t_progressData.eyes[j]; 
			var t_eye_max_d = t_eye_object.max_distance;

			var t_x = t_eye_max_d * Math.cos(t_angle);
			var t_y = t_eye_max_d * Math.sin(t_angle);

			t_eye_object.pupilx = t_x;
			t_eye_object.pupily = t_y;
		}

		t_progressData.scale = (t_total_current_percentage/100);
		progressElementManager.transform();


		exports.display_progress_text(_section_number, section_name_array[_section_number-1] + " : " + t_total_current_percentage + "% Loaded ...");

		// If finished, then call the finish function.
		if ((_section_number == n_sections)&&(t_total_current_percentage == 100))	{
			finishedFlag = true;
			if (waitForClickFlag)	{
				if ((progressConfigObject.waitText != undefined) && (progressConfigObject.waitText != ""))	{
					exports.display_progress_text(4, progressConfigObject.waitText);
					exports.pulseClickToStart();
				}
			}	else	{
				exports.finish();
			}
		}
    };


    exports.pulseClickToStart = function()	{

	// Setup transition on the "click to start anywhere" text ...
	var tid = PTEXT_CLASS_PREFIX + 3;
	var t_element = g_progressdisplay_g.select("text#" + tid);

	if (!t_element.empty())	{
		 t_element
			.transition()
				.ease("linear")
				.duration(0)
				.remove();

		var t_firstTransition = t_element
			.transition()
			.duration(500)
			.style("fill-opacity", "0.0"); 

		var t_secondTransition = t_firstTransition
			.transition()
			.duration(500)
			.style("fill-opacity", "1.0")
			.each('end',  function(d){
				dispatch.pulseClickToStartFinished();
			});
	}
    }



    exports.display_progress_text=function(_p_stage, _p_text)	{
	var t_id = PTEXT_CLASS_PREFIX + (_p_stage-1);
	var t_textElement = g_progressdisplay_g.select("text#" + t_id);

	// If text element isn't empty:
	if (!t_textElement.empty())	{
		t_textElement
			.text(_p_text);
		t_textElement = g_progressdisplay_g.select("text#" + t_id);
		var t_element_bbox = t_textElement.node().getBBox();

		var t_face_g = faceSvg.select("g." + LOADING_CLASS_NAME);
		if ((t_face_g == undefined) || (t_face_g.empty()))
			return;
		var t_face_bbox = t_face_g.node().getBBox();

		var tx, ty;
		if (_p_stage == 1)	{
			tx = t_element_bbox.x;
			ty = t_face_bbox.height + t_element_bbox.height + 10;

			tx = ((t_face_bbox.width/2) - (t_element_bbox.width/2));

		}	else	{
			var t_previd = PTEXT_CLASS_PREFIX + (_p_stage-2);
			var t_prevtextElement = g_progressdisplay_g.select("text#" + t_previd);
			var t_prevtextElementBox = t_prevtextElement.node().getBBox();

			if (!t_prevtextElement.empty())	{
				tx = t_element_bbox.x;
				tx = ((t_face_bbox.width/2) - (t_element_bbox.width/2));
				ty = t_prevtextElementBox.y + t_prevtextElementBox.height + t_element_bbox.height;

			}
		}

		t_textElement.attr("x", tx).attr("y", ty);
	}
    };


    exports.finish=function()	{

	// Quickly remove listeners:
	faceSvg
		.on("mousedown", null)
		.on("touchstart", null);


	// Now finished loading, so need to make all this fade away .....
	// Remove the progress display element: 
	progressDataArray.splice(0,1);


	var t_progress_quit_transition_time = C_PROGRESS_QUIT_TRANSITION_TIME;
	if ((progressConfigObject.progress_quit_transition_time != undefined) && (progressConfigObject.progress_quit_transition_time != ""))	{
		t_progress_quit_transition_time = progressConfigObject.progress_quit_transition_time;
	}

	progressElementManager.quit(t_progress_quit_transition_time);
	progressElementManager.on('quitComplete', function() {
		g_progressdisplay_g.selectAll("text")
			.transition()
				.style("opacity", "0")
				.style("fill-opacity", 0)
				.duration(1)
				.remove();

		faceSvg.select("g.progressdisplay_g")
			.transition()
				.style("opacity", "0")
				.duration(1)
				.remove()
	  			.each("end", function() {dispatch.quitComplete();});
	});
    };

    d3.rebind(exports, dispatch, "on");
    return exports;
};

////////////////////////////////////////////////////////////////////



