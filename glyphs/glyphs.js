var sample_rsa = [
    {
        "delta":"194",
        "scheduled":"1980-01-01  17:10:00"
    },
    {
        "delta":"254",
        "scheduled":"1980-01-01  17:14:00"
    },
    {
        "delta":"76",
        "scheduled":"1980-01-01  17:22:00"
    },
    {
        "delta":"2",
        "scheduled":"1980-01-01  17:25:00"
    },
    {
        "delta":"-160",
        "scheduled":"1980-01-01  17:30:00"
    },
    {
        "delta":"-764",
        "scheduled":"1980-01-01  17:55:00"
    },
    {
        "delta":"-764",
        "scheduled":"1980-01-01  17:57:00"
    },
    {
        "delta":"-756",
        "scheduled":"1980-01-01  17:58:00"
    },
    {
        "delta":"-720",
        "scheduled":"1980-01-01  18:01:00"
    },
    {
        "delta":"-714",
        "scheduled":"1980-01-01  18:02:00"
    },
    {
        "delta":"-640",
        "scheduled":"1980-01-01  18:03:00"
    },
    {
        "delta":"-499",
        "scheduled":"1980-01-01  18:05:00"
    },
]

var data = [],
    chart,
    bars,
    margin = 80,
    width = 720, // overall width
    w = 8,       // bar width
    h = 500,     // bar height
    x, y,
    xAxis, yAxis;

sample_rsa.forEach(function(val) {
    var stop = {};
    stop.scheduled = new Date(Date.parse( val.scheduled ));
    stop.delta = Math.abs(parseInt( val.delta, 10 ));
    data.push( stop );
} );

chart = d3.select( 'body' ).append( 'svg' )
    .attr( 'class', 'chart' )
    .attr( 'width', width )
    .attr( 'height', h )
    .append('g');

d3.select('svg g')
    .attr('transform', 'translate(' + margin/2 + ',' + margin/2 + ')');

    
//TODO: change domain and range to use the difference (in minutes) between earliest and latest times in the json provided rather than hardcoding...
x = d3.time.scale()
    .domain( [data[0].scheduled, d3.time.minute.offset( data[data.length - 1].scheduled, 1 ) ] )
    .range( [0, w * 60] )


y = d3.scale.linear()
    .domain( [0, d3.max( data, function( d ) { return d.delta; } )] )
    .rangeRound( [0, h - margin] );

// Bars
bars = chart.append('g')
    .attr('class', 'bars');

bars.selectAll( 'rect' )
    .data( data )
  .enter().append( 'rect' )
    .attr( 'x', function( d, i ) { return x( d.scheduled ) - .5; } )
    .attr( 'y', function( d ) { return (h - margin) - y( d.delta ) + .5 } )
    .attr( 'width', w )
    .attr( 'height', function( d ) { return y( d.delta ) } )
    .append('g');

// Axis
xAxis = d3.svg.axis()
    .scale(x)
    .ticks(20)
    .tickSize(6, 3, 1);

yAxis = d3.svg.axis()
    .scale(d3.scale.linear().domain( [0, d3.max( data, function( d ) { return d.delta; } )] ).rangeRound( [h - margin, 0] ))
    .tickSize(6, 3, 1)
    .orient('right');

chart.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0, ' + (h - margin) + ')')
    .call(xAxis);

chart.append('g')
    .attr('class', 'y axis')
    .attr('transform', 'translate(' + x.range()[1] + ')')
    .call(yAxis);