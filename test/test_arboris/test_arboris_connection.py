#!/usr/bin/env python

"""
This thest_arboris_coonection is a test to create an Arboris observer to
communicate with a html page. This page will be update to show the robot
moving in a three.js instance...
"""


from arboris.core import World
from arboris.robots import simplearm, icub

##### Create world
w = World()
#simplearm.add_simplearm(w, with_shapes=True)

icub.add(w, create_shapes=False)
w._up[:] = [0,0,1]


##### Init World
joints = w.getjoints()

#    for n in ["Shoulder", "Elbow", "Wrist"]:
#        joints[n].gpos[0] = .5


##### Add ctrl
from arboris.controllers import WeightController

w.register(WeightController())


##### Add observers
from arboris.observers import PerfMonitor, Hdf5Logger

from arboris.visu.dae_writer import write_collada_scene, write_collada_animation, add_shapes_to_dae
from arboris.visu            import pydaenimCom
flat = False
write_collada_scene(w, "./scene.dae", flat=flat)
add_shapes_to_dae("./scene.dae", "./icub_simple.dae")

obs = []

pobs = PerfMonitor(True)
dobs = pydaenimCom("./scene.dae", flat=flat)
h5obs = Hdf5Logger("sim.h5", mode="w", flat=flat)
obs.append(pobs)
obs.append(dobs)
obs.append(h5obs)



##### Simulate
from arboris.core import simulate
from numpy import arange

timeline = arange(0, 1.03, 0.005)
simulate(w, timeline, obs)


##### Results

print pobs.get_summary()

write_collada_animation("anim.dae", "scene.dae", "sim.h5")



