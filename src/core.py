#!/usr/bin/env python


""" TODO: module description
"""

import os
import webbrowser
import sys
import tempfile
import shutil
import json
import subprocess, shlex
from   collections import OrderedDict


def create_pydaenimViewer(collada_file, **kwargs):
    """
    """
    # SET PATHS ################################################################
    PlayerFolder   = os.path.dirname(__file__)+os.sep+"pydaenimViewer"
    ResourceFolder = PlayerFolder+os.sep+"pydaenim_resources"
    
    tempdir = tempfile.gettempdir()
    TempApplicationFolder = tempdir+os.sep+"pydaenim_application"
    TempResourcesFolder   = TempApplicationFolder+os.sep+"pydaenim_resources"

    # CREATE APPLICATION FOLDER & COPY RESOURCES ###############################
    try:
        os.makedirs(TempResourcesFolder) # create Application and Resources folders at the same time
    except:
        pass

    _check_and_copy(ResourceFolder, TempResourcesFolder) # copy resources
    collada_basename = os.path.basename(collada_file)
    shutil.copy(collada_file, TempApplicationFolder+os.sep+collada_basename) #copy collada file


    # CREATE USER DEFINED PARAMETERS ###########################################
    html_user_args = []
    html_user_args.append("<script>")
    html_user_args.append("// This script contains all the user defined values //")
    html_user_args.append("var input_collada_file = '{}';".format(collada_basename))
    if "host" in kwargs:
        html_user_args.append("var webDaenimSocket = new WebSocket('ws://{}:{}/');".format(kwargs["host"], kwargs["port"]) )
    if "window" in kwargs:
        html_user_args.append("three_player.style.width  = '{}px';".format(kwargs["window"][0]) )
        html_user_args.append("three_player.style.height = '{}px';".format(kwargs["window"][1]) )
    if "cam" in kwargs:
        html_user_args.append("camera_position_vector = {};".format( list(kwargs["cam"]) ) )
    if "coi" in kwargs:
        html_user_args.append("camera_target_vector = {};".format( list(kwargs["coi"]) ) )
    if "up" in kwargs:
        html_user_args.append("camera_up_vector = {};".format( list(kwargs["up"]) ) )
    html_user_args.append("</script>")


    # LOAD & CHANGE HTML #######################################################
    with open(PlayerFolder+os.sep+"pydaenim.html", "r") as f:
        srcHTML = f.read()
        tempHTML = srcHTML.replace("<!-- INSERT USER PARAMETERS HERE -->", "\n".join(html_user_args))

        with open(TempApplicationFolder+os.sep+"pydaenim.html", mode='w') as temFile:
            temFile.writelines(tempHTML)

    # RUN BROWSER ##############################################################
    browser = kwargs["browser"] if "browser" in kwargs else None
    cmd = _get_cmdline(browser, TempApplicationFolder+os.sep+"pydaenim.html")
    subprocess.Popen(shlex.split(cmd))




import websocket
from base64 import b64decode

from threading import Timer

def create_pydaenimViewer_with_websocket(collada_file, **kwargs): #, args
    """
    """
    ws = websocket.pydaenimWebSocket("127.0.0.1", 5000)
    
    kwargs.update({"host":ws.host, "port":ws.port})
    
    Timer(0.1, create_pydaenimViewer, (collada_file,), kwargs).start()
    
    ws.listen()
    
    basepath  =  os.getcwd() #os.path.dirname(os.path.abspath(collada_file))
    recfolder = basepath+os.sep+"pydaenim_record"
    
    
    while 1:
        msg = ws.recv_message()
        if msg == '\x03\xe9': # means that the browser has quitted
            print "close!!!"
            break

        else:
            json_msg = json.loads(msg)
            print "received:", json_msg[0]

            if json_msg[0] == "save_img":
                img_data = json_msg[1].partition(",")[2]
                with open(basepath+os.sep+"snapshot.png", "wb") as f:
                    try:
                        f.write(b64decode(img_data))
                    except TypeError:
                        print msg
                        print "problem while decoding image url, raised TypeError."
                        #TODO: warn pydaenimViewer that the image has not been saved...

            elif json_msg[0] == "start_recording":
                try:
                    os.mkdir(recfolder)
                except:
                    pass

            if json_msg[0] == "rec_img":
                idx = json_msg[1]
                img_data = json_msg[2].partition(",")[2]
                with open(recfolder+os.sep+"{:06d}.png".format(int(idx)), "wb") as f:
                    try:
                        f.write(b64decode(img_data))
                    except TypeError:
                        print msg
                        print "problem while decoding image url of index "+str(i)+", raised TypeError."
                        #TODO: warn pydaenimViewer that the image has not been saved...



