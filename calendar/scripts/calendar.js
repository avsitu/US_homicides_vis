var selectedMonths = [];
var yearRange = [1980, 2014];

function monthDeselect() {
    d3.selectAll(".selected").attr("class", "month bordered");
    selectedMonths = [];
}

function monthSelect(e, data) {
    if(selectedMonths.length > 0 && e.shiftKey) { //select range of months
        var startM = selectedMonths[0].month;
        var startY = selectedMonths[0].year;
        monthDeselect();
        var s = d3.selectAll(".month").filter(function(d) { 
            if((data.month < startM && data.year == startY)
                || data.year < startY) { //if selection goes backwards
                if(((d.month <= startM && d.year == startY) || 
                    d.year < startY)
                && ((d.month >= data.month && d.year == data.year) ||
                    d.year > data.year)){
                    selectedMonths.push({month: d.month, year: d.year});
                    return true;
                }
            }
            else{ //if selection goes forwards
                if(((d.month >= startM && d.year == startY) || 
                    d.year > startY)
                && ((d.month <= data.month && d.year == data.year) || 
                    d.year < data.year)){
                    selectedMonths.push({month: d.month, year: d.year});
                    return true;
                }
            }
            return false;
        });
        s.attr("class", "month bordered selected");
    }
    else { //select individual month
        d3.select(e.target).attr("class", "month bordered selected");
        //creates date object with month and year properties from selection
        //access using 'selectedMonths[i].month' and 'selectedMonths[i].year'
        selectedMonths.push({month: data.month, year: data.year});
    }
    console.log(selectedMonths);
}

function makeCalendar() {
const margin = { top: 50, right: 0, bottom: 100, left: 50 },
      width = 960 - margin.left - margin.right,
      height = 820 - margin.top - margin.bottom,
      gridSize = Math.floor(width / 24),
      legendElementWidth = gridSize * 1.5,
      buckets = 9,
      colors = ["#fff5f0","#fee0d2","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#a50f15","#67000d"],
      months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
    var years = [];
    for(i=yearRange[0]; i<=yearRange[1]; i++)
        years.push(i.toString());

    const svg = d3.select(".calendar")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
          
      const yearLabels = svg.selectAll(".yearLabel")
          .data(years)
          .enter().append("text")
            .text(function (d) { return d; })
            .attr("x", 0)
            .attr("y", (d, i) => i * gridSize/2 - 12)
            .style("text-anchor", "end")
            .attr("transform", "translate(-6," + gridSize / 1.5  + ")")
            .attr("class", "yearLabel mono axis");

      const monthLabels = svg.selectAll(".monthLabel")
          .data(months)
          .enter().append("text")
            .text((d) => d)
            .attr("x", (d, i) => i * gridSize)
            .attr("y", 0)
            .style("text-anchor", "middle")
            .attr("transform", "translate(" + gridSize / 2 + ", -6)")
            .attr("class", "monthLabel mono axis");

      const type = (d) => {
        return {
          year: +d.year,
          month: +d.month,
          amount: +d.amount
        };
      };

    d3.csv("data/dates.csv", type, (error, data) => {
      const colorScale = d3.scaleQuantile()
        .domain([d3.min(data, (d) => d.amount), d3.max(data, (d) => d.amount)])
        .range(colors);

      const cards = svg.selectAll(".month")
          .data(data, (d) => d.year+':'+d.month);
      
      var tooltip = d3.select("#tooltip");

      cards.enter().append("rect").filter(function(d) {
          return (d.year >= yearRange[0] && d.year <= yearRange[1]);
      })
          .attr("x", (d) => (d.month - 1) * gridSize)
          .attr("y", (d) => (d.year - yearRange[0]) * gridSize/2)
          .attr("rx", 4)
          .attr("ry", 4)
          .attr("class", "month bordered")
          .attr("width", gridSize)
          .attr("height", gridSize/2)
          .style("fill", colors[0])
          .on('mouseover', (d) => {
            tooltip.transition()
              .duration(200)		
              .style('opacity', .95);
            tooltip.html(months[d.month-1] + ' ' + d.year + '<br>' + d.amount + ' incidents')
              .style('left', (d3.event.pageX - 55)+'px')	
              .style('top', (d3.event.pageY - 50)+'px');
          })
          .on('mousemove', () => {
            tooltip.style('left', (d3.event.pageX - 55)+'px')	
              .style('top', (d3.event.pageY - 50)+'px');
          })
          .on('mouseout', () => {		
            tooltip.transition()		
            .duration(400)		
            .style('opacity', 0);	
          })
          .on('click', (d) => {
              if(!d3.event.ctrlKey && !d3.event.shiftKey)
                monthDeselect(); //deselect previous
              monthSelect(d3.event, d); //select new
              d3.event.stopPropagation();
          })
        .merge(cards)
          .transition()
          .duration(1000)
          .style("fill", (d) => colorScale(d.amount));
          
      cards.exit().remove();

      const legend = svg.selectAll(".legend")
          .data(colorScale.quantiles(), (d) => d);

      const legend_g = legend.enter().append("g")
          .attr("class", "legend");

      legend_g.append("rect")
        .attr("x", (d, i) => legendElementWidth * i)
        .attr("y", (d) => (yearRange[1] - yearRange[0] + 2) * gridSize/2)
        .attr("width", legendElementWidth)
        .attr("height", gridSize / 2)
        .style("fill", (d, i) => colors[i]);

      legend_g.append("text")
        .attr("class", "mono")
        .text((d) => "≥ " + Math.round(d))
        .attr("x", (d, i) => legendElementWidth * i)
        .attr("y", (d) => (yearRange[1] - yearRange[0] + 2) * gridSize/2 + gridSize)

      legend.exit().remove();
    });
}
makeCalendar();