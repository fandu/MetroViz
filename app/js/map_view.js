var fareTypeColor = []
fareTypeColor.push({
    "type": "Faculty Staff",
    "color": "#E41A1C"
});
fareTypeColor.push({
    "type": "Full Fare",
    "color": "#377EB8"
});
fareTypeColor.push({
    "type": "Full Pass",
    "color": "#4DAF4A"
});
fareTypeColor.push({
    "type": "Half Fare",
    "color": "#984EA3"
});
fareTypeColor.push({
    "type": "Half Pass",
    "color": "#FF7F00"
});
fareTypeColor.push({
    "type": "Reboard",
    "color": "#FFFF33"
});
fareTypeColor.push({
    "type": "Student",
    "color": "#A65628"
});
fareTypeColor.push({
    "type": "TOB ID",
    "color": "#F781BF"
});
fareTypeColor.push({
    "type": "Transfer",
    "color": "#999999"
});

var fareTypeColorMap = {};
for (var i = 0; i < fareTypeColor.length; i++) {
    fareTypeColorMap[getFareTypeName(i)] = getFareTypeColor(i);
}

// Faculty Staff|287210
// Full Fare|208345
// Full Pass|372981
// Half Fare|24608
// Half Pass|20912
// Reboard|43568
// Student|9557501
// TOB ID|12654
// Transfer|13577

function getFareTypeColor(i) {
    if (i >= 0 && i < fareTypeColor.length) return fareTypeColor[i].color;
    else return "#DDD";
}

function getFareTypeName(i) {
    if (i >= 0 && i < fareTypeColor.length) return fareTypeColor[i].type;
    else return "Not Found";
}

// Create the Google Map
var map = new google.maps.Map(d3.select("#map_id").node(), {
    zoom: 11,
    center: new google.maps.LatLng(37.18746, -80.4105),
    mapTypeId: google.maps.MapTypeId.ROADMAP
});

// Create the legend and display on the map
var legend = document.createElement('div');
legend.id = 'legend';
var content = [];
content.push('<h3>Fare Types</h3>');
for (var i = 0; i < fareTypeColor.length; i++) {
    content.push('<p><div class="legend_color" style="background:' + getFareTypeColor(i) + '"></div>' + getFareTypeName(i) + '</p>');
}
legend.innerHTML = content.join('');
legend.index = 1;
map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legend);

