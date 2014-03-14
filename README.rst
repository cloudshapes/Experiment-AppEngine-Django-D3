
Experiment Using Google AppEngine, Django/Python and D3
==========================================================

A simple experiment running on Google AppEngine, that allows users (with a Google account) to login, create text items (comprising a title and description), and to then see their text items visualised and animated using D3. Whilst chasing an image of the Queen.

Setting Up:
----------------

The code relies upon the Potato Djappengine (https://github.com/potatolondon/djappengine), so you need to set that up first. Let's say you install the Potato Djappengine in: 

```
/home/me/djappengine
```

The next step, is to clone this repository (i.e. the https://github.com/cloudshapes/Experiment-AppEngine-Django-D3.git repository) somewhere (other than /home/me/djappengine), and do the following:


1. Place the resulting "textdisplay" folder in the djappengine folder. So you end up with: 

```
/home/me/djappengine/textdisplay/
```

2. Copy the "master.json" file into the "djappengine" folder, i.e. to /home/me/djappengine/master.json.

3. Next up, you need to amend the app.yaml file at /home/me/djappengine/app.yaml:- you need to change the "static" handler such that it reads as follows (i.e. you replace 'core' with 'textdisplay'):


```
static_dir: textdisplay/static
```


4. You need to copy the urls.py file from the Experiment-AppEngine-Django-D3.git repository to /home/me/djappengine/urls.py.

5. Finally, you need to amend the /home/me/djappengine/settings.py file by replacing 'core' with 'textdisplay' in the INSTALLED_APPS section of settings.py.


6. At this point, you *should* be ready to launch the webserver.

From the command line type:

```
cd /home/me/djappengine
```

```
./serve.sh &
```

7. Before you run anything else, you need to run: http://localhost:8080/amn/createdefault/. Running this locally you don't need a Google Account to login, you can just use the sample email that is suggested, but you will be prompted for a general site-wide username/password, which is "amn/p00t!".

8. Once you've run "createdefault", you should then be able to use the site by requesting http://localhost:8080/. You should see two sample text items. At this point you should also be able to edit the text items at http://localhost:8080/amn/.

















