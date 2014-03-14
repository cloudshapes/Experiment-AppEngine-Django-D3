
/////////////////////////////////////////////////////////////////////////

// UTILITY FUNCTIONS:


function string_endswith(_str, suffix)	{
	return _str.indexOf(suffix, this.length - suffix.length) !== -1;
}

function remove_nonalphanumeric(t_str)	{
	return t_str.replace(/[^a-zA-Z0-9]/g, '');
}




function cs_copyBBox(_orig)	{
	var t_new_bbox = {};
	t_new_bbox.x = _orig.x;
	t_new_bbox.y = _orig.y;
	t_new_bbox.width = _orig.width;
	t_new_bbox.height = _orig.height;

	return t_new_bbox;
}


function timeSinceEpoch()	{
	var t_t = new Date().getTime();
	return t_t;
}



// Time-since: 
function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}



