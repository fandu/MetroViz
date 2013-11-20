/**
 * glyphs.js - dynamically generated glyphs
 * 
 * Color code:
 * green - minutes early
 * red - minutes late
 * gray/black - fare count at stop
 *
 * Notes:
 * Every chart function targets an html id
 * Every chart function returns the chart's unique id for later removal
 * Chart functions obey the following name convention:
 *
 * [aggregate|individual]_[line|radar|bar]_[all|adhere|pop]()
 *
 * (data, width, height, height, target_id, [min_hour, max_hour])
 *
 * Aggregate charts bucket by hour, individual charts display every stop
 *
 * Every parameter except data is optional, defaults will be used as necessary.
 * 
 * @author Joshua Brule <jtcbrule@gmail.com>
 */

// JSON attribute names
var SCHEDULED = "scheduled";
var DELTA = "delta";
var POPULATION = "population";

// default chart options
var DEFAULT_WIDTH = 480;
var DEFAULT_HEIGHT = 320;
var scale_max = 15;
var bar_chart_options = {scaleOverride: true, scaleStartValue: 0,
                         scaleStepWidth: 1, scaleSteps: scale_max, scaleFontSize: 10};
var line_chart_options = {scaleOverride: true, scaleStartValue: 0,
                          scaleStepWidth: 1, scaleSteps: scale_max, scaleFontSize: 10};
var radar_chart_options = {scaleOverride: true, scaleStartValue: 0,
                           scaleStepWidth: 1, scaleSteps: scale_max, scaleFontSize: 10};
 
/**
 * Sort array of objects by key.
 */
function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key];
        var y = b[key];

        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

/**
 * Sets all future glyphs to have max as the maximum scale value.
 */             
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

/**
 * Insert chart in html element with id=target_id (helper function)
 */  
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
                     
/**
 * Create a new bar chart displaying each stop individually.
 * Chart will be placed in the HTML element with id=target_id
 * Returns the chart's unique id.
 */  
function individual_bar_all(raw_data, width, height, target_id) {
    var chart_data = {labels: [],
        datasets: [ {data: [], fillColor: "rgba(0,127,0,.8)", strokeColor: "rgba(0,127,0,0)"},
                    {data: [], fillColor: "rgba(0,0,0,.5)", strokeColor: "rgba(0,0,0,.8)" },
                    {data: [], fillColor: "rgba(127,0,0,.8)", strokeColor: "rgba(127,0,0,0)"} ]};
    
    if (width == null) width = DEFAULT_WIDTH;
    if (height == null) height = DEFAULT_HEIGHT;
    
    sortByKey(raw_data, SCHEDULED);
    
    // format data
    raw_data.forEach(function(val) {
        var time_string = (new Date(Date.parse( val[SCHEDULED] ))).toTimeString().slice(0,5)
        chart_data.labels.push( time_string );
        
        var delta = parseInt(val[DELTA]) / 60.0;
        if (delta < 0) {
            chart_data.datasets[0].data.push(-delta);
            chart_data.datasets[2].data.push(0);
        } else {
            chart_data.datasets[0].data.push(0);
            chart_data.datasets[2].data.push(delta);
        }
        
        chart_data.datasets[1].data.push(Number(val[POPULATION]));
    } );
    
    return insert_chart(chart_data, "bar", width, height, target_id);
}

/**
 * Like individual_bar_all(), adherence only.
 */
