import os
import cherrypy
import sqlite3
import json
import time

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
    def getAdherenceRidership(self,route=None,stop=None,trip=None,startDate=None,endDate=None,pretty=False):
        t = time.time()
        conn = sqlite3.connect(DB)
        c = conn.cursor()
        query = 'select r.name,s.name,d.trip,year,month,day,hour, min,adherence, fareCount, boarding, alighting from data d left join route_trips t on t.ROWID=d.trip left join stops s on s.ROWID=d.stop left join routes r on r.ROWID=d.route'
        params = []
        count = 0
        if route is not None:
            if count == 0:
                query += ' where d.route=?'
                count = 1
            else:
                query += ' and d.route=?'
            params.append(route)
        if stop is not None:
            if count == 0:
                query += ' where d.stop=?'
                count = 1
            else:
                query += ' and d.stop=?'
            params.append(stop)
        if trip is not None:
            if count == 0:
                query += ' where d.trip=?'
                count = 1
            else:
                query += ' and d.trip=?'
            params.append(trip)
        if (startDate is not None) or (endDate is not None):
            start = 0 if startDate is None else int(startDate)
            end =   99999999 if endDate is None else int(endDate)
            query += ' and 10000*d.year+100*d.month+d.day between ? and ?'
            params.extend([start,end,])
        query +=  ' order by 1,2,3'
        c.execute(query,tuple(params))
        row = c.fetchone()
        d = {}
        while row is not None:
            (route,stop,trip,syear,smonth,sday,shour,smin,delta,fare,boarding,alighting) = row
            if trip not in d:
                d[trip] = []
            d[trip].append({'route':route,'stop':stop,'date':'{}{:02}{:02}'.format(syear,smonth,sday),'ScheduledTime':"{:02}:{:02}".format(shour,smin),'adherence':delta, 'fareCount':fare,'boarded':boarding,'alighted':alighting})
            row = c.fetchone()
            
        s = self.createJSON('data',d,pretty)
        c.close()
        conn.close()
        print time.time()-t
        return s
    
    def getAdherenceData(self,route,stop,trip=None,startDate=None,endDate=None):
        t = time.time()
        conn = sqlite3.connect(DB)
        c = conn.cursor()
        query = 'select r.name,s.name,d.trip,d.year,d.month,d.day,d.hour, d.min,d.adherence from data d left join route_trips t on t.ROWID=d.trip left join stops s on s.ROWID=d.stop left join routes r on r.ROWID=d.route'
        params = []
        if route is not None:
            if count == 0:
                query += ' where d.route=?'
                count = 1
            else:
                query += ' and d.route=?'
            params.append(route)
        if stop is not None:
            if count == 0:
                query += ' where d.stop=?'
                count = 1
            else:
                query += ' and d.stop=?'
            params.append(stop)
        if trip is not None:
            if count == 0:
                query += ' where d.trip=?'
                count = 1
            else:
                query += ' and d.trip=?'
            params.append(trip)
        if (startDate is not None) or (endDate is not None):
            start = 0 if startDate is None else int(startDate)
            end =   99999999 if endDate is None else int(endDate)
            query += ' and 10000*d.year+100*d.month+d.day between ? and ?'
            params.extend([start,end,])
        query +=  ' order by 1,2,3'
        c.execute(query,tuple(params))
        
        d = {}
        row = c.fetchone()
        while row is not None:
            (stop,trip,year,month,day,hour,min,delta) = row
            if trip not in d:
                d[trip] = []
            d[trip].append({'stop':stop,'date':'{}{:02}{:02}'.format(year,month,day),'ScheduledTime':"{:02}:{:02}".format(hour,min),'adherence':delta})
            row = c.fetchone()
        c.close()
        conn.close()
        print time.time()-t
        return d
    
    @cherrypy.expose
    def getAdherence(self,route,stop=None,trip=None,startDate=None,endDate=None,pretty=False):
        d = self.getAdherenceData(route,stop,trip,startDate,endDate)
        s = self.createJSON('adherence',d,pretty)
        return s

    def getRidershipData(self,route,stop,trip,startDate,endDate):
        t = time.time()
        conn = sqlite3.connect(DB)
        c = conn.cursor()
        query = 'select r.name,s.name,d.trip,d.year,d.month,d.day,d.hour, d.min,d.fareCount, d.boarding, d.alighting from data d left join route_trips t on t.ROWID=d.trip left join stops s on s.ROWID=d.stop left join routes r on r.ROWID=d.route'
        params = []
        if route is not None:
            if count == 0:
                query += ' where d.route=?'
                count = 1
            else:
                query += ' and d.route=?'
            params.append(route)
        if stop is not None:
            if count == 0:
                query += ' where d.stop=?'
                count = 1
            else:
                query += ' and d.stop=?'
            params.append(stop)
        if trip is not None:
            if count == 0:
                query += ' where d.trip=?'
                count = 1
            else:
                query += ' and d.trip=?'
            params.append(trip)
        elif (startDate is not None) or (endDate is not None):
            start = 0 if startDate is None else int(startDate)
            end =   99999999 if endDate is None else int(endDate)
            query += ' and 10000*d.year+100*d.month+d.day between ? and ?'
            params.extend([start,end,])
        query +=  ' order by 1,2,3'
        c.execute(query,tuple(params))
        
        d = {}
        row = c.fetchone()
        while row is not None:
            (route,stop,trip,year,month,day,hour,min,fare,board,alight) = row
            if trip not in d:
                d[trip] = []
            d[trip].append({'route':route,'stop':stop,'date':'{}{:02}{:02}'.format(year,month,day),'SchduleTime':"{:02}:{:02}".format(hour,min),'fareCount':fare,'boarded':board, 'alighted':alight})
            row = c.fetchone()
            
        c.close()
        conn.close()
        print time.time() - t
        return d
    
    @cherrypy.expose
    def getRidership(self,route=None,stop=None,trip=None,startDate=None,endDate=None,pretty=False):
        d = self.getRidershipData(route, stop, trip, startDate, endDate)    
        s = self.createJSON('ridership',d,pretty)
        return s
    
    @cherrypy.expose
    def getTotalFareByType(self,stop=None,pretty=False):
        t = time.time()
        conn = sqlite3.connect(DB)
        c = conn.cursor()
        query = 'select name,farename,sum(count) from totalFareByType f left join stops s on s.ROWID=f.stop'
        params = ()
        if stop is not None:
            query += ' where stop=?'
            params = (stop,)
        query +=  ' group by 1,2 order by 1,2'
        c.execute(query,params)

        row = c.fetchone()
        d = {}
        while row is not None:
            (stop,faretype,count) = row
            if stop not in d:
                d[stop] = {}
            d[stop][faretype] = count
            row = c.fetchone()
            
        s = self.createJSON('FareTypeCount',d,pretty)
        c.close()
        conn.close()
        print time.time()-t
        return s
    
def CORS():
    cherrypy.response.headers["Access-Control-Allow-Origin"] = "*" # mean: CORS to all; insert spec. origin to allow spec access
    
if __name__ == '__main__':
    cherrypy.tools.CORS = cherrypy.Tool('before_handler', CORS)
    port = int(os.environ.get('PORT', 5000))
    cherrypy.config.update({'server.socket_host': '0.0.0.0',
                        'server.socket_port': port,
                        'tools.CORS.on': True,
                       })
    cherrypy.quickstart(MetroViz())
    
    cherrypy.quickstart(PyCachedAdmin(),
                        config={
                            '/': {
                               'request.dispatch':
                                    cherrypy.dispatch.MethodDispatcher(),
                               }})




