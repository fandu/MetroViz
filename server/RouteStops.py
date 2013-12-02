import sqlite3

conn = sqlite3.connect('Metroviz.db')
c = conn.cursor()
c.execute('select name,ROWID from routes')
routes = dict(c.fetchall())
print "Got routes"
c.execute('select name,ROWID from stops')
stops = dict(c.fetchall())
print "Got stops"
c.execute('select RouteName,StopName,min(ROWID) from RSA_data group by 1,2 order by 1,3')
print "Got data"
row = c.fetchone()
counts = {}
res = []
while (row is not None):
    (route,stop,_) = row
    if route not in counts:
        counts[route] = 0
    counts[route] += 1
    res.append((counts[route],routes[route],stops[stop]))
    row = c.fetchone()
    
print "Processed data"
c.executemany('update route_stops set id=? where route=? and stop=?',res)
print "Done updates"    
conn.commit()
c.close()
conn.close()
print "DONE"