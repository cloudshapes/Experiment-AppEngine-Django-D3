

//// IMPORTED STUFF STARTS HERE ///////////////
function d3_cs_identity(d) {
  return d;
}
//// IMPORTED STUFF ENDS HERE ///////////////



// A rudimentary force layout using Gauss-Seidel.
d3.cloudshapes.force = function() {
//d3.layout.force = function() {

  var force = {},
      event = d3.dispatch("start", "tick", "end"),
      size = [1, 1],
      drag,
      alphaCooling = true, // Flag to indicate whether alphaCooling should happen. Default is true.
      alpha, // Need to understand alpha.
      friction = .9, // Or rather, velocity decay.
      nodes = [],
      gravity = 0, // A weak geometric constraint similar to a virtual spring connecting each node to the center of the layout's size
      charge = 80, // Need to understand. Negative equals repulsion, positive equals attraction.
      charges,
      throwFlag = false, // flag to indicate whether to throw or not ....
      stopOnMouseOverFlag = false, // flag to indicate whether to stop on mouse over or not ..
      theta = .8;  // Theta determines the accuracy of the computation



//      links = [];
/*
      distances,
      strengths,
      ;
*/

  /////////////////////////////// Repulse function: not entirely sure how this sits here.
  function repulse(node) {
    return function(quad, x1, _, x2) {
      if (quad.point !== node) {
        var dx = quad.cx - node.x,
            dy = quad.cy - node.y,
            dn = 1 / Math.sqrt(dx * dx + dy * dy);


        /* Barnes-Hut criterion. */
        if ((x2 - x1) * dn < theta) {
          var k = quad.charge * dn * dn;
          node.px -= dx * k;
          node.py -= dy * k;

          return true;
        }


        if (quad.point && isFinite(dn)) {
          var k = quad.pointCharge * dn * dn;
          node.px -= dx * k;
          node.py -= dy * k;

        }

      }

      return !quad.charge;
    };
  }


  /////////////////// force.tick //////////////////////
  force.tick = function(_elapsed) {
    // Simulated annealing, basically:
    if (alphaCooling == true)
	alpha *= .99;

    if (alpha < .005) {
      event.end({type: "end", alpha: alpha = 0});
      return true;
    }


    var n = nodes.length,
//        m = links.length,
        q,
        i, // current index
        o, // current object
        s, // current source
        t, // current target
        l, // current distance
        k, // current force
        x, // x-distance
        y; // y-distance


    // RDNOTE: THIS MAKES A DIFFERENCE: 
    // apply gravity forces
    if (k = alpha * gravity) {
      x = size[0] / 2;
      y = size[1] / 2;
      i = -1; if (k) while (++i < n) {
        o = nodes[i];
        o.x += (x - o.x) * k;
        o.y += (y - o.y) * k;
      }
    }


    // RDNOTE: THIS NEEDS "start" upgrading to work: 
    // compute quadtree center of mass and apply charge forces
    if (charge) {
      d3_layout_forceAccumulate(q = d3.geom.quadtree(nodes), alpha, charges);
      i = -1; while (++i < n) {
        if (!(o = nodes[i]).fixed) {

          q.visit(repulse(o));

        }
      }
    }



    // position verlet integration
    i = -1; while (++i < n) {
      o = nodes[i];
      if (o.fixed) {
        o.x = o.px;
        o.y = o.py;
      } else {
        o.x -= (o.px - (o.px = o.x)) * friction;
        o.y -= (o.py - (o.py = o.y)) * friction;
      }
    }


    event.tick({type: "tick", alpha: alpha, elapsed:_elapsed});
  };


  /////////////////// GETTERS AND SETTERS - STARTS //////////////////////
  force.nodes = function(x) {
    if (!arguments.length) return nodes;
    nodes = x;
    return force;
  };

/*
  force.links = function(x) {
    if (!arguments.length) return links;
    links = x;
    return force;
  };
*/

  force.size = function(x) {
    if (!arguments.length) return size;
    size = x;
    return force;
  };

  force.alphaCooling = function(x) {
    if (!arguments.length) return alphaCooling;
    alphaCooling = x;
    return force;
  };


  force.friction = function(x) {
    if (!arguments.length) return friction;
    friction = x;
    return force;
  };

  force.theta = function(x) {
    if (!arguments.length) return theta;
    theta = x;
    return force;
  };


  force.throwFlag = function(x) {
    if (!arguments.length) return throwFlag;
    throwFlag = x;
    return force;
  };

  force.stopOnMouseOverFlag = function(x) {
    if (!arguments.length) return stopOnMouseOverFlag;
    stopOnMouseOverFlag = x;
    return force;
  };


  force.charge = function(x) {
    if (!arguments.length) return charge;
    charge = x;
    return force;
  };



  force.gravity = function(x) {
    if (!arguments.length) return gravity;
    gravity = x;
    return force;
  };

  force.alpha = function(x) {
    if (!arguments.length) return alpha;

    if (alpha) { // if we're already running
      if (x > 0) alpha = x; // we might keep it hot
      else alpha = 0; // or, next tick will dispatch "end"
    } else if (x > 0) { // otherwise, fire it up!
      event.start({type: "start", alpha: alpha = x});
      d3.timer(force.tick);
    }

    return force;
  };
  /////////////////// GETTERS AND SETTERS - ENDS //////////////////////


  /////////////////// force.start //////////////////////
  force.start = function() {
    var i,
        j,
        n = nodes.length,
//        m = links.length,
        w = size[0],
        h = size[1],
        neighbors,
        o;

    for (i = 0; i < n; ++i) {
//      (o = nodes[i]).index = i;
      o = nodes[i];
      o.index = i;
      o.weight = 0;
      o.throwFlag = throwFlag;
      o.stopOnMouseOverFlag = stopOnMouseOverFlag;
    }


    // initialize neighbors lazily
    function neighbor() {
      if (!neighbors) {
        neighbors = [];
        for (j = 0; j < n; ++j) {
          neighbors[j] = [];
        }
      }
      return neighbors[i];
    }


    // initialize node position based on first neighbor
    function position(dimension, size) {
      var neighbors = neighbor(i),
          j = -1,
          m = neighbors.length,
          x;
      while (++j < m) if (!isNaN(x = neighbors[j][dimension])) return x;
      return Math.random() * size;
    }


    for (i = 0; i < n; ++i) {
      o = nodes[i];
      if (isNaN(o.x)) o.x = position("x", w);
      if (isNaN(o.y)) o.y = position("y", h);
      if (isNaN(o.px)) o.px = o.x;
      if (isNaN(o.py)) o.py = o.y;
    }


    charges = [];

    if (typeof charge === "function") for (i = 0; i < n; ++i) charges[i] = +charge.call(this, nodes[i], i);
    else for (i = 0; i < n; ++i) charges[i] = charge;

    return force.resume();
  };



  /////////////////// force.resume and stop //////////////////////
  force.resume = function() {
    return force.alpha(.1);
  };

  force.stop = function() {
    return force.alpha(0);
  };


  /////////////////// force.drag etc //////////////////////
  // use `node.call(force.drag)` to make nodes draggable
  force.drag = function() {
    if (!drag) drag = d3.behavior.drag()
        .origin(d3_cs_identity)
        .on("dragstart", d3_layout_forceDragstart)
        .on("drag", dragmove)
        .on("dragend", d3_layout_forceDragend);

    this.on("mouseover.force", d3_layout_forceMouseover)
        .on("mouseout.force", d3_layout_forceMouseout)
        .call(drag);
  };

  function dragmove(d) {
    d.px = d3.event.x, d.py = d3.event.y;
    force.resume(); // restart annealing
  }

  return d3.rebind(force, event, "on");
};


