
# -*- coding: utf-8 -*-
from __future__ import unicode_literals

# Django
from django.views.generic import TemplateView
from django import forms
from django.shortcuts import render_to_response, redirect
from django.template import RequestContext
from django.utils.html import strip_tags
from django.views.generic.list import ListView
from django.utils import timezone
from django.http import Http404
from django.http import HttpResponse
from django.http import HttpResponseServerError


# Google
from google.appengine.api import users

# Custom
from textdisplay.models import TextObject
from textdisplay import textdisplay_settings

# Python:
import string
import random
from datetime import datetime
import re
import json
import os
from textwrap import wrap


import pdb



# View class/view generating list of text objects:
class AmnList(TemplateView):
    template_name = "amn.html"
    def get_context_data(self, **kwargs):
        context = super(AmnList, self).get_context_data(**kwargs)
	# Wee bit of a hack here I suppose. Would like to use the generic ListView
	# but not too sure it works with AppEngine and NDB models. Boo.
	qry = TextObject.query(TextObject.toEdit == True).order(-TextObject.createDateTime)
	tobjectslist = qry.fetch()
	context['tobjectslist'] = tobjectslist
        return context
amn_list = AmnList.as_view()


# Form object:
class TextObjectForm(forms.Form):
	title = forms.CharField(max_length=60, required=True, help_text='60 characters max')
	content = forms.CharField(widget=forms.Textarea, required=False)


# So this is perhaps a bit odd.
# The intention here is to force the local version of code
# to fully refresh the page listing all text objects. Doesn't appear to work sadly.
# Works on live, so perhaps locally the saving takes longer. 
def force_redirect_to_amn():
	# Generate random number.
	# Note: the following is entirely lifted from: 
	# http://stackoverflow.com/questions/18319101/whats-the-best-way-to-generate-random-strings-of-a-specific-length-in-python
	outstr = (''.join(random.choice(string.ascii_uppercase) for i in range(12)))
	return redirect("/amn/?r=%s" % outstr)


def get_currentauthor_details():
	author_nickname_str = "Anonymous"
	author_em_str = "AnonymousEm"
	current_user = users.get_current_user()
	if current_user != None:

		# Have a valid user, so obfuscate name in case nickname is in fact an email address.
		author_nickname_str = current_user.nickname()

		# Quick'n'dirty. Just remove .com and .co.uk. I know, many other domains out there.
		author_nickname_str = author_nickname_str.replace(".com", "")
		author_nickname_str = author_nickname_str.replace(".co.uk", "")

		author_nickname_strlen = len(author_nickname_str)
		# Want to replace 30% with 'xxx's.
		replace_len = int(author_nickname_strlen * 0.3)
		replace_str = 'x' * replace_len
		author_nickname_list = list(author_nickname_str)
		author_nickname_list[replace_len:(replace_len*2)] = replace_str
		author_nickname_str = ''.join(author_nickname_list)

		author_em_str = current_user.email()
	return author_nickname_str, author_em_str

def createAndPutTextObject(title,content,nickname,email,editFlag):
	t = TextObject()
	t.title=strip_tags(title)
	t.content=strip_tags(content)
	t.createDateTime = datetime.now()
	t.ukFormattedCreateDateTime = t.createDateTime.strftime("%H:%M %d/%m/%Y")
	t.author_nickname = nickname
	t.author_em = email
	t.toEdit = editFlag
	t.put()
	t.jsonBlob = createJson(t)
	t.put()

# View for creating/editing text object:
def edit_textobject(request, idval=None):
	idvalint = None
	if idval != None:
		idvalint=int(idval)

	# If 'GET', then create either empty form, or form for editing: 
	if request.method == 'GET':
		textObjectForm = None
		createDateTimeStr = None
		to = None
		
		author_nickname, author_em = get_currentauthor_details()

		# If blank idval, then assume that we are creating: 
		if idval == None:
			 textObjectForm = TextObjectForm()

		# Otherwise, attempting to edit:
		else:
			# Try to retrieve matching textObject.
			to = TextObject.get_by_id(idvalint)

			# If found one, populate the form:
			if to != None:
				toFormDict = {'title': to.title, 'content': to.content, 'createDateTime': to.ukFormattedCreateDateTime}
				textObjectForm = TextObjectForm(toFormDict)
		if textObjectForm != None:
			return render_to_response('amn_edit.html', {'textObjectForm':textObjectForm, 'formDestn':idval, 'to':to, 'author_nickname': author_nickname}, context_instance=RequestContext(request))

		else: # Haven't found an existing TextObject, so just bounce back to main admin listing page.
			# Redirect to '/'
			return force_redirect_to_amn()


	else:	# POST: ...
		# So, either insert, or retrieve and update. 
		textObjectForm = TextObjectForm(request.POST)
		if textObjectForm.is_valid():
			# If we have a valid form, process, update/insert into the datastore, 
			# and redirect to the main list:
			author_nickname, author_em = get_currentauthor_details()

			# Are we creating or editing?
			if idval == None:
				# Creating: so ... create.
				createAndPutTextObject(textObjectForm.cleaned_data['title'],textObjectForm.cleaned_data['content'],author_nickname,author_em,True)
				return force_redirect_to_amn()

			else:
				# Editing. So retrieve ... and edit.
				to = TextObject.get_by_id(idvalint)

				# If found one, update it:
				if to != None:
					to.title=strip_tags(textObjectForm.cleaned_data['title'])
					to.content=strip_tags(textObjectForm.cleaned_data['content'])
					to.author_nickname = author_nickname
					to.jsonBlob = createJson(to)
					to.put()
					return force_redirect_to_amn()

				# If fail to retrieve, should flag up error. Shouldn't happen.
				# Possibly something dodgy going on, so flag it as a 404 for now.
				error_msg = "edit_textobject failed to get: %i" % idvalint
			        raise Http404(error_msg)
		else:
			# Not a valid form. Redirect back to admin edit page: 
			return render_to_response('amn_edit.html', {'textObjectForm':textObjectForm}, context_instance=RequestContext(request))

