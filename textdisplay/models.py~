from google.appengine.ext import ndb

class TextObject(ndb.Model):
	author_nickname = ndb.StringProperty(required=True)
	author_em = ndb.StringProperty(required=True)
	title = ndb.StringProperty(required=True)
	content = ndb.TextProperty(required=False)
	createDateTime = ndb.DateTimeProperty()
	ukFormattedCreateDateTime =  ndb.StringProperty(required=True)
	jsonBlob = ndb.JsonProperty(required=False)
	toEdit = ndb.BooleanProperty(required=True, default=True)


