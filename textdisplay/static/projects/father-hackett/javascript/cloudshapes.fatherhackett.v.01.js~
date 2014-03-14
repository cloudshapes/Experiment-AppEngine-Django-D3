
"use strict"; 

// Constant values:
/////////////////////////////////////////////////////////////////////////


var 
	C_DEFAULT_CURVY_TEXT = "Type Your Own Message Into the Input Box ...",
	C_MAX_INPUT_LENGTH = 80,
	C_TWEET_TIMER = 2000,
	C_MAX_RENDERLIST_LENGTH = 2, // Max. number to hold in the render list.
	C_MAX_TWITTERLIST_LENGTH = 500, // Max. number to hold in the twitter list.

	C_NUM_NEW_TWEETS_NEED_TO_SET_TO_NEW = 10,

	C_FH_TWEET_BORN_COLOR = "#be1622",


	C_PUPIL_STEP = 0.2,
	C_REDIR_URL_END = "#39CS",


	C_TIME_NO_RELOAD_N_MINUTES = 1,
	C_TIME_NO_RELOAD_N_MILLISECONDS = (C_TIME_NO_RELOAD_N_MINUTES * 60 * 1000); // If not reloaded in x minutes, reload.

// Textbox highlights
var C_INPUTBOX_PULSE_FLAG = false;
var C_INPUTBOX_PULSE = 7000;
var C_HIGHLIGHT_FIRSTTRANS_TIME = 2000;
var C_HIGHLIGHT_FIRSTTRANS_COLOR = "#db9fd5";
var C_HIGHLIGHT_FIRSTTRANS_TEXTCOLOR = "#333333";
var C_HIGHLIGHT_FIRSTTRANS_EASE = "cubic";

var C_HIGHLIGHT_SECONDTRANS_TIME = 2000;
var C_HIGHLIGHT_SECONDTRANS_COLOR = "#ffffff";
var C_HIGHLIGHT_SECONDTRANS_TEXTCOLOR = "#000000";
var C_HIGHLIGHT_SECONDTRANS_EASE = "cubic";



var
	C_CSS_WIDTH_OFFSET = 10,
	C_CSS_HEIGHT_OFFSET = 50;


// Collision variables: 
var
	C_CIRCLE_COLLIDE_DISTANCE = 5,
	C_CIRCLE_COLLIDE_FACTOR = 0.1,
	C_RECT_COLLIDE_DISTANCE = 2,
	C_RECT_COLLIDE_FACTOR = 0.05,
	C_CIRCLE_RECT_COLLIDE_FACTOR = 0.05,
	C_CIRCLE_RECT_COLLIDE_DISTANCE = 2,
	C_MAX_SPEED = 1;


// HORRIBLE HACK VARIABLES:
var
	C_HORRID_HACK_X = 20,
	C_HORRID_HACK_Y = 22;


var	
	C_MASTER_JSON_FOLDER = "/exp/tf/projects/_project_/json/",  	// This will need to point to static .... 
	C_PROGRESS_JSON_FILE = "progress.json",
	C_MASTER_JSON_FILE = "master.json";



