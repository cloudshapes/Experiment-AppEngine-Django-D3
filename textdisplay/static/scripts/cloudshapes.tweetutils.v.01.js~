


/////////////////////////////////////////////////////////////////////////

// DEFAULTS: 
var
	C_FACE_DEFAULT_CHARGE_RANGE = 20,
	C_TWEET_DEFAULT_CHARGE = 0,
	C_FACE_DEFAULT_SCALE = 1,
	C_FACE_DEFAULT_CHARGE = 30; 

var 
	C_GRAVITY_VALUE = 0.0001;

var	
	C_URL_CTO_N_ITERATIONS = 20,
	C_URL_CTO_TIME_GAP = 1000,

	C_INPUT_URL_CTO_SFSIZE = 20,
	C_INPUT_URL_CTO_DURATION = 1000,
	C_INPUT_URL_CTO_DIRECTION = "in",
	C_INPUT_URL_CTO_COLOUR = "#ffaa88";

// SOUND ICON IMAGES:
var
	C_SOUND_ON = "/static/images/sound.png",
	C_SOUND_OFF = "/static/images/soundoff.png";

var C_DEFAULT_SENTIMENT = "#3f3f3e";

/////////////////////////////////////////////////////////////////////////



// TWEET STATUSES:
var 
	C_TWEET_NEW = "new",
	C_TWEET_PRELIVE = "prelive", 	// Prelive: Ready to be visually created.
	C_TWEET_PRELIVE2 = "prelive2", 	// Visually created, now ready to be added to the forced graph.
	C_TWEET_LIVE = "live", 		// Live: visually created, and now in the forced graph.
	C_TWEET_DIEING = "dieing",	// Visually being deleted, so still visually present, but no longer in the forced graph.
	C_TWEET_OLD = "old";		// Dead, no longer visually created, and no longer part of the forced graph.

// TWEET PROPERTIES:
var
	C_TWEET_FADEUPCOMPLETE_TIME = "fadeUpCompleteTime",
	C_TWEET_BORN_TIME = "bornTime",
	C_TWEET_OPACITY = "opacity";


// FACE STATUSES:
var
	C_FACE_NEW = "new",
	C_FACE_PRELIVE = "prelive",
	C_FACE_PRELIVE2 = "prelive2",
	C_FACE_LIVE = "live";

// FACE PROPERTIES:
var
	C_FACE_TYPE = "face",
	C_FACE_CLASS_PREFIX = "g_csface_",
	C_FACE_ID_PREFIX = "csface_";



/////////////////////////////////////////////////////////////////////////


// Google Analytics Event tracking settings:
var 
	C_GA_CATEGORY = "tweets_featuring",
	C_GA_ACTION_FACE_CLICK = "face_click",
	C_GA_ACTION_TWEET_CLICK = "tweet_click",

	C_GA_ACTION_INPUTBOX_ENTER_PRESSED = "inputbox_enter_pressed",
	C_GA_ACTION_INPUTBOX_BUTTON_PRESSED = "inputbox_button_pressed",

	C_GA_ACTION_HELP_LAUNCHED = "help_launched",
	C_GA_ACTION_NO_INPUT_PROMPT_LAUNCHED = "no_input_prompt_launched",

	C_GA_ACTION_WEBINTENT_LAUNCHED_DEFAULT = "tweetmessage_webintent_launched_default",
	C_GA_ACTION_WEBINTENT_LAUNCHED_CUSTOM = "tweetmessage_webintent_launched_custom",
	C_GA_ACTION_WEBINTENT_SENT = "tweetmessage_webintent_sent",

	C_GA_ACTION_URL_REQUESTED_WEBINTENT = "url_requested_via_webintent",
	C_GA_ACTION_URL_REQUESTED_NOTWEBINTENT = "url_requested_not_webintent";





function reportEventToGoogleAnalytics(_category, _action, _label_, _value, _bounceFlag)	{
	var t_ret = _gaq.push(['_trackEvent', _category, _action, _label_, _value, _bounceFlag]);
}



// TWEET UTILITY FUNCTIONS:
function countNumTweetTypes(t_array, t_tweet_type)	{
	var t_num_tweets = 0;
	for (var ti = 0; ti < t_array.length; ti++)	{
		if (t_array[ti]['status'] == t_tweet_type)	{
			t_num_tweets++;
		}
	}

	return t_num_tweets;
}


function deleteFromArray(t_array, t_property, t_value)	{
	for (var i = t_array.length-1; i >= 0; i--) {
	    if (t_array[i][t_property] == t_value) {
		t_array.splice(i, 1);
	    }
	}
	return t_array;
}

// http://stackoverflow.com/questions/822452/strip-html-from-text-javascript
function stripHTML(_string) {
    return _string.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>?/gi, '');
}









