var height = document.getElementById('sunburst').clientHeight;
var width = document.getElementById('sunburst').clientWidth;
if (!height || height == 0 ) { height = 780; }
if (!width || width == 0) { width = 780; }

var radius = Math.min(width, height) / 2;
// var filename ="emotions.csv";
var filename = "https://raw.githubusercontent.com/noso2k1/ruota-emozioni/main/emotions.csv";

function filter_min_arc_size_text(d, i) {return (d.dx*d.depth*radius/4)>14}; 

// Mapping of step names to colors.
var colors = {
  "anger:rabbia"      : "#3366cc",
  "disgust:disgusto"  : "#dc3912",
  "surprise:sorpresa" : "#ff9900",
  "happy:felicità"    : "#109618",
  "fear:paura"        : "#990099",
  "sad:tristezza"     : "#0099c6"
};


var svg = d3.select("#sunburst").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    
var partition = d3.layout.partition()
    .sort(function(a, b) { return d3.ascending(a.name, b.name); })
    .size([2 * Math.PI, radius]);

var arc = d3.svg.arc()
    .startAngle(function(d) { return d.x; })
    .endAngle(function(d) { return d.x + d.dx - .01 / (d.depth + .5); })
    .innerRadius(function(d) { return ( radius - 20) / 3 * (d.depth - 1) + 20; })
    .outerRadius(function(d) { return ( radius - 20) / 3 * (d.depth) - 1 + 20; });

