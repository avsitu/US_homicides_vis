var width = 960;
var height = 500;

var selectedStates = new Set()

function stateDeselect(update) {
    if(selectedStates.size > 0){
        d3.selectAll(".selected").attr("class", "state bordered");
        selectedStates.clear();
        
        if(update){
            stateFilter = [];
            updateChords();
        }
    }
}

function stateSelect(e, d) {
    // highlight it 
    d3.select(e.target).attr("class", "state bordered selected");
    
    if (selectedStates.has(d.properties.name)){
        selectedStates.delete(d.properties.name)
        
        // unhighlight it
        d3.select(e.target).attr("class", "state bordered");
    }else{
        selectedStates.add(d.properties.name)
        //svg.select("g#"+d.properties.id)
        //    .attr("fill", "#FFFFFF")
    }
    
    //console.log(selectedStates)
    stateFilter = [];
    selectedStates.forEach(v => stateFilter.push(v))
    updateChords()
}


// D3 Projection
var projection = d3.geoAlbersUsa()
				   .translate([width/2, height/2])    // translate to center of screen
				   .scale([1000]);          // scale things down so see entire US
        
// Define path generator
var path = d3.geoPath()               // path generator that will convert GeoJSON to SVG paths
		  	 .projection(projection);  // tell path generator to use albersUsa projection

var lowColor = '#ffe5e5'
var highColor = '#7f0000'
		
//Create SVG element and append map to the SVG
var svg = d3.select("body")
			.append("svg")
			.attr("width", width)
			.attr("height", height);
        
// Select tooltip from DOM
var tooltip = d3.select("#tooltip");

