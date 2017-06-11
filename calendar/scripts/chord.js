//Adapted from https://bl.ocks.org/mbostock/4062006, Mike Bostock

console.log('Hello from chord.js :)');

var raceKey = {"Asian/Pacific Islander": 0, "Black": 1, "Native American/Alaska Native": 2, "Unknown" : 3, "White" : 4};
var races = ["Asian/Pacific Islander", "Black", "Native American/Alaska Native", "Unknown" , "White"];
var ageKey = {"1-20": 0, "21-30": 1, "31-40": 2, "41-50": 3, "51-60": 4, "61+": 5, "Unknown": 6};
var ages = ["1-20", "21-30", "31-40", "41-50", "51-60", "61+", "Unknown"];
var monthKey = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];




var stateFilter = [];
//["California", "Arizona"];
var timeFilter = [];
//["1980 March"];


var raceData = [];

var ageData = [];
resetData();

function resetData(){
  raceData = [];
  ageData = [];
	for(var i = 0; i < 5; i++){
	  raceData[i] = [];
	  for(var j = 0; j< 5; j++){
	    raceData[i][j] = 0;
	  }
	}

	for(var i = 0; i < 7; i++){
	  ageData[i] = [];
	  for(var j = 0; j < 7; j++){
	    ageData[i][j] = 0;
	  }
	}
}






var width2 = 900;
var height2 = 500;
var outerRadius = Math.min(width2, height2) * 0.5 - 40;
var innerRadius = outerRadius - 30;

var tipStr = "";

var raceSvg = d3.select("body").append("svg")
    .attr("width", width2 )
    .attr("height", height2 );

var ageSvg = d3.select("body").append("svg")
    .attr("width", width2 )
    .attr("height", height2 );

var tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .text("a simple tooltip");


var formatValue = d3.formatPrefix(",.0", 1e3);

var color_race = d3.scaleOrdinal(["Blue", "Orange", "Green", "Red", "Purple"]);

var color_age = d3.scaleOrdinal(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "Black"]);

updateChords();


function updateChords(){
	resetData();
  d3.csv("data/chord_data.csv", row, function(error, data) {
    if (error) throw error;
    raceSvg.selectAll("*").remove();
    ageSvg.selectAll("*").remove();
    //printData();
    createRaceChord();
    createAgeChord();
  });

  function row(d){
    var time = monthKey.indexOf(d.Month)+1 + " " + d.Year;
    if(stateFilter.length <= 0 || stateFilter.indexOf(d.State) != -1){
      if(timeFilter.length <= 0 || timeFilter.indexOf(time) != -1){
            //for race
        raceData[raceKey[d.Victim_Race]][raceKey[d.Perpetrator_Race]] += 1;

        var v, p;
        //for age
        if(d.Victim_Age >= 1 && d.Victim_Age <= 20){
          v =  "1-20";
        }else if(d.Victim_Age >= 21 && d.Victim_Age <= 30){
          v = "21-30";
        }else if(d.Victim_Age >= 31 && d.Victim_Age <= 40){
          v = "31-40";
        }else if(d.Victim_Age >= 41 && d.Victim_Age <= 50){
          v = "41-50";
        }else if(d.Victim_Age >= 51 && d.Victim_Age <= 60){
          v = "51-60";
        }else if(d.Victim_Age >= 61){
          v = "61+";
        }else {
          v = "Unknown";
        }
        if(d.Perpetrator_Age >= 1 && d.Perpetrator_Age <= 20){
          p =  "1-20";
        }else if(d.Perpetrator_Age >= 21 && d.Perpetrator_Age <= 30){
          p = "21-30";
        }else if(d.Perpetrator_Age >= 31 && d.Perpetrator_Age <= 40){
          p = "31-40";
        }else if(d.Perpetrator_Age >= 41 && d.Perpetrator_Age <= 50){
          p = "41-50";
        }else if(d.Perpetrator_Age >= 51 && d.Perpetrator_Age <= 60){
          p = "51-60";
        }else if(d.Perpetrator_Age >= 61){
          p = "61+";
        }else {
          p = "Unknown";
        }
       
        ageData[ageKey[v]][ageKey[p]] += 1;
      }
    }
  }
}



function printData(){
  console.log("Race Data");
  for(var i = 0; i < 5; i++){
      console.log(raceData[i][0] + "\t"  + raceData[i][1] + "\t"  + raceData[i][2] + "\t"
        + raceData[i][3] + "\t"  + raceData[i][4]);
  }

  console.log("\nAge Data");

   for(var i = 0; i < 7; i++){
      console.log(ageData[i][0] + "\t"  + ageData[i][1] + "\t"  + ageData[i][2] + "\t"+ ageData[i][3]
       + "\t"  + ageData[i][4] + "\t" + ageData[i][5] + "\t" + ageData[i][6]);
  }
}


