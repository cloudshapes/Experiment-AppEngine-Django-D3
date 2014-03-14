

"use strict"; 
var 
	// Lifespan of a tweet, and time for fade up
	C_TWEET_LIFESPAN_ = 10000,

	C_TWEET_FADEUP_DURATION_PERCENT = 5,
	C_TWEET_FADELIVE_DURATION_PERCENT = 80,
	C_TWEET_FADEOUT_DURATION_PERCENT = 100 - C_TWEET_FADELIVE_DURATION_PERCENT - C_TWEET_FADEUP_DURATION_PERCENT,

//	C_TWEET_BOX_POSN_OFFSET = 200,
//	C_TWEET_BOX_Y_POSN_OFFSET = 100,

	C_TWEET_BOX_OFFSET_VAL = 50,
	C_TWEET_BOX_OFFSET = 8;
	


function setBornTime(d, flag)	{
	if (flag)
		d[C_TWEET_BORN_TIME] = new Date().getTime();
	else
		d[C_TWEET_BORN_TIME] = undefined;	
}


d3.cloudshapes.tweetmanager = function module() {
	var mainSvg;
	var width,height;
	var sentiment_colours;
	var projectProperties;
	var 
		tweet_lifespan,
		tweet_fadeup_duration,
		tweet_fadelive_duration,
		tweet_fadeout_duration;


	var dispatch = d3.dispatch('removeTweetEvent', 'mouseTabletClick');
	function exports(_selection, _width,_height, _twitter_render_list, _sentiment_colours, _forced_layout, _projectProperties)	{
		width = _width;
		height = _height;
		sentiment_colours = _sentiment_colours;
		projectProperties = _projectProperties;
		_selection.each(function(_data) {
			if (!mainSvg) {
				mainSvg = d3.select(this);
			}
			if (tweet_lifespan == undefined)	{
				exports.setTweetDurations();
			}
			exports.render_tweets(_forced_layout, _twitter_render_list);
		})
	}

	exports.setTweetDurations=function(_tweetlifespan)	{
		tweet_lifespan = _tweetlifespan;
		if (_tweetlifespan == undefined)
			tweet_lifespan = C_TWEET_LIFESPAN_;

		tweet_fadeup_duration = Math.round((C_TWEET_FADEUP_DURATION_PERCENT/100)*tweet_lifespan);
		tweet_fadelive_duration = Math.round((C_TWEET_FADELIVE_DURATION_PERCENT/100)*tweet_lifespan);
		tweet_fadeout_duration = Math.round((C_TWEET_FADEOUT_DURATION_PERCENT/100)*tweet_lifespan);
	}


	exports.build_tweet_class_string=function(_tweet_id_str)	{
		return "tid"+_tweet_id_str;
	}

	exports.render_tweets=function(_forced_layout, twitter_render_list)	{
		////////////////// CREATE NEW TWEETS ////////////////

		var t_new_tweet = mainSvg.selectAll("g.tweet_g") 
			.data(twitter_render_list)
			.enter()
			.append("g")
			.attr("class", function(d){
				var t_tweet_id_str = d.id_str;
				var t_temp_tweet_class = "tweet_g " + exports.build_tweet_class_string(t_tweet_id_str);
				return t_temp_tweet_class;
			})
			.attr("id",function(d,i) {return d.id_str;}) 
			.style({opacity: 0});

		// If new tweet is not empty, i.e. exists properly: 
		if (t_new_tweet.empty() == false)	{
			// Background rect ....
			t_new_tweet.append("rect")
				.attr("class", "tweet_background_rect")
				.style({opacity: 1}); // was zero

			// Get the tweet data: 
			var tweet_data = undefined;
			t_new_tweet.attr("d", function(d)	{ tweet_data = d; })

			var x;
			var y;
			var t_rand = Math.round(Math.random());
			if (t_rand)	{
				// x varies.
				x = Math.round(Math.random() * (width-C_TWEET_BOX_OFFSET_VAL)) + C_TWEET_BOX_OFFSET_VAL/2;
				y = Math.round(Math.random());
				if (y)	
					y = -(C_TWEET_BOX_OFFSET_VAL/2);
				else
					y = height + (C_TWEET_BOX_OFFSET_VAL/2);
			}	else	{
				// y varies
				x = Math.round(Math.random());
				if (x)
					x = -(C_TWEET_BOX_OFFSET_VAL/2);
				else
					x = width + (C_TWEET_BOX_OFFSET_VAL/2);
				y = Math.round(Math.random() * (height-C_TWEET_BOX_OFFSET_VAL)) + C_TWEET_BOX_OFFSET_VAL/2;
			}
//			x = Math.round(Math.random() * (width-C_TWEET_BOX_POSN_OFFSET));
//			y = Math.round(Math.random() * (height-C_TWEET_BOX_POSN_OFFSET)) + C_TWEET_BOX_Y_POSN_OFFSET;

			tweet_data.x = x;
			tweet_data.y = y;

			tweet_data.px = tweet_data.x;
			tweet_data.py = tweet_data.y;


			var t_new_user_details = t_new_tweet.append("text")
				.attr("x", 0)
				.attr("y", 0)
				.attr("class", "text_user_details")
				.style({opacity: 1}) // was zero

			// Add author nickname: 
			t_new_user_details.append("tspan")
				.attr("class", "text_user_details_tspan")
				.text(function(d)	{
					return d.author_nickname + ":";
				})

			var userdetails_text_element =  t_new_tweet.select("text.text_user_details");
			var userdetails_bbox =  userdetails_text_element.node().getBBox();
			var t_y_position = userdetails_bbox.height;


			var t_sentiment_colour = C_DEFAULT_SENTIMENT;
			if (tweet_data['sentiment'] != undefined)	{
				var t_tweet_sentiment = tweet_data['sentiment'][0];
				var t_sentiment_scale = d3.scale.linear().domain([-1,1]).range([0,sentiment_colours.length]);
				var t_sentiment_colour_index = parseInt(t_sentiment_scale(t_tweet_sentiment));
				t_sentiment_colour = sentiment_colours[t_sentiment_colour_index];
			}



			// Add in title:
			var t_title_text = t_new_tweet.append("text")
				.attr("x", 0)
				.attr("y", t_y_position)
				.attr("class", "tweet_text_title")
				.style({opacity: 1}) // was zero

			// Add author nickname: 
			t_title_text.append("tspan")
				.attr("class", "tweet_text_title")
				.text(function(d)	{
					return d.title;
				})

			var title_text_element =  t_new_tweet.select("text.tweet_text_title");
			var title_bbox =  title_text_element.node().getBBox();
			t_y_position += title_bbox.height;


			// Render individual lines of tweets: 
			var t_text_lines = tweet_data.text_lines;
			for (var i=0; i<t_text_lines.length;i++)	{
				var t_text_line = t_text_lines[i];
				var t_text_line_number = t_text_line.line_number;
				var t_text_line_text = t_text_line.text;

				var tweet_text = t_new_tweet.append("text")
					.attr("x", 0)
					.attr("y", t_y_position)
					.attr("class", function(d){ return "line line" + t_text_line_number;})

				tweet_text.append("tspan")
					.attr("class", "tweet_text_tspan")
					.style({opacity: 1, fill:t_sentiment_colour}) // was zero
					.text(t_text_line_text);

				// Now, get the height of this current line.
				var current_text_line =  t_new_tweet.select("text.line" + t_text_line_number);
				var current_text_line_bbox =  current_text_line.node().getBBox();
				t_y_position += current_text_line_bbox.height;
			}

			var datetime_text = t_new_tweet.append("text")
				.attr("x", 0)
				.attr("y", t_y_position)
				.attr("class", "datetime_details")
				.style({opacity: 1}); // was zero


			datetime_text.append("tspan")
				.attr("class", "text_datetime_details_tspan")
				.text(function(d)	{
					return "Published: " + d.ukFormattedCreateDateTime;
				})


			var t_temp_tweet_class = exports.build_tweet_class_string(tweet_data.id_str);
			var t_new_tweet_copy = mainSvg.select("g." + t_temp_tweet_class);
			var t_tweet_bbox_orig =  t_new_tweet_copy.node().getBBox();
			var t_tweet_bbox = cs_copyBBox(t_tweet_bbox_orig);

			// Draw box around the tweet: 
			t_tweet_bbox.x -= C_TWEET_BOX_OFFSET;
			t_tweet_bbox.y -= C_TWEET_BOX_OFFSET;
			t_tweet_bbox.width += (C_TWEET_BOX_OFFSET*2);
			t_tweet_bbox.height += (C_TWEET_BOX_OFFSET*2);

			var t_new_tweet_rect = t_new_tweet_copy.select("rect.tweet_background_rect")
				.attr("x", t_tweet_bbox.x)
				.attr("y", t_tweet_bbox.y)
				.attr("width", t_tweet_bbox.width)
				.attr("height", t_tweet_bbox.height)
				.style({opacity: 0.5}); // was zero

			// Setup on-click on tweet functionality. Quite possibly temporary code:
			t_new_tweet_copy
				.on("touchstart", function(d){
					exports.tweet_mouse_tablet_event(this, d);
				})

				.on("mousedown", function(d){
					exports.tweet_mouse_tablet_event(this, d);
				})

				.on("mouseover", function(d){
					exports.tweet_mouseover_event(this, d);
				})


			// Here, look to set tweet status to prelive2: 
			////////////////////////// FINAL ASSIGNMENT OF DATA TO TWEET: /////////////////////////
//			t_tweet_bbox = t_new_tweet_copy.node().getBBox();
			t_new_tweet_copy.attr("d", function(d)	{
				// Here record the tweets width, height, x and y details.
				d.width = t_tweet_bbox.width;
				d.height = t_tweet_bbox.height;

				// Here record information necessary for collision detection etc ...:
				var t_w = d.width;
				var t_h = d.height;

				var t_half_width = t_w/2;
				var t_half_height = t_h/2;

				var t_hypotenuse = Math.sqrt((t_w * t_w) + (t_h * t_h));
				var t_half_hypotenuse = t_hypotenuse/2;

				var t_max_length = t_w;
				if (t_h > t_max_length)
					t_max_length = t_h;
				var t_half_max_length = t_max_length/2;

				d.half_width = t_half_width;
				d.half_height = t_half_height;
				d.hypotenuse = t_hypotenuse;
				d.half_hypotenuse = t_half_hypotenuse;
				d.max_length = t_max_length;
				d.half_max_length = t_half_max_length;

				d.shape_type = "rect";

				// Set the default charge: 
				d.charge = projectProperties.get('tweet_charge');

				// Reset born time if tweet being reused: 
				if (d[C_TWEET_BORN_TIME] != undefined)	{
					setBornTime(d, false);
				}
				d.status = C_TWEET_PRELIVE2; // Visually live, ready to be added to forced graph.

				return d;
			});

			t_new_tweet_copy
				.call(_forced_layout.drag);
		}
	}


	exports.tweet_mouse_tablet_event = function(_clickedon, d)	{
		if (d.status == C_TWEET_LIVE)	{
			var t_this_element = d3.select(_clickedon);
			t_this_element.transition().style({opacity: 1}).duration(0);
			setBornTime(d, true);

			dispatch.mouseTabletClick(_clickedon, d);
		}
	}


	exports.tweet_mouseover_event = function(_clickedon, d)	{
		if (d.status == C_TWEET_LIVE)	{
			var t_this_element = d3.select(_clickedon);
			t_this_element.transition().style({opacity: 1}).duration(0);
			setBornTime(d, true);
		}
	}


	exports.removeTweet = function(t_element_id)	{
		var t_element_class_string = "g." + exports.build_tweet_class_string(t_element_id);
		var t_element_data;

		////////////////// DELETE OLD TWEET ////////////////
		mainSvg.selectAll(t_element_class_string) 
			// Immediately set the status to dieing, taking it out of the forced graph.
			.attr('d', function(d)	{
				d.x = d.px, d.y = d.py; 

				d.status = C_TWEET_DIEING; 
				t_element_data = d;
				return d;
			})
			.remove()
		t_element_data['status'] = C_TWEET_OLD;
		dispatch.removeTweetEvent(t_element_id);
	}


	// exports.tickFn: 
	exports.tickFn = function(t_tweetdata)	{

		// First check that the tweet is live. Should only ever be live:
		if (t_tweetdata['status'] == C_TWEET_LIVE)	{
			// If born time not set, set it.
			if (t_tweetdata[C_TWEET_BORN_TIME] == undefined)	{
				setBornTime(t_tweetdata, true);
				t_tweetdata[C_TWEET_FADEUPCOMPLETE_TIME] = t_tweetdata[C_TWEET_BORN_TIME] + tweet_fadeup_duration;
			}

			// If being dragged, moved, whatever - extend lifestyle:
			if (t_tweetdata['fixed'] > 0)	{
				setBornTime(t_tweetdata, true);
			}

			// Has the tweet outlived its lifespan?
			var t_borntime = t_tweetdata[C_TWEET_BORN_TIME];
			var t_currenttime = new Date().getTime();
			var t_time_alive = t_currenttime - t_borntime;

			if (t_time_alive > tweet_lifespan)	{
				// Time ... to die: 
				exports.removeTweet(t_tweetdata['id_str']);
				return;
			}


			// Calculate opacity value of other parts of the tweet: 
			var t_opacity_value;
			var t_fadeuptimeleft = t_tweetdata[C_TWEET_FADEUPCOMPLETE_TIME] - t_currenttime;

			if (t_fadeuptimeleft <= 0)	{
				t_opacity_value = 1;
				var t_end_of_fade_live_time = t_borntime + tweet_fadeup_duration + tweet_fadelive_duration;
				if (t_currenttime >= t_end_of_fade_live_time)	{	
					// Fade out time:
					var t_fadeouttimeleft = (t_end_of_fade_live_time + tweet_fadeout_duration) - t_currenttime;
					t_opacity_value = t_fadeouttimeleft / tweet_fadeout_duration;
				}
			}	else	{
				t_opacity_value = 1 - (t_fadeuptimeleft / tweet_fadeup_duration);
			}

			t_tweetdata[C_TWEET_OPACITY] = t_opacity_value;
		}
	}

	exports.transform = function()	{
		if (mainSvg == undefined)
			return;

		var t_tweet_element = mainSvg.selectAll("g.tweet_g");
		t_tweet_element
				.style({opacity: 1})
				.attr("transform", function(d)	{
					var t_x = d.x - d.half_width;
					var t_y = d.y - d.half_height;
					var t_scale = d[C_TWEET_OPACITY];
					return "translate(" + t_x + "," + t_y + "), scale(" + t_scale + ")";
//					return "translate(" + t_x + "," + t_y + ")";
				});

/*
		t_tweet_element
				.selectAll("text.text_user_details").style("opacity", function(d)	{
					return d[C_TWEET_OPACITY];
				});
		t_tweet_element
				.selectAll("a.tweet_text_link").style("opacity", function(d)	{
					return d[C_TWEET_OPACITY];
				});
		t_tweet_element
				.selectAll("tspan.tweet_text_tspan").style("opacity", function(d)	{
					return d[C_TWEET_OPACITY];
				});
		t_tweet_element
				.selectAll("text.datetime_details").style("opacity", function(d)	{
					return d[C_TWEET_OPACITY];
				});
*/

	}



	d3.rebind(exports, dispatch, 'on');
	return exports;
};

////////////////////////////////////////////////////////////////////