d3.text(filename, function(error, text) {
  if (error) return console.warn(error);
  // Compute the initial layout on the entire tree to sum sizes.
  // Also compute the full name and fill color for each node, and stash the children so they can be restored as we descend.
  var csv = d3.csv.parseRows(text);
  var root = buildHierarchy(csv);
  
  // Nel file: il testo prima dei ":" è in inglese (indice 0) mentre quello dopo è in italiano (indice 1)
  var langVal = '',
      langID  = '';
  var langDOM = d3.selectAll("input")[0];
  for (var i=0; i < langDOM.length; i++){
    if (langDOM[i].checked) {
        langVal = langDOM[i].value;
        break;
    };
  };
  switch (langVal) {
    case "it": langID = 1;
      break;
    case "en": langID = 0;
      break;
  };
  
  partition
      .value(function(d) { return d.size; })
      .nodes(root)
      .forEach(function(d) {
        d._children = d.children;
        d.sum = d.value;
        d.key = key(d);
        d.fill = fill(d);
      });

  // Now redefine the value function to use the previously-computed sum.
  partition
      .children(function(d, depth) { return depth < 3 ? d._children : null; })
      .value(function(d) { return d.sum; });

  var center = svg.append("circle")
      .attr("r", radius / 4)
      .on("click", zoomOut)
      .style("fill", "white")
      .style("pointer-events", "all")
      .style("cursor", "pointer");

  center.append("title")
      .text("zoom out");
      
  var partitioned_data=partition.nodes(root).slice(1)

  var path = svg.selectAll("path")
      .data(partitioned_data)
    .enter().append("path")
      .attr("d", arc)
      .style("fill", function(d) { return d.fill; })
      .each(function(d) { this._current = updateArc(d); })
      .on("click", zoomIn)
		.on("mouseover", mouseOverArc)
      .on("mouseout", mouseOutArc);
      
  var texts = svg.selectAll("text")
      .data(partitioned_data)
    .enter().append("text")
		.filter(filter_min_arc_size_text)    	
    	.attr("transform", function(d) { return "rotate(" + computeTextRotation(d) + ")"; })
        .attr("x", function(d) {return computeTextPosition(d);})
		//.attr("dx", "6") // margin
      .style("text-anchor", "middle")
      .attr("dy", ".35em") // vertical-align	
		.text(function(d,i) {return d.name.split(":")[langID]})

  //Manges the legend
  drawLegend(langID);
        
  // Manages the selection of the language
  d3.selectAll("input").on("change", function change() {
    if (this.value == "en") {
      langID = 0;
    } else {
      langID = 1;
    };
    
    // Change language of the sunburst
    texts 	
      .text(function(d,i) {return d.name.split(":")[langID]});
    
    // Change language of the legend  
    d3.select("#legend").selectAll("text")
      .text(function(d,i) {return d.key.split(":")[langID] });
      
    if (langID == 0) {
      document.getElementById("legendTitle").innerHTML = "Legend";
    }else{
      document.getElementById("legendTitle").innerHTML = "Legenda";
    }
   });
  
  
  function zoomIn(p) {
    if (p.depth > 1) p = p.parent;
    if (!p.children) return;
    zoom(p, p);
  }

  function zoomOut(p) {
    if (!p.parent) return;
    zoom(p.parent, p);
  }

  // Zoom to the specified new root.
  function zoom(root, p) {
    if (document.documentElement.__transition__) return;

    // Rescale outside angles to match the new layout.
    var enterArc,
        exitArc,
        outsideAngle = d3.scale.linear().domain([0, 2 * Math.PI]);

    function insideArc(d) {
      return p.key > d.key
          ? {depth: d.depth - 1, x: 0, dx: 0} : p.key < d.key
          ? {depth: d.depth - 1, x: 2 * Math.PI, dx: 0}
          : {depth: 0, x: 0, dx: 2 * Math.PI};
    }

    function outsideArc(d) {
      return {depth: d.depth + 1, x: outsideAngle(d.x), dx: outsideAngle(d.x + d.dx) - outsideAngle(d.x)};
    }

    center.datum(root);

    // When zooming in, arcs enter from the outside and exit to the inside.
    // Entering outside arcs start from the old layout.
    if (root === p) enterArc = outsideArc, exitArc = insideArc, outsideAngle.range([p.x, p.x + p.dx]);
	
	var new_data=partition.nodes(root).slice(1)

    path = path.data(new_data, function(d) { return d.key; });
	 	 
	// When zooming out, arcs enter from the inside and exit to the outside.
    // Exiting outside arcs transition to the new layout.
    if (root !== p) enterArc = insideArc, exitArc = outsideArc, outsideAngle.range([p.x, p.x + p.dx]);

    d3.transition().duration(d3.event.altKey ? 7500 : 750).each(function() {
      path.exit().transition()
          .style("fill-opacity", function(d) { return d.depth === 1 + (root === p) ? 1 : 0; })
          .attrTween("d", function(d) { return arcTween.call(this, exitArc(d)); })
          .remove();
          
      path.enter().append("path")
          .style("fill-opacity", function(d) { return d.depth === 2 - (root === p) ? 1 : 0; })
          .style("fill", function(d) { return d.fill; })
          .on("click", zoomIn)
			 .on("mouseover", mouseOverArc)
      	 //.on("mousemove", mouseMoveArc)
      	 .on("mouseout", mouseOutArc)
          .each(function(d) { this._current = enterArc(d); });

      path.transition()
          .style("fill-opacity", 1)
          .attrTween("d", function(d) { return arcTween.call(this, updateArc(d)); });
    });
    
	texts = texts.data(new_data, function(d) { return d.key; })

	texts.exit()
	         .remove()    
    texts.enter()
            .append("text")
      	
    texts.style("opacity", 0)
      .attr("transform", function(d) { return "rotate(" + computeTextRotation(d) + ")"; })
        .attr("x", function(d){return computeTextPosition(d);})
		//.attr("dx", "6") // margin
      .attr("dy", ".35em") // vertical-align
      .style("text-anchor", "middle")
      .filter(filter_min_arc_size_text)    	
      .text(function(d,i) {return d.name.split(":")[langID]})
		.transition().delay(750).style("opacity", 1)

  }
});

