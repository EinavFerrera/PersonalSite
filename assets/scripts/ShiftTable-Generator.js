let numOfSholtim = 5;
let numOfShifts = 5;
// Number of vertices in graph
let V = numOfSholtim + numOfShifts + 2; // +2 for source and sink
let daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
let names = [
  "Bak",
  "Einav",
  "Milshtein",
  "Azulay",
  "Solomin",
  "Solomin",
  "Solomin",
  "Solomin",
  "Solomin",
  "Solomin",
  "Solomin",
  "Solomin",
  "Solomin",
  "Solomin",
  "Solomin",
];

// Let us create a graph shown in the above example
let graph = [
  [0, 2, 3, 3, 3, 3, /**/ 0, 0, 0, 0, 0, /**/ 0], // s to sholtim
  [0, 0, 0, 0, 0, 0, /**/ 1, 1, 1, 0, 1, /**/ 0], // a to shift
  [0, 0, 0, 0, 0, 0, /**/ 0, 1, 1, 1, 0, /**/ 0], // b to shift
  [0, 0, 0, 0, 0, 0, /**/ 1, 1, 1, 0, 1, /**/ 0], // c to shift
  [0, 0, 0, 0, 0, 0, /**/ 0, 1, 0, 1, 1, /**/ 0], // d to shift
  [0, 0, 0, 0, 0, 0, /**/ 1, 0, 1, 1, 0, /**/ 0], // e to shift
  [0, 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /**/ 1], // 1 to sink
  [0, 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /**/ 4], // 2 to sink
  [0, 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /**/ 3], // 3 to sink
  [0, 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /**/ 3], // 4 to sink
  [0, 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /**/ 3], // 5 to sink
  [0, 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /**/ 0], // t
];
let u, v;
let rGraph = new Array(V);
for (u = 0; u < V; u++) {
  rGraph[u] = new Array(V);
  for (v = 0; v < V; v++) rGraph[u][v] = graph[u][v];
}

function generate() {
  let generatedTable = fordFulkerson(graph, 0, 11, rGraph);
  let targetSum = sumTarget();
  if (generatedTable != targetSum) {
    alert(
      "ERROR! we are missing " + (targetSum - generatedTable) + " sholtim!"
    );
    for (let i = 0; i < numOfShifts; i++) {
      if (rGraph[i + 1 + numOfShifts][numOfSholtim + numOfSholtim + 1] > 0) {
        if (rGraph[i + 1 + numOfShifts][numOfSholtim + numOfSholtim + 1] == 1) {
          alert(
            "missing " +
              rGraph[i + 1 + numOfShifts][numOfSholtim + numOfSholtim + 1] +
              " sholet for shift: " +
              daysOfWeek[i]
          );
        } else {
          alert(
            "missing " +
              rGraph[i + 1 + numOfShifts][numOfSholtim + numOfSholtim + 1] +
              " sholtim for shift: " +
              daysOfWeek[i]
          );
        }
      }
    }
    return;
  } else {
    alert("SUCCESS! here is the final table: ");

    for (let i = 0; i < names.length; i++) {
      let validShifts = printSholetShifts(i); // Assuming printSholetShifts is a function returning an array
      let count = validShifts.filter((shift) => shift === 1).length;

      const newSholetElemnt = $(
        '<div id="sholet-' +
          i +
          '" style="display: flex; flex-direction: column"' +
          'class="p-3">' +
          '<button type="button" class="btn btn-dark position-relative px-5">' +
          '<span class="name">' +
          names[i] +
          "</span>" +
          '<span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">' +
          count +
          "</span>" +
          "</button>" +
          '<ul class="list-group">' +
          "</ul>" +
          "</div>"
      );

      // Appending the new element to the parent container
      $("#sholtim-container").append(newSholetElemnt);

      // Update shift list
      for (let j = 0; j < numOfShifts; j++) {
        if (validShifts.length > 0 && validShifts[j] === 1) {
          const newSholetShiftsListElemnt = $(
            '<li class="list-group-item ">' + daysOfWeek[j] + "</li>"
          );
          $("#sholet-" + i + "> .list-group").append(newSholetShiftsListElemnt);
        }
      }
    }
  }
}

// Returns true if there is a path from source
// 's' to sink 't' in residual graph. Also
// fills parent[] to store the path
function bfs(rGraph, s, t, parent) {
  // Create a visited array and mark all vertices as not visited
  let visited = new Array(V);
  for (let i = 0; i < V; ++i) visited[i] = false;

  // Create a queue, enqueue source vertex and mark source vertex as visited
  let queue = [];
  queue.push(s);
  visited[s] = true;
  parent[s] = -1;

  // Standard BFS Loop
  while (queue.length != 0) {
    let u = queue.shift();

    for (let v = 0; v < V; v++) {
      if (visited[v] == false && rGraph[u][v] > 0) {
        // If we find a connection to the sink
        // node, then there is no point in BFS
        // anymore We just have to set its parent
        // and can return true
        if (v == t) {
          parent[v] = u;
          return true;
        }
        queue.push(v);
        parent[v] = u;
        visited[v] = true;
      }
    }
  }

  // We didn't reach sink in BFS starting
  // from source, so return false
  return false;
}

// Returns the maximum flow from s to t in
// the given graph
function fordFulkerson(graph, s, t, rGraph) {
  // Create a residual graph and fill the
  // residual graph with given capacities
  // in the original graph as residual
  // capacities in residual graph

  // Residual graph where rGraph[i][j]
  // indicates residual capacity of edge
  // from i to j (if there is an edge.
  // If rGraph[i][j] is 0, then there is
  // not)

  // This array is filled by BFS and to store path
  let parent = new Array(V);

  // There is no flow initially
  let max_flow = 0;

  // Augment the flow while there
  // is path from source to sink
  while (bfs(rGraph, s, t, parent)) {
    // Find minimum residual capacity of the edges
    // along the path filled by BFS. Or we can say
    // find the maximum flow through the path found.
    let path_flow = Number.MAX_VALUE;
    for (v = t; v != s; v = parent[v]) {
      u = parent[v];
      path_flow = Math.min(path_flow, rGraph[u][v]);
    }

    // Update residual capacities of the edges and
    // reverse edges along the path
    for (v = t; v != s; v = parent[v]) {
      u = parent[v];
      rGraph[u][v] -= path_flow;
      rGraph[v][u] += path_flow;
    }

    // Add path flow to overall flow
    max_flow += path_flow;
  }
  // Return the overall flow
  return max_flow;
}

function printSholetShifts(i) {
  let shifts = [];
  for (let j = 0; j < numOfShifts; j++) {
    shifts.push(rGraph[j + 1 + numOfShifts][i + 1]);
  }
  return shifts;
}
function sumTarget() {
  let sum = 0;
  for (let j = 0; j < numOfShifts; j++) {
    sum += graph[j + 1 + numOfShifts][numOfSholtim + numOfSholtim + 1];
  }
  return sum;
}
