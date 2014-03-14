from django.shortcuts import redirect
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.template import RequestContext


import base64
import pdb


from textdisplay import textdisplay_settings



# Decorator "inspired by": http://passingcuriosity.com/2009/writing-view-decorators-for-django/
# Authentiction "inspired by": https://djangosnippets.org/snippets/243/


def need_to_login_response():
	realm = textdisplay_settings.TD_BASIC_PROMPT
	response = HttpResponse()
	response.status_code = 401
	response['WWW-Authenticate'] = 'Basic realm="%s"' % realm
	return response

def basic_auth(function=None):
	""" Check for basic username/password authentication on a URL:
	"""
	def _dec(view_func):
	        def _view(request, *args, **kwargs):
			if 'HTTP_AUTHORIZATION' in request.META:

				auth_header = request.META['HTTP_AUTHORIZATION']
				if auth_header == None:
					return need_to_login_response()
				else:
					auth_parts = auth_header.split(' ')
					user_pass_parts = base64.b64decode(auth_parts[1]).split(':')
					user_arg = user_pass_parts[0]
					pass_arg = user_pass_parts[1]

					if user_arg != textdisplay_settings.TD_BASIC_US or pass_arg != textdisplay_settings.TD_BASIC_PWD:
						realm = textdisplay_settings.TD_BASIC_PROMPT
						response = render_to_response("401.html", context_instance=RequestContext(request))
						response.status_code = 401
						response['WWW-Authenticate'] = 'Basic realm="%s"' % realm
						return response

					else:
						return view_func(request, *args, **kwargs)

			else:
				return need_to_login_response()

	        _view.__name__ = view_func.__name__
        	_view.__dict__ = view_func.__dict__
        	_view.__doc__ = view_func.__doc__

        	return _view

	if function is None:
		return _dec
	else:
		return _dec(function)





