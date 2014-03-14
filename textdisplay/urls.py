from django.conf.urls import *
from django.conf import settings
from django.views.generic import TemplateView

from textdisplay import views
from textdisplay.decorators import basic_auth

urlpatterns = patterns('',
    url(r'^$', basic_auth(TemplateView.as_view(template_name='home.html'))),
    url(r'^pull/$', views.pull_data, name='pull_data'),
    url(r'^readme/$', basic_auth(TemplateView.as_view(template_name='readme.html'))),

    url(r'^amn/$', basic_auth(views.amn_list), name='amn-list'),
    url(r'^amn/edit/$', basic_auth(views.edit_textobject), name='edit_textobject'),
    url(r'^amn/edit/(?P<idval>[\d]+)/$', basic_auth(views.edit_textobject), name='edit_textobject'),
    url(r'^amn/delete/(?P<idval>[\d]+)/$', basic_auth(views.delete_textobject), name='delete_textobject'),
    url(r'^amn/createdefault/$', basic_auth(views.create_default), name='create_default'),
)



if settings.DEBUG:
    urlpatterns += patterns(
        '',
        url(r'^500/$', 'django.views.generic.simple.direct_to_template', {'template': '500.html'}),
        url(r'^404/$', 'django.views.generic.simple.direct_to_template', {'template': '404.html'}),
    )



