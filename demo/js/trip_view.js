function truncate(str, maxLength, suffix) {
	if(str.length > maxLength) {
		str = str.substring(0, maxLength + 1); 
		str = str.substring(0, Math.min(str.length, str.lastIndexOf(" ")));
		str = str + suffix;
	}
	return str;
}

var margin = {top: 20, right: 200, bottom: 0, left: 20},
	width = 300,
	height = 650;

var start_year = 2004,
	end_year = 2013;

var c = d3.scale.category20c();

var x = d3.scale.linear()
	.range([0, width]);

/* Using fake data for now */

var stops = ["Squires West", "Main Red / Maple Nbnd", "Squires East", "Fairfax Ellett Nbnd"];
var fake_data = [];

for (var i = 0; i < 10; i++) {
    var time = 0,
        actual = 0;
    for (var j = 0; j < stops.length; j++) {
        time += Math.floor(Math.random() * 100)
        actual += Math.floor(Math.random()  * 100);
        fake_data.push({
                    "trip": i,
                    "stop": stops[j],
                    "scheduled": time,
                    "actual": actual,
                    "passengers": Math.floor(Math.random() * 50)
                });
    }
}

/* End fake data generation */

var xAxis;
var svg = d3.select("body").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.style("margin-left", margin.left + "px")
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var updateTripView = function (data) {
    var stops = [];
    for (var i = 0; i < data.length; i++) {
        if (stops.indexOf(data[i]["stop"]) == -1) {
            stops.push(data[i]["stop"]);
        }
    }
    console.log(stops);

    x = d3.scale.ordinal()
        .domain(stops)
        .range(_.range(stops.length));

    xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("top");

    d3.selectAll(".journal").remove();

    data = d3.nest()
        .key(function (d) { return d["trip"]; })
        .map(data);

    console.log(data);

	var xScale = d3.scale.linear()
		.domain([x(stops[0]), x(stops[stops.length - 1])])
		.range([0, width]);

    var abbr = function (str) {
        var words = str.split(' ');
        return words.map(function (word) { return word[0]; }).join('');
    }

	var g = svg.append("g").attr("class","journal");
	var text = g.selectAll("text")
		.data(stops)
		.enter()
		.append("text");
	text
		.attr("y", 0)
		.attr("x",function(d, i) { return 50 + xScale(x(d))-5; })
		.attr("class","value")
        .style("fill", function () { return d3.hsl("#4A4A4A"); })
		.text(function(d){ return abbr(d); });

	for (trip_no in data) {
        var trip = data[trip_no];
		var g = svg.append("g").attr("class","journal");

		var circles = g.selectAll("circle")
			.data(trip)
			.enter()
			.append("circle");

		var text = g.selectAll("text")
			.data(trip)
			.enter()
			.append("text");

		var rScale = d3.scale.linear()
			.domain([0, d3.max(trip, function(d) { return Math.abs(d.scheduled - d.actual); })])
			.range([2, 9]);

        var circleFill = function (d) {
			return d3.hsl(0, d.passengers / 50, 0.7);
        }

		circles
			.attr("cx", function(d, i) { return 50 + xScale(x(d.stop)); })
			.attr("cy", trip_no*20+20)
			.attr("r", function(d) { return rScale(Math.abs(d.scheduled - d.actual)); })
			.style("fill", circleFill);

		text
			.attr("y", trip_no*20+25)
			.attr("x",function(d, i) { return 50 + xScale(x(d.stop))-5; })
			.attr("class","value")
			.text(function(d){ return d.passengers; })
			.style("fill", circleFill)
			.style("display","none");

		g.append("text")
			.attr("y", trip_no*20+25)
			.attr("x", 0)
			.attr("class","label")
			.text(truncate("Trip " + trip_no,30,"..."))
			.style("fill", function(d) { return d3.hsl("#4A4A4A"); })
			.on("mouseover", mouseover)
			.on("mouseout", mouseout);
	};

	function mouseover(p) {
		var g = d3.select(this).node().parentNode;
		d3.select(g).selectAll("circle").style("display","none");
		d3.select(g).selectAll("text.value").style("display","block");
	}

	function mouseout(p) {
		var g = d3.select(this).node().parentNode;
		d3.select(g).selectAll("circle").style("display","block");
		d3.select(g).selectAll("text.value").style("display","none");
	}
};


