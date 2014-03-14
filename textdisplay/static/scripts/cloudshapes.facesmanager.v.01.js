

////////////////////////////////////////////////////////////////////
// FACEMANAGER MODULE

// GLOBAL CONSTANTS:
var
	C_PUPIL_OFFSET_FROM_EDGE = 1,
	C_QUIT_TRANSITION_DURATION = 1750;

var
	C_BORDER_OF_FACE_CIRCLE = "blue",
	C_RIPPLE_INITIAL_COLOUR = C_BORDER_OF_FACE_CIRCLE,
	C_RIPPLE_END_COLOUR = "red",
	C_RIPPLE_INITIAL_RIPPLE_WIDTH = 2,
	C_RIPPLE_END_RIPPLE_WIDTH = 20,
	C_RIPPLE_EXTN = 8,	
	C_RIPPLE_DURATION = 500;



d3.cloudshapes.facesManager = function module() {
	var faceSvg;
	var width,height;
	var dispatch = d3.dispatch('mousedown', 'touchstart', 'mouseover.force', 'mouseover', 'quitComplete');
	var projectProperties;

    function exports(_selection, _width,_height, _data, _face_class, _forced_layout, _projectProperties) {
	width = _width;
	height = _height;
	data = _data;
	face_class = _face_class;
	forced_layout = _forced_layout;
	projectProperties = _projectProperties;

	_selection.each(function(_data) {
		var p_visible = true;

		if (!faceSvg) {
			faceSvg = d3.select(this);
		}

		// Create a 'g' object per face:
		var t_objectg = faceSvg.selectAll("g." + face_class)
			.data(data, function(d) { return d.id_str;});
		
		// Create the face objects. //////////////////////////////////////////////////
		// enter() section - i.e. create the face objects.
		var t_newly_created_g_objectg = t_objectg
		    .enter()
			.append("svg:g")
			.attr("display", function(d) {var return_value="inline"; if (p_visible==false){return_value="none";}; return return_value;})
			.attr("class", face_class)
			.attr("name", function(d) {return d.name;})
			.attr("id",function(d,i) {return d.id_str;}) 
			.attr('d', function(d)	{
				d.type = C_FACE_TYPE;

				if (d.x == undefined)	{
					d.x = Math.round(Math.random() * width);
					d.px = d.x;
				}

				if (d.y == undefined)	{
					d.y = Math.round(Math.random() * height);
					d.py = d.y;
				}

				if (d.scale == undefined)
					d.scale = C_FACE_DEFAULT_SCALE;

				if (d.radius == undefined)	{
					d.radius = d.imgd/2;
				}

				if (d.scaled_radius == undefined)
					d.scaled_radius = d.scale * d.radius;

				if (d.charge == undefined)	{
					if (projectProperties != undefined)	{
						d.charge = projectProperties.get('face_charge');
					}	else	{
						d.charge = C_FACE_DEFAULT_CHARGE;
					}
				}
				d.shape_type = "circle";
			})
			.attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")";});

		if (forced_layout != undefined)	{
			t_newly_created_g_objectg
				.call(forced_layout.drag);
		}

		t_newly_created_g_objectg
			.on("mousedown", exports.process_mousedown)
			.on("touchstart", exports.process_touchstart)
			.on("mouseover.force", exports.process_mouseover);

		var t_circle_object = t_newly_created_g_objectg
			.append("circle")
				.attr("cx", function(d) { return 0; })
				.attr("cy", function(d) { return 0; })
				.attr("r", function(d) {return d.radius; })
				.attr("class", "object_circle")
				.style("fill", function(d) { return d.bgnd; })
				.style("fill-opacity", function(d) { return d.bgnd_opacity; });

		t_newly_created_g_objectg
			.append("image")
				.attr("xlink:href", function(d) { return d.image;})
				.attr("width", function(d) { return d.imgd;})
				.attr("height", function(d) { return d.imgd;})
				.attr("transform", function(d) {return "translate(" + -d.imgd/2 + "," + -d.imgd/2 + ")";});

		// Create the eyes and pupils.
		var t_eye_object_g = t_objectg.selectAll("g.g_eye_object_g")
			.data(function(d) { return d.eyes; })
			.enter()
			.append("svg:g")
				.attr("class", "g_eye_object_g")
				.attr("transform", function(d) {return "translate(" + d.cx + "," + d.cy + ")";})

		var t_eye_object = t_eye_object_g
			.append("circle")
				.attr("cx", function(d) { return 0; })
				.attr("cy", function(d) { return 0; })
				.attr("r", function(d) { return d.r; })
				.attr("class", "eye_object")
				.style("fill-opacity", function(d) { return d.eye_fill_opacity; })
				.style("fill", function(d) { return d.eye_fill; })

		var t_pupil_object = t_eye_object_g
			.append("circle")
				.attr("cx", function(d) { return d.pupilx; })
				.attr("cy", function(d) { return d.pupily; })
				.attr("r", function(d) { return d.pr; })
				.attr("d", function(d) { d.max_distance = d.r - d.pr - C_PUPIL_OFFSET_FROM_EDGE; return d; })
				.attr("class", "g_pupil_object")
				.style("fill", function(d,i) { return "#222222"; });

		// Exiting. So remove.
		t_objectg
			.exit()
				.attr("class", face_class + " exiting")
				.transition()
					.duration(350)
					.ease("linear")
					.style("fill-opacity", 0.0)
					.remove();

		t_newly_created_g_objectg.attr('d', function(d)	{
			d.status = C_FACE_PRELIVE2;
		});
        });
    }


    exports.transform = function() {
	if (faceSvg == undefined)
		return;

	var t_objectg = faceSvg.selectAll("g." + face_class);
	t_objectg
//		.attr("d",function(d) { d.y = Math.max(d.scaled_radius, Math.min(height - d.scaled_radius, d.y)); d.x = Math.max(d.scaled_radius, Math.min(width - d.scaled_radius, d.x)); return d;})
		.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + "), scale(" + d.scale + ")";
		});

	var t_eye_pupils = faceSvg.selectAll("circle.g_pupil_object")
		.attr("cx", function(d) { 
			var t_retv = d.pupilx; 
			if (isNaN(t_retv)) {t_retv = 0;}
			return t_retv;
		})
		.attr("cy", function(d) { 
			var t_retv = d.pupily; 
			if (isNaN(t_retv)) {t_retv = 0;}
			return t_retv;
		})
    };


    exports.quit = function(_transitionDuration)	{
	if (_transitionDuration == undefined)	{
		_transitionDuration = C_QUIT_TRANSITION_DURATION;
	}

    	var t_objectg = faceSvg.selectAll("g." + face_class)
    	t_objectg
    		.attr("class", face_class + " exiting")
    		.transition()
    			.duration(_transitionDuration)
    			.ease("linear")
    			.style("fill-opacity", 0.0)
    			.remove()
  			.each("end", function() {dispatch.quitComplete();});
    }


    exports.process_mousedown = function(_clickedon) {
	var t_clickedOnElement = d3.select(this);
	dispatch.mousedown(_clickedon, t_clickedOnElement);
    };

    exports.process_touchstart = function(_clickedon) {
	var t_clickedOnElement = d3.select(this);
	dispatch.touchstart(_clickedon, t_clickedOnElement);
    };

    exports.process_mouseover = function(_item) {
	dispatch.mouseover(_item);
    };


    exports.selectById = function(p_faceId) {
	var t_face = faceSvg.select('#' + p_faceId);
	return t_face;
    };



    exports.facePulse = function(p_faceId) {
	var t_face = exports.selectById(p_faceId);
	var initial_ripple = t_face
		.append("circle")
		.attr("class", "ripplering")
		.attr("r", function(d) { return d.radius;})
		.style("stroke-width", C_RIPPLE_INITIAL_RIPPLE_WIDTH)
		.style("stroke", C_RIPPLE_INITIAL_COLOUR)
		.style("fill-opacity", "0.0"); 

	var t1 = initial_ripple
		.transition()
			.ease("linear")
			.duration(C_RIPPLE_DURATION)
			.style("stroke-opacity", 0.5)
			.style("stroke-width", function(d) { return C_RIPPLE_END_RIPPLE_WIDTH/d.scale;})
			.style("stroke", C_RIPPLE_END_COLOUR)
			.style("fill-opacity", "0.0")
			.attr("r", function(d) { return d.radius + (C_RIPPLE_EXTN/d.scale);})

	var t2 = t1
		.transition()
			.ease("linear")
			.style("stroke-opacity", 0)
			.style("stroke-width", C_RIPPLE_INITIAL_RIPPLE_WIDTH)
			.style("stroke", C_RIPPLE_INITIAL_COLOUR)
			.style("fill-opacity", "0.0")
			.attr("r", function(d) { return d.radius;})
			.remove();
    };



    d3.rebind(exports, dispatch, "on");
    return exports;
};

////////////////////////////////////////////////////////////////////