// The fixed property has three bits:
// Bit 1 can be set externally (e.g., d.fixed = true) and show persist.
// Bit 2 stores the dragging state, from mousedown to mouseup.
// Bit 3 stores the hover state, from mouseover to mouseout.
// Dragend is a special case: it also clears the hover state.

function d3_layout_forceDragstart(d) {
  d.fixed |= 2; // set bit 2
}

function d3_layout_forceDragend(d) {
  d.fixed &= ~6; // unset bits 2 and 3
  if (d.throwFlag == true)	{
	  d.px = d.x + (d.x - d.px);
	  d.py = d.y + (d.y - d.py);
  }
}

function d3_layout_forceMouseover(d) {
  if (d.stopOnMouseOverFlag)	{
	  d.fixed |= 4; // set bit 3
	  d.px = d.x, d.py = d.y; // set velocity to zero
  }
}

function d3_layout_forceMouseout(d) {
  d.fixed &= ~4; // unset bit 3
}

function d3_layout_forceAccumulate(quad, alpha, charges) {
  var cx = 0,
      cy = 0;
  quad.charge = 0;
  if (!quad.leaf) {
    var nodes = quad.nodes,
        n = nodes.length,
        i = -1,
        c;
    while (++i < n) {
      c = nodes[i];
      if (c == null) continue;
      d3_layout_forceAccumulate(c, alpha, charges);
      quad.charge += c.charge;
      cx += c.charge * c.cx;
      cy += c.charge * c.cy;
    }
  }
  if (quad.point) {
    // jitter internal nodes that are coincident
    if (!quad.leaf) {
      quad.point.x += Math.random() - .5;
      quad.point.y += Math.random() - .5;
    }
    var k = alpha * charges[quad.point.index];
    quad.charge += quad.pointCharge = k;
    cx += k * quad.point.x;
    cy += k * quad.point.y;
  }
  quad.cx = cx / quad.charge;
  quad.cy = cy / quad.charge;
}

var d3_layout_forceLinkDistance = 20,
    d3_layout_forceLinkStrength = 1;


