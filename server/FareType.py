import sqlite3

conn = sqlite3.connect('Metroviz.db.back')
c = conn.cursor()
c.execute('select name,ROWID from routes')
routes = dict(c.fetchall())
print "Got routes"
c.execute('select name,ROWID from stops')
stops = dict(c.fetchall())
print "Got stops"

c.execute('select RouteName,StopName,FareTypeName,sum(FareCount) from Fare_By_Type group by 1,2,3')
print "Got Data"

row = c.fetchone()
res = []
i = 0
while (row is not None):
    (route,stop,faretype,count) = row
    try:
        res.append((routes[route],stops[stop], faretype, count))
    except:
        print "error"
        i+=1
    row = c.fetchone()
print i

print "Done processing"    
c.executemany('insert into totalFareByType (route, stop, fareName, count) values (?,?,?,?)',res)    
print "Done inserts"
conn.commit()
c.close()
conn.close()
print "Done"