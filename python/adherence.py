import sqlite3
import time

conn = sqlite3.connect('Metroviz.db.back')
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

c.execute('select RouteName text,TripName text,PatternName text,StopName text,ScheduledDepartTime text,ActualDepartTime,DepartDelta int from RSA_data')
print "Got Data"

row = c.fetchone()
res = []
while (row is not None):
    (route,trip,pattern,stop,scheduledTime,actualTime,delta) = row
    s = time.strptime(scheduledTime[:-4], "%Y-%m-%d %H:%M:%S")
    a = time.strptime(actualTime[:-4], "%Y-%m-%d %H:%M:%S")
    res.append((routes[route], patterns[(pattern,routes[route])], trips[(trip,routes[route])], stops[stop], a[0], a[1], a[2], a[6], s[3], s[4], delta))
    row = c.fetchone()

print "Done processing"    
c.executemany('insert into adherence (route, pattern, trip, stop, year, month, day, dayOfWeek, hour, min, adherence) values (?,?,?,?,?,?,?,?,?,?,?)',res)    
print "Done inserts"
conn.commit()
c.close()
conn.close()
print "Done"