# View for deleting text object:
def delete_textobject(request, idval=None):
	idvalint = None
	if idval != None:
		idvalint=int(idval)

	# If 'GET', then create either empty form, or form for editing: 
	if request.method == 'GET':
		if idval != None:
			# Try to retrieve matching textObject.
			to = TextObject.get_by_id(idvalint)
			# If found one, delete
			if to != None:
				to.key.delete()
			return force_redirect_to_amn()
		return force_redirect_to_amn()



def word_wrap(source_str):
	width = textdisplay_settings.TD_COLUMN_WIDTH

	t_output_array = []

	# First split on newlines:
	lines_array = source_str.splitlines()

	# Then split on width:
	for line in lines_array:
		split_lines = wrap(line, width)
		for split_line in split_lines:
			t_output_array.append(split_line)

	return t_output_array



def createJson(to):
	toDict = {}

	toDict["id_str"] = str(to.key.id())
	toDict["status"] = "new"
	toDict["author_nickname"] = to.author_nickname
	toDict["ukFormattedCreateDateTime"] = to.ukFormattedCreateDateTime
	toDict["title"] = to.title

	# Iterate through and build up the text_lines item from the content ... remembering to record the line number(s):
	content_str = to.content
	line_list = word_wrap(content_str)

	line_counter = 1
	textLinesList = []
	for line_item in line_list:
		line_item_obj = {}
		line_item_obj['line_number'] = str(line_counter)
		line_item_obj['text'] = line_item
		textLinesList.append(line_item_obj)
		line_counter += 1

	toDict["text_lines"] = textLinesList
	return toDict


# View to pull list of all text objects: 
def pull_data(request):
	# Most of the time, we hope that there's people editing.
	# So, we only pull editable objects. Not the default that tells people to edit.
	qry = TextObject.query(TextObject.toEdit == True).order(-TextObject.createDateTime)
	tobjectslist = qry.fetch()

	# But sometimes there aren't. So we display the default object:
	if len(tobjectslist) == 0:
		qry = TextObject.query(TextObject.toEdit == False).order(-TextObject.createDateTime)
		tobjectslist = qry.fetch()



	# Build list of jsonBlob's ...
	jsonBlobList = []
	for item in tobjectslist:
		jsonBlobList.append(item.jsonBlob)


	# Start to compile full JSON file ...: 
	path_to_master_json = "%s/%s" % (os.getcwd(), textdisplay_settings.TD_MASTER_JSON)

	# Try to open the master file. 
	# This *clearly* would be better if reading from NDB.
	try: 
		f = open(path_to_master_json, 'r')
	except IOError,e:
		# Oh-oh. Failed to open file. Barf. 
		errorMessage = "Failed to open: %s" % path_to_master_json
		return HttpResponseServerError(errorMessage)
	master_json = f.read()
	f.close()

	# Convert the master json template into a Python structure
	master = json.loads(master_json)

	# Load up the json Blobs:
	master['tweets'] = jsonBlobList

	# Output to json string:
	outJson = json.dumps(master)

	# Und, return to the browser: 
	return HttpResponse(outJson, content_type="application/json")


# View to create default textObject, just to make sure there's always one:
def create_default(request):
	createAndPutTextObject("Add your own text item", "Click 'Edit' on the nav above", "Roland Dunn", "roland.dunn@gmail.com", False)
	complex_text = "Sample English text\r\n\
Sample Greek text: ἐσήγαγον διδασϰάλια\r\n\
Sample Russian text:  ыччгвааааддд\r\n"

	createAndPutTextObject("Example multi-lingual content", complex_text, "Roland Dunn", "roland.dunn@gmail.com", False)

	return force_redirect_to_amn()

# def createAndPutTextObject(title,content,nickname,email,editFlag):












	