function individual_bar_adhere(raw_data, width, height, target_id) {
    var chart_data = {labels: [], datasets: [ {data: [], fillColor: "rgba(0,127,0,.8)" },
                                              {data: [], fillColor: "rgba(127,0,0,.8)" } ]};
    
    if (width == null) width = DEFAULT_WIDTH;
    if (height == null) height = DEFAULT_HEIGHT;
    
    sortByKey(raw_data, SCHEDULED);
    
    // format data
    raw_data.forEach(function(val) {
        var time_string = (new Date(Date.parse( val[SCHEDULED] ))).toTimeString().slice(0,5)
        chart_data.labels.push( time_string );
        
        var delta = parseInt(val[DELTA]) / 60.0;
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

/**
 * Like individual_bar_all(), but ridership only.
 */
function individual_bar_pop(raw_data, width, height, target_id) {
    var chart_data = {labels: [], datasets: [ {data: [], fillColor: "rgba(0,0,0,.8)" } ]};
    
    if (width == null) width = DEFAULT_WIDTH;
    if (height == null) height = DEFAULT_HEIGHT;
    
    sortByKey(raw_data, SCHEDULED);
    
    // format data
    raw_data.forEach(function(val) {
        var time_string = (new Date(Date.parse( val[SCHEDULED] ))).toTimeString().slice(0,5)
        chart_data.labels.push( time_string );
        
        chart_data.datasets[0].data.push(Number(val[POPULATION]));
    } );
    
    return insert_chart(chart_data, "bar", width, height, target_id);
}


/**
 * Create a new line chart displaying each stop individually.
 * Chart will be placed in the HTML element with id=target_id
 * Returns the chart's unique id
 */
function individual_line_all(raw_data, width, height, target_id) {
    var chart_data = {labels: [],
        datasets: [ {data: [], fillColor: "rgba(0,0,0,.5)", pointColor: "rgba(0,0,0,.8)",
                     pointStrokeColor: "rgba(0,0,0,0)"},
                    {data: [], fillColor: "rgba(0,127,0,.5)", pointColor: "rgba(0,127,0,0)",
                     pointStrokeColor: "rgba(0,0,0,0)"},
                    {data: [], fillColor: "rgba(127,0,0,.5)", pointColor: "rgba(127,0,0,0)",
                     pointStrokeColor: "rgba(0,0,0,0)"} ]};
    
    if (width == null) width = DEFAULT_WIDTH;
    if (height == null) height = DEFAULT_HEIGHT;
    
    sortByKey(raw_data, SCHEDULED);
    
    // format data
    raw_data.forEach(function(val) {
        var time_string = (new Date(Date.parse( val[SCHEDULED] ))).toTimeString().slice(0,5)
        chart_data.labels.push( time_string );
        
        var delta = parseInt(val[DELTA]) / 60.0;
        if (delta < 0) {
            chart_data.datasets[1].data.push(-delta);
            chart_data.datasets[2].data.push(0);
        } else {
            chart_data.datasets[1].data.push(0);
            chart_data.datasets[2].data.push(delta);
        }
        
        chart_data.datasets[0].data.push(Number(val[POPULATION]));
    } );
    
    return insert_chart(chart_data, "line", width, height, target_id);
}

/**
 * Create a new line chart displaying aggregate data.
 * Stop data is bucketed by hour (truncated) and adherence/ridership is averaged
 * Hours displayed are [min_hour, max_hour)
 * Chart will be placed in the HTML element with id=target_id
 * Returns the chart's unique id
 */
function aggregate_line_all(raw_data, width, height, target_id, min_hour, max_hour) {
    var empty = new Array(24+1).join('0').split('').map(parseFloat);

    var chart_data = {
        labels: ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11",
                 "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"],
        datasets: [ {data: empty.slice(0), fillColor: "rgba(0,0,0,.5)", pointColor: "rgba(0,0,0,.8)",
                     pointStrokeColor: "rgba(0,0,0,0)"},
                    {data: empty.slice(0), fillColor: "rgba(0,127,0,.5)", pointColor: "rgba(0,127,0,0)",
                     pointStrokeColor: "rgba(0,0,0,0)"},
                    {data: empty.slice(0), fillColor: "rgba(127,0,0,.5)", pointColor: "rgba(127,0,0,0)",
                     pointStrokeColor: "rgba(0,0,0,0)"} ]};
    
    if (width == null) width = DEFAULT_WIDTH;
    if (height == null) height = DEFAULT_HEIGHT;
    
    sortByKey(raw_data, SCHEDULED);
    
    var bucket_count = empty.slice(0);
    
    // format data
    raw_data.forEach(function(val) {
        var hour = (new Date(Date.parse( val[SCHEDULED] ))).getHours();
        
        var delta = parseInt(val[DELTA]) / 60.0;
        if (delta < 0) {
            chart_data.datasets[1].data[hour] += -delta;
        } else {
            chart_data.datasets[2].data[hour] += delta;
        }
        
        chart_data.datasets[0].data[hour] += Number(val[POPULATION]);
        
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
    
    return insert_chart(chart_data, "line", width, height, target_id);
}

/**
 * Like aggreagate_line_all, but with adherence data only.
 */
function aggregate_line_adhere(raw_data, width, height, target_id, min_hour, max_hour) {
    var empty = new Array(24+1).join('0').split('').map(parseFloat);

    var chart_data = {
        labels: ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11",
                 "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"],
        datasets: [ {data: empty.slice(0), fillColor: "rgba(0,127,0,.5)", pointColor: "rgba(0,127,0,0)",
                     pointStrokeColor: "rgba(0,0,0,0)"},
                    {data: empty.slice(0), fillColor: "rgba(127,0,0,.5)", pointColor: "rgba(127,0,0,0)",
                     pointStrokeColor: "rgba(0,0,0,0)"} ]};
    
    if (width == null) width = DEFAULT_WIDTH;
    if (height == null) height = DEFAULT_HEIGHT;
    
    sortByKey(raw_data, SCHEDULED);
    
    var bucket_count = empty.slice(0);
    
    // format data
    raw_data.forEach(function(val) {
        var hour = (new Date(Date.parse( val[SCHEDULED] ))).getHours();
        
        var delta = parseInt(val[DELTA]) / 60.0;
        if (delta < 0) {
            chart_data.datasets[0].data[hour] += -delta;
        } else {
            chart_data.datasets[1].data[hour] += delta;
        }
        
        bucket_count[hour] += 1;
    } );
    
    // average each bucket (hour)
    for (var i = 0; i < 24; i++) {
        if (bucket_count[i] == 0) continue;
        
        chart_data.datasets[0].data[i] /= bucket_count[i];
        chart_data.datasets[1].data[i] /= bucket_count[i];
    }
    
    // slice the hours we want
    if (min_hour == null) min_hour = 0;
    if (max_hour == null) max_hour = 24;
    if (min_hour != 0 || max_hour != 24) {
        chart_data.labels = chart_data.labels.slice(min_hour, max_hour);
        chart_data.datasets[0].data = chart_data.datasets[0].data.slice(min_hour, max_hour);
        chart_data.datasets[1].data = chart_data.datasets[1].data.slice(min_hour, max_hour);
    }
    
    return insert_chart(chart_data, "line", width, height, target_id);
}

/**
 * Create a new bar chart displaying aggregate data.
 * Stop data is bucketed by hour (truncated) and adherence/ridership is averaged
 * Hours displayed are [min_hour, max_hour)
 * Chart will be placed in the HTML element with id=target_id
 * Returns the chart's unique id
 */
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
    
    sortByKey(raw_data, SCHEDULED);
    
    var bucket_count = empty.slice(0);
    
    // format data
    raw_data.forEach(function(val) {
        var hour = (new Date(Date.parse( val[SCHEDULED] ))).getHours();
        
        var delta = parseInt(val[DELTA]) / 60.0;
        if (delta < 0) {
            chart_data.datasets[0].data[hour] += -delta;
        } else {
            chart_data.datasets[2].data[hour] += delta;
        }
        
        chart_data.datasets[1].data[hour] += Number(val[POPULATION]);
        
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


/**
 * Create a new radar chart displaying aggregate data.
 * Stop data is bucketed by hour (truncated) and adherence/ridership is averaged
 * Hours displayed are [min_hour, max_hour)
 * Chart will be placed in the HTML element with id=target_id
 * Returns the chart's unique id
 */
function aggregate_radar_all(raw_data, width, height, target_id) {
    var empty = new Array(24+1).join('0').split('').map(parseFloat);

    var chart_data = {
        labels: ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11",
                 "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"],
        datasets: [{data: empty.slice(0), fillColor: "rgba(0,0,0,.5)", pointColor: "rgba(0,0,0,0)",
                    strokeColor: "rgba(0,0,0,.5)", pointStrokeColor: "rgba(0,0,0,0)"},
                   {data: empty.slice(0), fillColor: "rgba(0,127,0,.5)", pointColor: "rgba(0,0,0,0)",
                    strokeColor: "rgba(0,127,0,.5)", pointStrokeColor: "rgba(0,127,0,0)"},
                   {data: empty.slice(0), fillColor: "rgba(127,0,0,.5)", pointColor: "rgba(127,0,0,0)",
                    strokeColor: "rgba(127,0,0,.5)", pointStrokeColor: "rgba(127,0,0,0)"} ]};
    
    if (width == null) width = DEFAULT_WIDTH;
    if (height == null) height = DEFAULT_HEIGHT;
    
    sortByKey(raw_data, SCHEDULED);
    
    var bucket_count = empty.slice(0);
    
    // format data
    raw_data.forEach(function(val) {
        var hour = (new Date(Date.parse( val[SCHEDULED] ))).getHours();
        
        var delta = parseInt(val[DELTA]) / 60.0;
        if (delta < 0) {
            chart_data.datasets[1].data[hour] += -delta;
        } else {
            chart_data.datasets[2].data[hour] += delta;
        }
        
        chart_data.datasets[0].data[hour] += Number(val[POPULATION]);
        
        bucket_count[hour] += 1;
    } );
    
    // average each bucket (hour)
    for (var i = 0; i < 24; i++) {
        if (bucket_count[i] == 0) continue;
        
        chart_data.datasets[0].data[i] /= bucket_count[i];
        chart_data.datasets[1].data[i] /= bucket_count[i];
        chart_data.datasets[2].data[i] /= bucket_count[i];
    }

    return insert_chart(chart_data, "radar", width, height, target_id);
}

/**
 * Like aggregate_radar_all, adherence only.
 */
function aggregate_radar_adhere(raw_data, width, height, target_id) {
    var empty = new Array(24+1).join('0').split('').map(parseFloat);

    var chart_data = {
        labels: ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11",
                 "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"],
        datasets: [{data: empty.slice(0), fillColor: "rgba(0,127,0,.5)", pointColor: "rgba(0,127,0,.5)",
                    strokeColor: "rgba(0,127,0,.5)", pointStrokeColor: "rgba(0,127,0,0)"},
                   {data: empty.slice(0), fillColor: "rgba(127,0,0,.5)", pointColor: "rgba(127,0,0,.5)",
                    strokeColor: "rgba(127,0,0,.5)", pointStrokeColor: "rgba(127,0,0,0)"} ]};
    
    if (width == null) width = DEFAULT_WIDTH;
    if (height == null) height = DEFAULT_HEIGHT;
    
    sortByKey(raw_data, SCHEDULED);
    
    var bucket_count = empty.slice(0);
    
    // format data
    raw_data.forEach(function(val) {
        var hour = (new Date(Date.parse( val[SCHEDULED] ))).getHours();
        
        var delta = parseInt(val[DELTA]) / 60.0;
        if (delta < 0) {
            chart_data.datasets[0].data[hour] += -delta;
        } else {
            chart_data.datasets[1].data[hour] += delta;
        }
        
        bucket_count[hour] += 1;
    } );
    
    // average each bucket (hour)
    for (var i = 0; i < 24; i++) {
        if (bucket_count[i] == 0) continue;
        
        chart_data.datasets[0].data[i] /= bucket_count[i];
        chart_data.datasets[1].data[i] /= bucket_count[i];
    }

    return insert_chart(chart_data, "radar", width, height, target_id);
}

/**
 * Like aggregate_radar_all, ridership only.
 */
function aggregate_radar_pop(raw_data, width, height, target_id) {
    var empty = new Array(24+1).join('0').split('').map(parseFloat);

    var chart_data = {
        labels: ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11",
                 "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"],
        datasets: [{data: empty.slice(0), fillColor: "rgba(0,0,0,.5)", pointColor: "rgba(0,0,0,.5)",
                    strokeColor: "rgba(0,0,0,.5)", pointStrokeColor: "rgba(0,0,0,0)"}] };
    
    if (width == null) width = DEFAULT_WIDTH;
    if (height == null) height = DEFAULT_HEIGHT;
    
    sortByKey(raw_data, SCHEDULED);
    
    var bucket_count = empty.slice(0);
    
    // format data
    raw_data.forEach(function(val) {
        var hour = (new Date(Date.parse( val[SCHEDULED] ))).getHours();
        
        chart_data.datasets[0].data[hour] += Number(val[POPULATION]);
        
        bucket_count[hour] += 1;
    } );
    
    // average each bucket (hour)
    for (var i = 0; i < 24; i++) {
        if (bucket_count[i] == 0) continue;
        
        chart_data.datasets[0].data[i] /= bucket_count[i];
    }

    return insert_chart(chart_data, "radar", width, height, target_id);
}

