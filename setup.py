from distutils.core import setup, Command

import os, sys, string, shutil, errno
from site import USER_BASE

package_name = 'pydaenim'

def force_symlink(file1, file2):
	try:
		os.symlink(file1, file2)
	except OSError, e:
		if e.errno == errno.EEXIST:
			shutil.rmtree(file2)
			os.symlink(file1, file2)

class develop(Command):
	description = "Create symbolic link instead of installing files"
	user_options = [
			('prefix=', None, "installation prefix"),
			('uninstall', None, "uninstall development files")
			]

	def initialize_options(self):
		self.prefix = None
		self.uninstall = 0

	def finalize_options(self):
		self.py_version = (string.split(sys.version))[0]
		if self.prefix is None:
		    self.prefix = USER_BASE
		self.prefix = os.path.expanduser(self.prefix)

	def run(self):
		out_dir     = os.path.join(self.prefix, "lib", "python"+self.py_version[0:3], "site-packages")
		out_dir_bin = os.path.join(self.prefix, "bin")
		if not os.path.isdir(out_dir):
			os.makedirs(out_dir)
		if not os.path.isdir(out_dir_bin):
			os.makedirs(out_dir_bin)

		out_dir     = os.path.join(out_dir, package_name)
		out_dir_bin = os.path.join(out_dir_bin, "daenim.py")
		src_dir     = os.path.join(os.getcwd(), "src" )
		script_file = os.path.join(os.getcwd(), "scripts", "daenim.py")
		if self.uninstall == 1:
			if os.path.islink(out_dir):
				print "Removing symlink "+out_dir
				os.remove(out_dir)
				print "Removing symlink "+script_file
				os.remove(script_file)
			else:
				print "Not in dev mode, nothing to do"
		else:
			if os.path.islink(out_dir):
				print "Already in dev mode"
			else:
				print "Creating symlink "+src_dir+" -> "+out_dir
				force_symlink(src_dir, out_dir)
				print "Creating symlink "+script_file+" -> "+out_dir_bin
				force_symlink(script_file, out_dir_bin)


setup(name='pydaenim',
	  version='0.1',
	  description='daenim player in web browser',
	  author='Joseph Salini',
	  author_email='josephsalini@gmail.com',
	  package_dir={'pydaenim':'src'},
	  packages=[package_name],
	  scripts=['scripts/daenim.py'],
	  package_data={'pydaenim': ['pydaenimViewer/*.html',
	                             'pydaenimViewer/pydaenim_resources/css/smoothness/*.css',
	                             'pydaenimViewer/pydaenim_resources/css/smoothness/images/*',
	                             'pydaenimViewer/pydaenim_resources/*.js',
	                             'pydaenimViewer/pydaenim_resources/jquery/*.js',
	                             'pydaenimViewer/pydaenim_resources/three/*.js',
	                             'pydaenimViewer/pydaenim_resources/three/extra/*.js',
	                             'pydaenimViewer/pydaenim_resources/three/extra/*/*.js',
	                             ]},
	  cmdclass={'develop': develop}
	 )
