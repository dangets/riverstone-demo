var riverstone = (function() {
  var my = {};

  Student = function(name, bday, gender) {
    this.name = name;
    this.bday = bday;
    this.gender = gender;
  };

  Student.prototype.toString = function() {
    return "Student{" +
      "name='" + this.name + "' " +
      "bday='" + this.bday + "' " +
      "gender='" + this.gender + "' " +
      "}"
  };

  var students = [
      new Student("Danny", new Date('1984-1-31'), "M"),
      new Student("Christine", new Date('1983-6-22'), "F"),
      new Student("Brucie", new Date('2015-3-7'), "F"),
  ];

  getRandomDate = function(lower, upper) {
    return new Date(lower.getTime() + Math.random() * (upper.getTime() - lower.getTime()));
  };

  getRandomGender = function() {
    if (Math.random() > 0.5)
      return "F"
    return "M"
  };

  var randomCount = 0;
  getRandomStudent = function() {
    var name = "random" + randomCount;
    var bday = getRandomDate(new Date("1999-01-01"), new Date("2002-01-01"));
    var gender = getRandomGender();
    randomCount += 1;
    return new Student(name, bday, gender);
  };

  var studentUl = d3.select("#vis")
    .append("ul");

  var svgHeight = 450;
  var svgWidth = 850;
  var mainHeight = 400;
  var mainWidth = 800;
  var yAxisWidth = svgWidth - mainWidth;
  var xAxisHeight = svgHeight - mainHeight;

  var histogram = d3.select("#histogram")
    .append("svg")
    .attr("class", "center")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("transform", "translate(0, 10)");

  var histMain = histogram
    .append("g")
    .attr("width", mainWidth)
    .attr("height", mainHeight)
    .attr("transform", "translate(" + yAxisWidth + ", 0)");

  var histXAxisG = histogram
    .append("g")
    .attr("width", mainWidth)
    .attr("height", xAxisHeight)
    .attr("transform", "translate(" + yAxisWidth + ", " + mainHeight + ")");

  var histYAxisG = histogram
    .append("g")
    .attr("width", yAxisWidth)
    .attr("height", mainHeight)
    .attr("transform", "translate(" + yAxisWidth + ", 0)");

  histByMonth = function(byGender) {
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var groupFn = function(d) { return d.bday.getMonth(); };
    var xRange = d3.range(0, monthNames.length);
    var xValues = monthNames;

    if (byGender) {
      my.redrawHistogram2(groupFn, xRange, xValues);
    } else {
      my.redrawHistogram(groupFn, xRange, xValues);
    }
  };

  histByDayOfWeek = function(byGender) {
    var daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    var groupFn = function(d) { return d.bday.getDay(); };
    var xRange = d3.range(0, daysOfWeek.length);
    var xValues = daysOfWeek;

    if (byGender) {
      my.redrawHistogram2(groupFn, xRange, xValues);
    } else {
      my.redrawHistogram(groupFn, xRange, xValues);
    }
  };

  clear = function() {
    histMain.selectAll("*").remove();
  };

  var mode = "byMonth";

  // PUBLIC FUNCTIONS -----------------------------------
  my.redrawWithCount = function() {
    var count = document.getElementById("inputCount").value;

    clear();
    students = [];
    this.populateWithRandomData(count);
    this.redraw();
  };

  my.switchToByMonth = function() {
    clear();
    mode = "byMonth";
    this.redraw();
  };

  my.switchToByDayOfWeek = function() {
    clear();
    mode = "byDayOfWeek";
    this.redraw();
  };

  my.redraw = function() {
    byGender = document.getElementById("byGender").checked;
    if (mode === "byMonth") {
      histByMonth(byGender);
    } else {
      histByDayOfWeek(byGender);
    }
  }

  my.showData = function() {
    this.redrawList();
  };

  my.addStudent = function(name, bday, gender) {
    students.push(new Student(name, bday, gender));
    console.debug("added student: " + students);
  };

  my.addStudentFromForm = function() {
    students.push(getRandomStudent())
    //var name = document.getElementById("inputName").value;
    //var bday = document.getElementById("inputBday").value;
    //var gender = document.getElementById("inputGender").value;
    //// TODO: validate input
    //return this.addStudent(name, bday, gender);
  };

  my.removeStudent = function() {
    students.shift();
  }

  my.populateWithRandomData = function(count) {
    var i = 0;
    while (i < count) {
      students.push(getRandomStudent());
      i++;
    }
  };

  my.redrawList = function() {
    var studentRow = studentUl
    .selectAll("li")
    .data(students, function(d) { return d.name; });

    studentRow.enter()
    .append("li")
    .html(function (d) { return d.toString(); });
  };

  my.redrawHistogram = function(groupFn, xRange, xValues) {
    var data = d3.nest()
      .key(groupFn)
      .entries(students);

    var mostEntriesInGroup = d3.max(data, function(d) { return d.values.length; });
    if (mostEntriesInGroup == 0)
      mostEntriesInGroup = 1;

    var scaleX = d3.scale.ordinal()
      .domain(xRange)
      .rangeRoundBands([0, mainWidth], 0.1);

    var scaleY = d3.scale.linear()
      .domain([0, mostEntriesInGroup])
      .rangeRound([mainHeight, 0]);

    var xAxis = d3.svg.axis()
      .scale(scaleX)
      .orient("bottom")
      .tickFormat(function(d) { return xValues[d]; });

    var yAxis = d3.svg.axis()
      .scale(scaleY)
      .orient("left")
      .tickFormat(d3.format(".0f"));
    if (mostEntriesInGroup < 10) {
      yAxis.tickValues(d3.range(0, mostEntriesInGroup+1));
    }

    histXAxisG.call(xAxis);
    histYAxisG.call(yAxis);

    var bars = histMain.selectAll("rect")
      .data(data, function(d) { return d.key; });

    bars.enter()
      .append("rect")
      .attr("fill", "steelblue")
      .attr("x", function(d) { return scaleX(d.key); })
      .attr("y", mainHeight)
      .attr("width", scaleX.rangeBand())
      .attr("height", 0);

    bars.transition()
      .attr("y", function(d) { return scaleY(d.values.length); })
      .attr("height", function(d) { return mainHeight - scaleY(d.values.length); });

    bars.exit()
      .transition()
      .attr("y", mainHeight)
      .attr("height", 0)
      .remove();
  };

  my.redrawHistogram2 = function(groupFn, xRange, xValues) {
    var data1 = d3.nest()
      .key(groupFn)
      .entries(students);

    var genderGroupFn = function(d) { return d.gender; };
    var data2 = d3.nest()
      .key(groupFn)
      .key(genderGroupFn)
      .entries(students);

    var mostEntriesInGroup = d3.max(data1, function(d) { return d.values.length; });
    if (mostEntriesInGroup === undefined)
      mostEntriesInGroup = 1;

    var scaleX = d3.scale.ordinal()
      .domain(xRange)
      .rangeRoundBands([0, mainWidth], 0.1);

    var scaleX2 = d3.scale.ordinal()
      .domain(["M", "F"])
      .rangeRoundBands([0, scaleX.rangeBand()], 0.1);

    var scaleY = d3.scale.linear()
      .domain([0, mostEntriesInGroup])
      .rangeRound([mainHeight, 0]);

    var xAxis = d3.svg.axis()
      .scale(scaleX)
      .orient("bottom")
      .tickFormat(function(d) { return xValues[d]; });

    var yAxis = d3.svg.axis()
      .scale(scaleY)
      .orient("left")
      .tickFormat(d3.format(".0f"));
    if (mostEntriesInGroup < 10) {
      yAxis.tickValues(d3.range(0, mostEntriesInGroup+1));
    }

    histXAxisG.call(xAxis);
    histYAxisG.call(yAxis);

    var bars = histMain.selectAll(".group1Rect")
      .data(data1, function(d) { return d.key; });

    bars.enter()
      .append("rect")
      .attr("class", "group1Rect")
      .attr("fill", "steelblue")
      .attr("x", function(d) { return scaleX(d.key); })
      .attr("y", mainHeight)
      .attr("width", scaleX.rangeBand())
      .attr("height", 0);

    bars.transition()
      .attr("y", function(d) { return scaleY(d.values.length); })
      .attr("height", function(d) { return mainHeight - scaleY(d.values.length); });

    bars.exit()
      .transition()
      .attr("y", mainHeight)
      .attr("height", 0)
      .remove();

    var bars2 = histMain.selectAll(".group2Rect")
      .data(data2, function(d) { return d.key; });

    bars2.enter()
      .append("g")
      .attr("class", "group2Rect")
      .attr("transform", function(d) { return "translate(" + scaleX(d.key) + ", 0)"; });

    bars2.exit()
      .remove();

    var bars2Bars = bars2.selectAll("rect")
      .data(function(d) { return d.values; }, function(d) { return d.key; });

    bars2Bars.enter()
      .append("rect")
      .attr("fill", function(d) { return d.key === "M" ? "#edf8b1" : "#7fcdbb"; })
      .attr("stroke-width", 1.5)
      .attr("stroke", "black")
      .attr("x", function(d) { return scaleX2(d.key); })
      .attr("width", scaleX2.rangeBand())
      .attr("y", mainHeight)
      .attr("height", 0);

    bars2Bars.transition()
      .attr("y", function(d) { return scaleY(d.values.length); })
      .attr("height", function(d) { return mainHeight - scaleY(d.values.length); });

    bars2Bars.exit()
      .transition()
      .attr("stroke-width", 0)
      .attr("y", mainHeight)
      .attr("height", 0)
      .remove();
  };

  return my;
})();