function createRaceChord(){
    var chord = d3.chord()
      .padAngle(0.05)
      .sortSubgroups(d3.descending);

  var arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

  var ribbon = d3.ribbon()
      .radius(innerRadius);

  var g2 = raceSvg.append("g")
      .attr("transform", "translate(" + width2 / 3 + "," + height2 / 2 + ")")
      .datum(chord(raceData));

  var group = g2.append("g")
    .attr("class", "groups")
    .selectAll("g")
    .data(function(chords) { return chords.groups; })
    .enter().append("g");

  group.append("path")
      .style("fill", function(d) { return color_race(d.index); })
      .style("stroke", function(d) { return d3.rgb(color_race(d.index)).darker(); })
      .attr("d", arc);

  var groupTick = group.selectAll(".group-tick")
    .data(function(d) { return groupTicks(d, 5e3); })
    .enter().append("g")
      .attr("class", "group-tick")
      .attr("transform", function(d) { return "rotate(" + (d.angle * 180 / Math.PI - 90) + ") translate(" + outerRadius + ",0)"; });

  groupTick.append("line")
      .attr("x2", 6);

  groupTick
    .filter(function(d) { return d.value % 10e3 === 0; })
    .append("text")
      .attr("x", 8)
      .attr("dy", ".35em")
      .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180) translate(-16)" : null; })
      .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
      .text(function(d) { return formatValue(d.value); });

  g2.append("g")
    .attr("class", "ribbons")
    .selectAll("path")
    .data(function(chords) { return chords; })
    .enter().append("path")
    .attr("d", ribbon)
    .style("fill", function(d) { return color_race(d.target.index); })
    .style("stroke", function(d) { return d3.rgb(color_race(d.target.index)).darker(); })
    .on("mouseover", function(d) 
        {
          tipStr = races[d.source.index] + " -> "  + races[d.target.index] + ": " + d.source.value + 
          "\n" + races[d.target.index] + " -> "  + races[d.source.index] + ": " + d.target.value;
          return tooltip.style("visibility", "visible")
          .text(tipStr); 
        })
    .on("mousemove", function(){return tooltip.style("top",
    (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
    .on("mouseout", function(){return tooltip.style("visibility", "hidden");});



    var legend2 = g2.append("g")
      .attr("class", "legend")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
      .selectAll("g")
      .data(Object.keys(raceKey)) 
      .enter().append("g")
      .attr("transform", function(d, i) { return "translate(-450," + i * 20 + ")"; });


  legend2.append("rect")
      .attr("x", width2 - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", color_race);

  legend2.append("text")
      .attr("x", width2 - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) { return d; });

  // Returns an array of tick angles and values for a given group and step.
  function groupTicks(d, step) {
    var k = (d.endAngle - d.startAngle) / d.value;
    return d3.range(0, d.value, step).map(function(value) {
      return {value: value, angle: value * k + d.startAngle};
    });
  }

}


function createAgeChord(){
  var chord = d3.chord()
      .padAngle(0.05)
      .sortSubgroups(d3.descending);

  var arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

  var ribbon = d3.ribbon()
      .radius(innerRadius);

  var g2 = ageSvg.append("g")
      .attr("transform", "translate(" + width2 / 3 + "," + height2 / 2 + ")")
      .datum(chord(ageData));

  var group = g2.append("g")
      .attr("class", "groups")
    .selectAll("g")
    .data(function(chords) { return chords.groups; })
    .enter().append("g");

  group.append("path")
      .style("fill", function(d) { return color_age(d.index); })
      .style("stroke", function(d) { return d3.rgb(color_age(d.index)).darker(); })
      .attr("d", arc);

  var groupTick = group.selectAll(".group-tick")
    .data(function(d) { return groupTicks(d, 5e3); })
    .enter().append("g")
      .attr("class", "group-tick")
      .attr("transform", function(d) { return "rotate(" + (d.angle * 180 / Math.PI - 90) + ") translate(" + outerRadius + ",0)"; });

  groupTick.append("line")
      .attr("x2", 6);

  groupTick
    .filter(function(d) { return d.value % 10e3 === 0; })
    .append("text")
      .attr("x", 8)
      .attr("dy", ".35em")
      .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180) translate(-16)" : null; })
      .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
      .text(function(d) { return formatValue(d.value); });

  g2.append("g")
      .attr("class", "ribbons")
    .selectAll("path")
    .data(function(chords) { return chords; })
    .enter().append("path")
      .attr("d", ribbon)
      .style("fill", function(d) { return color_age(d.target.index); })
      .style("stroke", function(d) { return d3.rgb(color_age(d.target.index)).darker(); })
      .on("mouseover", function(d) 
        {
          tipStr = ages[d.source.index] + " -> "  + ages[d.target.index] + ": " + d.source.value + 
          "\n" + ages[d.target.index] + " -> "  + ages[d.source.index] + ": " + d.target.value;
          return tooltip.style("visibility", "visible")
          .text(tipStr); 
        })
    .on("mousemove", function(){return tooltip.style("top",
    (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
    .on("mouseout", function(){return tooltip.style("visibility", "hidden");});


    var legend2 = g2.append("g")
      .attr("class", "legend")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
      .selectAll("g")
      .data(Object.keys(ageKey)) 
      .enter().append("g")
      .attr("transform", function(d, i) { return "translate(-450," + i * 20 + ")"; });


  legend2.append("rect")
      .attr("x", width2 - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", color_age);

  legend2.append("text")
      .attr("x", width2 - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) { return d; });

  // Returns an array of tick angles and values for a given group and step.
  function groupTicks(d, step) {
    var k = (d.endAngle - d.startAngle) / d.value;
    return d3.range(0, d.value, step).map(function(value) {
      return {value: value, angle: value * k + d.startAngle};
    });
  }
}

function addState(s){
  stateFilter.push(s);
}

function removeState(s){
  var i = stateFilter.indexOf(s);
  if(i > -1){
    stateFilter.splice(i, 1);
  }
}

function addTime(t){
  timeFilter.push(t);
}

function setTimeFilter(x){
  timeFilter = [];
  for (var i = 0; i < x.length; i++){
    timeFilter.push(x[i].key);
  }
}

function removeTime(t){
   var i = timeFilter.indexOf(t);
  if(i > -1){
    timeFilter.splice(i, 1);
  }
}







