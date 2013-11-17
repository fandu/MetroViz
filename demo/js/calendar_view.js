// Using fake data for now
// TODO: Figure out if there will be enough data that we should be using
// LocalStorage

var routes = {
    "Hethwood A": ["Burruss Hall", "Stroubles Circle"],
    "Hethwood B": ["Torgersen Hall", "Tall Oaks"]
};

var dt = new Date(2006, 0, 1),
    data = [],
    sched = 0,
    actual = 0;

for (var d = 0; d < 365 * 2; d++) {
    for (var route in routes) {
        sched = 0;
        actual = 0;
        for (var trip = 0; trip < 3; trip++) {
            for (var stop = 0; stop < routes[route].length; stop++) {
                sched += Math.floor(Math.random() * 50);
                actual += Math.floor(Math.random() * 50);
                data.push({
                    "route": route,
                    "date": dt,
                    "trip": trip,
                    "stop": routes[route][stop],
                    "scheduled": sched,
                    "actual": actual,
                    "passengers": Math.floor(Math.random() * 30)
                });
            }
        }
    }
    dt = new Date(dt.getTime() + (24 * 60 * 60 * 1000));
}

// End of fake data generation

var day = d3.time.format("%w"),
    week = d3.time.format("%U"),
    percent = d3.format(".1%"),
    format = d3.time.format("%Y-%m-%d");

var width = 960,
    height = 136,
    cellSize = 17; // cell size

var displayCalendar = function(data, initSubview, subviewUpdate) {

    if (!subviewUpdate) {
        subviewUpdate = function () {};
    }

    Date.prototype._cView_toISO = function () {
        return this.toISOString().slice(0, 10);
    }

var nested_data = d3.nest()
    .key(function(d) { return d["date"]._cView_toISO(); })
    .map(data);

var data_by_dow = d3.nest()
    .key(function(d) { return day(d["date"]); })
    .map(data);

showDow = function (dow) {
    updateTripView(data_by_dow["" + dow]);
}

var adherence = function (d) {
    var delta_sum = 0;
    for (var i = 0; i < d.length; d++) {
        delta_sum += Math.abs(d[i]["scheduled"] - d[i]["actual"]);
    }
    return delta_sum;
};

var maxAdherence = d3.max(data, function (d) {
    return adherence(nested_data[d["date"]._cView_toISO()]);
});

var color = d3.scale.quantize()
    .domain([0.0, maxAdherence])
    .range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));

    var minYear = d3.min(data, function (d) { return +d.date.getUTCFullYear(); });
    var maxYear = d3.max(data, function (d) { return +d.date.getUTCFullYear(); }) + 1;

var svg = d3.select("body").selectAll("svg")
    .data(d3.range(minYear, maxYear))
  .enter().append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "RdYlGn")
  .append("g")
    .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

svg.append("text")
    .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
    .style("text-anchor", "middle")
    .text(function(d) { return d; });

var rect = svg.selectAll(".day")
    .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
  .enter().append("rect")
    .attr("class", "day")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", function(d) { return week(d) * cellSize; })
    .attr("y", function(d) { return day(d) * cellSize; })
    .datum(format)
    //.on("mouseover", function (d) { console.log("Mouseover " + d); })
    .on("click", function (d) { subviewUpdate(nested_data[d]); });

rect.append("title")
    .text(function(d) { return d; });

svg.selectAll(".month")
    .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
  .enter().append("path")
    .attr("class", "month")
    .attr("d", monthPath);


  rect.filter(function(d) { return d in nested_data; })
      .attr("class", function(d) { return "day " + color(adherence(nested_data[d])); })
    .select("title")
    .text(function(d) { return d + ": " + percent(adherence(nested_data[d])); });

    if (initSubview) {
        initSubview();
    }
};


function monthPath(t0) {
  var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
      d0 = +day(t0), w0 = +week(t0),
      d1 = +day(t1), w1 = +week(t1);
  return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
      + "H" + w0 * cellSize + "V" + 7 * cellSize
      + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
      + "H" + (w1 + 1) * cellSize + "V" + 0
      + "H" + (w0 + 1) * cellSize + "Z";
}

d3.select(self.frameElement).style("height", "2910px");
