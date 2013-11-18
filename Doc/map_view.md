# Using Map View

# Class and ID prefix: map_

## Dependencies

1. d3
2. google map API

## Data Files

1. stops.json

## Preliminary

To use map view in in html file, you must include the following lines
somewhere in the body of the page.

    <div id="map_id"></div>

and access to the internet.

## API

### highlightStops

Highlight Stops.
Input: ["s1", "s2", ...]
Usage: highlightStops(["Airport"]);

	function highlightStops(stopNames) {
	    for (var i = 0; i < stopNames.length; i++) {
	        var stopName = trimStopName(stopNames[i]);
	        d3.select(".map_marker." + stopName).classed("mouseon", true);
	        d3.select(".map_marker." + stopName + " .map_stop").classed("mouseon", true);
	        d3.select(".map_marker." + stopName + " .map_stop_name").classed("mouseon", true);
	    }
	}

### unhighlightStops

Undo Highlight Stops.
Input: ["s1", "s2", ...]
Usage: unhighlightStops(["Airport"]);

	function unhighlightStops(stopNames) {
	    for (var i = 0; i < stopNames.length; i++) {
	        var stopName = trimStopName(stopNames[i]);
	        d3.select(".map_marker." + stopName).classed("mouseon", false);
	        d3.select(".map_marker." + stopName + " .map_stop").classed("mouseon", false);
	        d3.select(".map_marker." + stopName + " .map_stop_name").classed("mouseon", false);
	    }
	}

### afterClickStop

Called everytime users click on a stop.
Input: d
Usage: alert(""+d.value[0] + "," + d.value[1] + ":" + d.key);
	
	function afterClickStop(d) {
	    alert(""+d.value[0] + "," + d.value[1] + ":" + d.key);
	}
