let numOfSholtim, numOfShifts;
let notValid;
let perfectTable = false;
let originalNameArray = [];
let totalWeekSpacer;
let weekSpacer;
let toggelWeekView = true;
let succesGenerate = false;
const shiftsNamesShort = [
  "S1",
  "S2",
  "S3",
  "M1",
  "M2",
  "M3",
  "T1",
  "T2",
  "T3",
  "W1",
  "W2",
  "W3",
  "Th1",
  "Th2",
  "Th3",
  "F1",
  "F2",
  "F3",
  "Sa1",
  "Sa2",
  "Sa3",
];

function generateConfirmation() {
  if (perfectTable) {
    $("#confirmGenerateModal").modal("show");
    // Handle clear action on confirmation
    $("#confirmGenerateBtn").click(function () {
      $("#sholtim-container").empty();
      $("#shift-container").empty();
      perfectTable = false;
      generate();
    });
  } else if (succesGenerate) {
    $("#sholtim-container").empty();
    $("#shift-container").empty();
    generate();
  } else {
    generate();
  }
}

function generate() {
  generateGraph();
  let numOfSholtim = namesArray.length;
  let numOfShifts = shiftNeeds.length;
  notValid = false;
  for (u = 0; u < Vertix; u++) {
    rGraph[u] = new Array(Vertix);
    for (v = 0; v < Vertix; v++) rGraph[u][v] = graph[u][v];
  }

  fordFulkerson(0, Vertix - 1);
  for (let j = 0; j < numOfShifts; j++) {
    if (rGraph[j + numOfSholtim * 8 + 1][Vertix - 1] > 0) {
      if (notValid === false) {
        $("#collapseExample > div > ul").children("li").remove();
        const newLiElement = $(
          "<li style='font-weight:bold; text-decoration:underline;'>" +
            "MISSING:" +
            "</li>"
        );
        $("#collapseExample > div > ul").append(newLiElement);
        $("#toggel-error-view").addClass("visible");
      }
      showToast(
        "ERROR! we are missing " +
          rGraph[j + numOfSholtim * 8 + 1][Vertix - 1] +
          " sholtim at " +
          shiftsNames[j],
        true
      );
      const newLiElement = $(
        "<li>" +
          rGraph[j + numOfSholtim * 8 + 1][Vertix - 1] +
          " sholtim at " +
          shiftsNames[j] +
          "</li>"
      );
      $("#collapseExample > div > ul").append(newLiElement);
      notValid = true;
    }
  }
  if (notValid === true) {
    return;
  }
  showToast("SUCCESS! ", false);

  if (checkIntegrity() === false) {
    $("#collapseExample").collapse("hide");
    $("#toggel-error-view").removeClass("visible");
    perfectTable = true;
  }
  succesGenerate = true;

  for (let i = 0; i < numOfSholtim; i++) {
    let validShifts = [];
    validShifts = sholetShifts(i, numOfShifts, numOfSholtim);
    let count = validShifts.filter((shift) => shift === 1).length;
    userDisplay(i, count, validShifts);
  }
  shiftDisplay();
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

    let tempGraph = [];
    for (let i = 0; i < rGraph.length; i++) {
      tempGraph[i] = rGraph[i].slice();
    }
    orderByRatio(tempGraph);
  }
  // Return the overall flow
  return max_flow;
}

function orderByRatio(tempGraph) {
  numOfSholtim = namesArray.length;
  weekSpacer = 7;

  //Get the Ratio of each Sholet
  let sholetRatio = [];
  for (let i = 1; i <= numOfSholtim; i++) {
    let newSholetRatioObj = {
      id: i,
      ratio: rGraph[0][i] / (rGraph[0][i] + rGraph[i][0]),
      max_shifts: rGraph[0][i] + rGraph[i][0],
    };
    sholetRatio.push(newSholetRatioObj);
  }
  //randomize the order and than sort it by the ratio where the lowest ratio will be first
  let newOrder = sholetRatio.toSorted(() => Math.random() - 0.5);
  newOrder.sort((a, b) => a.ratio - b.ratio).reverse();

  for (let j = numOfSholtim + 1; j <= 8 * numOfSholtim; j++) {
    tempGraph[j][1] = rGraph[j][1];
  }
  sholetRatio.forEach((element) => {
    let newIndex =
      1 +
      newOrder.findIndex((object) => {
        return object.id === element.id;
      });
    let oldIndex = 1 + sholetRatio.indexOf(element);

    // sets the new rGraph - row swap
    rGraph[newIndex] = tempGraph[oldIndex].slice();

    // sets the new rGraph - column swap
    for (let i = 0; i < Vertix; i++) {
      rGraph[i][newIndex] = tempGraph[i][oldIndex];
    }
  });
}

