var feature;

var projection = d3.geo.orthographic()
    .clipAngle(90)
    .scale(300)
    .translate([400, 300]);

var circle = d3.geo.circle()
    .origin(projection.center());

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#body").append("svg:svg")
    .attr("width", 1280)
    .attr("height", 800)
    .on("mousedown", mousedown);

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
		.attr("d", clip)
    .style("fill", "red");
});

window.addEventListener("load", function() {
	var rotation = d3.select("#rotate").node();
	var rotationCallback;
	rotation.onchange = function() {
		if (rotation.checked) {
			rotationCallback = window.setInterval(function() {
				var currentOrigin = projection.origin();
				var newOrigin = currentOrigin.map(function(val) { return val + 1; });
				projection.origin(newOrigin);
				circle.origin(newOrigin);
				refresh();
			}, 100);
		} else {
			clearInterval(rotationCallback);
		}
	}
});

d3.select(window)
    .on("mousemove", mousemove)
    .on("mouseup", mouseup);

d3.select("select").on("change", function() {
  projection.mode(this.value).scale(scale[this.value]);
  refresh(750);
});

var m0,
    o0;

function mousedown() {
  m0 = [d3.event.pageX, d3.event.pageY];
  o0 = projection.center();
  d3.event.preventDefault();
}

function mousemove() {
  if (m0) {
    var m1 = [d3.event.pageX, d3.event.pageY],
        o1 = [o0[0] + (m0[0] - m1[0]) / 8, -o0[1] + (m1[1] - m0[1]) / 8];
    projection.rotate(o1);
    refresh();
  }
}

function mouseup() {
  if (m0) {
    mousemove();
    m0 = null;
  }
}

function refresh(duration) {
	feature.attr("d", path);
	coordinate_system.attr("d", path);
	points.attr("d", path);
}
