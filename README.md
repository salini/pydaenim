wsdaenim
========

A daenim viewer on any web browser, based on three.js.


install
-------

Ubuntu:
_______

Download, extract, and open a terminal; 3 possibilities:

* sudo python setup.py install
    - install for all with root privilege

* python setup.py install --user
    - install only for current user ( in $HOME/.local/)

* python setup.py develop
    - create symbolic links for current user ( in $HOME/.local/), so any change in this
      repository will be taken into account when using this lib

NOTE: when using the last two methods, the script "daenim.py" located in
"$HOME/.local/bin" may not be found. Add this location to your path; open file
"$HOME/.bashrc" and add at the end of the file:

* PATH=$PATH:$HOME/.local/bin

Windows:
________

If python is installed, download, extract.
Open a console in the extrated directory (shift + right click on the folder, "Open command window here"):

* setyp.py install

The script "daenim.py" will be installed in "C:\PythonXX\Scripts\"


Usage
-----

To use this package as a program, open a console/terminal and run:

* (daenim.py --or-- C:\PythonXX\Scripts\daenim.py) colladaFile.dae [--args]


To use this package on python script:
"""
import pydaenim
pydaenim
pydaenim.create_pydaenimViewer(colladaFile, browser=None, **kwargs)
"""


purpose
-------

The purpose of pydaenim is to give a kind of graphical user interface
for robotic simulator, in my case arboris or xde.

I expect this program to handle the 4 following cases:

* To read collada file, just a scene without animation,
* To read collada file with animation, or collada scene coupled with animation data,
* To update a collada scene through some websocket; the other side of the socket could be a simulator for instance,
* To update some initial value in a simulator by interacting with the collada scene; I imagine updates through websockets.

A last case, which is not a priority, or dedicated to another program, could be:

* To plot/display (physical) results in a fancy and interactive way.


means
-----

The main point of this program is to read collada file. The main issue was to get
a cross-platform library to render collada scene. To do so, the
Three.js library (http://mrdoob.github.io/three.js/ & https://github.com/mrdoob/three.js/)
seems to be a very good solution, because:

* it is based on webgl, a technology supported by most of recent web browsers, to efficiently display 3D scene using the client graphic card,
* if webgl is no supported, Three.js give access to a canvas renderer, which can at least display 3D scene, but with poor performances,
* it is written in javascript, and it does not require any copmilation,
* it can load collada files,
* it is very easy to understand ans to use.

The second point is the possible communication between a program, for instance a simulator, and the
graphical scene to update data on one side or the other. A solution can be provided with
Websockets.
I can help to deport or at least to seperate the simulation and the rendering processes.

Finally, The graphical user interface in the webpage, to configure the scene or to control
the animation is based on jQuery ui. Although this last libray is not mandatory it
simplifies events management and provides slider bars, a tool that are not always
well display in all web browsers (in particular mozilla-firefox).

To sum up, this program should depend on the following libraries:

* Three.js
* jQuery UI
* the use of WebSockets


How it works
------------

When the pydaenimViewer is created, a temporary html is generated and it is copied with all the
assiociated css and javascript files in the temporaru folder of your OS. However, when one wants
to read a collada file with this temporary html, this can raise an error because we try to read
information on the client, which can be a security issue.

One way is to do a local copy of the collada file next to the temporary html file.
Firefox allows to read files in the same directory, but other browser don't.
Furthermore, it may be problematic if the main collada file is related to other
collada that have not been copied.

* So firefox & safari seem to do the job.

* with chrome, it needs the argument :"--allow-file-access-from-files", but don't worry,
  when you select "chrome" as browser, pydaenim will add this argument for you.

* with opera you have to allows the XmlHTTPRequest:
    - go to "opera:config"
    - go to "User Prefs"
    - check "allow "Allow File XMLHttpRequest"

    Warning: for now three.js seems not to work on opera. I hope it will in the future...



