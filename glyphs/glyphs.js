/**
 * glyphs.js - dynamically generated glyphs
 * 
 * @author Joshua Brule <jtcbrule@gmail.com>
 */

// default chart options
var DEFAULT_WIDTH = 480;
var DEFAULT_HEIGHT = 320;
var scale_max = 15;
var bar_chart_options = {scaleOverride: true, scaleStartValue: 0,
                         scaleStepWidth: 1, scaleSteps: scale_max, scaleFontSize: 10};
var line_chart_options = {scaleOverride: true, scaleStartValue: 0,
                          scaleStepWidth: 1, scaleSteps: scale_max, scaleFontSize: 10};
var radar_chart_options = {scaleOverride: false, scaleStartValue: 0,
                           scaleStepWidth: 1, scaleSteps: scale_max, scaleFontSize: 10};
 
/**
 * helper function; sorts array of objects by key
 */
function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key];
        var y = b[key];

        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

// sets all future glyphs to have max as the maximum scale value                     
function set_scale_max(max) {
    var tmp = Number(max);
    if (!isNaN(tmp) && tmp > 0) {
        scale_max = tmp;
    }
        
    bar_chart_options.scaleSteps = scale_max;
    line_chart_options.scaleSteps = scale_max;
    radar_chart_options.scaleSteps = scale_max;
    
    return scale_max;
}

// helper function to insert chart in html id=target_id
function insert_chart(chart_data, type, width, height, target_id) {
    // create canvas element
    var canv = document.createElement('canvas');
    canv.id = Math.random().toString(36).slice(2);
    canv.height = height;
    canv.width = width;
    
    if (target_id == null) {
        document.body.appendChild(canv);
    } else {
        document.getElementById(target_id).appendChild(canv); 
    }
    
    // add chart
    var ctx = canv.getContext("2d");
    switch (type) {
    case "bar":
        new Chart(ctx).Bar(chart_data, bar_chart_options);
        break;
    
    case "line":
        new Chart(ctx).Line(chart_data, line_chart_options);
        break;
        
    case "radar":
        new Chart(ctx).Radar(chart_data, radar_chart_options);
        break;
        
    default:
        throw "Invalid chart type"
    }
    
    return canv.id;
}
                     
// Create a new bar chart displaying each stop individually.
// Chart will be placed in the HTML element with id=target_id
// Returns the chart's unique id.
function individual_bar_all(raw_data, width, height, target_id) {
    var chart_data = {labels: [],
        datasets: [ {data: [], fillColor: "rgba(0,127,0,.8)", strokeColor: "rgba(0,127,0,0)"},
                    {data: [], fillColor: "rgba(0,0,0,.5)", strokeColor: "rgba(0,0,0,.8)" },
                    {data: [], fillColor: "rgba(127,0,0,.8)", strokeColor: "rgba(127,0,0,0)"} ]};
    
    if (width == null) width = DEFAULT_WIDTH;
    if (height == null) height = DEFAULT_HEIGHT;
    
    sortByKey(raw_data, "scheduled");
    
    // format data
    raw_data.forEach(function(val) {
        var time_string = (new Date(Date.parse( val.scheduled ))).toTimeString().slice(0,5)
        chart_data.labels.push( time_string );
        
        var delta = parseInt(val.delta) / 60.0;
        if (delta < 0) {
            chart_data.datasets[0].data.push(-delta);
            chart_data.datasets[2].data.push(0);
        } else {
            chart_data.datasets[0].data.push(0);
            chart_data.datasets[2].data.push(delta);
        }
        
        chart_data.datasets[1].data.push(Number(val.population));
    } );
    
    return insert_chart(chart_data, "bar", width, height, target_id);
}

// Like individual_bar_all(), adherence only
function individual_bar_adhere(raw_data, width, height, target_id) {
    var chart_data = {labels: [], datasets: [ {data: [], fillColor: "rgba(0,127,0,.8)" },
                                              {data: [], fillColor: "rgba(127,0,0,.8)" } ]};
    
    if (width == null) width = DEFAULT_WIDTH;
    if (height == null) height = DEFAULT_HEIGHT;
    
    sortByKey(raw_data, "scheduled");
    
    // format data
    raw_data.forEach(function(val) {
        var time_string = (new Date(Date.parse( val.scheduled ))).toTimeString().slice(0,5)
        chart_data.labels.push( time_string );
        
        var delta = parseInt(val.delta) / 60.0;
        if (delta < 0) {
            chart_data.datasets[0].data.push(-delta);
            chart_data.datasets[1].data.push(0);
        } else {
            chart_data.datasets[0].data.push(0);
            chart_data.datasets[1].data.push(delta);
        }
    } );
    
    return insert_chart(chart_data, "bar", width, height, target_id);
}

