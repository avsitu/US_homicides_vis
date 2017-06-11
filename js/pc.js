var m = [100, 40, 50, 300],
  w = 1500 - m[1] - m[3],
  h = 600 - m[0] - m[2];
var line = d3.line();
var dragging = {};
var x2 = d3.scaleBand().range([0, w]);
var y2 = {};

var svg2 = d3.select('.pc')
  .attr("width", w + m[1] + m[3])
  .attr("height", h + m[0] + m[2]).append("g")
  .attr("transform", "translate(" + 20 + "," + 50 + ")");

var background;
var foreground = svg2.append('g')
  .attr('width', w)
  .attr('height', h);;

var legend2 = d3.select('.pc').append('g').attr('class', 'legend2').attr('transform', 'translate(1050,-430)'); 
var colors2 = ["#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"];
var first = true;

function pc(data) {
	// d3.csv(fn, myfilter, function(data) { 
	// 	var axis = d3.axisLeft();
	br_min = d3.min(data, function(p) { return p['bedrooms']; });
		br_max = d3.max(data, function(p) { return p['bedrooms']; });

	// Extract the list of dimensions and create a scale for each.
	x2.domain(dimensions = d3.keys(data[0]).filter(function(d) {
			if(d == 'yr_sold' || d == 'mo_sold') return false;
			else {
		  y2[d] = d3.scaleLinear().domain([d3.min(data, function(p) { return p[d]; }),d3.max(data, function(p) { return p[d]; })])
		  	.range([h, 0]); 
		  	return true;
		  } 	
		}
	));
	price_color = d3.scaleQuantile()
	.domain([d3.min(data, function(d) { return d.price; }),d3.max(data, function(d) { return d.price; })])
	.range(colors2);

	update = foreground.selectAll("path")
	  .data(data);	

	  update.exit().transition().duration(1000)
      .style("opacity", 0).remove();
	  
	  update.enter().append("path").merge(update).attr("class", "enter").attr('fill','none').attr('stroke-width',1.5)
		.attr("d", path).attr('stroke', function(d) {return price_color(d.price)}).style('opacity',0)
		.transition().duration(1000)
      .style("opacity", 1);

 	labels = ['Lot Area (sq. feet)', 'Living Area(sq. feet)', 'Bedrooms', 'Year Built', 'Sale Price'];
 	if(first) {
 		for(var d=0; d < dimensions.length; d++) {
	 		svg2.append('g').attr('class', "axis"+d)
	 		.attr("transform", function() {
    	return "translate(" + x2(dimensions[d]) + ")"; });
	 		if (labels[d] == 'Bedrooms') {
	 			// console.log(br_min+' '+br_max);
				d3.select('.axis'+d).call(d3.axisRight(y2[dimensions[d]]))
				.append("svg:text")
			  .attr("y", -9).attr('fill','black')
		  	.text(labels[d]);
	 		}
	 		else { 			
				d3.select('.axis'+d).call(d3.axisRight(y2[dimensions[d]]))
				.append("svg:text")
			  .attr("y", -9).attr('fill','black')
		  	.text(labels[d]);
	 		}
 		}
	 	first = false;
 	}
 	else {
 		for(var d=0; d < dimensions.length; d++) {
 			if(labels[d] == 'Bedrooms') {
 				// console.log(br_min+' '+br_max);
 				d3.select('.axis'+d).transition().duration(1000).call(d3.axisRight(y2[dimensions[d]]));
 			}
			else
				d3.select('.axis'+d).transition().duration(1000).call(d3.axisRight(y2[dimensions[d]]));
 		}
 	}

 	update2 = legend2.selectAll("text")
        .data([0].concat(price_color.quantiles()), function(d) { return d; });
	update2.exit().remove();
  	update2.enter().append("text").merge(update2)
      .attr("x", function(d, i) { return 70 * i + 5; })
      .attr("y", h + 65)  
      .text(function(d) { 
      	val = Math.round(d).toString();
      	if(val.length>=6) val = val.slice(0,3)+'k';
      	else if(val.length==5) val = val.slice(0,2)+'k';
      	return " >= $" + val; });
 	update3 = legend2.selectAll("rect")
        .data([0].concat(price_color.quantiles()), function(d) { return d; });        
	update3.exit().remove();
	update3.enter().append("rect").merge(update3)
	      .attr("x", function(d, i) { return 70 * i; })
	      .attr("y", h + 20)
	      .attr("width", 70)
	      .attr("height", 30)
	      .style("fill", function(d, i) { return colors2[i]; });   
	// legend2.append('g').append('text').text('Sales Price:').attr('x',-20).attr('transform','translate(-60,510)');
       
};	

function position(d) {
  var v = dragging[d];
  return x2(d);
}

function transition(g) {
  return g.transition().duration(500);
}

// Returns the path for a given data point.
function path(d) {
  return line(dimensions.map(function(p) {
    return [position(p), y2[p](d[p])];
  }));
}	

function myfilter(d) {
	return {
		bedrooms: +d.BedroomAbvGr,
		lot_area: +d.LotArea,
		quality: +d.OverallQual,
		built: +d.YearBuilt,
		price: +d.SalePrice
	};
}

// pc(data[0]);
// i = 0
// d3.select('.button').on('click', function() {
// 	if(i == 0) i = 1;
// 	else i = 0;
// 	pc(data[i]);
// })