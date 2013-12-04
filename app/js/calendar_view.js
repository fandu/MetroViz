(function () {
    // Using fake data for now
    // TODO: Figure out if there will be enough data that we should be using
    // LocalStorage

    fake_cal_data = [];
    fake_cal_data2 = [];

    var routes = {
        "Hethwood A": ["Burruss Hall", "Stroubles Circle", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
//        "Hethwood B": ["Torgersen Hall", "Tall Oaks"]
    };

    var dt = new Date(2006, 0, 1),
        sched = 0,
        actual = 0;

    for (var d = 0; d < 365 * 2; d++) {
        for (var route in routes) {
            sched = 0;
            actual = 0;
            var tmp = dt;
            for (var trip = 0; trip < 3; trip++) {
                tmp = new Date(tmp.getTime());
                tmp.setHours(tmp.getHours() + 1);
                for (var stop = 0; stop < routes[route].length; stop++) {
                    if (dt.getMonth() == 9) {
                        sched = 1000;
                        actual = Math.random() * 2000;
                    } else if (dt.getMonth() == 6) {
                        sched = 1000;
                        actual = 400 + Math.random() * 1200;
                    } else {
                        sched = 1000;
                        actual = 600 + Math.random() * 800;
                    }
                    if (dt.getMonth() > 3) {
                    fake_cal_data2.push({
                        "route": route,
                        "date": tmp,
                        "trip": trip,
                        "stop": routes[route][stop],
                        "delta": sched - actual,
                        "boarded": Math.floor(Math.random() * 30)
                    });

                    }
                    fake_cal_data.push({
                        "route": route,
                        "date": tmp,
                        "trip": trip,
                        "stop": routes[route][stop],
                        "delta": sched - actual,
                        "boarded": Math.floor(Math.random() * 30)
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

    var subviewUpdate = function () {},
        cellSize = 10,
        width = cellSize * 9,
        height = cellSize * 55;

    function aveAdherence (d) {
        var delta_sum = 0;
        for (var i = 0; i < d.length; i++) {
            delta_sum += Math.abs(d[i]["delta"]);
        }
        return delta_sum / d.length;
    }

    /*
     * This function returns an SVG path starting at (d0 * cellSize, w1 * cellSize)
     * and moving in horizontal / vertial line segments from there.
     */
    function monthPath(t0) {
      var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
          d0 = +day(t0), w0 = +week(t0),
          d1 = +day(t1), w1 = +week(t1);
      return "M" + d0 * cellSize + "," + w0 * cellSize +
          "H" + 7 * cellSize + "V" + w1 * cellSize +
          "H" + (d1 + 1) * cellSize + "V" + (w1 + 1) * cellSize +
          "H" + 0 + "V" + (w0 + 1) * cellSize +
          "H" + d0 * cellSize + "Z";
    }

    function toISOStringWithoutTime (date) {
        return date.toISOString().slice(0, 10);
    }

    function insertLegend (spectrum, scale, min, max) {
        var legend = d3.select("#calendar-container")
            .insert("div", "svg")
            .attr("id", "legend");

        legend.append("p")
            .text("Average difference between scheduled and actual arrival times: ");

        legend.append("span")
            .text(min + " ");

        legend.append("svg")
            .style("width", cellSize * 5.0)
            .style("height", cellSize * 1.1)
            .attr("class", "RdYlBl")
            .selectAll(".day")
            .data(spectrum)
            .enter().append("rect")
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("x", function(d) { return cellSize * spectrum.indexOf(d); })
            .attr("class", function(d) { console.log(d); return "day " + scale(d); })
            .text(function(d) { return d + ": " + percent(d); });

        legend.append("span")
            .text(" " + Math.floor(max));
    }

    displayCalendar = function(data) {
        //$("#calendar-container").empty();
        var nested_data = d3.nest()
            .key(function(d) { return toISOStringWithoutTime(d["date"]); })
            .map(data);

        console.log(nested_data);

        var maxAdherence = d3.max(data, function (d) {
            return aveAdherence(nested_data[toISOStringWithoutTime(d["date"])]);
        });

        var color = d3.scale.quantize()
            .domain([maxAdherence, 0.0])
            .range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));

        var minYear = d3.min(data, function (d) { return +d.date.getUTCFullYear(); }),
            maxYear = d3.max(data, function (d) { return +d.date.getUTCFullYear(); }) + 1;

        d3.select("#calendar-container").selectAll("svg").remove();
        d3.select("#calendar-container").selectAll("div").remove();

        var svg = d3.select("#calendar-container").selectAll("svg")
            .data(d3.range(minYear, maxYear))
          .enter().append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("class", "RdYlBl")
          .append("g")
            .attr("transform", "translate(" + 10 + "," + 15 + ")");

        svg.append("text")
            .attr("transform", "translate(" + cellSize * 3.5 + "," + -5 + ")")
            .style("text-anchor", "middle")
            .text(function(d) { return d; });

        var rect = svg.selectAll(".day")
            .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
          .enter().append("rect")
            .attr("class", "day")
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("y", function(d) { return week(d) * cellSize; })
            .attr("x", function(d) { return day(d) * cellSize; })
            .datum(format)
            .on("click", function (d) { subviewUpdate(nested_data[d]); });

        rect.append("title")
            .text(function(d) { return d; });

        svg.selectAll(".month")
            .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
          .enter().append("path")
            .attr("class", "month")
            .attr("d", monthPath);

        rect.filter(function(d) { return d in nested_data; })
            .attr("class", function(d) { return "day " + color(aveAdherence(nested_data[d])); })
            .select("title")
            .text(function(d) { return d + ": " + aveAdherence(nested_data[d]); });

        insertLegend(d3.range(maxAdherence / 5, maxAdherence + maxAdherence / 5, maxAdherence / 5), color, 0, maxAdherence);
    };

    changeSubviewUpdate = function(updateCb) {
        subviewUpdate = updateCb;
    };
})();
