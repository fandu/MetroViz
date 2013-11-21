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
            return "{}"
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
    def getAdherenceRidership(self,route,stop,trip=None,startDate=None,endDate=None,pretty=False):
        conn = sqlite3.connect(DB)
        c = conn.cursor()
        query = 'select t.trip,a.year,a.month,a.day,a.hour, a.min,r.hour,r.min, a.adherence, r.fareCount, r.boarding, r.alighting from adherence a left join ridership r on (r.year=a.year and r.month=a.month and r.day=a.day and r.route=a.route and r.stop=a.stop and r.trip=a.trip) left join route_trips t on t.ROWID=a.trip where a.route=? and a.stop=?'
        params = [route,stop,]
        if trip is not None:
             query += ' and a.trip=?'
             params.append[trip]
        elif (startDate is not None) or (endDate is not None):
            start = 0 if startDate is None else int(startDate)
            end =   99999999 if endDate is None else int(endDate)
            query += ' and 10000*a.year+100*a.month+a.day between ? and ?'
            params.extend([start,end,])
        query +=  ' order by 1,2,3'
        c.execute(query,tuple(params))
        row = c.fetchone()
        d = {}
        while row is not None:
            (trip,syear,smonth,sday,shour,smin,ahour,amin,delta,fare,boarding,alighting) = row
            if trip not in d:
                d[trip] = []
            d[trip].append({'date':'{}{:02}{:02}'.format(syear,smonth,sday),'ScheduledTime':"{:02}:{:02}".format(shour,smin),'ActualTime':"{:02}:{:02}".format(ahour,amin),'adherence':delta, 'fareCount':fare,'boarded':boarding,'alighted':alighting})
            row = c.fetchone()
            
        s = self.createJSON('data',d,pretty)
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
            d[trip].append({'date':'{}{:02}{:02}'.format(year,month,day),'ScheduledTime':"{:02}:{:02}".format(hour,min),'adherence':delta})
            row = c.fetchone()
            
        s = self.createJSON('adherence',d,pretty)
        c.close()
        conn.close()
        return s

    @cherrypy.expose
    def getRidership(self,route,stop,trip=None,startDate=None,endDate=None,pretty=False):
        conn = sqlite3.connect(DB)
        c = conn.cursor()
        if trip is not None:
            c.execute('select t.trip,r.year,r.month,r.day,r.hour, r.min, r.boarding,r.alighting from ridership r left join route_trips t on t.ROWID=r.trip where r.route=? and r.stop=? and r.trip=? order by 1,2,3',(route,stop,trip,))
        elif (startDate is not None) or (endDate is not None):
            start = 0 if startDate is None else int(startDate)
            end = 99999999 if endDate is None else int(endDate)
            c.execute('select t.trip,r.year,r.month,r.day,r.hour, r.min, r.boarding,r.alighting from ridership r left join route_trips t on t.ROWID=r.trip where r.route=? and r.stop=? and 10000*r.year+100*r.month+r.day between ? and ? order by 1,2,3',(route,stop,start,end,))
        else:
            c.execute('select t.trip,r.year,r.month,r.day,r.hour, r.min, r.boarding,r.alighting from ridership r left join route_trips t on t.ROWID=r.trip where r.route=? and r.stop=? order by 1,2,3',(route,stop,))
        d = {}
        row = c.fetchone()
        while row is not None:
            (trip,year,month,day,hour,min,board,alight) = row
            if trip not in d:
                d[trip] = []
            d[trip].append({'date':'{}{:02}{:02}'.format(year,month,day),'DepartTime':"{:02}:{:02}".format(hour,min),'boarded':board, 'alighted':alight})
            row = c.fetchone()
            
        s = self.createJSON('ridership',d,pretty)
        c.close()
        conn.close()
        return s
    
    
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    cherrypy.config.update({'server.socket_host': '0.0.0.0',
                        'server.socket_port': port,
                       })
    cherrypy.quickstart(MetroViz())
