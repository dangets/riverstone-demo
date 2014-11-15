var riverstone = (function() {
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

  var svgHeight = 400;
  var svgWidth = 800;
  var histogram = d3.select("#histogram")
    .append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth);

  var histMain = histogram.append("g");

  return {
    addStudent: function(name, bday, gender) {
      students.push(new Student(name, bday, gender));
      console.debug("added student: " + students);
    },

    addStudentFromForm: function() {
      students.push(getRandomStudent())
      //var name = document.getElementById("inputName").value;
      //var bday = document.getElementById("inputBday").value;
      //var gender = document.getElementById("inputGender").value;
      //// TODO: validate input
      //return this.addStudent(name, bday, gender);
    },

    populateWithRandomData: function(count) {
      var i = 0;
      while (i < count) {
        students.push(getRandomStudent());
        i++;
      }
    },

    redraw: function() {
      //this.redrawList();
      this.redrawHistogram();
    },

    redrawList: function() {
      var studentRow = studentUl
        .selectAll("li")
        .data(students, function(d) { return d.name; });

      studentRow.enter()
        .append("li")
        .html(function (d) { return d.toString(); });
    },

    redrawHistogram: function() {
      var studentsByMonth = d3.nest()
        .key(function(d) { return d.bday.getMonth(); })
        .entries(students);

      var mostEntriesInGroup = d3.max(studentsByMonth, function(d) { return d.values.length; });

      //console.debug(studentsByMonth);
      //console.debug(mostEntriesInGroup);

      var scaleX = d3.scale.ordinal()
        .domain(d3.range(0, 12))
        .rangeRoundBands([0, svgWidth], 0.1);

      var scaleY = d3.scale.linear()
        .domain([0, mostEntriesInGroup])
        .rangeRound([svgHeight, 0]);

      var bars = histMain.selectAll("rect")
        .data(studentsByMonth);

      bars.enter()
        .append("rect")
        .attr("fill", "steelblue")
        .attr("x", function(d) { return scaleX(d.key); })
        .attr("y", function(d) { return scaleY(d.values.length); })
        .attr("width", scaleX.rangeBand())
        .attr("height", 0)
        .transition(1000)
        .attr("height", function(d) { return svgHeight - scaleY(d.values.length); });

      bars.transition()
        .attr("y", function(d) { return scaleY(d.values.length); })
        .attr("height", function(d) { return svgHeight - scaleY(d.values.length); });

      bars.exit()
        .attr("y", function(d) { return scaleY(d.values.length); })
        .attr("height", function(d) { return svgHeight - scaleY(d.values.length); });
    },
  };
})();

riverstone.populateWithRandomData(50);
riverstone.redraw();
