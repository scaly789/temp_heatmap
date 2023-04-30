// Dimensions for Canvas
const margin = { top: 50, right: 50, bottom: 50, left: 70 };
const width = screen.width - margin.left - margin.right;
const height = screen.height - margin.top - margin.bottom;
let displayMax = false;
let overallMax = 0;

// Checkbox element for changing modes
const checkbox = document.querySelector('#tempChange');

// Dictionary mapping numbers to their respective months
const months = {1: "January", 2: "February", 3: "March", 4: "April", 5: "May", 6: "June", 7: "July", 8: "August", 9: "September", 10: "October", 11: "November", 12: "December"};

// Create the canvas for part 1
const svg = d3.select("body")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

// Create the canvas for part 2
const svg2 = d3.select("body")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  
// Reading in data and THEN doing stuff
d3.csv("temperature_daily.csv").then(
   function(data) {
      // Results is a dictionary where key is month-year and value is {max, min}
      let result = {};

      // Dailies is a dictionary where key is month-year and value is array of data for each day in that month
      let dailies = {}
      for (let i = 0; i < data.length; i++){
         let date = data[i].date;
         let max_temp = parseInt(data[i].max_temperature);
         let min_temp = parseInt(data[i].min_temperature);
         let month = date.split("-")[1];
         let year = date.split ("-")[0];
         let key = month + "-"+ year;
         if (max_temp > overallMax) {
            overallMax = max_temp;
         }
         if (key in result){
            let temps = result[key];
            if (max_temp > temps.max) {
               temps.max = max_temp;
            }
            if (min_temp < temps.min) {
               temps.min = min_temp;
            }
         }
         else {
            result[key] = {max: max_temp, min: min_temp};
         }

         let key2 = parseInt(month) + "-" + year;
         if (key2 in dailies) {
            dailies[key2].push({date: date, max: max_temp, min: min_temp});
         }
         else {
            dailies[key2] = [{date: date, max: max_temp, min: min_temp}];
         }
      }

      // Relevant temps is array containing {month, year, max for month, min for month}
      const relevant_temps = [];
      for (let key in result) {
         let month = key.split("-")[0];
         let year = key.split("-")[1];
         relevant_temps.push({month: parseInt(month), year: parseInt(year), max: parseInt(result[key].max), min: parseInt(result[key].min)});
      }

      // Relevant temps 2 is array containing same data as relevant temps but for years 2008-2017
      const relevant_temps2 = [];
      for (let key in result) {
         let month = key.split("-")[0];
         let year = key.split("-")[1];
         if (parseInt(year) >= 2008 && parseInt(year) <= 2017){
            relevant_temps2.push({month: parseInt(month), year: parseInt(year), max: parseInt(result[key].max), min: parseInt(result[key].min)});
         }
      }

      // Scale for x axis for part 1 (years)
      const xScale = d3.scaleBand()
         .range([0, width])
         .domain(d3.range(1997, 2018))
         .padding(0.05);

      // Scale for y axis for part 1 (months)
      const yScale = d3.scaleBand()
         .range([0, height])
         .domain(d3.range(1, 13))
         .padding(0.1);

      // Color scale for values
      const colorScale = d3.scaleSequential()
         .interpolator(d3.interpolateYlOrRd)
         .domain(d3.extent(relevant_temps, function(d) { return d.max; }));
      
         
      // Tooltip for hover effect
      const tooltip = d3.select("body")
         .append("div")
         .attr("class", "tooltip")
         .style("opacity", 0);
      
      
      // Create the matrix cells
      svg.selectAll(".matrix-cell")
         .data(relevant_temps)
         .enter().append("rect")
            .attr("class", "matrix-cell")
            // x value based on year
            .attr("x", function(d) { return xScale(d.year) })
            // y value based on month
            .attr("y", function(d) { return yScale(d.month); })
            .attr("width", xScale.bandwidth())
            .attr("height", yScale.bandwidth())
            // Coloring matrix cells
            .style("fill", function(d) { return colorScale(d.min); })
            // Add the details on mouseover
            .on("mouseover", function(d) {
               let temp = d.srcElement.__data__;
               let month;
               if (temp.month < 10) {
                  month = "0" + temp.month;
               }
               else {
                  month = temp.month;
               }
               tooltip.transition()
               .duration(200)
               .style("opacity", 0.9);
               tooltip.html(
               "Date: " + temp.year + "-" + month + "; " +
               "Max: " + temp.max + "°C; " +
               "Min: " + temp.min + "°C"
               )
               //Style to follow mouse cursor
               .style("position", "absolute")
               .style("background-color", "white")
               .style("left", (d.pageX + 20) + "px")
               .style("top", (d.pageY - 20) + "px");
            })
            // Hide the details on mouseout
            .on("mouseout", function(d) {
               tooltip.transition()
               .duration(500)
               .style("opacity", 0);
            });

      // Add the x-axis
      svg.append("g")
         .attr("class", "x-axis")
         .attr("transform", "translate(0)")
         .call(d3.axisTop(xScale).tickFormat(d3.format("d")));

      // Add the y-axis
      svg.append("g")
         .attr("class", "y-axis")
         .call(d3.axisLeft(yScale).tickFormat(function(d) {
            return months[d];
         }));

      // Add a title
      svg.append("text")
         .attr("class", "title")
         .attr("x", width / 2)
         .attr("y", -20)
         .attr("text-anchor", "middle")
         .text("Monthly Temperature of Hong Kong");


       // Create a scale for the x-axis (years)
      const xScale2 = d3.scaleBand()
         .range([0, width])
         .domain(d3.range(2008, 2018))
         .padding(0.05);

      // Create a scale for the y-axis (weeks of the month)
      const yScale2 = d3.scaleBand()
         .range([0, height])
         .domain(d3.range(1, 13))
         .padding(0.1);
         
      // Define the tooltip
      const tooltip2 = d3.select("body")
         .append("div")
         .attr("class", "tooltip")
         .style("opacity", 0);

      // Define x and y scales for the line graph
      const lineXScale = d3.scaleLinear()
         .domain([0, 32])
         .range([0, xScale2.bandwidth()]);

      const lineYScale = d3.scaleLinear()
         .domain([0, overallMax])
         .range([0, yScale2.bandwidth()]);

      // Define line generator functions for the line graph (both max and min temps)
      const line = d3.line()
         .x(d => lineXScale(parseInt(d.date.split("-")[2])) + (xScale2.bandwidth()+7.85)*(parseInt(d.date.split("-")[0])-2008))
         .y(d => lineYScale(overallMax- d.max) + (yScale2.bandwidth()+8)*(parseInt(d.date.split("-")[1])-1));

      const minLine = d3.line()
         .x(d => lineXScale(parseInt(d.date.split("-")[2])) + (xScale2.bandwidth()+7.85)*(parseInt(d.date.split("-")[0])-2008))
         .y(d => lineYScale(overallMax- d.min) + (yScale2.bandwidth()+8)*(parseInt(d.date.split("-")[1])-1));
      
    
      // select all matrix cells
      var graph = svg2.selectAll(".matrix-cell")
         .data(relevant_temps2)
         .enter()
         .append("g") // append a g element for each cell
         .attr("class", "matrix-cell");

      // Create the matrix cells
      graph.append("rect")
         .attr("class", "matrix-cell")
         .attr("x", function(d) { return xScale2(d.year) })
         .attr("y", function(d) { return yScale2(d.month); })
         .attr("width", xScale2.bandwidth())
         .attr("height", yScale2.bandwidth())
         .attr("stroke", "#ccc")
         .style("fill", function(d) { return colorScale(d.min); })
         // Add the details on mouseover
         .on("mouseover", function(d) {
            let temp = d.srcElement.__data__;
            let month;
            if (temp.month < 10) {
               month = "0" + temp.month;
            }
            else {
               month = temp.month;
            }
            tooltip2.transition()
            .duration(200)
            .style("opacity", 0.9);
            tooltip2.html(
            "Date: " + temp.year + "-" + month + "; " +
            "Max: " + temp.max + "°C; " +
            "Min: " + temp.min + "°C"
            )
            .style("position", "absolute")
            .style("background-color", "white")
            .style("left", (d.pageX + 20) + "px")
            .style("top", (d.pageY - 20) + "px");
         })
         // Hide the details on mouseout
         .on("mouseout", function(d) {
            tooltip2.transition()
            .duration(500)
            .style("opacity", 0);
         });

      // Add the line graphs to the cells
      graph.append("path")
         .data(relevant_temps2)
         .datum(function(d) { return dailies[d.month + "-" + d.year] })
         .attr("fill", "none")
         .attr("stroke", "green")
         .attr("stroke-width", 3)
         .attr("class", "line")
         .attr("d", line);

      graph.append("path")
         .data(relevant_temps2)
         .datum(function(d) { return dailies[d.month + "-" + d.year] })
         .attr("fill", "none")
         .attr("stroke", "steelblue")
         .attr("stroke-width", 3)
         .attr("class", "line")
         .attr("d", minLine);
      

      // Add the x-axis
      svg2.append("g")
         .attr("class", "x-axis")
         .attr("transform", "translate(0)")
         .call(d3.axisTop(xScale2).tickFormat(d3.format("d")));

      // Add the y-axis
      svg2.append("g")
         .attr("class", "y-axis")
         .call(d3.axisLeft(yScale2).tickFormat(function(d) {
            return months[d];
         }));

      // Add a title
      svg2.append("text")
         .attr("class", "title")
         .attr("x", width / 2)
         .attr("y", -20)
         .attr("text-anchor", "middle")
         .text("Monthly Temperatures with Details");

      // Create the legend element
      var legend = d3.select("#legend")
         .append("svg")
         .attr("width", 400)
         .attr("height", 50);

      // Append rectangles with color to the legend
      legend.selectAll("rect")
         .data(d3.range(0, 51, 10))
         .enter()
         .append("rect")
         .attr("x", function(d, i) { return i * 40; })
         .attr("y", 0)
         .attr("width", 40)
         .attr("height", 40)
         .attr("fill", function(d) { return colorScale(d); });

      // Add text labels to the legend
      legend.selectAll("text")
         .data(d3.range(0, 51, 10))
         .enter()
         .append("text")
         .attr("x", function(d, i) { return i * 40 + 10; })
         .attr("y", 35)
         .text(function(d) { return d; });

      // Listener event for when clicking the checkbox to chang emodes
      checkbox.addEventListener('change', () => {
         // Update the boolean variable based on the checkbox state
         displayMax = checkbox.checked;
      
         // change the fills of the  cells
         if (displayMax){
            svg.selectAll(".matrix-cell").style("fill", function(d) { return colorScale(d.max); })
            svg2.selectAll(".matrix-cell").style("fill", function(d) { return colorScale(d.max); })
         }
         else {
            svg.selectAll(".matrix-cell").style("fill", function(d) { return colorScale(d.min); })
            svg2.selectAll(".matrix-cell").style("fill", function(d) { return colorScale(d.min); })
         }
       });

   }
   
)

