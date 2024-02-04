let numOfSholtim, numOfShifts;
let notValid;

function generate() {
  let numOfSholtim = namesArray.length;
  let numOfShifts = shiftNeeds.length;
  notValid = false;
  for (u = 0; u < Vertix; u++) {
    rGraph[u] = new Array(Vertix);
    for (v = 0; v < Vertix; v++) rGraph[u][v] = graph[u][v];
  }
  fordFulkerson(0, Vertix - 1);
  console.log("rGraph:", rGraph);
  for (let j = 0; j < Vertix; j++) {
    if (rGraph[j][Vertix - 1] > 0) {
      showToast(
        "ERROR! we are missing " +
          rGraph[j][Vertix - 1] +
          " sholtim at " +
          shiftsNames[j - 1 - numOfSholtim],
        true
      );
      console.log(
        " ERROR! we are missing " +
          rGraph[j][Vertix - 1] +
          " sholtim at " +
          shiftsNames[j - 1 - numOfSholtim]
      );
      notValid = true;
    }
  }
  if (notValid === true) {
    return;
  }
  showToast("SUCCESS! ", false);
  for (let i = 0; i < numOfSholtim; i++) {
    let validShifts = [];
    validShifts = sholetShifts(i, numOfShifts, numOfSholtim);
    let count = validShifts.filter((shift) => shift === 1).length;
    userDisplay(i, count, validShifts);
  }
}

// Returns true if there is a path from source
// 's' to sink 't' in residual graph. Also
// fills parent[] to store the path
function bfs(s, t, parent) {
  // Create a visited array and mark all vertices as not visited
  let visited = new Array(Vertix);
  for (let i = 0; i < Vertix; ++i) visited[i] = false;

  // Create a queue, enqueue source vertex and mark source vertex as visited
  let queue = [];
  queue.push(s);
  visited[s] = true;
  parent[s] = -1;

  // Standard BFS Loop
  while (queue.length != 0) {
    let u = queue.shift();

    for (let v = 0; v < Vertix; v++) {
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
function fordFulkerson(s, t) {
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
  let parent = new Array(Vertix);

  // There is no flow initially
  let max_flow = 0;

  // Augment the flow while there
  // is path from source to sink
  while (bfs(s, t, parent)) {
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

function sholetShifts(i, numOfShifts, numOfSholtim) {
  let shiftsToDisplay = [];
  for (let j = 0; j < numOfShifts; j++) {
    shiftsToDisplay.push(rGraph[j + 1 + numOfSholtim][i + 1]);
  }

  return shiftsToDisplay;
}

function sumTarget() {
  let sum = 0;
  for (let j = 0; j < numOfShifts; j++) {
    sum += graph[j + 1 + numOfShifts][numOfSholtim + numOfSholtim + 1];
  }
  return sum;
}

function showToast(message, isError = false) {
  const toastContainer = $(".toast-container");

  // Create a new toast element
  const newToastElement = $(
    '<div class="toast" role="alert" aria-live="assertive" aria-atomic="true">' +
      '<div class="toast-header">' +
      '<img src="../assets/images/magic.svg" class="rounded me-2" alt="Wizard" />' +
      '<strong class="me-auto">Kosem</strong>' +
      '<small class="text-body-secondary">just now</small>' +
      '<button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>' +
      "</div>" +
      '<div class="toast-body">' +
      message +
      "</div>" +
      "</div>"
  );

  // Set toast background color based on error status
  if (isError) {
    newToastElement.addClass("bg-danger");
  } else {
    newToastElement.addClass("bg-success");
  }

  // Append the new toast element to the toast container
  toastContainer.append(newToastElement);

  // Initialize Bootstrap Toast
  const toast = new bootstrap.Toast(newToastElement);

  // Show the toast
  toast.show();
}

function userDisplay(i, count, validShifts) {
  let numOfShifts = shiftNeeds.length;
  const newSholetElemnt = $(
    '<div id="sholet-' +
      i +
      '" style="display: flex; flex-direction: column"' +
      'class="p-3">' +
      '<button type="button" class="btn btn-dark position-relative px-5">' +
      '<span class="name">' +
      namesArray[i] +
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
        '<li class="list-group-item ">' + shiftsNames[j] + "</li>"
      );
      $("#sholet-" + i + "> .list-group").append(newSholetShiftsListElemnt);
    }
  }
}
function shiftDisplay(i, count, validShifts) {
  let numOfShifts = shiftNeeds.length;
  const newSholetElemnt = $(
    '<div id="sholet-' +
      i +
      '" style="display: flex; flex-direction: column"' +
      'class="p-3">' +
      '<button type="button" class="btn btn-dark position-relative px-5">' +
      '<span class="name">' +
      namesArray[i] +
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
        '<li class="list-group-item ">' + shiftsNames[j] + "</li>"
      );
      $("#sholet-" + i + "> .list-group").append(newSholetShiftsListElemnt);
    }
  }
}
