var feature;

var w = function() { return document.body.clientWidth },
    h = function() { return document.body.clientHeight };

var projection = d3.geo.orthographic()
    .clipAngle(90)
    .scale(Math.min(w(), h()) / 2);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#body").append("svg:svg");

var countries = svg.append("g").attr('id', 'countries').selectAll("path");
var locations = svg.append("g").attr('id', 'locations').selectAll("path");

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

var points;

function projectedPoint(coll) {
	coll
		.attr("cx", function(d) { return projection(d)[0] })
		.attr("cy", function(d) { return projection(d)[1] })
		.attr("r", 4)
		.style("fill", "red")
		.style("display", pointVisibility);
}

var center = projection.invert([w() / 2, h() / 2]);
function pointVisibility(d) {
	var offset = [Math.abs(d[0] - center[0]), Math.abs(d[1] - center[1])];
	return Math.max(offset[0], offset[1]) > 90 ? 'none' : 'inline';
}

var refreshLocations = function() {
	d3.json("http://localhost:8080/location.json", function(searches) {
		points = d3.select('#locations').selectAll('circle').data(searches);
		points.enter().append('circle')
			.call(projectedPoint);
		points.exit().remove();
	});
}
refreshLocations();
window.setInterval(refreshLocations, 10 * 1000);

window.addEventListener("load", function() {
	var rotationCallback;
	d3.select("#rotate").on("change", function() {
		if (this.checked) {
			rotationCallback = window.setInterval(function() {
				var r = projection.rotate();
				projection.rotate([r[0] + 1, r[1], r[2]]);
				refresh();
			}, 100);
		} else {
			clearInterval(rotationCallback);
		}
	});
	resize();
});

svg.call(d3.behavior.zoom()
	.scale(Math.min(w(), h()) / 2)
	.on("zoom", function() {
		projection.rotate(d3.event.translate);
		refresh();
}));

function refresh(duration) {
	(feature ? feature.attr("d", path) : null);
	(coordinate_system ? coordinate_system.attr("d", path) : null);
	center = projection.invert([w() / 2, h() / 2]);
	(points ? points.call(projectedPoint) : null);
}

function resize() {
	projection.translate([w() / 2, h() / 2]);
	refresh();
}

window.addEventListener("resize", resize);
