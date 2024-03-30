/**
 * first function when you run a generate request
 * cheks if there is a table already - if so it will ask for a confirmation / resets the display
 * if not it will generate the table
 */

function generateConfirmation(timesToRun) {
  console.log("per-", perfectTable);
  if (typeof timesToRun != "number") {
    timesToRun = Number(timesToRun);
  }
  if (typeof timesToRun != "number") {
    timesToRun = 0;
  }
  console.log(timesToRun);
  if (timesToRun > 1 && !perfectTable) {
    $("#sholtim-container").empty();
    $("#shift-container").empty();
    generate();
    generateConfirmation(timesToRun - 1);
  } else if (perfectTable) {
    $("#confirmGenerateModal").modal("show");
    // Handle clear action on confirmation
    $("#confirmGenerateBtn").click(function () {
      $("#sholtim-container").empty();
      $("#shift-container").empty();
      perfectTable = false;
      succesGenerate = false;
      generate();
    });
  } else if (succesGenerate) {
    $("#sholtim-container").empty();
    $("#shift-container").empty();
    succesGenerate = false;
    generate();
  } else {
    generate();
  }
}
/**
 * makes an attempt to generate a valid table (where all shifts are covered)
 * if successful it will display the table and the conflicts (if any) in the error view
 * else it will display the missing shifts with popups and in the error view
 * @returns void when not valid to stop generating
 */
function generate() {
  //initializtions
  let numOfSholtim = namesArray.length;
  let numOfShifts = shiftNeeds.length;
  notValid = false;
  generateGraph();
  for (u = 0; u < Vertix; u++) {
    rGraph[u] = new Array(Vertix);
    for (v = 0; v < Vertix; v++) rGraph[u][v] = graph[u][v];
  }
  //makes the graph with the max flow (maxium flow == all shifts are covered)
  fordFulkerson(0, Vertix - 1);

  //checks if there is a shifts with less sholtim than needed
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
  //if all shifts are covered
  if (!succesGenerate) {
    showToast("SUCCESS! ", false);
    succesGenerate = true;
  }

  //gains the conflicts (if any)
  if (checkIntegrity() === false) {
    $("#collapseExample").collapse("hide");
    $("#toggel-error-view").removeClass("visible");
    perfectTable = true;
  }
  //display the table
  for (let i = 0; i < numOfSholtim; i++) {
    let validShifts = [];
    validShifts = sholetShifts(i, numOfShifts, numOfSholtim);
    let count = validShifts.filter((shift) => shift === 1).length;
    userDisplay(i, count, validShifts);
  }
  if (BEST_graphConflictsNumber > $("#collapseExample > div > ul >").length) {
    BEST_graphConflictsNumber = $("#collapseExample > div > ul >").length;
    for (u = 0; u < Vertix; u++) {
      BEST_rGraph[u] = new Array(Vertix);
      for (v = 0; v < Vertix; v++) BEST_rGraph[u][v] = rGraph[u][v];
    }
  }

  shiftDisplay();
}

/**
 * a part of the fordFulkerson algorithm - finds a path
 * @param {*} s starting vertix (usually 0)
 * @param {*} t ending vertix (usually Vertix - 1)
 * @param {*} parent array to store the path found to increase the flow
 * @returns true if there is a path from source 's' to sink 't' in residual graph.
 */
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

/**
 *
 * @param {*} s starting vertix (usually 0)
 * @param {*} t ending vertix (usually Vertix - 1)
 * @returns the maximum flow from s to t in the given graph
 */
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
/**
 * orders the sholtim by the ratio of the shifts they are covering - to make sure the shifts are splitted evenly
 * !Also uses a Random before ordering! what makes table unique each time
 * @param {*} tempGraph a deep copy of the rGraph to manipulate
 */
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
  newOrder = sholetRatio.toSorted(() => Math.random() - 0.5);
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
/**
 * !Not in use in Version 1.0!
 * order the sholtim by a random order
 * @param {*} tempGraph a deep copy of the rGraph to manipulate
 */
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

/**
 * Retrieves the shifts covered by a specific sholet.
 * @param {number} i - The index of the sholtim.
 * @param {number} numOfShifts - The total number of shifts.
 * @param {number} numOfSholtim - The total number of sholtim.
 * @returns {Array} Returns an array of shifts covered by the sholtim.
 */
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

/**
 * Calculates the sum of the target shifts.
 * @returns {number} Returns the sum of the target shifts.
 */
function sumTarget() {
  let sum = 0;
  for (let j = 0; j < numOfShifts; j++) {
    sum += graph[j + 1 + numOfShifts][numOfSholtim + numOfSholtim + 1];
  }
  return sum;
}

/**
 * Displays a toast message.
 * @param {string} message - The message to display.
 * @param {boolean} isError - Indicates if the message is an error message (default: false).
 * @returns {void} Returns nothing.
 */
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

/**
 * Displays the table in a Sholet view - where each sholet name is followed by his shifts
 * @param {number} i - The index of the Sholet in the nameArray.
 * @param {number} count - The count of shifts.
 * @param {number[]} validShifts - An array representing the validity of shifts.
 */
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
  minConflictsAdd(i, count);
}

/**
 * Displays the table in a shift vew - shifts are followed by the name of the sholtim list on it
 */
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
          '<li class="list-group-item" style="font-size: 0.8rem; word-wrap: break-word;">' +
            namesArray[Math.floor((j - 1) / 7)] +
            "</li>"
        );
        $("#shift-" + i + "> .list-group").append(newShiftSholtimListElemnt);
      }
    }
  }
}

/**
 * Controls the display - Shift view / Sholet view
 */
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

/**
 * Checks the integrity of the shift table by searching for conflicts between shifts.
 * if a sholet has a shift with a shift in the next shift/next next shift - its a conflict
 * @returns {boolean} True if conflicts are found, false otherwise.
 */
function checkIntegrity() {
  let integrityFound = false;
  weekSpacer = 7;
  $("#collapseExample > div > ul").children("li").remove();

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
              if (
                $("#collapseExample > div > ul > #conflict-header")[0] ===
                undefined
              ) {
                const newLiElement = $(
                  "<li id= 'conflict-header' style='font-weight:bold; text-decoration:underline;'>" +
                    "CONFLICTS:" +
                    "</li>"
                );
                $("#collapseExample > div > ul").append(newLiElement);
              }
              const newLiElement = $(
                "<li><span style='font-weight:bold;'>" +
                  namesArray[i] +
                  "</span> has conflict in: " +
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
  for (let i = 0; i < numOfSholtim; i++) {
    if (integrityFound === false) {
      integrityFound = false;
    }
  }

  return integrityFound;
}

function minConflictsAdd(i, count) {
  if (sholtimObjectArray[i].minShifts > count) {
    if ($("#collapseExample > div > ul > #min-header")[0] === undefined) {
      const newLiElement = $(
        "<li id= 'min-header' style='font-weight:bold; text-decoration:underline;'>" +
          "Minimum Shifts:" +
          "</li>"
      );
      $("#collapseExample > div > ul").append(newLiElement);
    }
    const newLiElement = $(
      "<li><span style='font-weight:bold;'> " +
        namesArray[i] +
        "</span> has <span style='font-weight:bold;'>" +
        count +
        "</span>" +
        " shifts, but should do at least <span style='font-weight:bold;'>" +
        sholtimObjectArray[i].minShifts +
        "</span>"
    );
    $("#collapseExample > div > ul").append(newLiElement);
    $("#toggel-error-view").addClass("visible");
  }
}

// Initially hide one of the views
$("#sholtim-container").attr("style", "display: none !important;");
