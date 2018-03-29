# MetroViz
MetroViz is an interactive visual analysis tool that helps users explore public transportation data and evaluate how well the public transportation system is serving the public.

![Screenshot](http://i.imgur.com/PGDZESE.png)

### Usage
* Running MetroViz requires python2 or python3 with cherrypy installed and the following database file (too large to be included directly in the git repo): [Metroviz.zip](https://drive.google.com/open?id=0By7ubmCnVyC6ck1FaDVWZlJuQjA)
* Git clone the project to obtain the source code and place the Metroviz.db file in the root (MetroViz) directory.
* To start MetroViz, execute webserver6.py (runs under python2 or python3) and *either* webserver2 or webserver3 (depending on your version of python). Then, point your browser at:
`localhost:8000/app`
* To shutdown MetroViz, kill the two server processes.

### Paper
* [MetroViz: Visual Analysis of Public Transportation Data](https://arxiv.org/abs/1507.05215)
