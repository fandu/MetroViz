(function () {
    // Using fake data for now
    // TODO: Figure out if there will be enough data that we should be using
    // LocalStorage

    fake_cal_data = [];

    var routes = {
        "Hethwood A": ["Burruss Hall", "Stroubles Circle"],
        "Hethwood B": ["Torgersen Hall", "Tall Oaks"]
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
                    sched += Math.floor(Math.random() * 1000);
                    actual += Math.floor(Math.random() * 1000);
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

    var subviewUpdate,
        nested_data = {},
        width = 960,
        height = 136,
        cellSize = 17; // cell size

    displayCalendar = function(data, svUpdate) {
        subviewUpdate = svUpdate;
        if (!subviewUpdate) {
            subviewUpdate = function () {};
        }

        Date.prototype._cView_toISO = function () {
            return this.toISOString().slice(0, 10);
        };

        nested_data = d3.nest()
            .key(function(d) { return d["date"]._cView_toISO(); })
            .map(data);

        var data_by_dow = d3.nest()
            .key(function(d) { return day(d["date"]); })
            .map(data);

        showDow = function (dow) {
            console.log(data_by_dow["" + dow]);
            subviewUpdate(data_by_dow["" + dow]);
        };

        var adherence = function (d) {
            var delta_sum = 0;
            for (var i = 0; i < d.length; i++) {
                //delta_sum += Math.abs(d[i]["scheduled"] - d[i]["actual"]);
                delta_sum += Math.abs(d[i]["delta"]);
            }
            return delta_sum / d.length;
        };

        var maxAdherence = d3.max(data, function (d) {
            return adherence(nested_data[d["date"]._cView_toISO()]);
        });

        var color = d3.scale.quantize()
            .domain([maxAdherence, 0.0])
            .range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));

            var minYear = d3.min(data, function (d) { return +d.date.getUTCFullYear(); });
            var maxYear = d3.max(data, function (d) { return +d.date.getUTCFullYear(); }) + 1;

        var svg = d3.select("#calendar-container").selectAll("svg")
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

            var spectrum = d3.range(0.0, maxAdherence, maxAdherence / 4);
            var legend = d3.select("#calendar-container")
                .insert("div", "svg")
                .attr("id", "legend");

            legend.append("p")
                .text("Average difference between scheduled and actual arrival times: ");

            legend.append("span")
                .text("0 ");

            legend.append("svg")
                .style("width", cellSize * 4.1)
                .style("height", cellSize * 1.1)
                .attr("class", "RdYlGn")
                .selectAll(".day")
                .data(spectrum)
                .enter().append("rect")
                .attr("width", cellSize)
                .attr("height", cellSize)
                .attr("x", function(d) { return cellSize * spectrum.indexOf(d); })
                .attr("class", function(d) { console.log(d); return "day " + color(d); })
                .text(function(d) { return d + ": " + percent(d); }); ;

            legend.append("span")
                .text(" " + maxAdherence);
        };

        changeSubviewUpdate = function(svUpdate) {
            subviewUpdate = svUpdate;
        };

        function monthPath(t0) {
          var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
              d0 = +day(t0), w0 = +week(t0),
              d1 = +day(t1), w1 = +week(t1);
          return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize +
              "H" + w0 * cellSize + "V" + 7 * cellSize +
              "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize +
              "H" + (w1 + 1) * cellSize + "V" + 0 +
              "H" + (w0 + 1) * cellSize + "Z";
        }

        d3.select(self.frameElement).style("height", "2910px");
})();
