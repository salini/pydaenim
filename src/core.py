#!/usr/bin/env python


""" TODO: module description
"""

import os
import webbrowser
import tempfile
import shutil
import json


def create_pydaenimViewer(colladaFile, browser=None, **kwargs):
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
    shutil.copy(colladaFile, TempApplicationFolder+os.sep+colladaFile) #copy collada file


    # CREATE USER DEFINED PARAMETERS ###########################################
    html_user_args = []
    html_user_args.append("<script>")
    html_user_args.append("// This script contains all the user defined values //")
    html_user_args.append("var input_collada_file = '{}';".format(colladaFile))
    if "host" in kwargs:
        html_user_args.append("var webDaenimSocket = new WebSocket('ws://{}:{}/');".format(kwargs["host"], kwargs["port"]) )
    if "window" in kwargs:
        html_user_args.append("three_player.style.width  = '{}px';".format(kwargs["window"][0]) )
        html_user_args.append("three_player.style.height = '{}px';".format(kwargs["window"][1]) )
    html_user_args.append("</script>")


    # LOAD & CHANGE HTML #######################################################
    with open(PlayerFolder+os.sep+"pydaenim.html", "r") as f:
        srcHTML = f.read()
        tempHTML = srcHTML.replace("<!-- INSERT USER PARAMETERS HERE -->", "\n".join(html_user_args))

        with open(TempApplicationFolder+os.sep+"pydaenim.html", mode='w') as temFile:
            temFile.writelines(tempHTML)

    # RUN BROWSER ##############################################################
    wb = webbrowser.get(_get_cmdline(browser))
    wb.open(TempApplicationFolder+os.sep+"pydaenim.html", autoraise=True)





import websocket
from base64 import b64decode

from threading import Timer

def create_pydaenimViewer_with_websocket(colladaFile, browser=None, **kwargs): #, args
    """
    """
    ws = websocket.pydaenimWebSocket("localhost", 5000)
    
    kwargs.update({"host":ws.host, "port":ws.port})
    
    Timer(0.1, create_pydaenimViewer, (colladaFile, browser), kwargs).start()
    
    ws.listen()
    
    basepath = os.path.dirname(os.path.abspath(colladaFile))
    recfolder = basepath+os.sep+"wsdaenim_record"
    
    
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
                        #TODO: warn wsdaenimPlayer that the image has not been saved...

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
                        #TODO: warn wsdaenimPlayer that the image has not been saved...




def _get_cmdline(browser):
    """
    """
    _iscmd = webbrowser._iscommand
    pf    = "C:/Program Files/"
    pfx86 = "C:/Program Files (x86)/"
    def _get_cmd_path(pp,wp):
        return ( (_iscmd(pp) and pp) or (_iscmd(pf+wp) and "'"+pf+wp+"'") or (_iscmd(pfx86+wp) and "'"+pfx86+wp+"'") )

    available_browser = []
    if browser in ["firefox", None]:
        available_browser.append(_get_cmd_path("firefox", "Mozilla Firefox/firefox.exe") )
        
    if browser in ["chrome", "google-chrome", None]:
        app_path = _get_cmd_path("google-chrome", "Google/Chrome/Application/chrome.exe")
        available_browser.append( app_path and app_path+" --allow-file-access-from-files")
    
    if browser in ["chromium", "chromium-browser", None]:
        app_path = _get_cmd_path("chromium-browser", "") #TODO: win path
        available_browser.append( app_path and app_path+" --allow-file-access-from-files")
        
    if browser in ["safari", None]:
        available_browser.append(_get_cmd_path("safari", "Safari/Safari.exe") )
        
    if browser in ["opera", None]:
        available_browser.append(_get_cmd_path("opera", "Opera/opera.exe") )
    
    try:
        return next(wb+" %s" for wb in available_browser if wb)
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



def get_arguments():
    print """
pydaenim_player.py [--options] colladaFile.dae
 --or --
pydaenim_player.py colladaFile.dae [--options]

options are:
* --browser wb  : use browser "wb" to display collada file.
* --window  w h : set display window to width:w and height:h.
"""
