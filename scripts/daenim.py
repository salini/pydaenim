#!/usr/bin/env python

import pydaenim
import sys
import os

if len(sys.argv)==1:
    pydaenim.get_arguments( os.path.basename(sys.argv[0]) )
    exit()

colladaFile = sys.argv[1] if sys.argv[1][0:2] != "--" else sys.argv[-1]

kwargs = {}

for i, val in enumerate(sys.argv):
    if val == "--browser":
        kwargs["browser"] = sys.argv[i+1]
    if val == "--window":
        kwargs["window"] = [sys.argv[i+1], sys.argv[i+2]]

pydaenim.create_pydaenimViewer_with_websocket(colladaFile, **kwargs)
