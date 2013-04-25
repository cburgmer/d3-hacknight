var feature;

var w = function() { return document.body.clientWidth },
    h = function() { return document.body.clientHeight };

var projection = d3.geo.orthographic()
    .clipAngle(90)
    .scale(Math.min(w(), h()) / 2);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#body").append("svg:svg");
resize();

var countries = svg.append("g").selectAll("path");
var locations = svg.append("g").selectAll("path");

d3.json("world-countries.json", function(collection) {
  feature = countries
      .data(collection.features)
    .enter().append("svg:path")
      .attr("d", path);

  feature.append("svg:title")
      .text(function(d) { return d.properties.name; });
});

var coordinate_system = svg.append("g").append("path")
	.datum(d3.geo.graticule())
	.attr("class", "graticule")
	.attr("d", path);

to_geojson = function(d) {
	return { type: "Feature", geometry: { type: "Point", coordinates: d.location }, id: d.url };
}

var points;

d3.json("data/searches.json", function(searches) {
	points = locations.data(searches.slice(0, 1000).filter(function(d){return d.location;}).map(to_geojson))
	.enter().append("svg:path")
		.attr("d", path)
    .style("fill", "red");
});

window.addEventListener("load", function() {
	var rotationCallback;
	d3.select("#rotate").on("change", function() {
		if (this.checked) {
			rotationCallback = window.setInterval(function() {
				projection.rotate([projection.rotate()[0] + 1, 0]);
				refresh();
			}, 100);
		} else {
			clearInterval(rotationCallback);
		}
	});
});

svg.call(d3.behavior.drag()
	.on("drag", function() {
		var p = projection.invert([d3.event.x, d3.event.y]);
		projection.rotate([-p[0] / 4, -p[1] / 4]);
		refresh();
}));

svg.call(d3.behavior.zoom()
	.scale(Math.min(w(), h()) / 2)
	.on("zoom", function() {
		projection.scale(d3.event.scale);
		refresh();
}));

function refresh(duration) {
	(feature ? feature.attr("d", path) : null);
	(coordinate_system ? coordinate_system.attr("d", path) : null);
	(points ? points.attr("d", path) : null);
}

function resize() {
	projection.translate([w() / 2, h() / 2]);
	refresh();
}

window.addEventListener("resize", resize);