// Load the station data. When the data comes back, create an overlay.
d3.json("./data/stops.json", function(data) {

    var stop_data = data;
    searchAutoComplete(stop_data);

    d3.json("./data/faretypes.json", function(error, data) {
        var fare_data = data["FareTypeCount"];

        var overlay = new google.maps.OverlayView();
        overlay.setMap(map);

        // Add the container when the overlay is added to the map.
        overlay.onAdd = function() {
            var layer = d3.select(this.getPanes().overlayMouseTarget).append("div")
                .attr("class", "map_class");

            // Draw each map_marker as a separate SVG element.
            // We could use a single SVG, but what size would it have?
            overlay.draw = function() {
                var projection = this.getProjection();

                /*---------------------------------------------------------------*/

                var piechart_radius = 40;
                var padding2 = piechart_radius;

                var count = 0;

                var map_marker2 = layer.selectAll("svg.map_marker2")
                    .data(d3.entries(stop_data))
                    .each(transform2)
                    .enter().append("svg")
                    .each(transform2)
                    .attr("class", function(d) {

                        return "map_marker2 " + trimStopName(d.key);
                    });

                ///
                var map_piechart = map_marker2.append("g")
                    .attr("class", "map_stop_info map_piechart")
                    .attr("transform", "translate(" + (padding2) + "," + (padding2) + ")");

                var arc = d3.svg.arc()
                    .outerRadius(piechart_radius * 1)
                    .innerRadius(piechart_radius * 0.5);

                var pie = d3.layout.pie()
                    .sort(null)
                    .value(function(d) {
                        return d.farecount;
                    });

                var map_piechart_unit = map_piechart.selectAll(".map_piechart_unit")
                    .data(function(d) {
                        var pie_data = {};
                        if (fare_data[d.key] != undefined)
                            var pie_data = fare_data[d.key];

                        var faretypes = [];
                        for (var i = 0; i < fareTypeColor.length; i++) {
                            var typename = getFareTypeName(i);
                            if (pie_data[typename] != undefined) {
                                faretypes.push({
                                    "faretype": typename,
                                    "farecount": pie_data[typename]
                                });
                            }
                        }

                        return pie(faretypes);
                    })
                    .enter().append("g")
                    .attr("class", ".map_piechart_unit")
                    .append("path")
                    .attr("d", arc)
                    .style("fill", function(d) {
                        return fareTypeColorMap[d.data.faretype];
                    });
                ///

                /*---------------------------------------------------------------*/
                var map_stop_radius = 5;
                var padding = map_stop_radius;
                var map_marker = layer.selectAll("svg.map_marker")
                    .data(d3.entries(stop_data))
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
                        afterMouseOver(d);
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
    // console.log("highlightStopsAnimate");
    unhighlightAllStops();

    d3.selectAll(".map_stop").classed("fade", true);
    for (var i = 0; i < stopNames.length; i++) {
        var stopName = trimStopName(stopNames[i]);
        d3.selectAll("." + stopName).classed("mouseon", true);
        d3.selectAll("." + stopName + " .map_stop").classed("mouseon", true);
        d3.selectAll("." + stopName + " .map_stop_info").classed("mouseon", true);

        if (i == parseInt(stopNames.length / 2)) {
            var marker = d3.select(".map_marker." + stopName);
            if (marker[0][0] != null)
                map.panTo(new google.maps.LatLng(marker.attr("lat"), marker.attr("lng")));
        }
    }
}

function highlightStopsTextOnlyAnimate(stopNames) {
    // console.log("highlightStopsTextOnlyAnimate");
    unhighlightAllStops();

    d3.selectAll(".map_stop").classed("fade", true);
    for (var i = 0; i < stopNames.length; i++) {
        var stopName = trimStopName(stopNames[i]);
        d3.selectAll("." + stopName).classed("mouseon", true);
        d3.selectAll("." + stopName + " .map_stop").classed("mouseon", true);
        d3.selectAll("." + stopName + " .map_stop_info_text").classed("mouseon", true);

        if (i == parseInt(stopNames.length / 2)) {
            var marker = d3.select(".map_marker." + stopName);
            if (marker[0][0] != null)
                map.panTo(new google.maps.LatLng(marker.attr("lat"), marker.attr("lng")));
        }
    }
}

function highlightStopsCircleOnlyAnimate(stopNames) {
    // console.log("highlightStopsCircleOnlyAnimate");
    unhighlightAllStops();

    d3.selectAll(".map_stop").classed("fade", true);
    for (var i = 0; i < stopNames.length; i++) {
        var stopName = trimStopName(stopNames[i]);
        d3.selectAll("." + stopName).classed("mouseon", true);
        d3.selectAll("." + stopName + " .map_stop").classed("mouseon", true);

        if (i == parseInt(stopNames.length / 2)) {
            var marker = d3.select(".map_marker." + stopName);
            if (marker[0][0] != null)
                map.panTo(new google.maps.LatLng(marker.attr("lat"), marker.attr("lng")));
        }
    }
}

function highlightStops(stopNames) {
    // console.log("highlightStops");
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

function searchAutoComplete(data) {
    var availableTags = [];
    for (key in data) {
        availableTags.push(key);
    }

    $("#search_box").autocomplete({
        source: availableTags,
        select: function(event, ui) {
            $("#search_box").val(ui.item.value);
            $("#search_button").click();
            return false;
        }
    });


}