//////////////////////////////////////////////////
d3.cloudshapes.fatherhackett = function module() {
	var mainSvg;
	var width, height;

	var jsonDataContainer;
	var progressDisplay;
	var soundManager;

	var dispatch = d3.dispatch('cs_progress');

	var sounds_data;
	var sentiment_colours;
	var initialisingFlag = true;


	var tweetManager;
	var facesManager;

	// These hold lists of tweets that have been loaded into memory:
	var twitter_list;
	var twitter_id_index;

	// This changes, and contains lists of tweets to actually be rendered:
	var twitter_render_list = [];

	// This contains the list of nodes to be passed to the forced graph:
	var fgraph_nodelist = [];

	var face_list = [];


	var reloadFlag = true;

	var timeLastRendered = 0;
	var timeJsonLastLoaded = 0;
	var timeCurvyTextLastSpat = 0;
	var timeLastInputPulsed = 0;
	var timeOfPromptMessage;

	var textInputBoxMessageHasHappened = false;

	var force_layout;
	var stopTickFlag = false; // true stops the timer.

	var urlSlug;
	var progressDisplayFile;
	var masterJsonFile;
	var progressDataContainer;
	var progressDataObject;
	var curvyTextObjectManager; 

	var projectProperties = d3.map();
	var urlData = d3.map();

	var keywordList = d3.map();
	var keywordListIndex = 0;

	///////////////////////////////////////// INITIALISATION FUNCTIONS 
	// Main function.
	function exports(_selection, _width,_height) {
		width = _width;
		height = _height;

		if (!mainSvg)	{
			mainSvg = this
				.append("svg")
				.attr("width", width)
				.attr("height", height)
				.attr("class", "g_mainsvg");
		}

		var t_location_path_split = location.pathname.split("/");
		urlSlug = t_location_path_split[t_location_path_split.length-1];
		if (urlSlug == "")
			urlSlug = t_location_path_split[t_location_path_split.length-2];


		progressDisplayFile = C_MASTER_JSON_FOLDER + C_PROGRESS_JSON_FILE;
		masterJsonFile = C_MASTER_JSON_FOLDER + C_MASTER_JSON_FILE;

		progressDisplayFile = progressDisplayFile.replace("_project_", urlSlug);
		masterJsonFile = masterJsonFile.replace("_project_", urlSlug);


		// Setup help & support link:
		$(document).ready(function(){
			// Report to GA:
			$("#tf_help_support_link").click(
				function()	{
					reportEventToGoogleAnalytics(C_GA_CATEGORY, C_GA_ACTION_HELP_LAUNCHED, "Help Launched", undefined, true);
					document.documentElement.style.overflow = 'visible';  // firefox, chrome
					document.body.scroll = "yes"; // ie only
				}
			);
			// Launch help:
			$("#tf_help_support_link").colorbox({
				inline:true, width:"75%", opacity:0.1,
				onClosed:function(){
					document.documentElement.style.overflow = 'hidden';  // firefox, chrome
					document.body.scroll = "no"; // ie only
				}	
			});
		});


		progressDataContainer = d3.cloudshapes.jsonContainer();
		progressDataContainer.loadJsonData(progressDisplayFile);

		progressDataContainer.on('dataLoadingError', function(_error){
			console.log(new Date, "error", _error);
		});
		progressDataContainer.on('dataLoading', function(_event){
//			console.log(new Date, "something", _event);
		});
		progressDataContainer.on('dataReady', function(_d,_i){exports.secondPartInitialisation();});
	}


	exports.secondPartInitialisation = function()	{
		// progressDataContainer
		// progressDataObject
		progressDataObject = progressDataContainer.getAllData();
		progressDataObject['screen_width'] = width;
		progressDataObject['screen_height'] = height;


		// Here setup textbox:
		d3.select("#tf_textinput_box")
			.on("keydown", function()	{
				if ((d3.event.keyCode == 13)||(d3.event.which == 13))	{
					exports.textInputBoxMessage(C_GA_ACTION_INPUTBOX_ENTER_PRESSED);
				}
			})

		tweetManager = d3.cloudshapes.fhtweetmanager();
		tweetManager.on('removeTweetEvent', function()	{
			deleteFromArray(twitter_render_list, "status", C_TWEET_OLD);
			deleteFromArray(fgraph_nodelist, "status", C_TWEET_OLD);
		});
		tweetManager.on('mouseTabletClick', exports.tweet_clicked_touched); 
		tweetManager.on('tweetBorn', exports.tweetBorn); 



		facesManager = d3.cloudshapes.facesManager();
		facesManager.on('mousedown', exports.face_clicked_touched);
		facesManager.on('touchstart', exports.face_clicked_touched);


		curvyTextObjectManager = d3.cloudshapes.curvyTextObjectManager();
		mainSvg
			.call(curvyTextObjectManager);


		twitter_list = [];
		twitter_id_index = d3.map();

		// Load up the progress display component. 
		progressDisplay = d3.cloudshapes.progressDisplay();
		mainSvg
			.call(progressDisplay, progressDataObject);
		exports.on('cs_progress', exports.control_load_progress);
		exports.kick_off_loading();
	}


	exports.textAndURLCTO = function(_cto_text, _tcolor)	{
		// Here, setup curvyTextObject ....
		var t_targetFace = face_list[Math.round(Math.random() * (face_list.length -1))];
		var t_textData = {};

		t_textData['text'] = _cto_text;
		t_textData['sfsize'] = projectProperties.get("tf_input_url_cto_sfsize");
		t_textData['time'] = projectProperties.get("tf_input_url_cto_duration");
		t_textData['dir'] = projectProperties.get("tf_input_url_cto_direction");

		if (_tcolor == undefined)	{
			t_textData['colour'] = projectProperties.get("tf_input_url_cto_colour");
		}	else	{
			t_textData['colour'] = _tcolor;
		}

		exports.generate_face_curvy_text(t_targetFace, t_textData); 

		// Here, iterate through the keywords. If the _cto_text contains a keyword,
		// *AND* there are sounds, use one.
		var t_keys = keywordList.keys();
		if (t_keys.length > 1)	{
			for (var tc = 0; tc < t_keys.length; tc++)	{
				var t_key = t_keys[tc];
				if (_cto_text.toLowerCase().indexOf(t_key.toLowerCase()) > -1)	{
					var t_sounds = keywordList.get(t_key);
					if ((t_sounds != undefined)&&(t_sounds != ""))	{
						var t_sound = t_sounds[0];
						if (t_sounds.length > 1)	{
							var t_soundIndex = Math.round(Math.random() * (t_sounds.length-1));
							t_sound = t_sounds[t_soundIndex];
						}
						soundManager.play(t_sound);
					}
				}
			}
		}
	}

	exports.textInputBoxMessage = function(_action)	{

		var t_text_ = document.getElementById("tf_textinput_box").value;
		var t_text = stripHTML(t_text_);
		if ((t_text != undefined)&&(t_text != "") )	{
			if (t_text == projectProperties.get("tf_textinput_box"))	{
				var t_default = projectProperties.get("tf_textinput_default_message");
				if ((t_default != undefined)&&(t_default != ""))	{
					t_text = t_default;
				}	else	{
					t_text = C_DEFAULT_CURVY_TEXT;					
				}
			}

			textInputBoxMessageHasHappened = true;
			exports.textAndURLCTO(t_text);
		}

		// Report to Google Analytics: Remember - we WANT to capture whether someone clicked with
		// an empty box. Could be an issue/problem.

		var t_label = "input text: " + t_text;
		reportEventToGoogleAnalytics(C_GA_CATEGORY, _action, t_label, undefined, true);

	}



	exports.pulseTextInputBox = function()	{
		if (projectProperties.get("tf_textinput_box") != "")	{
			var t_element = d3.select("#tf_textinput_box");
			if (!t_element.empty())	{
				 t_element
					.transition()
						.ease("linear")
						.duration(0)
						.remove();

				var t_firstTransition = t_element
					.transition()
					.ease(C_HIGHLIGHT_FIRSTTRANS_EASE)
					.duration(C_HIGHLIGHT_FIRSTTRANS_TIME)
//					.style("color", C_HIGHLIGHT_FIRSTTRANS_TEXTCOLOR)
					.style("background-color", C_HIGHLIGHT_FIRSTTRANS_COLOR);

				var t_secondTransition = t_firstTransition
					.transition()
					.ease(C_HIGHLIGHT_SECONDTRANS_EASE)
					.duration(C_HIGHLIGHT_SECONDTRANS_TIME)
					.style("background-color", C_HIGHLIGHT_SECONDTRANS_COLOR)
//					.style("color", C_HIGHLIGHT_SECONDTRANS_TEXTCOLOR)
					.each('end',  function(d){
						t_element.style("background-color", C_HIGHLIGHT_SECONDTRANS_COLOR);
					});
			}
		}
	}


	exports.face_spit_out = function(_now)	{
		if (!_now)	{
			// Do a random check: spit out face at random: 
			var t_rand = Math.round(Math.random());
			if (!t_rand)
				return;
		}

		var t_face, t_face_spit_out;
		if (face_list.length > 1)	{
			var t_face_list_len = face_list.length;
			t_face = face_list[Math.round(Math.random() * (t_face_list_len-1))];
			t_face_spit_out = t_face['spit_out'];
		}	else	{
			t_face = face_list[0];
			t_face_spit_out = t_face['spit_out'];
		}

		if ((t_face.status == C_FACE_LIVE)||(t_face.status == C_FACE_PRELIVE2))	{
			if (t_face_spit_out != undefined)	{
				// Choose an entry at random.
				var t_face_spit_out_length = t_face_spit_out.length;
				if (t_face_spit_out_length > 0)	{
					var t_face_spit_out_data;
					if (t_face_spit_out_length == 1)	{
						t_face_spit_out_data = t_face_spit_out[0];
					}	else	{
						t_face_spit_out_data = t_face_spit_out[Math.round(Math.random() * (t_face_spit_out_length-1))];
					}

					if (exports.generate_face_curvy_text(t_face, t_face_spit_out_data))	{
						// Kick-off a face pulse:
						facesManager.facePulse(t_face.id_str);

						// Here, play the sound: 
						if (t_face_spit_out_data['sound'] != undefined)
							soundManager.play(t_face_spit_out_data['sound']);
					}
	///////////////////////////////////////////////
				}
			}
		}
	}

	exports.tweetBorn = function(_tweetData)	{
		var t_kwds = _tweetData.found_keywords;
		for (var tc = 0; tc < t_kwds.length; tc++)	{
			var t_kwd_text = t_kwds[tc].keywords;
			exports.textAndURLCTO(t_kwd_text, C_FH_TWEET_BORN_COLOR);
		}
	}

	exports.tweet_clicked_touched = function(_clickedon, t_clickedOnElement)	{
		// Register event with Google Analytics:
		var t_label = "https://twitter.com/" + t_clickedOnElement.user_details.text + "/status/" + t_clickedOnElement.id_str;
		var t_ret = _gaq.push(['_trackEvent', ]);

		reportEventToGoogleAnalytics(C_GA_CATEGORY, C_GA_ACTION_TWEET_CLICK, t_label, undefined, true);
	}


	exports.face_clicked_touched = function(_clickedon, t_clickedOnElement)	{
		// Register event with Google Analytics:
		var t_label = _clickedon.name;
		reportEventToGoogleAnalytics(C_GA_CATEGORY, C_GA_ACTION_FACE_CLICK, t_label, undefined, true);


		var t_clicked_on_params = _clickedon['clicked_on'];
//		var t_clicked_on_params = _clickedon['spit_out'];

		if (t_clicked_on_params != undefined)	{
			// Choose an entry at random.
			var t_clicked_on_params_length = t_clicked_on_params.length;
			if (t_clicked_on_params_length > 0)	{
				var t_clicked_on_data;
				if (t_clicked_on_params_length == 1)	{
					t_clicked_on_data = t_clicked_on_params[0];
				}	else	{
					t_clicked_on_data = t_clicked_on_params[Math.round(Math.random() * (t_clicked_on_params_length-1))];
				}

				if (exports.generate_face_curvy_text(_clickedon, t_clicked_on_data))	{
					// Here, play the sound: 
					if (t_clicked_on_data['sound'] != undefined)
						soundManager.play(t_clicked_on_data['sound']);
				}
///////////////////////////////////////////////
			}
		}
	}


	exports.generate_face_curvy_text = function(_clickedon, t_clicked_on_data)	{

				var t_scaled_radius = _clickedon.scaled_radius;
				var t_cx = _clickedon.x; 
				var t_cy = _clickedon.y; 

				var t_text = t_clicked_on_data['text'];
				var t_innerFontSize = t_clicked_on_data['sfsize'];
				var t_outerFontSize;
				var t_timeScale = t_clicked_on_data['time'];

				var t_dir = t_clicked_on_data['dir'];
				var t_colour = t_clicked_on_data['colour'];

				var sx1,sy1,mx1,my1,ex1,ey1;
				var sx2,sy2,mx2,my2,ex2,ey2;

				var inner_sx,inner_sy,inner_mx,inner_my,inner_ex,inner_ey;
				var outer_sx,outer_sy,outer_mx,outer_my,outer_ex,outer_ey;

				var m_theta;
				var s_theta;
				var e_theta;

		

				// Get text dimensions:
				var t_startTextDimensions = curvyTextObjectManager.measureText(t_text, t_innerFontSize, t_colour); 
				var t_innerTextDimensions, t_innerRadius;
				var t_width = width;
				var t_height = height;


				///////////////////////////////////////////////////////////////////
				// Here, need to choose an angle which means always looking to the 
				// furthest away point from the face.
				var t_width = width;
				var t_height = height;

				var d1 = Math.sqrt( (t_cx * t_cx) + (t_cy * t_cy));
				var d2 = Math.sqrt( ((width-t_cx) * (width-t_cx)) + (t_cy * t_cy));
				var d3 = Math.sqrt( ((width-t_cx) * (width-t_cx)) + ((height-t_cy) * (height-t_cy))     );
				var d4 = Math.sqrt( ((t_cx) * (t_cx)) + ((height-t_cy) * (height-t_cy))     );

				var distancesArray = [ 
					{ dist: d1, x:0, y:0},
					{ dist: d2, x:width, y:0},
					{ dist: d3, x:width, y:height},
					{ dist: d4, x:0, y:height}
				    ];
				distancesArray.sort(function(a,b) {return (b.dist > a.dist) ? 1 : ((a.dist > b.dist) ? -1 : 0);});
				// OK, now calculate angle range between two furthest away points:
				var p1 = distancesArray[0], p2 = distancesArray[1];
				var p1angle = Math.atan2((p1.y - t_cy), (p1.x - t_cx));
				var p2angle = Math.atan2((p2.y - t_cy), (p2.x - t_cx));

				var angle_range = p2angle - p1angle;
				if (angle_range > Math.PI)	{
					angle_range = angle_range - (Math.PI * 2);
				}

				var random_angle_range = Math.random() * angle_range;
 				m_theta = p1angle + random_angle_range;

				var n_theta = m_theta;
				if (m_theta < (-Math.PI))	{
					n_theta = m_theta + (Math.PI * 2);
				}
				if (m_theta > Math.PI)	{
					n_theta = m_theta - (Math.PI * 2);
				}
				m_theta = n_theta;
//				m_theta = Math.random() * (Math.PI * 2);
				///////////////////////////////////////////////////////////////////



				t_innerTextDimensions = t_startTextDimensions;
				t_innerRadius = t_scaled_radius + t_innerTextDimensions.height;

				var t_maxInnerCirc = 2 * Math.PI * t_innerRadius;

				// If length of text is greater than existing circumference, change the radius:
				if (t_innerTextDimensions.width > t_maxInnerCirc)	{
					t_maxInnerCirc = t_innerTextDimensions.width + 15; // 15 is just some buffer.
					t_innerRadius = t_maxInnerCirc / (Math.PI * 2);
				}

				// Calculate the start points.
				inner_mx = t_cx + (t_innerRadius * Math.cos(m_theta));
				inner_my = t_cy + (t_innerRadius * Math.sin(m_theta));


				// Now, need to work backwards to work out "top" and "bottom" points:
				var t_innerAngle; 
				t_innerAngle = (t_innerTextDimensions.width)/ (t_innerRadius);


				s_theta = m_theta - (t_innerAngle/2);
				e_theta = m_theta + (t_innerAngle/2);

				inner_sx = t_cx + (t_innerRadius * Math.cos(s_theta));
				inner_sy = t_cy + (t_innerRadius * Math.sin(s_theta));

				inner_ex = t_cx + (t_innerRadius * Math.cos(e_theta));
				inner_ey = t_cy + (t_innerRadius * Math.sin(e_theta));


				mx1 = inner_mx;
				my1 = inner_my;
				sx1 = inner_sx;
				sy1 = inner_sy;
				ex1 = inner_ex;
				ey1 = inner_ey;

				var t_intersect = false;
				var t_where;

				// Calculate the end points.
				var t_dummyRadius = 10000;
				mx2 = t_cx + t_dummyRadius * Math.cos(m_theta);
				my2 = t_cy + t_dummyRadius * Math.sin(m_theta);


				var t_ret = checkLineIntersection(t_cx, t_cy, mx2, my2, 0, 0, t_width, 0);
				if (t_ret.onLine1 && t_ret.onLine2)	{ 
					t_intersect = true;
					t_where = "top";
				}

				// Check bottom-line:
				if (!t_intersect)	{
					t_ret = checkLineIntersection(t_cx, t_cy, mx2, my2, 0, t_height, t_width, t_height);
					if (t_ret.onLine1 && t_ret.onLine2)	{
						t_intersect = true;
						t_where = "bottom";
					}
				}

				// Check left-line:
				if (!t_intersect)	{
					t_ret = checkLineIntersection(t_cx, t_cy, mx2, my2, 0, 0, 0, t_height);
					if (t_ret.onLine1 && t_ret.onLine2)	{
						t_intersect = true;
						t_where = "left";
					}
				}

				// Check right-line:
				if (!t_intersect)	{
					t_ret = checkLineIntersection(t_cx, t_cy, mx2, my2, t_width, 0, t_width, t_height);
					if (t_ret.onLine1 && t_ret.onLine2)	{
						t_intersect = true;
						t_where = "right";
					}
				}

					
				if (t_intersect)	{

					mx2 = t_ret.x;
					my2 = t_ret.y;

					var t_endRadius = Math.sqrt( ((mx2-t_cx)*(mx2-t_cx)) + ((my2-t_cy)*(my2-t_cy)) );
					sx2 = t_cx + t_endRadius * Math.cos(s_theta);
					sy2 = t_cy + t_endRadius * Math.sin(s_theta);
					ex2 = t_cx + t_endRadius * Math.cos(e_theta);
					ey2 = t_cy + t_endRadius * Math.sin(e_theta);


					t_outerFontSize = t_innerFontSize * (t_endRadius / t_innerRadius);


					var t_startArray = [[sx1,sy1], [mx1,my1], [ex1,ey1]];
					var t_endArray = [[sx2,sy2], [mx2,my2], [ex2,ey2]];


					if (t_dir == "out")	{
						curvyTextObjectManager.addCurvyTextObject(t_text, sx1,sy1,mx1,my1,ex1,ey1, sx2,sy2,mx2,my2,ex2,ey2, t_innerRadius,t_endRadius, t_innerAngle, t_timeScale, t_innerFontSize, t_outerFontSize, t_colour);
					}

					if (t_dir == "in")	{
						curvyTextObjectManager.addCurvyTextObject(t_text, sx2,sy2,mx2,my2,ex2,ey2, sx1,sy1,mx1,my1,ex1,ey1,  t_endRadius, t_innerRadius, t_innerAngle, t_timeScale, t_outerFontSize, t_innerFontSize, t_colour);
					}


					return true;
				}
				return false;
	}

	


	exports.kick_off_loading = function()	{
		dispatch.cs_progress(1, 0);
	}


	exports.checkURLForCTOData = function()	{

		// Here, check the URL - and strip out the content for the CurvyTextObject:
		var t_url_anchor = window.location.hash;

		if ( (t_url_anchor != "") && (t_url_anchor != undefined) )	{
			if (t_url_anchor[0] == "#")	{

				var t_url_decoded = decodeURIComponent(t_url_anchor);
				var t_text_to_use = "";
				// Check to see if ends with C_REDIR_URL_END:

				var t_ga_action = C_GA_ACTION_URL_REQUESTED_WEBINTENT;
				if (string_endswith(t_url_decoded, C_REDIR_URL_END))	{

					var t_myRe = new RegExp("^#(.*)" + C_REDIR_URL_END + "$", "g");
					var t_matchArray = t_myRe.exec(t_url_decoded);
					if ((t_matchArray != null) && (t_matchArray.length > 1))	{
						t_text_to_use = t_matchArray[1];

						// Record in events in Google Analytics. 
						// i.e. came from redirect, has redirect thing on end.
					}

				}	else	{
					var t_myRe = new RegExp("^#(.*)$", "g");
					var t_matchArray = t_myRe.exec(t_url_decoded);
					if ((t_matchArray != null) && (t_matchArray.length > 1))	{
						t_text_to_use = t_matchArray[1];

						// Record in events in Google Analytics. 
						// i.e. DID NOT come from redirect, DID NOT HAVE redirect thing on end.
						t_ga_action = C_GA_ACTION_URL_REQUESTED_NOTWEBINTENT;
					}
				}

				if (t_text_to_use != "")	{
					// Setup the CurvyTextObject to be fired several times ...
					urlData.set('urlText', t_text_to_use);
					reportEventToGoogleAnalytics(C_GA_CATEGORY, t_ga_action, t_text_to_use, undefined, true);
				}
			}
		}
	}


	exports.control_load_progress = function(_section_number, _percentage)	{
		if (initialisingFlag == true)	{
			progressDisplay.update(_section_number, _percentage);
			progressDisplay.on('quitComplete', function() {
				exports.kickOff();
				initialisingFlag = false;
				reloadFlag = false;

				// Here make the sound button visible:
				var t_sound_element = d3.select("#sound_button");
				if (!t_sound_element.empty())	{
					t_sound_element.style("display", "inline-block");
				}

				// Here play the background music.
				var t_bgnd_music = projectProperties.get('background_music');
				if ((t_bgnd_music != undefined)&&(t_bgnd_music != ""))	{
					var t_loopFlag = false;
					var t_bgnd_music_setting = projectProperties.get('background_music_loop');
					if ((t_bgnd_music_setting != undefined)&&(t_bgnd_music_setting != "")&&(t_bgnd_music_setting=="y"))			{
							t_loopFlag = true;
						}
					if (!t_loopFlag)		
						soundManager.play(t_bgnd_music);
					else
						soundManager.loop(t_bgnd_music);
				}

				function getSetHTMLValues(projectProperties, _property, _flag)	{
					var t_prop_value = projectProperties.get(_property);
					if ((t_prop_value != undefined)&&(t_prop_value != ""))	{
						var t_element = d3.select("#" + _property);
						if (!t_element.empty())	{
							t_element.style("display", "inline-block");
							switch(_flag)	{
								case "html":
									t_element.html(t_prop_value);
								break;

								case "value":
									t_element.attr("value", t_prop_value);
								break;
							}
						}
					}
				}

				getSetHTMLValues(projectProperties, "tf_short_title", "html");
				getSetHTMLValues(projectProperties, "tf_textinput_box", "value");
				getSetHTMLValues(projectProperties, "tf_creds1", "html");
				getSetHTMLValues(projectProperties, "tf_creds2", "html");


				// Set text input button properties: 
				var t_prop_value = projectProperties.get("tf_textinput_button");
				if ((t_prop_value != undefined)&&(t_prop_value != ""))	{
					var t_element = d3.select("#tf_sendmessage_button");
					if (!t_element.empty())	{
						t_element.html(t_prop_value);

						// Set data used, or function used, if clicked on.
						t_element.on("click", function() { exports.textInputBoxMessage(C_GA_ACTION_INPUTBOX_BUTTON_PRESSED);});
						// Set visible.
						t_element.style("display", "inline-block");
					}
				}


				// Set tweet button properties: 
				var t_prop_value = projectProperties.get("tf_tweet_button_text");
				if ((t_prop_value != undefined)&&(t_prop_value != ""))	{
					var t_element = d3.select("#tf_tweet_button");
					if (!t_element.empty())	{
						var t_element_html = t_element.html();
						projectProperties.set("bitlyurl", t_element_html);

						t_element.html(t_prop_value);
						// Set data used, or function used, if clicked on.
						t_element.on("click", exports.webIntentTweet);
						// Set visible.
						t_element.style("display", "inline-block");
					}
				}


				// Set text input box clearing if clicked on etc ...
				var t_element = d3.select("#tf_textinput_box");
				if (!t_element.empty())	{
					t_element.attr("maxlength", C_MAX_INPUT_LENGTH);

					t_element.on("focus", function()	{
							if (this.value == projectProperties.get('tf_textinput_box'))
								this.value = "";
						});

					t_element.on("blur", function()	{
							if (this.value == "")
								this.value = projectProperties.get('tf_textinput_box');
						});
				}

				exports.checkURLForCTOData();
			});
		}

		switch(_section_number)
		{
			case 1:
				if (_percentage == 0)	{
					// Load up JSON file.
					exports.loadProjectJsonFile();		
				}

				if (_percentage == 100)	{
					// Dispatch event saying now ready for second stage: sounds.
					dispatch.cs_progress(2, 0);
				}
				break;

			case 2:
				if (_percentage == 0)	{
					// Load up sounds.
					exports.loadSounds();		
				}

				if (_percentage == 100)	{
					// Dispatch event saying now ready for second stage: ministers.
					dispatch.cs_progress(3, 0);
				}
				break;

			case 3:
				if (_percentage == 0)	{
					// Load up tweet's etc ...
					exports.loadTweetsEtc();		
				}

				// Here, loading is complete. 
				if (_percentage == 100)	{
					if (!initialisingFlag)	{
						reloadFlag = false;
					}
				}
				break;
		}
	};


	// Closely followed by this initialise function. 
	exports.loadProjectJsonFile = function()	{
		// Load up the JSON file here. 
		jsonDataContainer = d3.cloudshapes.jsonContainer();
		jsonDataContainer.loadJsonData(masterJsonFile);

		jsonDataContainer.on('dataLoadingError', function(_error){
			console.log(new Date, "error", _error);
		});
		jsonDataContainer.on('dataLoading', function(_event){
//			console.log(new Date, "something", _event);
		});
		jsonDataContainer.on('dataReady', function(_d,_i){exports.container_dataReady();});
	}

	///////////////////////////////////////// UTILITY FUNCTIONS 

	function launchTwitterWebIntent(_text, _url, _win, _ga_action)	{

		var tweet_url = 'https://twitter.com/intent/tweet?related=roland_dunn&text=';
		tweet_url += encodeURIComponent(_text);

		var t_url = _url;
		if (t_url == undefined)
			t_url = window.location.href;

		tweet_url += '&url=' + encodeURIComponent(t_url);
//		tweet_url += '&via=roland_dunn';
		if (_win == undefined)	{
			window.open(tweet_url,'_blank');
		}	else	{
			_win.location.href = tweet_url;
		}

		var t_label = "| " + _text + " | " + _url;
		reportEventToGoogleAnalytics(C_GA_CATEGORY,_ga_action, t_label, undefined, true);
	}


	exports.webIntentTweet=function()	{

		// Construct URL to shorten:
		var t_using_shortening = false;
		var t_ga_action = C_GA_ACTION_WEBINTENT_LAUNCHED_DEFAULT;

		if (projectProperties.get("tf_textinput_box") != "")	{
			var t_element = d3.select("#tf_textinput_box");
			if (!t_element.empty())	{
				var t_text_ = document.getElementById("tf_textinput_box").value;
				var t_text = stripHTML(t_text_);

				if (t_text == projectProperties.get("tf_textinput_box"))
					t_text = "";

				if ((t_text != undefined)&&(t_text != ""))	{

					// Here build URL to shorten.
					// Clean up the current URL, i.e. remove any anchor text.
					var t_url_no_anchor = window.location.href.replace(window.location.hash, '');

					// Test code: 
					// t_url_no_anchor = t_url_no_anchor.replace("cloudshapes", "pootshapes");

					// Append the text
					var t_url_with_text = t_url_no_anchor + "#" + t_text;

					// URL encode it. 
					var t_url_encoded = encodeURI(t_url_with_text);
					var t_text_post_string = "ttext=" + t_url_encoded;

					// OK, so, now, let's have a go at shortening this: 
					var csrfElements = document.getElementsByName("csrfmiddlewaretoken");
					if ((csrfElements != undefined) && (csrfElements.length == 1))	{
						var csrfElement = csrfElements[0];
						var csrfElementValue = csrfElement.getAttribute("value");

						var httpRequest = d3.xhr("/s/s/");

						httpRequest.mimeType("text/html,application/xhtml+xml,application/xml");
						httpRequest.header("Content-type", "application/x-www-form-urlencoded");
						httpRequest.header("X-CSRFToken", csrfElementValue);

						t_using_shortening = true;

						// http://www.webdeveloper.com/forum/showthread.php?280955-Trying-to-get-Google-Chrome-to-open-a-new-tab-instead-of-a-new-window-using-JS
						var t_win = window.open("",'_blank');
						httpRequest.post(t_text_post_string, function(d, request){ 
							var t_content;
							var t_url;
							if ((request != undefined) && (request.status == "200")&&(request.responseText != undefined))			{
								var t_obj = JSON.parse(request.responseText);
								t_url = t_obj['return_url'];

								var t_property_content = projectProperties.get('tf_tweet_button_short_content');
								if ((t_property_content == undefined) || (t_property_content == ""))	{
									t_property_content = projectProperties.get('tf_tweet_button_content');
								}


								var t_final_content = t_text + t_property_content + t_url;
								if (t_final_content.length > 140)	{
									var t_surplus = (t_final_content.length - 140) + 8;
									t_text = t_text.substring(0,(t_text.length - t_surplus)) + "... ";
								}
								t_content = "\"" + t_text + "\" " + t_property_content;

								t_ga_action = C_GA_ACTION_WEBINTENT_LAUNCHED_CUSTOM;
							}	else	{ // Problem with shortening. Uh-oh.
								t_content = projectProperties.get('tf_tweet_button_content');
								t_url = projectProperties.get("bitlyurl");
							}

							if (t_url == undefined)
								t_url = window.location.href;
							launchTwitterWebIntent(t_content, t_url, t_win, t_ga_action);
						});
					}
				}
			}
		}

		if (!t_using_shortening)	{
			var t_content = projectProperties.get('tf_tweet_button_content');
			var t_url = projectProperties.get("bitlyurl");
			if (t_url == undefined)
				t_url = window.location.href;
			launchTwitterWebIntent(t_content, t_url, undefined, t_ga_action);
		}
	}


	// Called when data is loaded into the JSON object. 
	exports.container_dataReady=function()	{

		timeJsonLastLoaded = timeSinceEpoch();
		var t_allJsonData = jsonDataContainer.getAllData();

		// Here, record project properties:
		var t_tempProperties = t_allJsonData['properties'];

		// Copy project properties over to the projectProperties d3.map:
		var t_obj = t_tempProperties;
		for (var t_prop in t_obj) {
			if(t_obj.hasOwnProperty(t_prop)){
				projectProperties.set(t_prop, t_obj[t_prop]);
			}
		}

		function setDefaultProperties(d3map, property, default_value)	{
			if (d3map.get(property) == undefined)
				d3map.set(property, default_value);
		}

		setDefaultProperties(projectProperties, 'tweet_charge', C_TWEET_DEFAULT_CHARGE);
		setDefaultProperties(projectProperties, 'face_charge', C_FACE_DEFAULT_CHARGE);
		setDefaultProperties(projectProperties, 'face_charge_range', C_FACE_DEFAULT_CHARGE_RANGE);
		setDefaultProperties(projectProperties, 'force_gravity', C_GRAVITY_VALUE);
		setDefaultProperties(projectProperties, 'face_charge_range', C_FACE_DEFAULT_CHARGE_RANGE);

		setDefaultProperties(projectProperties, 'tf_url_cto_n_iterations',  C_URL_CTO_N_ITERATIONS);
		setDefaultProperties(projectProperties, 'tf_url_cto_time_gap',  C_URL_CTO_TIME_GAP);

		setDefaultProperties(projectProperties, 'tf_input_url_cto_sfsize',  C_INPUT_URL_CTO_SFSIZE);
		setDefaultProperties(projectProperties, 'tf_input_url_cto_duration',  C_INPUT_URL_CTO_DURATION);
		setDefaultProperties(projectProperties, 'tf_input_url_cto_direction',  C_INPUT_URL_CTO_DIRECTION);
		setDefaultProperties(projectProperties, 'tf_input_url_cto_colour',  C_INPUT_URL_CTO_COLOUR);

		setDefaultProperties(projectProperties, 'tf_fh_tweet_born_color',  C_FH_TWEET_BORN_COLOR);

		setDefaultProperties(projectProperties, 'ntweets_to_render',  C_MAX_RENDERLIST_LENGTH);

		// Set the tweetManager time lifespan:
		if (tweetManager != undefined)	{
			tweetManager.setTweetDurations(projectProperties.get('tweet_lifespan'));
		}


		// Update progress. JSON loading and processing now complete. 
		dispatch.cs_progress(1, 100);
	}

	exports.loadSounds=function()	{
		var t_allJsonData = jsonDataContainer.getAllData();

		var t_current_sounds_data = sounds_data;
		sounds_data = t_allJsonData.sounds;
		t_current_sounds_data = undefined;

		if (soundManager == undefined)	{
			soundManager = d3.cloudshapes.soundmanager();
			soundManager(sounds_data);
			soundManager.on("cs_soundprogress", function(_per) {dispatch.cs_progress(2, _per);});
		} else	{ 
			// soundManager *is* already defined, so want to step through and examine sounds, 
			// see if any more need loading ...
			// How check whether all sounds are already loaded?
			soundManager(sounds_data);
			soundManager.on("cs_soundprogress", function(_per) { dispatch.cs_progress(2, _per);});
		}
	}


	exports.loadTweetsEtc=function()	{
		var t_allJsonData = jsonDataContainer.getAllData();

		/////////////////////////////////////////
		// DEBUGGING: SANITY CHECK BEFORE RELOAD PROCESS: STARTS
		var t_n_new_tweets = countNumTweetTypes(twitter_list, C_TWEET_NEW);
//		console.log(new Date(), "STARTING: reloadING: twitter_list.length: ", twitter_list.length, "t_n_new_tweets: ", t_n_new_tweets);
		// DEBUGGING: SANITY CHECK BEFORE RELOAD PROCESS: ENDS
		/////////////////////////////////////////


		// Swopover sentiment colours:
		var t_current_sentiment_colours = sentiment_colours;
		sentiment_colours = t_allJsonData.sentiment_colours;
		t_current_sentiment_colours = undefined;


		// Load up faces into face_list:
		for (var tf = 0; tf < t_allJsonData.faces.length; tf++)	{
			var t_found = false;
			for (var fl = 0; fl < face_list.length; fl++)	{
				if (face_list[fl].name == t_allJsonData.faces[tf].name)	{
					t_found = true;
					break;
				} 
			}
			if (!t_found)	{
				if (t_allJsonData.faces[tf].id == undefined)	{
					// Generate a unique face ID:
					var t_idstr = C_FACE_ID_PREFIX + remove_nonalphanumeric(t_allJsonData.faces[tf].name) + "_" + (new Date().getTime()).toString();
					t_allJsonData.faces[tf].id_str = t_idstr;
				}
				face_list.push(t_allJsonData.faces[tf]);
			}
		}

		// Load-up tweets:
		var t_json_tweet_data = t_allJsonData.tweets[0];
		if (twitter_list.length < C_MAX_TWITTERLIST_LENGTH)	{
			for (var t_tweet_counter = 0; t_tweet_counter < t_json_tweet_data.length; t_tweet_counter++)	{
				var t_tweet_item = t_json_tweet_data[t_tweet_counter];
				if (twitter_id_index.get(t_tweet_item.id_str) == undefined)	{
					twitter_list.push(t_tweet_item);
					twitter_id_index.set(t_tweet_item.id_str, t_tweet_item);
				}	else	{
				}
			}
		}

		// If no. of new tweets in list < Z, reset all old to new: otherwise have nothing to show ...
		var t_n_new_tweets = countNumTweetTypes(twitter_list, C_TWEET_NEW);
		if (t_n_new_tweets < C_NUM_NEW_TWEETS_NEED_TO_SET_TO_NEW)	{
			for (var ti = 0; ti < twitter_list.length; ti++)	{
				if (twitter_list[ti]['status'] == C_TWEET_OLD)	{
					twitter_list[ti]['status'] = C_TWEET_NEW;
				}
			}
		}


		// Load up keywords:
		var t_keywordlist = t_allJsonData.keyword_list;
		if (t_keywordlist != undefined)	{
			for (var tcc = 0; tcc < t_keywordlist.length; tcc++)	{
				var t_keyword_item = t_keywordlist[tcc];
				var t_keyword = t_keyword_item['keywords'];
				if ((t_keyword != undefined)&&(t_keyword != "")) {
					if (keywordList.get(t_keyword) == undefined)	{
						var t_sounds = "";
						if ((t_keyword_item['sounds'] != undefined)&& (t_keyword_item['sounds'] != ""))	{
							t_sounds = t_keyword_item['sounds'].slice();
						}
						keywordList.set(t_keyword, t_sounds);
					}
				}
			}
		}

		/////////////////////////////////////////		
		// Delete 'old' tweet's from twitter_id_index, from twitter_list, and from twitter_render_list:

		// Delete from twitter_id_index index: 
		for (var i=0; i < twitter_list.length; i++)	{
			if (twitter_list[i]['status'] == C_TWEET_OLD)	{
				twitter_id_index.remove(twitter_list[i]['id_str']);
			}
		}

		// Delete any old Tweet's from the twitter_list:
		deleteFromArray(twitter_list, "status", C_TWEET_OLD);

		// Delete any old Tweet's from the twitter_render_list:
		deleteFromArray(twitter_render_list, "status", C_TWEET_OLD);
		deleteFromArray(fgraph_nodelist, "status", C_TWEET_OLD);
		/////////////////////////////////////////



		/////////////////////////////////////////
		// DEBUGGING: SANITY CHECK AFTER RELOAD PROCESS: STARTS
		var t_n_new_tweets = countNumTweetTypes(twitter_list, C_TWEET_NEW);
//		console.log(new Date(), "FINISHED reloaded: twitter_list.length: ", twitter_list.length, "t_n_new_tweets: ", t_n_new_tweets);
		// DEBUGGING: SANITY CHECK AFTER RELOAD PROCESS: ENDS
		/////////////////////////////////////////


		// Empty jsonDataContainer: 
		delete this.jsonDataContainer; 
		this.jsonDataContainer = {};

		// Tweets loading now complete, finish!
		dispatch.cs_progress(3, 100);
	}

	exports.kickOff=function()	{
		// Sound button: 
		var sound_button=d3.select("#sound_button");
		sound_button.on("click", function()	{
			var sound_button_element = d3.select(this);
			var t_soundFlag = soundManager.soundFlag();
			var t_soundOnFlag = true;
			
			if (t_soundFlag == true)	{
				// Sound is currently on, so turning it off.
				soundManager.soundFlag(false);
//				sound_button_element.html("Sound Off");
				t_soundOnFlag = false;
			} else	{
				// Sound is currently off, so turning it on.
				soundManager.soundFlag(true);
//				sound_button_element.html("Sound On");
			}

			// Change image accordingly:
			var sound_button_image = d3.select("#sound_button_image");
			if (!sound_button_image.empty())	{
				var t_sound_button_image_file = C_SOUND_ON;
				if (!t_soundOnFlag)
					t_sound_button_image_file = C_SOUND_OFF;
				// Here, actually change the image.
				sound_button_image.attr("src", t_sound_button_image_file);
			}
		})


		// Reload button: 
		var reload_button=d3.select("#reload_button");
		reload_button.on("click", function()	{
			reloadFlag = true;
		})



		// Start up the forced layout: 
		force_layout = d3.cloudshapes.force()
			//    .charge(0) // -80
			.charge(function(d, i) { 
				if (d.charge != undefined)	{
					return d.charge;
				}	else	{
					return 0;
				}
			})
			//    .friction(0.9) // 0.9 //  
			.friction(1) //  
			.gravity(projectProperties.get('force_gravity')) // 0.1
			.theta(0.8) // 0.8
			.alphaCooling(false) // 0.8
			.throwFlag(true)
			.stopOnMouseOverFlag(true)
			.size([width, height]);

		force_layout
//			.nodes(twitter_render_list);
			.nodes(fgraph_nodelist);

		force_layout.on("tick", exports.tickFn);
		force_layout.start();

	};


	exports.renderTweets=function()	{

		// DEAL WITH FACES: 
		// Iterate through face_list.
		// If items are NOT in fgraph_nodelist (isn't there an index), then add them.
		// AND set status to C_FACE_PRELIVE.
		// fgraph_nodelist.push(face);
		for (var fl = 0; fl < face_list.length; fl++)	{
			var t_found = false;
			for (var fg=0; fg < fgraph_nodelist.length; fg++)	{
				if (fgraph_nodelist[fg].type == C_FACE_TYPE)	{
					if (fgraph_nodelist[fg].name == face_list[fl].name)	{
						t_found = true;
						break;
					}
				}
			}
			if (!t_found)	{
				face_list[fl].status = C_FACE_PRELIVE;
				fgraph_nodelist.push(face_list[fl]);
			}

			// Choose a tweet at random:
			var t_tindex = Math.round(Math.random() * (twitter_render_list.length-1));
			var t_tweet = twitter_render_list[t_tindex];
			if (t_tweet != undefined)	{
				face_list[fl].eye_target_id = t_tweet.id_str;
			}
		}

		// Here, call, the faceManager with the faces list (which shouldn't change): 
		mainSvg
			.call(facesManager, width, height, face_list, C_FACE_CLASS_PREFIX, force_layout, projectProperties);



		// DEAL WITH TWEETS: 
		if (twitter_list.length > 0)	{

			if (twitter_render_list.length < projectProperties.get('ntweets_to_render'))	{

				var t_keywordListKeys = keywordList.keys();
				var t_keywordListKeysLength = t_keywordListKeys.length;
				var t_matchingTweets = new Array(t_keywordListKeysLength);
				var t_nMatchingTweets = 0;

				for (var ti = 0; ti < twitter_list.length; ti++)	{
					if (twitter_list[ti]['status'] == C_TWEET_NEW)	{
						twitter_list[ti]['type'] = "tweet";

						var t_tweet = twitter_list[ti];
						for (var tfc = 0; tfc < t_keywordListKeysLength; tfc++)	{
							var t_matchingTweetItem = t_matchingTweets[tfc];
							if (t_matchingTweetItem == undefined)	{
								var t_kwdsToMatch = t_keywordListKeys[tfc];
								var t_tweetFoundKeywordsList = t_tweet.found_keywords;
								for (var tk = 0; tk < t_tweetFoundKeywordsList.length; tk++)	{
									var t_tweetKeywords = t_tweetFoundKeywordsList[tk].keywords;
									if (t_kwdsToMatch == t_tweetKeywords)	{
										// Yes, found match.
										t_nMatchingTweets++;
										t_matchingTweets[tfc] = t_tweet;
										break;
									}
								}
							} 					}

						if (t_nMatchingTweets == t_keywordListKeysLength)	{
							break;
						}
					}
				}

				var t_tweetToAdd;
				if ((t_nMatchingTweets > 0) && (t_nMatchingTweets <= t_keywordListKeysLength))	{
					for (var tc = 0; tc < t_keywordListKeysLength; tc++)	{
						var t_foundMatch = false;
						if (t_matchingTweets[keywordListIndex] != undefined)	{
							t_tweetToAdd = t_matchingTweets[keywordListIndex];
							t_foundMatch = true;
						}
						keywordListIndex++;
						if (keywordListIndex >= t_keywordListKeysLength)
							keywordListIndex = 0;
						if (t_foundMatch)
							break;
					}
				}

				if (t_tweetToAdd != undefined)	{
					var t_random_tweet = t_tweetToAdd;
					if ((t_random_tweet != undefined)&&(t_random_tweet['status'] == C_TWEET_NEW)) 	{


						t_random_tweet['status'] = C_TWEET_PRELIVE;

////////////////////////////////////////////////////////////////////////////
//				var t_matchingTweet = t_random_tweet;
//				var t_keywordStr = "";
//				for (var xx=0;xx< t_matchingTweet.found_keywords.length;xx++)	{
//					t_keywordStr += (t_matchingTweet.found_keywords[xx].keywords + " : ");
//				}
//				console.log(new Date(), keywordListIndex, t_keywordStr, t_matchingTweet.id_str);
////////////////////////////////////////////////////////////////////////////

						var tchange = 0.01;

						var txdir = tchange;
						if (Math.round(Math.random())==1) txdir = -tchange;

						var tydir = tchange;
						if (Math.round(Math.random())==1) tydir = -tchange;

						t_random_tweet.x = face_list[0].x+txdir;
						t_random_tweet.y = face_list[0].y+tydir;


						twitter_render_list.push(t_random_tweet);
						fgraph_nodelist.push(t_random_tweet);
						}
				}
			}



			mainSvg
				.call(tweetManager, width, height, twitter_render_list, sentiment_colours, force_layout, projectProperties);
			force_layout.start();
		} 

		// Delete any old Tweet's from the twitter_render_list:
		deleteFromArray(twitter_render_list, "status", C_TWEET_OLD);
		deleteFromArray(fgraph_nodelist, "status", C_TWEET_OLD);

		// If X minutes since last load, set reloadFlag = true
		if ((timeSinceEpoch() - timeJsonLastLoaded) >= C_TIME_NO_RELOAD_N_MILLISECONDS)	{
			reloadFlag = true;
		}


		// If number of new in twitter_list < 0, set reloadFlag = true
		var t_n_new_tweets = countNumTweetTypes(twitter_list, C_TWEET_NEW);
		if (t_n_new_tweets == 0)	{
			reloadFlag = true;
		}

		if (reloadFlag == true)	{
			exports.kick_off_loading();			
		}

	}


////////////////////////////////////////////////////////////////////
/* TICK, COLLISION, ADJUST UTILITY FUNCTIONS - STARTS */


function rollaround_circle_values(t_node,w,h)	{
	// Roll x values: 
	if ((t_node.x + t_node.radius) < 0)	{
		var t_diff = t_node.px - t_node.x;
		t_node.x = w + t_node.radius;
		t_node.px = t_node.x + t_diff;
	}	else	{
		if ((t_node.x - t_node.radius) > w)	{
			var t_diff = t_node.x - t_node.px;
			t_node.x = -t_node.radius;
			t_node.px = t_node.x - t_diff;
		}
	}

	// Roll y values: 
	if ((t_node.y + t_node.radius) < 0)	{
		var t_diff = t_node.py - t_node.y;
		t_node.y = h + t_node.radius;
		t_node.py = t_node.y + t_diff;
	}	else	{
		if ((t_node.y - t_node.radius) > h)	{
			var t_diff = t_node.y - t_node.py;
			t_node.y = -t_node.radius;
			t_node.py = t_node.y - t_diff;
		}
	}
}

function rollaround_rect_values(t_node,w,h)	{
	// Roll x values: 
	if ((t_node.x + t_node.half_width) < 0)	{
		var t_diff = t_node.px - t_node.x;
		t_node.x = w + t_node.half_width;
		t_node.px = t_node.x + t_diff;
	}	else	{
		if ((t_node.x - t_node.half_width) > w)	{
			var t_diff = t_node.x - t_node.px;
			t_node.x = -t_node.half_width;
			t_node.px = t_node.x - t_diff;
		}
	}

	// Roll y values: 
	if ((t_node.y + t_node.half_height) < 0)	{
		var t_diff = t_node.py - t_node.y;
		t_node.y = h + t_node.half_height;
		t_node.py = t_node.y + t_diff;
	}	else	{
		if ((t_node.y - t_node.half_height) > h)	{
			var t_diff = t_node.y - t_node.py;
			t_node.y = -t_node.half_height;
			t_node.py = t_node.y - t_diff;
		}
	}
}

//////// ADJUST FUNCTION ////////
var adjust = function(t_node, w,h)	{

	switch(t_node.shape_type)	{
		case "circle":
			if (t_node.radius != undefined)	{
				rollaround_circle_values(t_node,w,h)
			}
			break;

		case "rect":
			if (t_node.x != undefined)	{
				rollaround_rect_values(t_node,w,h)
			}
			break;
	}


	/////////////////////////////////////////
	// Set max speed's: 
	var t_diffx = t_node.x - t_node.px;
	if (Math.abs(t_node.x - t_node.px) > C_MAX_SPEED)	{
		t_diffx = (t_diffx/Math.abs(t_diffx)) * C_MAX_SPEED;
		t_node.px = t_node.x - t_diffx;
	}
	var t_diffy = t_node.y - t_node.py;
	if (Math.abs(t_node.y - t_node.py) > C_MAX_SPEED)	{
		t_diffy = (t_diffy/Math.abs(t_diffy)) * C_MAX_SPEED;
		t_node.py = t_node.y - t_diffy;
	}
	/////////////////////////////////////////
}
//////// ADJUST FUNCTION ////////


// Following taken from: http://jsfiddle.net/justin_c_rounds/Gd2S2/
function checkLineIntersection(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
    // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
    var denominator, a, b, numerator1, numerator2, result = {
        x: null,
        y: null,
        onLine1: false,
        onLine2: false
    };
    denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
    if (denominator == 0) {
        return result;
    }
    a = line1StartY - line2StartY;
    b = line1StartX - line2StartX;
    numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
    numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these lines infinitely in both directions, they intersect here:
    result.x = line1StartX + (a * (line1EndX - line1StartX));
    result.y = line1StartY + (a * (line1EndY - line1StartY));
/*
        // it is worth noting that this should be the same as:
        x = line2StartX + (b * (line2EndX - line2StartX));
        y = line2StartX + (b * (line2EndY - line2StartY));
        */
    // if line1 is a segment and line2 is infinite, they intersect if:
    if (a > 0 && a < 1) {
        result.onLine1 = true;
    }
    // if line2 is a segment and line1 is infinite, they intersect if:
    if (b > 0 && b < 1) {
        result.onLine2 = true;
    }
    // if line1 and line2 are segments, they intersect if both of the above are true
    return result;
};




function circ_rect_intersects(node, quad)	{

	var circleDistanceX, circleDistanceY, circleX, circleY, circleR;
	var rectX, rectY, rectW, rectH;

	if (node.shape_type == "circle")	{
		circleX = node.x;
		circleY = node.y;
		circleR = node.radius;
	}
	if (node.shape_type == "rect")	{
		rectX = node.x;
		rectY = node.y;
		rectW = node.width;
		rectH = node.height;
	}

	if (quad.point.shape_type == "circle")	{
		circleX = quad.point.x;
		circleY = quad.point.y;
		circleR = quad.point.radius;
	}
	if (quad.point.shape_type == "rect")	{
		rectX = quad.point.x;
		rectY = quad.point.y;
		rectW = quad.point.width;
		rectH = quad.point.height;
	}


	// WARNING: HORRIBLE HACK. THIS IS REQUIRED, BUT, I HAVE NO IDEA WHY.
	rectX -= C_HORRID_HACK_X; 
	rectY -= C_HORRID_HACK_Y;

	circleDistanceX = Math.abs(circleX - rectX);
	circleDistanceY = Math.abs(circleY - rectY);

	if (circleDistanceX > ((rectW/2) + circleR)) { return false; }
	if (circleDistanceY > ((rectH/2) + circleR)) { return false; }

	if (circleDistanceX <= (rectW/2)) { return true; }
	if (circleDistanceY <= (rectH/2)) { return true; }

	var cornerDistance_sq = ((circleDistanceX - (rectW/2))*(circleDistanceX - (rectW/2))) + ((circleDistanceY - (rectH/2))*(circleDistanceY - (rectH/2)));
	var t_retflag = (cornerDistance_sq <= (circleR*circleR));

	return t_retflag;
}




function rect_intersects(node, quadpoint) {
	var r1_left, r1_right, r1_top, r1_bottom;
	var r2_left, r2_right, r2_top, r2_bottom;

	var t_adjust = 0;

	r1_left = node.x - node.half_width - t_adjust;
	r1_right = node.x + node.half_width + t_adjust;
	r1_top = node.y - node.half_height - t_adjust;
	r1_bottom = node.y + node.half_height + t_adjust;

	r2_left = quadpoint.x - quadpoint.half_width - t_adjust;
	r2_right = quadpoint.x + quadpoint.half_width + t_adjust;
	r2_top = quadpoint.y - quadpoint.half_height - t_adjust;
	r2_bottom = quadpoint.y + quadpoint.half_height + t_adjust;

	var t_returnflag = !(r2_left > r1_right || 
           r2_right < r1_left || 
           r2_top > r1_bottom ||
           r2_bottom < r1_top);

	return t_returnflag;
}


function collide(node) {
	var r = node.radius + 16;
	var nx1, nx2, ny1, ny2;

	if (node.shape_type == "circle")	{
		nx1 = node.x - r;
		nx2 = node.x + r;
		ny1 = node.y - r;
		ny2 = node.y + r;
	}


	if (node.shape_type == "rect")	{
		nx1 = node.x - node.half_max_length;
		nx2 = node.x + node.half_max_length;
		ny1 = node.y - node.half_max_length;
		ny2 = node.y + node.half_max_length;
	}


	  return function(quad, x1, y1, x2, y2) {
	    var notoverlap_flag = (x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1);
	    // If callback returns true for a quadtree node, then the children of that quadtree node are not visited.
	    // So we want to know whether a cabinet minister is completely WITHIN a quadtree node.
	    // So "TRUE" means that cabinet minister IS NOT OVERLAPPING the quadtree node.
	    if (notoverlap_flag)	{
		return notoverlap_flag;
	    }

	    // Only do this collision detection and correction *IF* there is an overlap. 
	    if (!notoverlap_flag) {
		    if (quad.point && (quad.point != node)) {

			if ((node.shape_type == "circle") && (quad.point.shape_type == "circle"))	{
			      var dx = node.x - quad.point.x,
				  dy = node.y - quad.point.y,
				  distance = Math.sqrt(dx * dx + dy * dy),
				  r = node.radius + quad.point.radius + C_CIRCLE_COLLIDE_DISTANCE;

			      // HERE: if they DO collide, do something about it. 
			      if (distance < r) {

					// This is the amount to repel objects by ...
					var repelvalue = (distance - r) / distance * C_CIRCLE_COLLIDE_FACTOR; 

					dx *= repelvalue;
					dy *= repelvalue;


					if ((node.fixed == undefined) || ((node.fixed != undefined) && (node.fixed == 0)) )	{
						node.x -= dx;
						node.y -= dy;
					}

					// BUT: WHY *ADD* WHEN ABOVE SUBTRACT? 
					// ANSWER: To move the objects away from each other a bit. 
					// OTHERWISE: They bump into each other too easily.  
					if ((quad.point.fixed == undefined) || ((quad.point.fixed != undefined) && (quad.point.fixed == 0)) )		{	
						quad.point.x += dx;
						quad.point.y += dy;
					}
					notoverlap_flag = true;
			      }
			
			}

			if ((node.shape_type == "rect") && (quad.point.shape_type == "rect"))	{
				var t_rect_intersects = rect_intersects(node, quad.point);
				if (t_rect_intersects)	{
					var nodex = node.x;
					var nodey = node.y;

					var quadx = quad.point.x;
					var quady = quad.point.y;

					var dx = nodex - quadx,
						dy = nodey - quady,
						distance = Math.sqrt(dx * dx + dy * dy);

					var max_distance = node.half_hypotenuse + quad.point.half_hypotenuse + C_RECT_COLLIDE_DISTANCE;
					var repelvalue = (distance - max_distance) / distance * C_RECT_COLLIDE_FACTOR; 


					dx *= repelvalue;
					dy *= repelvalue;

					if ((node.fixed == undefined) || ((node.fixed != undefined) && (node.fixed == 0)) )	{
						node.x -= dx;
						node.y -= dy;
					}

					// BUT: WHY *ADD* WHEN ABOVE SUBTRACT? 
					// ANSWER: To move the objects away from each other a bit. 
					// OTHERWISE: They bump into each other too easily.  
					if ((quad.point.fixed == undefined) || ((quad.point.fixed != undefined) && (quad.point.fixed == 0)) )		{
						quad.point.x += dx;
						quad.point.y += dy;
					}
					notoverlap_flag = true;
				}
			}

			// If circle intersects a rect: 
			// From ... http://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection

			if ((node.shape_type != quad.point.shape_type)&&((node.shape_type == "circle" && quad.point.shape_type == "rect") || (node.shape_type == "rect" && quad.point.shape_type == "circle")))
			{
				var t_circ_rect_intersect = circ_rect_intersects(node, quad);
				if (t_circ_rect_intersect)	{

					// Do something because they do collide ...
					var t_circle, t_rect;
					if (node.shape_type == "circle")
						t_circle = node;

					if (node.shape_type == "rect") 
						t_rect = node;

					if (quad.point.shape_type == "circle")
						t_circle = quad.point;

					if (quad.point.shape_type == "rect") 
						t_rect = quad.point;

					var nodex = node.x;
					var nodey = node.y;

					var quadx = quad.point.x;
					var quady = quad.point.y;

					var dx = nodex - quadx;
					var dy = nodey - quady;
					var distance = Math.sqrt(dx * dx + dy * dy);


					var max_distance = t_rect.half_hypotenuse + t_circle.radius + C_CIRCLE_RECT_COLLIDE_DISTANCE;
					var repelvalue = (distance - max_distance) / distance * C_CIRCLE_RECT_COLLIDE_FACTOR; 

					dx *= repelvalue;
					dy *= repelvalue;

					if ((node.fixed == undefined) || ((node.fixed != undefined) && (node.fixed == 0)) )	{
						node.x -= dx;
						node.y -= dy;
					}

					// BUT: WHY *ADD* WHEN ABOVE SUBTRACT? 
					// ANSWER: To move the objects away from each other a bit. 
					// OTHERWISE: They bump into each other too easily.  
					if ((quad.point.fixed == undefined) || ((quad.point.fixed != undefined) && (quad.point.fixed == 0)) )		{
						quad.point.x += dx;
						quad.point.y += dy;
					}
					notoverlap_flag = true;
				}
			}
	      }
	    }
	    return notoverlap_flag;
	  };
}


///////////////////////////// moveEyePupil: STARTS /////////////////////////////
	// Move eye pupils: 
	exports.moveEyePupil=function(_eyeData, _object_diff_x, _object_diff_y)	{
		var pupil_max_d = _eyeData.max_distance;
		var object_angle = Math.atan2(_object_diff_y, _object_diff_x);
	   
	    	var max_angle_diff = C_PUPIL_STEP;
		var current_angle = Math.atan2(_eyeData.pupily, _eyeData.pupilx);
		var angle_diff = object_angle - current_angle;
		var angle_diff_abs = Math.abs(object_angle - current_angle);
		
		if (angle_diff_abs > max_angle_diff)	{
			if (angle_diff_abs > Math.PI)	{
				if (angle_diff < 0)	{
					angle_diff = angle_diff + (2*Math.PI);
				}	else	{
					if (angle_diff > 0)	{
						angle_diff = angle_diff - (2*Math.PI);
					}
				}
			}
			if (angle_diff < 0)	{
				object_angle = current_angle - max_angle_diff;
			}
			if (angle_diff > 0)	{
				object_angle = current_angle + max_angle_diff;  
			}
		}        

		var cosa = Math.cos(object_angle);
		var sina = Math.sin(object_angle);

		// Here we always force the pupil to the edge of the eye. 
		var pupil_max_d_x = pupil_max_d * cosa;
		var pupil_max_d_y = pupil_max_d * sina;

		_eyeData.pupilx = pupil_max_d_x;
		_eyeData.pupily = pupil_max_d_y;

		return _eyeData; 
	}
///////////////////////////// moveEyePupil: ENDS /////////////////////////////


	exports.doURLCurvyText=function()	{
		if ((urlData != undefined) && (urlData.get('urlText') != undefined) && (urlData.get('urlText') != ""))	{

			var t_displayCounter = urlData.get('displayCounter');
			if (t_displayCounter == undefined)	{
				t_displayCounter = projectProperties.get('tf_url_cto_n_iterations');
				urlData.set('displayCounter', t_displayCounter);
			}

			if (t_displayCounter > 0)	{
				// We have some displaying to do. Maybe.
				var t_timeNextDisplayed = urlData.get('timeNextDisplayed');
				if ((t_timeNextDisplayed == undefined) || (timeSinceEpoch() >= t_timeNextDisplayed))	{
					// Now, we *definitely* have some displaying to do.

					// Display text. Or add it to the queue rather.
					exports.textAndURLCTO(urlData.get('urlText'));

					// Set next iteration counter and timer.
					t_displayCounter -= 1;
					urlData.set('displayCounter', t_displayCounter);
					urlData.set('timeNextDisplayed', timeSinceEpoch() + projectProperties.get('tf_url_cto_time_gap'));
				}
			}
		}
	}


/* TICK, COLLISION, ADJUST UTILITY FUNCTIONS - ENDS */
////////////////////////////////////////////////////////////////////

	exports.tickFn=function(_param)	{

		// Here: If no user input, and flags say user should be prompted,
		// and default input message is defined - user is indeed prompted:
		if ((projectProperties.get('tf_no_action_timetowait') != undefined) && (projectProperties.get('tf_no_action_timetowait') != "") && (projectProperties.get('tf_textinput_default_message') != undefined) && (projectProperties.get("tf_textinput_default_message") != ""))	{
			if (!textInputBoxMessageHasHappened)	{
				if (timeOfPromptMessage == undefined)	{
					timeOfPromptMessage = timeSinceEpoch() + projectProperties.get('tf_no_action_timetowait');
				}

				if (timeSinceEpoch() >= timeOfPromptMessage)	{
					// Send prompt message:
					exports.textAndURLCTO(projectProperties.get('tf_textinput_default_message'));

					// Record in GA.
					reportEventToGoogleAnalytics(C_GA_CATEGORY, C_GA_ACTION_NO_INPUT_PROMPT_LAUNCHED, "No Input & User Prompted", undefined, true);

					if ((projectProperties.get('tf_no_action_repeat') != undefined) && (projectProperties.get('tf_no_action_repeat') != "") && (projectProperties.get('tf_no_action_repeat') == "y"))	{
						timeOfPromptMessage = timeSinceEpoch() + projectProperties.get('tf_no_action_timetowait');
					}	else	{
						textInputBoxMessageHasHappened = true;
					}
				}
			}
		}

		// Here, add curvyTextObject if data specified in the URL(s):
		exports.doURLCurvyText();

		// Here pulse the text input box:
		if (C_INPUTBOX_PULSE_FLAG)	{
			if ((timeSinceEpoch() - timeLastInputPulsed) >= C_INPUTBOX_PULSE)	{
				timeLastInputPulsed = timeSinceEpoch();
				exports.pulseTextInputBox()
			}
		}


		//// HERE do reloading (if needs be):
		if ((timeSinceEpoch() - timeLastRendered) >= C_TWEET_TIMER)	{
			timeLastRendered = timeSinceEpoch();
			exports.renderTweets();
		}


		//////////// HERE DO MANIPULATION, COLLISION, ETC .....  ////////////////////////

		// Collision detection:
		var q = d3.cloudshapes.quadtree(fgraph_nodelist),
			i = 0,
			n = fgraph_nodelist.length;

		i = 0;
		while (i < n) {
			var t_node = fgraph_nodelist[i];
			if (t_node != undefined)	{
				q.visit(collide(t_node));

				// Adjust for rolling off sides, top and bottom.
				if ((t_node.status == C_FACE_LIVE)||(t_node.status==C_TWEET_LIVE)){
					adjust(t_node, width,height);
				}

				// Render faces: i.e. adjust eyes,
				if (t_node.type == "face")	{
					var t_face = t_node;
					if (t_face.status == C_FACE_PRELIVE2)	{
						t_face.status = C_FACE_LIVE;
					}

					// Adjust eye movement:
					if (t_face.status == C_FACE_LIVE)	{

						if (t_face.eye_target_id == undefined)	{
							// Choose a tweet at random:
							var t_tindex = Math.round(Math.random() * (twitter_render_list.length-1));
							var t_tweet = twitter_render_list[t_tindex];
							t_face.eye_target_id = t_tweet.id_str;
						}

						if (t_face.eye_target_id != undefined)	{
							var t_tweet = twitter_id_index.get(t_face.eye_target_id);
							if (t_tweet != undefined)	{
								var t_diff_x = t_tweet.x - t_face.x;
								var t_diff_y = t_tweet.y - t_face.y;
								exports.moveEyePupil(t_face.eyes[0], t_diff_x, t_diff_y);
								exports.moveEyePupil(t_face.eyes[1], t_diff_x, t_diff_y);
							}
						}
					}
				}

				// Render tweets: i.e. do fades and transitions.
				if (t_node.type == "tweet")	{
					if(t_node['status'] == C_TWEET_PRELIVE2)	{
						t_node['status'] = C_TWEET_LIVE;
					}

					if(t_node['status'] == C_TWEET_LIVE)	{
						tweetManager.tickFn(t_node);
					}
				}
			}
			i++;
		}


		facesManager.transform();
		tweetManager.transform();

		var t_spit_out_timer = projectProperties.get('spit_out_timer');
		if ((t_spit_out_timer != undefined) && (t_spit_out_timer != "") && (t_spit_out_timer > 0))	{

			if (timeCurvyTextLastSpat == 0)	{
					exports.face_spit_out(true);
					timeCurvyTextLastSpat = timeSinceEpoch();
			} else	{
				if ((timeSinceEpoch() - timeCurvyTextLastSpat) >= t_spit_out_timer)	{
					exports.face_spit_out(false);
					timeCurvyTextLastSpat = timeSinceEpoch();
				}
			}
		}


		return stopTickFlag; // true stops the tick function.
	}

	d3.rebind(exports, dispatch, 'on');
	return exports;
};


