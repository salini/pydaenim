#!/usr/bin/env python

import pydaenim
import sys

if len(sys.argv)==1:
    pydaenim.get_arguments()
    exit()

colladaFile = sys.argv[1] if sys.argv[1][0:2] != "--" else sys.argv[-1]
browser = None

kwargs = {}

for i, val in enumerate(sys.argv):
    if val == "--browser":
        browser = sys.argv[i+1]
    if val == "--window":
        kwargs["window"] = [sys.argv[i+1], sys.argv[i+2]]

pydaenim.create_pydaenimViewer_with_websocket(colladaFile, browser, **kwargs)