function key(d) {
  var k = [], p = d;
  while (p.depth) k.push(p.name), p = p.parent;
  return k.reverse().join(".");
}

function fill(d) {
  var p = d;
  while (p.depth > 1) p = p.parent;
  //var c = d3.lab(hue(p.name)).brighter(d.depth);
  var c = d3.lab(colors[p.name]).brighter(d.depth); 
  return c;
}

function arcTween(b) {
  var i = d3.interpolate(this._current, b);
  this._current = i(0);
  return function(t) { return arc(i(t)); };
}

function updateArc(d) {
  return {depth: d.depth, x: d.x, dx: d.dx};
}

// Take a 2-column CSV and transform it into a hierarchical structure suitable
// for a partition layout. The first column is a sequence of step names, from
// root to leaf, separated by hyphens. The second column is a count of how 
// often that sequence occurred.
function buildHierarchy(csv,lang) {
  var root = {"name": "root", "children": []};
  for (var i = 0; i < csv.length; i++) {
    var sequence = csv[i][0];
    var size = +csv[i][1];
    if (isNaN(size)) { continue; } // e.g. if this is a header row
      
    var parts = sequence.split("-");
    var currentNode = root;
    for (var j = 0; j < parts.length; j++) {
      var children = currentNode["children"];
      var nodeName = parts[j];
      var childNode;
      if (j + 1 < parts.length) {
   // Not yet at the end of the sequence; move down the tree.
 	var foundChild = false;
 	for (var k = 0; k < children.length; k++) {
 	  if (children[k]["name"] == nodeName) {
 	    childNode = children[k];
 	    foundChild = true;
 	    break;
 	  }
 	}
  // If we don't already have a child node for this branch, create it.
 	if (!foundChild) {
 	  childNode = {"name": nodeName, "children": []};
 	  children.push(childNode);
 	}
 	currentNode = childNode;
      } else {
 	// Reached the end of the sequence; create a leaf node.
 	childNode = {"name": nodeName, "size": size};
 	children.push(childNode);
      }
    }
  }
  return root;
}

function format_number(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function format_description(d) {
  var description = d.description;
  return '<b>' + d.name + '</b>';
}

function computeTextRotation(d) {
	var angle=(d.x +d.dx/2)*180/Math.PI - 90;
    if (angle <= -90 || angle >= 90) { angle = angle + 180; }
	return angle;
}

function computeTextPosition(d) {
  var angle=(d.x +d.dx/2)*180/Math.PI - 90
  var arcLength = (radius - 20) / 3;
  if (angle <= -90 || angle >= 90) {
    return - ( ( arcLength * (d.depth - 1) + 20 ) + arcLength / 2 );
  }else{
    var textPos = ( arcLength * (d.depth - 1) + 20 ) + arcLength / 2 ;
    return textPos;
  }
}

function mouseOverArc(d) {
	d3.select(this).attr("stroke","black");
}

function mouseOutArc(){
	d3.select(this).attr("stroke","");
}

function drawLegend(langID) {

  // Dimensions of legend item: width, height, spacing, radius of rounded rect.
  var li = { w: 150, h: 30, s: 3, r: 3 };

  var legend = d3.select("#legend").append("svg:svg")
      .attr("width", li.w)
      .attr("height", d3.keys(colors).length * (li.h + li.s));
      
  var g = legend.selectAll("g")
      .data(d3.entries(colors))
      .enter().append("svg:g")
      .attr("transform", function(d, i) { return "translate(0," + i * (li.h + li.s) + ")"; });

  g.append("svg:rect")
      .attr("rx", li.r)
      .attr("ry", li.r)
      .attr("width", li.w)
      .attr("height", li.h)
      .style("fill", function(d) {return d3.lab(d.value).brighter(1);});
      
  g.append("svg:text")
      .attr("x", li.w / 2)
      .attr("y", li.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .text(function(d) {return d.key.split(":")[langID]; })  // Default language: Italian
}