function orderByRandom(tempGraph) {
  numOfSholtim = namesArray.length;
  weekSpacer = 7;

  //Get the Ratio of each Sholet
  let sholetRatio = [];
  for (let i = 1; i <= namesArray.length; i++) {
    let newSholetRatioObj = {
      id: i,
      ratio: rGraph[0][i] / (rGraph[0][i] + rGraph[i][0]),
      max_shifts: rGraph[0][i] + rGraph[i][0],
    };
    sholetRatio.push(newSholetRatioObj);
  }
  //randomize the order and than sort it by the ratio where the lowest ratio will be first
  let newOrder = sholetRatio.toSorted(() => Math.random() - 0.5);
  sholetRatio.forEach((element) => {
    let newIndex =
      1 +
      newOrder.findIndex((object) => {
        return object.id === element.id;
      });
    let oldIndex = 1 + sholetRatio.indexOf(element);

    // sets the new rGraph - row swap
    rGraph[newIndex] = tempGraph[oldIndex].slice();

    // sets the new rGraph - column swap
    for (let i = 0; i < Vertix; i++) {
      rGraph[i][newIndex] = tempGraph[i][oldIndex];
    }
  });
}

function sholetShifts(i, numOfShifts, numOfSholtim) {
  let shiftsToDisplay = [];
  totalWeekSpacer = 7 * namesArray.length;
  weekSpacer = 7 * i;
  for (let j = 0; j < numOfShifts; j++) {
    for (let d = 1; d <= 7; d++) {
      shiftsToDisplay.push(
        rGraph[j + 1 + numOfSholtim + totalWeekSpacer][
          weekSpacer + numOfSholtim + d
        ]
      );
    }
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
  for (let j = 0; j < validShifts.length; j++) {
    if (validShifts[j] === 1) {
      const newSholetShiftsListElemnt = $(
        '<li class="list-group-item ">' +
          shiftsNames[Math.floor(j / 7)] +
          "</li>"
      );
      $("#sholet-" + i + "> .list-group").append(newSholetShiftsListElemnt);
    }
  }
}

function shiftDisplay() {
  let numOfShifts = shiftNeeds.length;
  let numOfSholtim = namesArray.length;
  for (let i = 0; i < numOfShifts; i++) {
    const newShiftElemnt = $(
      '<div id="shift-' +
        i +
        '" style="width:4% ;display: flex; flex-direction: column ;" class="">' +
        '<button type="button" class="btn btn-dark">' +
        '<span class="name" >' +
        shiftsNamesShort[i] +
        "</span>" +
        "</button>" +
        '<ul class="list-group">' +
        "</ul>" +
        "</div>"
    );

    // Appending the new element to the parent container
    $("#shift-container").append(newShiftElemnt);

    // Update sholtim list

    for (let j = 1; j <= numOfSholtim * 7; j++) {
      if (rGraph[numOfSholtim * 8 + 1 + i][j + numOfSholtim] === 1) {
        const newShiftSholtimListElemnt = $(
          '<li class="list-group-item" style="font-size: 0.8rem">' +
            namesArray[Math.floor((j - 1) / 7)] +
            "</li>"
        );
        $("#shift-" + i + "> .list-group").append(newShiftSholtimListElemnt);
      }
    }
  }
}

function toggelWeekDisplay() {
  toggelWeekView = !toggelWeekView;
  if (toggelWeekView) {
    $("#sholtim-container").attr("style", "display: none !important;");
    $("#shift-container").attr("style", "");
  } else {
    $("#sholtim-container").attr("style", "");
    $("#shift-container").attr("style", "display: none !important;");
  }
}

function checkIntegrity() {
  let integrityFound = false;
  weekSpacer = 7;
  $("#collapseExample > div > ul").children("li").remove();
  const newLiElement = $(
    "<li style='font-weight:bold; text-decoration:underline;'>" +
      "CONFLICTS:" +
      "</li>"
  );
  $("#collapseExample > div > ul").append(newLiElement);

  for (let i = 0; i < numOfSholtim; i++) {
    //checks for each sholet
    for (let j = 0; j < 21; j++) {
      //checks 19 shifts with 2 shifts ahead
      for (let t = 0; t < 5; t++) {
        //checks the entire shift row (only 1 bit sßhold be active each row)
        for (let p = 1; p <= 2; p++) {
          //checks the 2 rows beaneth
          for (let f = 2; f <= 3; f++) {
            //checks the 3 bit in that row beaneth are also 1
            if (
              rGraph[Vertix - 22 + j][1 + numOfSholtim + t + i * weekSpacer] ===
                1 &&
              rGraph[Vertix - 22 + p + j][
                f + numOfSholtim + t + i * weekSpacer
              ] === 1
            ) {
              const newLiElement = $(
                "<li>" +
                  namesArray[i] +
                  " has conflict in: " +
                  shiftsNames[j] +
                  " and " +
                  shiftsNames[j + p] +
                  "</li>"
              );
              $("#collapseExample > div > ul").append(newLiElement);
              $("#toggel-error-view").addClass("visible");
              integrityFound = true;
            }
          }
        }
      }
    }
  }
  return integrityFound;
}

// Initially hide one of the views
$("#sholtim-container").attr("style", "display: none !important;");