// Very first. Before anything else. Do initial nasty browser/OS hacks:
function browserOSHacks()	{
	var t_ua = navigator.userAgent;
	var t_ua_lowercase = t_ua.toLowerCase();

	// Check for Opera.
	if (t_ua_lowercase.indexOf("opera") !== -1)	{
		// Woo. Found Opera.
		var t_body = d3.select('body');
		if (!t_body.empty())	{
			// See: http://stackoverflow.com/questions/15121653/bad-svg-text-quality-in-opera
			// Without this, text in Tweet's just doesn't appear.
			// We could apply this more precisely, i.e. to specific elements that need it rather than
			// just the whole body, but hey, this works, and it is solely focused on Opera.
			t_body.style("text-rendering", "geometricPrecision");
		}
	}
}
browserOSHacks();




// Global variables ...
var t_w = window.innerWidth-C_CSS_WIDTH_OFFSET;
var t_h = window.innerHeight-C_CSS_HEIGHT_OFFSET;
var g_tweetfeaturing = d3.cloudshapes.fatherhackett();

document.documentElement.style.overflow = 'hidden';  // firefox, chrome
document.body.scroll = "no"; // ie only

d3.select("#tweets")
	.call(g_tweetfeaturing, t_w, t_h);


////////////////////////////////////////////////////////////////////







