import os
import cherrypy
import sqlite3
import json

DB = 'Metroviz.db'

class MetroViz(object):
    @cherrypy.expose
    def index(self):
        return "Hello World!"
    
    @cherrypy.expose
    def getRoutes(self, pretty=False):
        conn = sqlite3.connect(DB)
        c = conn.cursor()
        c.execute('select name,displayName,ROWID from routes')
        d = []
        row = c.fetchone()
        while row is not None:
            d.append({'id':row[2],'name':row[0],'display':row[1]})
            row = c.fetchone()
            
        s = json.dumps({'routes':d}, sort_keys=True, indent=4, separators=(',', ': '))
        if pretty:
            s = "<pre>"+s+"</pre>"
        
        c.close()
        conn.close()
        return s
    
    @cherrypy.expose
    def getTrips(self,route=None,pretty=False):
        conn = sqlite3.connect(DB)
        c = conn.cursor()
        if route is None:
            c.execute('select t.trip,t.route,t.ROWID,r.name from route_trips t left join routes r on r.ROWID=t.route')
        else:
            c.execute('select t.trip,t.route,t.ROWID,r.name from route_trips t left join routes r on r.ROWID=t.route where route=?',(route,))
        d = {}
        row = c.fetchone()
        while row is not None:
            (trip,routeid,tripid,routename) = row
            if routename not in d:
                d[routename] = []
            d[routename].append({'id':tripid,'trip':trip,'route':routeid})
                
            row = c.fetchone()
            
        s = json.dumps({'trips':d}, sort_keys=True, indent=4, separators=(',', ': '))
        if pretty:
            s = "<pre>"+s+"</pre>"
        
        c.close()
        conn.close()
        return s
    
    @cherrypy.expose
    def getStops(self,route=None,pretty=False):
        conn = sqlite3.connect(DB)
        c = conn.cursor()
        print "|"+route+"|"
        if route is None:
            c.execute('select t.stop,t.route,t.id,r.name,s.name from route_stops t left join routes r on r.ROWID=t.route left join stops s on s.ROWID=t.stop order by 2,3')
        else:
            c.execute('select t.stop,t.route,t.id,r.name,s.name from route_stops t left join routes r on r.ROWID=t.route left join stops s on s.ROWID=t.stop where route=? order by 2,3',(route,))
        d = {}
        row = c.fetchone()
        while row is not None:
            (stopid,routeid,order,routename,stopname) = row
            if routename not in d:
                d[routename] = []
            d[routename].append({'stopid':stopid,'stop':stopname,'order':order,'route':routeid})
                
            row = c.fetchone()
            
        s = json.dumps({'stops':d}, sort_keys=True, indent=4, separators=(',', ': '))
        if pretty:
            s = "<pre>"+s+"</pre>"
        
        c.close()
        conn.close()
        return s
    
    
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    cherrypy.config.update({'server.socket_host': '0.0.0.0',
                        'server.socket_port': port,
                       })
    cherrypy.quickstart(MetroViz())
