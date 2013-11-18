# Using Map View

## Dependencies

1. d3
2. google map API
3. jQuery
4. stops.json

## Preliminary

To use map view in in html file, you must include the following lines
somewhere in the body of the page.

    <div id="map"></div>

and access to the internet.

## API
function highlightStops(stopNames) {
        for (var i = 0; i < stopNames.length; i++) {
            var stopName = trimStopName(stopNames[i]);
            d3.select(".map_stop."+stopName).classed("mouseon", true);
            d3.select(".map_stop_name."+stopName).classed("mouseon", true);
        }
    }

    function unhighlightStops(stopNames) {
        for (var i = 0; i < stopNames.length; i++) {
            var stopName = trimStopName(stopNames[i]);
            d3.select(".map_stop."+stopName).classed("mouseon", false);
            d3.select(".map_stop_name."+stopName).classed("mouseon", false);
        }
    }

    function afterClickStop(stopName){
        alert(stopName);
    }
### highlightStops

Highlight Stops.
Input: ["s1", "s2", ...]
Usage: highlightStops(["Airport"]);

### unhighlightStops

Undo Highlight Stops.
Input: ["s1", "s2", ...]
Usage: unhighlightStops(["Airport"]);

### afterClickStop

Called everytime users click on a stop.
Input: d
Usage: alert(""+d.value[0] + "," + d.value[1] + ":" + d.key);
