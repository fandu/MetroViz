import sqlite3
import time

conn = sqlite3.connect('Metroviz.db')
c = conn.cursor()
c.execute('select name,ROWID from routes')
routes = dict(c.fetchall())
print "Got routes"
c.execute('select name,ROWID from stops')
stops = dict(c.fetchall())
print "Got stops"
c.execute('select trip,route,ROWID from route_trips')
tmp = c.fetchall()
trips = {}
for elem in tmp:
    trips[(elem[0],elem[1])] = elem[2];
print "Got trips"
c.execute('select pattern,route,ROWID from route_patterns')
tmp = c.fetchall()
patterns = {}
for elem in tmp:
    patterns[(elem[0],elem[1])] = elem[2];
print patterns
print "Got patterns"

c.execute('select RouteName text,TripName text,PatternName text,StopName text,ScheduledDepartTime text,DepartDelta int from RSA_data')
print "Got Data"

row = c.fetchone()
res = []
while (row is not None):
    (route,trip,pattern,stop,scheduledTime,delta) = row
    t = time.strptime(scheduledTime, "%Y-%m-%d %H:%M:%S.000")
    res.append((routes[route], patterns[(pattern,routes[route])], trips[(trip,routes[route])], stops[stop], t[0], t[1], t[2], t[6], t[3], t[4], delta))
    row = c.fetchone()

print "Done processing"    
c.executemany('insert into adherence (route, pattern, trip, stop, year, month, day, dayOfWeek, hour, min, adherence) values (?,?,?,?,?,?,?,?,?,?,?)',res)    
print "Done inserts"
conn.commit()
c.close()
conn.close()
print "Done"