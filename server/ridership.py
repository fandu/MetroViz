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
print "Got patterns"
c.execute('select RouteName,TripName,PatternName,StopName,DepartTimefromStop,totalfare,boardings,alightings from APC_count')
print "Got Data"

row = c.fetchone()
res = []
while (row is not None):
    (route,trip,pattern,stop,actualTime,fareCount, board,alight) = row
    a = time.strptime(actualTime[:-4], "%Y-%m-%d %H:%M:%S")
    try:
        p = patterns[(pattern,routes[route])]
        t = trips[(trip,routes[route])]
        res.append((fareCount,board,alight, routes[route], p, t, stops[stop], a[0], a[1], a[2],))
    except:
        pass
    row = c.fetchone()

print "Done processing" + str(len(res))+ " rows"
c.executemany('update data set fareCount=?,boarding=?, alighting=? where route=? and pattern=? and trip=? and stop=? and year=? and month=? and day=?',res)    
print "Done updates"
conn.commit()
c.close()
conn.close()
print "Done"