def _get_cmdline(browser, htmlfile):
    """
    """
    iscmd         = webbrowser._iscommand
    available_cmd = OrderedDict()
    htmlfile = '"'+htmlfile+'"'


    if sys.platform.startswith("linux"):
        if iscmd("firefox"):
            available_cmd["firefox"] = "firefox "+htmlfile
        if iscmd("google-chrome"):
            available_cmd["chrome"]        = "google-chrome --allow-file-access-from-files "+htmlfile
            available_cmd["google-chrome"] = "google-chrome --allow-file-access-from-files "+htmlfile
        if iscmd("chromium-browser"):
            available_cmd["chromium"]         = "chromium-browser --allow-file-access-from-files "+htmlfile
            available_cmd["chromium-browser"] = "chromium-browser --allow-file-access-from-files "+htmlfile

    elif sys.platform.startswith("win32"):
        htmlfile = "file:///"+htmlfile.replace("\\", "/")
        for prefix in ["C:/Program Files (x86)/", "C:/Program Files/"]:
            if iscmd(prefix+"Mozilla Firefox/firefox.exe"):
                available_cmd["firefox"] = prefix+"Mozilla Firefox/firefox.exe "+htmlfile
            if iscmd(prefix+"Google/Chrome/Application/chrome.exe"):
                available_cmd["chrome"]        = prefix+"Google/Chrome/Application/chrome.exe --allow-file-access-from-files "+htmlfile
                available_cmd["google-chrome"] = prefix+"Google/Chrome/Application/chrome.exe --allow-file-access-from-files "+htmlfile
            if iscmd(prefix+"Safari/Safari.exe"):
                available_cmd["safari"] = prefix+"Safari/Safari.exe "+htmlfile #websocket seems to block with safari

    elif sys.platform.startswith("darwin"):
        available_cmd["safari"] = "open -a Safari "+htmlfile
        if os.path.isdir("/Applications/Firefox.app"):
            available_cmd["firefox"] = "open -a Firefox "+htmlfile
        if os.path.isdir("/Applications/Google Chrome.app"):
            available_cmd["chrome"]        = "open -a \"Google Chrome\" "+htmlfile+" --args --allow-file-access-from-files"
            available_cmd["google-chrome"] = "open -a \"Google Chrome\" "+htmlfile+" --args --allow-file-access-from-files"


    for c in available_cmd:
        print c
    if browser is not None and browser.lower() in available_cmd:
        return available_cmd[browser.lower()]
    try:
        return next(cmd for cmd in available_cmd.values() if cmd)
    except:
        print "cannot find web browser. use user command line or default."
        return browser



def _check_and_copy(src_folder, dst_folder):
    src_size = 0
    dst_size = 0
    for w in os.walk(src_folder):
        src_size += sum( os.path.getsize(w[0] +os.sep+ f) for f in w[2] )
    for w in os.walk(dst_folder):
        dst_size += sum( os.path.getsize(w[0] +os.sep+ f) for f in w[2] )
    
    if src_size != dst_size:
        shutil.rmtree(dst_folder)
        shutil.copytree(src_folder, dst_folder)



def get_arguments(prog_name=None):
    if prog_name is None:
        prog_name = 'daenim.py'
    print """
{0} [--options] colladaFile.dae
 --or --
{0} colladaFile.dae [--options]

options are:
* --browser wb  : use browser "wb" to display collada file.
* --window  w h : set display window to width:w and height:h.
""".format(prog_name)
