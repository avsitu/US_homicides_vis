var pc_margins = [100, 40, 50, 40],
  pc_w = 1400 - pc_margins[1] - pc_margins[3],
  pc_h = 600 - pc_margins[0] - pc_margins[2];
var pcline = d3.line();
var pc_dragging = {};
var pc_x = d3.scaleBand().range([0, pc_w]);
var pc_y = {};

var pc_svg = d3.select('.pc')
  .attr("width", pc_w + pc_margins[1] + pc_margins[3])
  .attr("height", pc_h + pc_margins[0] + pc_margins[2]).append("g")
  .attr("transform", "translate(" + 80 + "," + 50 + ")");

var pc_background = pc_svg.append('g').attr('class', 'background')
  .attr('width', pc_w)
  .attr('height', pc_h);
var pc_foreground = pc_svg.append('g').attr('class', 'foreground')
  .attr('width', pc_w)
  .attr('height', pc_h);;
var pclegend2 = d3.select('.pc').append('g').attr('class', 'legend2').attr('transform', 'translate(1050,-430)'); 
var pccolors2 = ["#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"];
var pc_first = true;
var dimensions;
var axis_map = {'v_sex': 'Victim Sex', 'p_sex': 'Perpetrator Sex', 'v_age': 'Victim Age', 'p_age': 'Perpetrator Age',
	 'v_race': 'Victim Race', 'p_race': 'Perpetrator Race', 'rel': 'V-P Relationship', 'weap': 'Weapon Used'}

if(stateFilter.length == 1 && timeFilter.length == 1){
	updatePC();
}
else{
    d3.select('.pc').style('display', 'none');
}

function pc(data) {
	// Extract the list of dimensions and create a scale for each.
  dimensions = d3.keys(data[0]).filter(function(d) {
	if(d == 'month' || d == 'year' || d == 'state') return false;
	else if(d == 'v_age' || d == 'p_age') {
	  	pc_y[d] = d3.scaleLinear().domain([d3.min(data, function(p) { return p[d]; }),d3.max(data, function(p) { return p[d]; })])
	  	.range([pc_h, 0]); 		
		return true;
	}
	else {
	  	pc_y[d] = d3.scalePoint().domain(data.map(function(p) {
      		return p[d];
    	})).range([pc_h, 0]); 			
	  	return true;
	} 	
  })
	pc_x.domain(dimensions);

	update_bg = pc_background.selectAll("path")
    .data(data);

  update_bg.exit().transition().duration(1000)
    .style("opacity", 0).remove();    

  update_bg.enter().append("path").merge(update_bg)
    .attr("d", path).attr('stroke','#ddd').attr('fill','none');	

	var update = pc_foreground.selectAll("path")
	  .data(data);	

  update.exit().transition().duration(1000)
    .style("opacity", 0).remove();
	  
  fg = update.enter().append("path").merge(update).attr("class", "path").attr('fill','none').attr('stroke-width',1).attr('stroke','#ff8080')
	.attr("d", path).style('opacity',1);//.transition().duration(1000).style("opacity", 1);

	d3.selectAll('.brush').each(function(d) {d3.select(this).on('.brush', null);});
	d3.selectAll('.dimension').each(function(d) {d3.select(this).remove();});
		var drag_g = pc_svg.selectAll(".dimension")
		      .data(dimensions)
		    .enter().append("g")
		      .attr("class", "dimension")
		      .attr("transform", function(d) { return "translate(" + pc_x(d) + ")"; });
		      // .call(d3.drag()
		      //   .subject(function(d) { return {x: pc_x(d)}; })
		      //   .on("start", function(d) {
		      //     pc_dragging[d] = pc_x(d);
		      //     fg.attr("visibility", "hidden");
		      //   })
		      //   .on("drag", function(d) {
		      //     pc_dragging[d] = Math.min(pc_w, Math.max(0, d3.event.x));
		      //     fg.attr("d", path);
		      //     dimensions.sort(function(a, b) { return position(a) - position(b); });
		      //     x.domain(dimensions);
		      //     g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
		      //   })
		      //   .on("end", function(d) {
		      //     delete pc_dragging[d];
		      //     transition(d3.select(this)).attr("transform", "translate(" + pc_x(d) + ")");
		      //     transition(fg).attr("d", path);
		      //     pc_background
		      //         .attr("d", path)
		      //       .transition()
		      //         .delay(500)
		      //         .duration(0)
		      //         .attr("visibility", null);
		      //   }));      	

	  // Add an axis and title.
	  drag_g.append("g")
	      .attr("class", "axis")
	      .each(function(d) { d3.select(this).call(d3.axisRight(pc_y[d])); })
	    .append("text")
	      .style("text-anchor", "middle")
	      .attr("y", -9).attr('fill', 'black').attr('font-size', 15)
	      .text(function(d) { return axis_map[d]; });		

		// Add and store a brush for each axis.
	  drag_g.append("g")
	      .attr("class", "brush")
	      .each(function(d) {
	        d3.select(this).call(d3.brushY().extent([[-10,-20],[10,pc_h+20]]).on("start", brushstart).on("brush", brush).on('end',brush));
	      })
};	

function position(d) {
  var v = pc_dragging[d];
  return v == null ? pc_x(d) : v;
}

function transition(g) {
  return g.transition().duration(500);
}

// Returns the path for a given data point.
function path(d) {
  return pcline(dimensions.map(function(p) {
    return [position(p), pc_y[p](d[p])];
  }));
}	

function brushstart() {
  d3.event.sourceEvent.stopPropagation();

}

// Handles a brush event, toggling the display of foreground lines.
function brush() {
  var extents = []
  d3.selectAll('.brush').each(function(d) {extents.push(d3.brushSelection(d3.select(this)._groups[0][0]))})
  var actives = dimensions.filter(function(p,i) { return extents[i] != null; });
  extents = extents.filter(function(p) {return p != null});
  fg.style("display", function(d) {
    return actives.every(function(p, i) {
      return extents[i][0] <= pc_y[p](d[p]) && pc_y[p](d[p]) <= extents[i][1];
    }) ? null : "none";
  });
}

function updatePC() {
	//if(stateFilter.length == 1 && timeFilter.length == 1){
	//pc_svg.selectAll("*").remove();
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
      				return true;
      			}
      		}
      		return false;
		})
		//console.log(mydata.length);
		if(mydata.length < 1000){
			d3.select('.pc').style('display', 'block');	
			pc(mydata);
		}else{
      d3.select('.pc').style('display', 'none');	
		}	
	}
	);
	//}
}

// fn = 'pc_data_sample2.csv'
// updatePC(fn)
// d3.select('.button').on('click', function(d) {
// 	fn = 'pc_data_sample.csv'	
// 	updatePC(fn);
// })