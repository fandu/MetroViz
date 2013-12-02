// var head = document.getElementsByTagName('head');
// var testScript = document.createElement('script');
// testScript.src = '../js/route_view.js';
// testScript.type = 'text/javascript';
// head[0].appendChild(testScript);

// Create the Google Map…
var map = new google.maps.Map(d3.select("#map_id").node(), {
    zoom: 13,
    center: new google.maps.LatLng(37.22505, -80.41673),
    mapTypeId: google.maps.MapTypeId.ROADMAP
    // MapTypeId.ROADMAP displays the default road map view
    // MapTypeId.SATELLITE displays Google Earth satellite images
    // MapTypeId.HYBRID displays a mixture of normal and satellite views
    // MapTypeId.TERRAIN displays a physical map based on terrain information.
});

var fareTypeColor = []
fareTypeColor.push({
    "type": "Student",
    "color": "#A6CEE3"
});
fareTypeColor.push({
    "type": "Full Pass",
    "color": "#1F78B4"
});
fareTypeColor.push({
    "type": "Faculty Staff",
    "color": "#B2DF8A"
});
fareTypeColor.push({
    "type": "Full Fare",
    "color": "#33A02C"
});
fareTypeColor.push({
    "type": "Reboard",
    "color": "#FB9A99"
});
fareTypeColor.push({
    "type": "Half Fare",
    "color": "#E31A1C"
});
fareTypeColor.push({
    "type": "Half Pass",
    "color": "#FDBF6F"
});

function getFareTypeColor(i) {
    if (i > 0 && i < fareTypeColor.length) return fareTypeColor[i].color;
    else return "#DDD";
}

// Load the station data. When the data comes back, create an overlay.
d3.json("./data/stops.json", function(data) {
    var overlay = new google.maps.OverlayView();
    overlay.setMap(map);

    // Add the container when the overlay is added to the map.
    overlay.onAdd = function() {
        var layer = d3.select(this.getPanes().overlayMouseTarget).append("div")
            .attr("class", "map_class");
        var layer2 = d3.select(this.getPanes().mapPane).append("div")
            .attr("class", "map_class");

        // Draw each map_marker as a separate SVG element.
        // We could use a single SVG, but what size would it have?
        overlay.draw = function() {
            var projection = this.getProjection();

            /*---------------------------------------------------------------*/
            var map_legend = layer2.selectAll("svg.map_legend")
                .data(fareTypeColor).enter()
                .append("svg")
                .attr("class", "map_legend")
                .style("left", 820).style("top", 40);

            map_legend.append("rect")
                .attr("x", 0)
                .attr("y", function(d, i) {
                    return 30 * i;
                })
                .attr("width", 72)
                .attr("height", 18)
                .attr("fill", function(d) {
                    return d.color;
                });

            map_legend.append("text")
                .attr("x", 2)
                .attr("y", function(d, i) {
                    return 30 * i + 13;
                })
                .text(function(d) {
                    return d.type;
                });
            /*---------------------------------------------------------------*/
            var piechart_radius = 40;
            var padding2 = piechart_radius;
            var map_marker2 = layer.selectAll("svg.map_marker2")
                .data(d3.entries(data))
            // for every time
            .each(transform2)
                .enter().append("svg")
            // for the first time
            .each(transform2)
                .attr("class", function(d) {
                    return "map_marker2 " + trimStopName(d.key);
                });

            var arc = d3.svg.arc()
                .outerRadius(piechart_radius * 1)
                .innerRadius(piechart_radius * 0.5);

            var pie = d3.layout.pie()
                .sort(null)
                .value(function(d) {
                    return d.farecount;
                });

            var map_piechart = map_marker2.append("g")
                .attr("class", "map_stop_info map_piechart")
                .attr("transform", "translate(" + (padding2) + "," + (padding2) + ")");

            d3.csv("./data/data.csv", function(error, data) {
                var map_piechart_unit = map_piechart.selectAll(".map_piechart_unit")
                    .data(pie(data))
                    .enter().append("g")
                    .attr("class", "map_piechart_unit")
                    .append("path")
                    .attr("d", arc)
                    .style("fill", function(d) {
                        return getFareTypeColor(d.data.faretype);
                    });
            });

            /*---------------------------------------------------------------*/
            var map_stop_radius = 5;
            var padding = map_stop_radius;
            var map_marker = layer.selectAll("svg.map_marker")
                .data(d3.entries(data))
            // for every time
            .each(transform, padding)
                .enter().append("svg")
            // for the first time
            .each(transform, padding)
                .attr("class", function(d) {
                    return "map_marker " + trimStopName(d.key);
                }).attr("lat", function(d) {
                    return d.value[0];
                })
                .attr("lng", function(d) {
                    return d.value[1];
                });

            // Add a background.
            map_marker.append("rect")
                .attr("x", padding + 40)
                .attr("y", padding - 4)
                .attr("width", function(d) {
                    return d.key.length * 9;
                })
                .attr("height", 20)
                .attr("fill", "white")
                .attr("class", "map_stop_info map_stop_info_text");

            // Add a label.
            map_marker.append("text")
                .attr("x", padding + 40)
                .attr("y", padding + 5)
                .attr("dy", "7px")
                .attr("class", "map_stop_info map_stop_info_text")
                .text(function(d) {
                    return d.key;
                });

            // Add a circle.
            map_marker.append("circle")
                .attr("r", map_stop_radius)
                .attr("cx", padding)
                .attr("cy", padding)
                .attr("class", "map_stop")
                .on("mouseover", function(d) {
                    highlightStops([d.key]);
                })
                .on("mouseout", function(d) {
                    unhighlightStops([d.key]);
                })
                .on("click", function(d) {
                    afterClickStop(d);
                });
            /*---------------------------------------------------------------*/

            function transform(d) {
                d = new google.maps.LatLng(d.value[0], d.value[1]);
                d = projection.fromLatLngToDivPixel(d);
                return d3.select(this)
                    .style("left", (d.x - padding) + "px")
                    .style("top", (d.y - padding) + "px");
            }

            function transform2(d) {
                d = new google.maps.LatLng(d.value[0], d.value[1]);
                d = projection.fromLatLngToDivPixel(d);
                return d3.select(this)
                    .style("left", (d.x - padding2) + "px")
                    .style("top", (d.y - padding2) + "px");
            }
        };
    };
});

