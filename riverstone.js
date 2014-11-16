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

  histByMonth = function() {
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var studentsByMonth = d3.nest()
      .key(function(d) { return d.bday.getMonth(); })
      .entries(students);

    var xRange = d3.range(0, monthNames.length);
    var xValues = monthNames;

    my.redrawHistogram(studentsByMonth, xRange, xValues);
  };

  histByDayOfWeek = function() {
    var daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    var data = d3.nest()
      .key(function(d) { return d.bday.getDay(); })
      .entries(students);

    var xRange = d3.range(0, daysOfWeek.length);
    var xValues = daysOfWeek;

    my.redrawHistogram(data, xRange, xValues);
  };


  // PUBLIC FUNCTIONS -----------------------------------

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

  my.redraw = function() {
    //this.redrawList();
    //histByMonth();
    histByDayOfWeek();
  };

  my.redrawList = function() {
    var studentRow = studentUl
    .selectAll("li")
    .data(students, function(d) { return d.name; });

    studentRow.enter()
    .append("li")
    .html(function (d) { return d.toString(); });
  };

  my.redrawHistogram = function(data, xRange, xValues) {
    var mostEntriesInGroup = d3.max(data, function(d) { return d.values.length; });

    //console.debug(data);
    //console.debug(mostEntriesInGroup);

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
      .tickFormat(d3.format(".0f"))
      .tickValues(d3.range(0, mostEntriesInGroup+1));

    histXAxisG.call(xAxis);
    histYAxisG.call(yAxis);

    var bars = histMain.selectAll("rect")
      .data(data, function(d) { return d.key; });

    bars.enter()
      .append("rect")
      .attr("fill", "steelblue")
      .attr("x", function(d) { return scaleX(d.key); })
      .attr("y", function(d) { return scaleY(d.values.length); })
      .attr("width", scaleX.rangeBand())
      .attr("height", 0);

    bars.transition()
      .attr("y", function(d) { return scaleY(d.values.length); })
      .attr("height", function(d) { return mainHeight - scaleY(d.values.length); });

    bars.exit()
      .transition()
      .attr("y", function(d) { return scaleY(d.values.length); })
      .attr("height", 0)
      .remove();
  };

  return my;
})();

riverstone.populateWithRandomData(25);
riverstone.redraw();