// Load in my states data!
d3.csv("data/homicide_states.csv", function(data) {
	var dataArray = [];
	for (var d = 0; d < data.length; d++) {
		dataArray.push(parseFloat(data[d].incidents))
	}
	var minVal = d3.min(dataArray)
	var maxVal = d3.max(dataArray)
	//console.log(minVal)
	//console.log(maxVal)
	var ramp = d3.scalePow().exponent(0.15).domain([minVal,maxVal]).range([lowColor,highColor])

// Load GeoJSON data and merge with states data
d3.json("data/us-states.json", function(json) {
// Loop through each state data value in the .csv file
for (var i = 0; i < data.length; i++) {

	// Grab State Name
	var dataState = data[i].state;

	// Grab data value 
	var dataValue = data[i].incidents;

	// Find the corresponding state inside the GeoJSON
	for (var j = 0; j < json.features.length; j++)  {
		var jsonState = json.features[j].properties.name;
		if (dataState == jsonState) {

		// Copy the data value into the JSON
		json.features[j].properties.incidents = dataValue; 

		// Stop looking through the JSON
		break;
		}
	}
}
	//console.log("BEFORE LEGEND")
		// add a legend
	var w = 140, h = 300;

	var key = d3.select("body")
		.append("svg")
		.attr("width", w)
		.attr("height", h)
		.attr("class", "legend");
		
	var legend = key.append("defs")
			.append("svg:linearGradient")
			.attr("id", "gradient")
			.attr("x1", "100%")
			.attr("y1", "0%")
			.attr("x2", "100%")
			.attr("y2", "100%")
			.attr("spreadMethod", "pad");

		legend.append("stop")
			.attr("offset", "0%")
			.attr("stop-color", highColor)
			.attr("stop-opacity", 1);
			
		legend.append("stop")
			.attr("offset", "100%")
			.attr("stop-color", lowColor)
			.attr("stop-opacity", 1);	

		key.append("rect")
		.attr("width", w - 100)
		.attr("height", h)
		.style("fill", "url(#gradient)")
		.attr("transform", "translate(0,10)");

		var y = d3.scalePow().exponent(.15)
			.range([h, 0])
			.domain([minVal, maxVal]);

		var yAxis = d3.axisRight(y)

		key.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(41,10)")
			.call(yAxis)
 // Bind the data to the SVG and create one path per GeoJSON feature
//console.log("BEFORE CLICK CODE")
svg.selectAll("path")
	.data(json.features)
	.enter()
	.append("path")
	.attr("d", path)
	.style("stroke", "#fff")
	.style("stroke-width", "1.5")
	.style("fill", function(d) {return ramp(d.properties.incidents) })

	.on('click', (d) => {
	      if(!d3.event.ctrlKey && !d3.event.shiftKey){
	      		stateDeselect(false); //deselect previous
	      }
	      stateSelect(d3.event, d);
	      d3.event.stopPropagation();
    })
	.on("mouseover", function(d) {
    	tooltip.transition()        
      	   .duration(200)      
           .style("opacity", .9)   
        tooltip.html(d.properties.name + "<br/>"  + d.properties.incidents + " incidents")
           .style("left", (d3.event.pageX - 40) + "px")     
           .style("top", (d3.event.pageY - 40) + "px");    
	})
    .on('mousemove', () => {
        tooltip.style('left', (d3.event.pageX - 40)+'px')	
          .style('top', (d3.event.pageY - 40)+'px');
    })

    // fade out tooltip on mouse out               
    .on("mouseout", function(d) {       
        tooltip.transition()        
           .duration(500)      
           .style("opacity", 0);   
    });
})
});
//console.log("AFTER CLICK CODE")
	/*
	.on("click", function(d){

		d3.csv("data/" + d.properties.name + ".csv", function(da) {
		d3.selectAll(".legend").remove();
		d3.selectAll(".arc").remove();
		var width = 600,
	    height = 600,
	    radius = Math.min(width, height) / 2;
	    var legendRectSize = 18;
		var legendSpacing = 2;

	    var color = d3.scale.ordinal()
  		.range([ "#3182bd",
				"#6baed6",
				"#9ecae1",
				"#c6dbef",
				"#e6550d",
				"#fd8d3c",
				"#fdae6b",
				"#fdd0a2",
				"#31a354",
				"#74c476",
				"#a1d99b",
				"#c7e9c0",
				"#756bb1",
				"#9e9ac8",
				"#bcbddc",
				"#dadaeb",
				"#636363",
				"#969696",
				"#bdbdbd",
				"#d9d9d9",
				"#637939",
				"#8ca252",
				"#b5cf6b",
				"#cedb9c",
				"#8c6d31",
				"#e7ba52",
				"#e7cb94",
				"#843c39",
				"#ad494a",
				"#d6616b",
				"#e7969c",
				"#7b4173",
				"#a55194",
				"#ce6dbd",
				"#de9ed6"]);

  		var svg = d3.select('#donutchart')
		  .select('svg')
		  .attr('width', width)
		  .attr('height', height)
		  .append('g')
		  .attr('transform', 'translate(' + (width / 2) +  ',' + (height / 2) + ')');

		var arc = d3.svg.arc()
  		.innerRadius(radius-70)
  		.outerRadius(radius-10);

  		var pie = d3.layout.pie()
		  .value(function(d) { return d.duration; })
		  .sort(function(a, b) {
		return a.shape.localeCompare(b.shape);
		});
		 
		var g = svg.selectAll(".arc")
		    .data(pie(da))
		    .enter().append("g")
		    .attr("class", "arc");

		g.append("path")
		    .attr("d", arc)
		    .style("fill", function (d) {
		    return color(d.data.shape);
		    });

		var legend = svg.selectAll('.legend')
		  .data(color.domain())
		  .enter()
		  .append('g')
		  .attr('class', 'legend')
		  .attr('transform', function(d, i) {
		    var height = legendRectSize + legendSpacing;
		    var offset =  height * color.domain().length / 2;
		    var horz = -2 * legendRectSize;
		    var vert = i * height - offset;
		    return 'translate(' + horz + ',' + vert + ')';
		  });
		legend.append('rect')
		  .attr('width', legendRectSize)
		  .attr('height', legendRectSize)
		  .style('fill', color)
		  .style('stroke', color);

		legend.append('text')
		  .attr('x', legendRectSize + legendSpacing)
		  .attr('y', legendRectSize - legendSpacing)
		  .text(function(d) { return d; });
      })
	})
	.on("mouseover", function(d) {
    	div.transition()        
      	   .duration(200)      
           .style("opacity", .9);      
           div.html(d.properties.name + "<br/>"  + d.properties.incidents)
           .style("left", (d3.event.pageX) + "px")     
           .style("top", (d3.event.pageY - 28) + "px");    
	})   

    // fade out tooltip on mouse out               
    .on("mouseout", function(d) {       
        div.transition()        
           .duration(500)      
           .style("opacity", 0);   
    });
	;
	});
	console.log("after CLICKed")
*/