function trimStopName(str) {
    return "s_" + str.replace(/[\s\/]+/g, "_");
}

//APIs
map_highlightStops = highlightStopsAnimate;
map_highlightStopsTextOnly = highlightStopsTextOnlyAnimate;
map_highlightStopsCircleOnly = highlightStopsCircleOnlyAnimate;
map_unhighlightStops = unhighlightStops;

function highlightStopsAnimate(stopNames) {
    unhighlightAllStops();
    d3.selectAll(".map_stop").classed("fade", true);
    for (var i = 0; i < stopNames.length; i++) {
        var stopName = trimStopName(stopNames[i]);
        d3.selectAll("." + stopName).classed("mouseon", true);
        d3.selectAll("." + stopName + " .map_stop").classed("mouseon", true);
        d3.selectAll("." + stopName + " .map_stop_info").classed("mouseon", true);

        if (i == parseInt(stopNames.length / 2)) {
            var marker = d3.select(".map_marker." + stopName);
            map.panTo(new google.maps.LatLng(marker.attr("lat"), marker.attr("lng")));
        }
    }
}

function highlightStopsTextOnlyAnimate(stopNames) {
    unhighlightAllStops();
    d3.selectAll(".map_stop").classed("fade", true);
    for (var i = 0; i < stopNames.length; i++) {
        var stopName = trimStopName(stopNames[i]);
        d3.selectAll("." + stopName).classed("mouseon", true);
        d3.selectAll("." + stopName + " .map_stop").classed("mouseon", true);
        d3.selectAll("." + stopName + " .map_stop_info_text").classed("mouseon", true);

        if (i == parseInt(stopNames.length / 2)) {
            var marker = d3.select(".map_marker." + stopName);
            map.panTo(new google.maps.LatLng(marker.attr("lat"), marker.attr("lng")));
        }
    }
}

function highlightStopsCircleOnlyAnimate(stopNames) {
    unhighlightAllStops();
    d3.selectAll(".map_stop").classed("fade", true);
    for (var i = 0; i < stopNames.length; i++) {
        var stopName = trimStopName(stopNames[i]);
        d3.selectAll("." + stopName).classed("mouseon", true);
        d3.selectAll("." + stopName + " .map_stop").classed("mouseon", true);

        if (i == parseInt(stopNames.length / 2)) {
            var marker = d3.select(".map_marker." + stopName);
            map.panTo(new google.maps.LatLng(marker.attr("lat"), marker.attr("lng")));
        }
    }
}

function highlightStops(stopNames) {
    unhighlightAllStops();
    d3.selectAll(".map_stop").classed("fade", true);
    for (var i = 0; i < stopNames.length; i++) {
        var stopName = trimStopName(stopNames[i]);
        d3.selectAll("." + stopName).classed("mouseon", true);
        d3.selectAll("." + stopName + " .map_stop").classed("mouseon", true);
        d3.selectAll("." + stopName + " .map_stop_info").classed("mouseon", true);
    }
}

function unhighlightStops(stopNames) {
    d3.selectAll(".map_stop").classed("fade", false);
    for (var i = 0; i < stopNames.length; i++) {
        var stopName = trimStopName(stopNames[i]);
        d3.selectAll("." + stopName).classed("mouseon", false);
        d3.selectAll("." + stopName + " .map_stop").classed("mouseon", false);
        d3.selectAll("." + stopName + " .map_stop_info").classed("mouseon", false);
    }
}

function unhighlightAllStops() {
    d3.selectAll(".map_stop").classed("fade", false);
    d3.selectAll(".map_marker").classed("mouseon", false);
    d3.selectAll(".map_marker2").classed("mouseon", false);
    d3.selectAll(".map_stop").classed("mouseon", false);
    d3.selectAll(".map_stop_info").classed("mouseon", false);
}


function afterClickStop(d) {
    console.log("" + d.value[0] + "," + d.value[1] + ":" + d.key);
    send_to_route_view(d.key);
}

function afterMouseOver(d) {
    console.log("" + d.value[0] + "," + d.value[1] + ":" + d.key);
    send_to_route_view(d.key);
}
