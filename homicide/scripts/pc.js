var pcm = [100, 40, 50, 300],
  pcw = 1700 - pcm[1] - pcm[3],
  pch = 800 - pcm[0] - pcm[2];
var pcline = d3.line();
var pcdragging = {};
var pcx2 = d3.scaleBand().range([0, pcw]);
var pcy2 = {};

var pcsvg2 = d3.select('.pc')
  .attr("width", pcw + pcm[1] + pcm[3])
  .attr("height", pch + pcm[0] + pcm[2]).append("g")
  .attr("transform", "translate(" + 150 + "," + 50 + ")");

var pcbackground = pcsvg2.append('g').attr('class', 'background')
  .attr('width', pcw)
  .attr('height', pch);
var pcforeground = pcsvg2.append('g').attr('class', 'foreground')
  .attr('width', pcw)
  .attr('height', pch);;

var pclegend2 = d3.select('.pc').append('g').attr('class', 'legend2').attr('transform', 'translate(1050,-430)'); 
var pccolors2 = ["#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"];
var pcfirst = true;
var dimensions;

if(stateFilter.length == 1 && timeFilter.length == 1){
	updatePC();
}

function pc(data) {
	
	// d3.csv(fn, myfilter, function(data) { 
	// 	var axis = d3.axisLeft();
	// br_min = d3.min(data, function(p) { return p['bedrooms']; });
	// 	br_max = d3.max(data, function(p) { return p['bedrooms']; });

	// Extract the list of dimensions and create a scale for each.
    dimensions = d3.keys(data[0]).filter(function(d) {
		if(d == 'month' || d == 'year' || d == 'state') return false;
		else if(d == 'v_age' || d == 'p_age') {
		  	pcy2[d] = d3.scaleLinear().domain([d3.min(data, function(p) { return p[d]; }),d3.max(data, function(p) { return p[d]; })])
		  	.range([pch, 0]); 
					
			return true;
		}
		else {
		  	pcy2[d] = d3.scalePoint().domain(data.map(function(p) {
	      		return p[d];
	    	})).range([pch, 0]); 			
		  	return true;
		} 	
    })
	pcx2.domain(dimensions);
	// price_color = d3.scaleQuantile()
	// .domain([d3.min(data, function(d) { return d.price; }),d3.max(data, function(d) { return d.price; })])
	// .range(colors2);

  	// background = background.selectAll("path")
   //    .data(data)
   //  .enter().append("path")
   //    .attr("d", path).attr('stroke','#ddd').attr('fill','none');	

	var update = pcforeground.selectAll("path")
	  .data(data);	

	  update.exit().transition().duration(1000)
      .style("opacity", 0).remove();
	  
	  update.enter().append("path").merge(update).attr("class", "enter").attr('fill','none').attr('stroke-width',1).attr('stroke','steelblue')
		.attr("d", path).style('opacity',0)
		.transition().duration(1000)
      	.style("opacity", 1);

	  // var g = svg2.selectAll(".dimension")
	  //     .data(dimensions)
	  //   .enter().append("g")
	  //     .attr("class", "dimension")
	  //     .attr("transform", function(d) { return "translate(" + x2(d) + ")"; })
	  //     .call(d3.drag()
	  //       .origin(function(d) { return {x: x2(d)}; })
	  //       .on("dragstart", function(d) {
	  //         dragging[d] = x2(d);
	  //         background.attr("visibility", "hidden");
	  //       })
	  //       .on("drag", function(d) {
	  //         dragging[d] = Math.min(width, Math.max(0, d3.event.x));
	  //         foreground.attr("d", path);
	  //         dimensions.sort(function(a, b) { return position(a) - position(b); });
	  //         x.domain(dimensions);
	  //         g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
	  //       })
	  //       .on("dragend", function(d) {
	  //         delete dragging[d];
	  //         transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
	  //         transition(foreground).attr("d", path);
	  //         background
	  //             .attr("d", path)
	  //           .transition()
	  //             .delay(500)
	  //             .duration(0)
	  //             .attr("visibility", null);
	  //       }));      	

 	var labels = ['Victim Sex', 'Perpetrator Sex', 'Victim Age', 'Perpetrator Age', 'Victim Race', 'Perpetrator Race', 'Relationship', 'Weapon'];
 	if(pcfirst) {
 		for(var d=0; d < dimensions.length; d++) {
	 		pcsvg2.append('g').attr('class', "axis"+d)
	 		.attr("transform", function() {
    			return "translate(" + pcx2(dimensions[d]) + ")"; });
	 		// if (labels[d] == 'Bedrooms') {
	 			// console.log(br_min+' '+br_max);
				d3.select('.axis'+d).call(d3.axisRight(pcy2[dimensions[d]]))
				.append("svg:text")
			  .attr("y", -9).attr('fill','black')
		  	.text(labels[d]);
	 		// }
	 		// else { 			
				// d3.select('.axis'+d).call(d3.axisRight(y2[dimensions[d]]))
				// .append("svg:text")
			 //  .attr("y", -9).attr('fill','black')
		  // 	.text(labels[d]);
	 		// }
 		}
	 	pcfirst = false;
 	}
 	else {
 		for(var d=0; d < dimensions.length; d++) {
 			if(labels[d] == 'Bedrooms') {
 				// console.log(br_min+' '+br_max);
 				d3.select('.axis'+d).transition().duration(1000).call(d3.axisRight(pcy2[dimensions[d]]));
 			}
			else
				d3.select('.axis'+d).transition().duration(1000).call(d3.axisRight(pcy2[dimensions[d]]));
 		}
 	}

 // 	update2 = legend2.selectAll("text")
 //        .data([0].concat(price_color.quantiles()), function(d) { return d; });
	// update2.exit().remove();
 //  	update2.enter().append("text").merge(update2)
 //      .attr("x", function(d, i) { return 70 * i + 5; })
 //      .attr("y", h + 65)  
 //      .text(function(d) { 
 //      	val = Math.round(d).toString();
 //      	if(val.length>=6) val = val.slice(0,3)+'k';
 //      	else if(val.length==5) val = val.slice(0,2)+'k';
 //      	return " >= $" + val; });
 // 	update3 = legend2.selectAll("rect")
 //        .data([0].concat(price_color.quantiles()), function(d) { return d; });        
	// update3.exit().remove();
	// update3.enter().append("rect").merge(update3)
	//       .attr("x", function(d, i) { return 70 * i; })
	//       .attr("y", h + 20)
	//       .attr("width", 70)
	//       .attr("height", 30)
	//       .style("fill", function(d, i) { return colors2[i]; });   
	// legend2.append('g').append('text').text('Sales Price:').attr('x',-20).attr('transform','translate(-60,510)');
       //console.log('done pc');
};	

