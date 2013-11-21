import os
import cherrypy
import sqlite3
import json

DB = 'Metroviz.db'

class MetroViz(object):
    @cherrypy.expose
    def index(self):
        return "Hello World!"
    
    def createJSON(self,title,d,pretty,):
        if d == [] or d == {}:
            return {}
        if pretty:
            return "<pre>"+json.dumps({title:d}, sort_keys=True, indent=4, separators=(',', ': '))+"</pre>"
        return json.dumps({title:d}, sort_keys=True, indent=0, separators=(',', ':'))
    
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
            
        s = self.createJSON('routes',d,pretty)
        
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
            
        s = self.createJSON('trips',d,pretty)
        
        c.close()
        conn.close()
        return s
    
    @cherrypy.expose
    def getStops(self,route=None,pretty=False):
        conn = sqlite3.connect(DB)
        c = conn.cursor()
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
            
        s = self.createJSON('stops',d,pretty)
        
        c.close()
        conn.close()
        return s
    
    @cherrypy.expose
    def getAdherence(self,route,stop,trip=None,startDate=None,endDate=None,pretty=False):
        conn = sqlite3.connect(DB)
        c = conn.cursor()
        if trip is not None:
            c.execute('select t.trip,a.year,a.month,a.day,a.hour, a.min, a.adherence from adherence a left join route_trips t on t.ROWID=a.trip where a.route=? and a.stop=? and a.trip=? order by 1,2,3',(route,stop,trip,))
        elif (startDate is not None) or (endDate is not None):
            start = 0 if startDate is None else int(startDate)
            end =   99999999 if endDate is None else int(endDate)
            c.execute('select t.trip,a.year,a.month,a.day,a.hour, a.min, a.adherence from adherence a left join route_trips t on t.ROWID=a.trip where a.route=? and a.stop=? and 10000*year+100*month+day between ? and ? order by 1,2,3',(route,stop,start,end,))
        else:
            c.execute('select t.trip,a.year,a.month,a.day,a.hour, a.min, a.adherence from adherence a left join route_trips t on t.ROWID=a.trip where a.route=? and a.stop=? order by 1,2,3',(route,stop,))
        d = {}
        row = c.fetchone()
        while row is not None:
            (trip,year,month,day,hour,min,delta) = row
            if trip not in d:
                d[trip] = []
            d[trip].append({'date':'{}{:02}{:02}'.format(year,month,day),'ScheduledTime':str(hour)+":"+str(min),'adherence':delta})
            row = c.fetchone()
            
        s = self.createJSON('adherence',d,pretty)
        c.close()
        conn.close()
        return s
    
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    cherrypy.config.update({'server.socket_host': '0.0.0.0',
                        'server.socket_port': port,
                       })
    cherrypy.quickstart(MetroViz())
