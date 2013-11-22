var margin = {
    top: 20,
    right: 200,
    bottom: 0,
    left: 10
},
    width = 900,
    height = 650;

var first_stop = 1,
    last_stop = 40;

var c = d3.scale.ordinal()
    .range(["#A6CEE3", "#1F78B4", "#B2DF8A", "#33A02C", "#FB9A99", "#E31A1C", "#FDBF6F"]);

var x = d3.scale.linear()
    .range([0, width]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("top")
    .ticks(last_stop);

var formatYears = d3.format("00");
xAxis.tickFormat(formatYears);

var svg = d3.select("#route_id").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("margin-left", margin.left + "px")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


d3.json("../data/routes2.json", function(data) {
    x.domain([first_stop, last_stop]);

    var xScale = d3.scale.linear()
        .domain([first_stop, last_stop])
        .range([0, width]);


    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + 0 + ")")
        .call(xAxis);

    var nstops = [];
    for (var k = 0; k < data.length; k++) {

        nstops[k] = data[k]['total'];
    }


    for (var j = 0; j < data.length; j++) {

        var g = svg.append("g").attr("class", "journal");

        var circles = g.selectAll("circle")
            .data(data[j]['routes'])
            .enter()
            .append("circle");

        var text = g.selectAll("text")
            .data(data[j]['routes'])
            .enter()
            .append("text");

        var xAxisScale = d3.scale.linear()
            .domain([0, nstops[j]])
            .range([0, nstops[j] * 23.07]);


        circles
            .attr("cx", function(d, i) {
                return xAxisScale(i);
            })
            .attr("cy", j * 40 + 25)
            .attr("r", 5)
            .style("fill", function(d) {
                return "#6cb3f8";
            })
            .attr("stroke", "white")
            .attr("stroke-width", 1)
        //          .attr("class", function (d) { return d.name; };)
        .on("mouseover", circle_mouseover)
            .on("mouseout", circle_mouseout)
            .on("click", circle_mouseclick);


        g.append("text")
            .attr("y", j * 40 + 25)
            .attr("x", width + 20)
            .attr("class", "label")
            .text(data[j]['name'])
            .style("fill", function(d) {
                return "black";
            })
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on("click", textmouseclick);


    };

    // API 
    send_to_route_view = send_to_r_v;

    function send_to_r_v(stop_name) {
        // highlight the stops
        d3.selectAll("circle").transition().duration(250).attr("stroke-width",
            function(d, i) {
                console.log(stop_name);
                if (d == stop_name) {
                    return 3;
                } else {
                    return 1;
                }
            }
        ).attr("r", function(d, i) {
            if (d == stop_name) {
                return 10;
            } else {
                return 5;
            }
        });

    }

    //API

    api_highlight_given_name = highlight_given_name;

    function highlight_given_name(stop_name){
        d3.selectAll("circle").transition().duration(250).attr("stroke-width",1).attr("r",5).style("fill","6cb3f8");
        d3.selectAll("circle").transition().duration(250).attr("stroke-width",
            function(d, i) {
                //console.log(d);
                if (d == stop_name) {
                    return 3;
                } else {
                    return 1;
                }
            }
        ).attr("r", function(d, i) {
            if (d == stop_name) {
                return 10;
            } else {
                return 5;
            }
        }).style("fill",function(d, i) {
            if (d == stop_name) {
                return "red";
            } else {
                return "6cb3f8";
            });

    }

    function circle_mouseover() {

        var xpos = d3.select(this).attr("cx");
        var ypos = d3.select(this).attr("cy");
        xindex = Math.round(xpos / 23.07); //these numbers are really important
        yindex = Math.round((ypos - 25) / 40);
        stop_name = data[yindex].routes[xindex];

        d3.select(this).transition().duration(250).style("fill","red").attr("stroke-width", 1).attr("r", 10);

        map_highlightStops([stop_name]);

        var map_height = parseInt(d3.select("#map_id").style("height"));
        d3.select("text").text("Hello World").style("fill", "black").attr("x", xpos + 35).attr("y", (map_height + ypos + 24));
        //console.log(stop_name+" "+(xpos + 35) + "," + (parseFloat(map_height) + parseFloat(ypos) + 24));

        d3.selectAll("circle").transition().duration(250).attr("stroke-width",
            function(d, i) {
                //console.log(d);
                if (d == stop_name) {
                    return 3;
                } else {
                    return 1;
                }
            }
        ).attr("r", function(d, i) {
            if (d == stop_name) {
                return 10;
            } else {
                return 5;
            }
        });

    }


    function circle_mouseout() {
        var xpos = d3.select(this).attr("cx");
        var ypos = d3.select(this).attr("cy");
        xindex = Math.round(xpos / 23.07); //these numbers are really important
        yindex = Math.round((ypos - 25) / 40);
        stop_name = data[yindex].routes[xindex];
        map_unhighlightStops([stop_name]);

        d3.select(this).attr("stroke-width", 1).style("fill","#6cb3f8").attr("r","5");
        d3.select("text").text(null);

    }

    function mouseover() {
        var g = d3.select(this).node().parentNode;
        d3.select(g).selectAll("circle").attr("stroke-width", 3);
        var ypos = d3.select(this).attr("y");
        yindex = Math.round((ypos - 25) / 40);
        //console.log(yindex);
        //console.log(data[yindex].routes);
        map_highlightStopsTextOnly(data[yindex].routes);

    }

    function mouseout() {
        var g = d3.select(this).node().parentNode;
        d3.select(g).selectAll("circle").transition().delay(250).attr("stroke-width", 1);
        var ypos = d3.select(this).attr("y");
        yindex = Math.round((ypos - 25) / 40);
        map_unhighlightStopsTextOnly(data[yindex].routes);
        
    }

    function textmouseclick() {
        var ypos = d3.mouse(this)[1];
        yindex = Math.round((ypos - 25) / 40);
        alert("" + data[yindex].name);
        var g = d3.select(this).node().parentNode;
        d3.select(g).selectAll("circle").attr("stroke-width", 1);
    }

    // for the API

    function circle_mouseclick() {
        var xpos = d3.mouse(this)[0];
        var ypos = d3.mouse(this)[1];
        xindex = Math.round(xpos / 23.07); //these numbers are really important
        yindex = Math.round((ypos - 25) / 40);
        var selected_stop_name = data[yindex].routes[xindex];
//        console.log("" + data[yindex].routes[xindex]);
        list_of_stops = search_for_stopname_json(selected_stop_name);
 //       console.log(list_of_stops);
        also_highlight(list_of_stops);
    }

    // helper function which highlights other routes with the same stop

    function search_for_stopname_json(selected_stop_name) {
        var list_of_stops = [];
        var counter = 0;
        for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < data[i].routes.length; j++) {
                if (selected_stop_name == data[i].routes[j]) {
                    list_of_stops[counter] = [i, j];
                    counter++;
                }
            }
        }
        return list_of_stops;
    }

    function also_highlight(list_of_stops) {
        //d3.select("circle").attr("stroke-width",3);
    }
});