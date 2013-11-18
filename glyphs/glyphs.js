// glyphs.js - functions to dynamically generate stop glyphs

// default chart options
var scale_max = 15
var bar_chart_options = {scaleOverride: true, scaleStartValue: 0,
                         scaleStepWidth: 1, scaleSteps: scale_max, scaleFontSize: 10};
var line_chart_options = {scaleOverride: true, scaleStartValue: 0,
                         scaleStepWidth: 1, scaleSteps: scale_max, scaleFontSize: 10}
                     
// sets all future glyphs to have max as the maximum scale value                     
function set_scale_max(max) {
    var tmp = Number(max);
    if (!isNaN(tmp) && tmp > 0) {
        scale_max = tmp;
    }
        
    bar_chart_options.scaleSteps = scale_max;
    line_chart_options.scaleSteps = scale_max;
    
    return scale_max;
}

// helper function to insert chart in html id=target_id
function insert_chart(chart_data, type, width, height, target_id) {
    // create canvas element
    var canv = document.createElement('canvas');
    canv.id = Math.random().toString(36).slice(2);
    canv.height = height;
    canv.width = width;
    document.getElementById(target_id).appendChild(canv); 
    
    // add chart
    var ctx = canv.getContext("2d");
    switch (type) {
    case "bar":
        new Chart(ctx).Bar(chart_data, bar_chart_options);
        break;
    
    case "line":
        new Chart(ctx).Line(chart_data, line_chart_options);
        break;
        
    default:
        throw "Invalid chart type"
    }
    return canv.id;
}
                     
// Create a new bar chart displaying each stop individually.
// Chart will be placed in the HTML element with id=target_id
// Returns the chart's unique id.
// 
// NOTE: data will be displayed *in the order* given by raw_data
function individual_bar_all(raw_data, width, height, target_id) {
    var chart_data = {labels: [],
        datasets: [ {data: [], fillColor: "rgba(0,127,0,.8)", strokeColor: "rgba(0,127,0,0)"},
                    {data: [], fillColor: "rgba(0,0,0,.5)", strokeColor: "rgba(0,0,0,.8)" },
                    {data: [], fillColor: "rgba(127,0,0,.8)", strokeColor: "rgba(127,0,0,0)"} ]};
    
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
        
        chart_data.datasets[1].data.push(val.population);
    } );
    
    return insert_chart(chart_data, "bar", width, height, target_id);
}

// Like individual_bar_all(), but ridership level only
function individual_bar_adhere(raw_data, width, height, target_id) {
    var chart_data = {labels: [], datasets: [ {data: [], fillColor: "rgba(0,127,0,.8" },
                                              {data: [], fillColor: "rgba(127,0,0,.8" } ]};
    
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

// Like individual_bar_all(), but adherence only
function individual_bar_pop(raw_data, width, height, target_id) {
    var chart_data = {labels: [], datasets: [ {data: [], fillColor: "rgba(0,0,0,.8)" } ]};
    
    // format data
    raw_data.forEach(function(val) {
        var time_string = (new Date(Date.parse( val.scheduled ))).toTimeString().slice(0,5)
        chart_data.labels.push( time_string );
        
        chart_data.datasets[0].data.push(val.population);
    } );
    
    return insert_chart(chart_data, "bar", width, height, target_id);
}

// Create a new line chart displaying each stop individually.
// Chart will be placed in the HTML element with id=target_id
// Returns the chart's unique id
// 
// NOTE: data will be displayed *in the order* given by raw_data
function individual_line_all(raw_data, width, height, target_id) {
    var chart_data = {labels: [],
        datasets: [ {data: [], fillColor: "rgba(0,0,0,.7", pointColor: "rgba(0,0,0,1)"},
                    {data: [], fillColor: "rgba(0,127,0,.5)", pointColor: "rgba(0,127,0,0)"},
                    {data: [], fillColor: "rgba(127,0,0,.5", pointColor: "rgba(127,0,0,0)"} ]};
    
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
        
        chart_data.datasets[0].data.push(val.population);
    } );
    
    return insert_chart(chart_data, "line", width, height, target_id);
}