// Like individual_bar_all(), but ridership only
function individual_bar_pop(raw_data, width, height, target_id) {
    var chart_data = {labels: [], datasets: [ {data: [], fillColor: "rgba(0,0,0,.8)" } ]};
    
    if (width == null) width = DEFAULT_WIDTH;
    if (height == null) height = DEFAULT_HEIGHT;
    
    sortByKey(raw_data, "scheduled");
    
    // format data
    raw_data.forEach(function(val) {
        var time_string = (new Date(Date.parse( val.scheduled ))).toTimeString().slice(0,5)
        chart_data.labels.push( time_string );
        
        chart_data.datasets[0].data.push(Number(val.population));
    } );
    
    return insert_chart(chart_data, "bar", width, height, target_id);
}

// Create a new line chart displaying each stop individually.
// Chart will be placed in the HTML element with id=target_id
// Returns the chart's unique id
function individual_line_all(raw_data, width, height, target_id) {
    var chart_data = {labels: [],
        datasets: [ {data: [], fillColor: "rgba(0,0,0,.5", pointColor: "rgba(0,0,0,.8)"},
                    {data: [], fillColor: "rgba(0,127,0,.5)", pointColor: "rgba(0,127,0,0)"},
                    {data: [], fillColor: "rgba(127,0,0,.5", pointColor: "rgba(127,0,0,0)"} ]};
    
    if (width == null) width = DEFAULT_WIDTH;
    if (height == null) height = DEFAULT_HEIGHT;
    
    sortByKey(raw_data, "scheduled");
    
    // format data
    raw_data.forEach(function(val) {
        var time_string = (new Date(Date.parse( val.scheduled ))).toTimeString().slice(0,5)
        chart_data.labels.push( time_string );
        
        var delta = parseInt(val.delta) / 60.0;
        if (delta < 0) {
            chart_data.datasets[1].data.push(-delta);
            chart_data.datasets[2].data.push(0);
        } else {
            chart_data.datasets[1].data.push(0);
            chart_data.datasets[2].data.push(delta);
        }
        
        chart_data.datasets[0].data.push(Number(val.population));
    } );
    
    return insert_chart(chart_data, "line", width, height, target_id);
}

// Create a new bar chart displaying aggregate data
// Stop data is bucketed by hour (truncated) and adherence/ridership is averaged
// Hours displayed are [min_hour, max_hour)
// Chart will be placed in the HTML element with id=target_id
// Returns the chart's unique id
function aggregate_bar_all(raw_data, width, height, target_id, min_hour, max_hour) {
    var empty = new Array(24+1).join('0').split('').map(parseFloat);

    var chart_data = {
        labels: ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11",
                 "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"],
        datasets: [{data: empty.slice(0), fillColor: "rgba(0,127,0,.5)", strokeColor: "rgba(0,127,0,0)"},
                   {data: empty.slice(0), fillColor: "rgba(0,0,0,.5)", strokeColor: "rgba(0,0,0,.8)"},
                   {data: empty.slice(0), fillColor: "rgba(127,0,0,.5)", strokeColor: "rgba(127,0,0,0)"} ]};
    
    if (width == null) width = DEFAULT_WIDTH;
    if (height == null) height = DEFAULT_HEIGHT;
    
    sortByKey(raw_data, "scheduled");
    
    var bucket_count = empty.slice(0);
    
    // format data
    raw_data.forEach(function(val) {
        var hour = (new Date(Date.parse( val.scheduled ))).getHours();
        
        var delta = parseInt(val.delta) / 60.0;
        if (delta < 0) {
            chart_data.datasets[0].data[hour] += -delta;
        } else {
            chart_data.datasets[2].data[hour] += delta;
        }
        
        chart_data.datasets[1].data[hour] += Number(val.population);
        
        bucket_count[hour] += 1;
    } );
    
    // average each bucket (hour)
    for (var i = 0; i < 24; i++) {
        if (bucket_count[i] == 0) continue;
        
        chart_data.datasets[0].data[i] /= bucket_count[i];
        chart_data.datasets[1].data[i] /= bucket_count[i];
        chart_data.datasets[2].data[i] /= bucket_count[i];
    }
    
    // slice the hours we want
    if (min_hour == null) min_hour = 0;
    if (max_hour == null) max_hour = 24;
    if (min_hour != 0 || max_hour != 24) {
        chart_data.labels = chart_data.labels.slice(min_hour, max_hour);
        chart_data.datasets[0].data = chart_data.datasets[0].data.slice(min_hour, max_hour);
        chart_data.datasets[1].data = chart_data.datasets[1].data.slice(min_hour, max_hour);
        chart_data.datasets[2].data = chart_data.datasets[2].data.slice(min_hour, max_hour);
    }
    
    return insert_chart(chart_data, "bar", width, height, target_id);
}