function position(d) {
  var v = pcdragging[d];
  return v == null ? pcx2(d) : v;
}

function transition(g) {
  return g.transition().duration(500);
}

// Returns the path for a given data point.
function path(d) {
  return pcline(dimensions.map(function(p) {
    return [position(p), pcy2[p](d[p])];
  }));
}	

/*function myfilter(d) {
	return {
		bedrooms: +d.BedroomAbvGr,
		lot_area: +d.LotArea,
		quality: +d.OverallQual,
		built: +d.YearBuilt,
		price: +d.SalePrice
	};
}*/

function updatePC() {
	//pcsvg2.selectAll("*").remove();
	//if(stateFilter.length == 1 && timeFilter.length == 1){
	d3.csv('data/pc_data_sample.csv',
	function(d) {
		return {
			month: d['Month'],
			year: +d['Year'],
			state: d['State'],
		  v_sex: d['Victim Sex'],
		  p_sex: d['Perpetrator Sex'],
		  v_age: +d['Victim Age'],
		  p_age: +d['Perpetrator Age'],
		  v_race: d['Victim Race'],
		  p_race: d['Perpetrator Race'],
		  rel: d['Relationship'],
		  weap: d['Weapon']
		};
	},
	function(error, mydata) {
		if(error) throw error;
		mydata = mydata.filter(function(d) {
			var time = monthKey.indexOf(d.month)+1 + " " + d.year;
			if(stateFilter.length <= 0 || stateFilter.indexOf(d.state) != -1){
      			if(timeFilter.length <= 0 || timeFilter.indexOf(time) != -1){
      				if(d.v_age < 100)
      				return true;
      			}
      		}
      		return false;
		})
		console.log(mydata.length);
		if(mydata.length < 1000){
			pcsvg2.style('opacity', 1);	
			pc(mydata);
		}else{
		pcsvg2.style('opacity', 0);	
		}
		
	}
	);
	//}
}
// updatePC(['Alaska']);