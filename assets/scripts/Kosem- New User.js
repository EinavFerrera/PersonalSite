/**
 * Initializes the data by retrieving arrays from localStorage and performing necessary operations.
 */
function InitializeData() {
  // Retrieve arrays from localStorage
  namesArray = JSON.parse(localStorage.getItem("namesArray")) || [];
  maxShifts = JSON.parse(localStorage.getItem("maxShifts")) || [];
  sholtimObjectArray =
    JSON.parse(localStorage.getItem("sholtimObjectArray")) || [];
  if (localStorage.getItem("sholtimObjectArray") !== null) {
    for (let i = 0; i < namesArray.length; i++) {
      addUserBadge(
        sholtimObjectArray[i].name,
        sholtimObjectArray[i].shifts,
        sholtimObjectArray[i].maxShifts
      );
    }
    shiftNeeds = JSON.parse(localStorage.getItem("shiftNeeds")) || [];
    initializeShiftNeeds();
    generateGraph();
  }
}

/**
 * Initializes the shift needs by retrieving values from localStorage and setting default values if necessary.
 */
function initializeShiftNeeds() {
  for (const day of daysOfWeek) {
    for (let i = 1; i <= 3; i++) {
      const localStorageKey = day.toLowerCase() + i;
      const shiftValue = localStorage.getItem(localStorageKey);
      const inputElement = $("#" + day.toLowerCase() + i);
      if (shiftValue !== null) {
        inputElement.val(shiftValue);
      } else {
        // If no data in localStorage, set shift value to 1
        inputElement.val("1");
        // Update localStorage with default value
        localStorage.setItem(localStorageKey, "1");
      }
    }
  }
}

/**
 * Sets the shift needs for each day of the week.
 */
function setShiftNeeds() {
  for (const day of daysOfWeek) {
    for (let i = 1; i <= 3; i++) {
      const inputElement = $("#" + day.toLowerCase() + i);
      localStorage.setItem(inputElement.attr("id"), inputElement.val());
    }
  }
}

/**
 * Adds a new user to the system.
 *
 * @returns {void}
 */
function addUser() {
  // Get user input values
  let userName = $("#userName").val();
  if (userName == "") {
    return;
  }
  let shifts = getCheckboxValues();
  let maxShift = parseInt($("#maxShifts").val());

  let newSholet = new Sholet(userName, shifts, maxShift);
  addUserBadge(userName, shifts, maxShift);

  // Append values to arrays
  namesArray.push(userName);
  maxShifts.push(maxShift);
  sholtimObjectArray.push(newSholet);

  // Save arrays back to localStorage
  localStorage.setItem("namesArray", JSON.stringify(namesArray));
  localStorage.setItem("maxShifts", JSON.stringify(maxShifts));
  localStorage.setItem(
    "sholtimObjectArray",
    JSON.stringify(sholtimObjectArray)
  );

  // Reset form fields
  $("#userName").val("");
  $("#maxShifts").val("");
  generateGraph();
}

/**
 * Generates a graph based on the shift needs values for each day of the week.
 * @returns {void}
 */
function generateGraph() {
  // Get shift needs values
  shiftNeeds = [];
  for (const day of daysOfWeek) {
    shiftNeeds.push(parseInt($("#" + day.toLowerCase() + "1").val(), 10));
    shiftNeeds.push(parseInt($("#" + day.toLowerCase() + "2").val(), 10));
    shiftNeeds.push(parseInt($("#" + day.toLowerCase() + "3").val(), 10));
  }

  // Build the graph
  graph = buildGraph();

  // Log the generated graph
  console.log(graph);
}

/**
 * Builds a graph based on user data.
 * @returns {number[][]} The built graph.
 */
function buildGraph() {
  console.log("shiftNeeds:", shiftNeeds);
  console.log("namesArray:", namesArray);
  console.log("maxShifts:", maxShifts);

  let graph = [];
  Vertix = namesArray.length * 8 + shiftNeeds.length + 2;

  // Initialize graph with zeros
  for (let t = 0; t < Vertix; t++) {
    graph[t] = new Array(Vertix).fill(0);
  }
  // Build the graph based on user data
  for (let i = 0; i < namesArray.length; i++) {
    // Connect source to sholtim
    graph[0][i + 1] = maxShifts[i];
    weekSpacer = 7 * i;
    totalWeekSpacer = 7 * namesArray.length;

    //Connect sholet to day vertix
    for (let d = 1; d <= 7; d++) {
      graph[i + 1][weekSpacer + namesArray.length + d] = 1;
    }
    // Connect day vertix to shifts
    for (let j = 0; j < shiftNeeds.length; j++) {
      graph[weekSpacer + 1 + namesArray.length + Math.floor(j / 3)][
        j + 1 + namesArray.length + totalWeekSpacer
      ] = sholtimObjectArray[i].shifts[j];
    }
  }
  // Connect shifts to sink
  for (let q = 0; q < shiftNeeds.length; q++) {
    graph[q + 1 + totalWeekSpacer + namesArray.length][Vertix - 1] =
      shiftNeeds[q];
  }
  return graph;
}

/**
 * Retrieves the values of checkboxes with class 'btn-check'.
 * @returns {number[]} An array of checkbox values, where 1 represents checked and 0 represents unchecked.
 */
function getCheckboxValues() {
  let checkboxValues = [];
  let x = 0;
  // Iterate through checkboxes with class 'dayCheckbox'
  $(".btn-check").each(function () {
    let value = $(this)[0].checked ? 1 : 0;
    checkboxValues[x] = value;
    x++;
    // Reset form fields
    $(this)[0].checked = false;
  });
  return checkboxValues;
}

/**
 * Adds a user badge to the user container with the provided user information.
 * @param {string} userName - The name of the user.
 * @param {number[]} userShifts - An array representing the shifts of the user.
 * @param {number} maxS - The maximum number of shifts for the user.
 */
function addUserBadge(userName, userShifts, maxS) {
  console.log("max: " + maxS);
  let dayShifts = "Max Shifts: " + maxS + " ||| ";

  for (let j = 0; j < userShifts.length; j++) {
    if (userShifts[j] == 1) {
      dayShifts += shiftsNames[j];
      dayShifts += ", ";
    }
  }
  dayShifts = dayShifts.slice(0, -2);

  let newUserBadge = $(
    '<span class="badge d-flex p-2 align-items-center text-primary-emphasis bg-primary-subtle rounded-pill" data-bs-toggle="popover" data-bs-placement="top" data-bs-content="' +
      dayShifts +
      '">' +
      '<span class="px-1 userName">' +
      userName +
      "</span>" +
      '<button type="button" class="btn-close" aria-label="Close" onclick="removeUser(this)"></button>' +
      "</span>"
  );

  // Appending the new element to the parent container
  $("#sigend-user-container").append(newUserBadge);
  new bootstrap.Popover(newUserBadge[0], {
    container: "body",
    trigger: "hover",
  });
}

function removeUser(el) {
  console.log(el.parentElement);
  let userName = el.parentElement.textContent;
  console.log("userName: " + userName);

  // Find the index of the user in the namesArray
  let index = namesArray.indexOf(userName);

  if (index !== -1) {
    // Remove the user from arrays
    namesArray.splice(index, 1);
    maxShifts.splice(index, 1);
    sholtimObjectArray.splice(index, 1);

    // Save arrays back to localStorage
    localStorage.setItem("namesArray", JSON.stringify(namesArray));
    localStorage.setItem("maxShifts", JSON.stringify(maxShifts));
    localStorage.setItem(
      "sholtimObjectArray",
      JSON.stringify(sholtimObjectArray)
    );
  }
  $(el).parent().remove();
  // Update the graph
  generateGraph();
  rGraph.fill(0);
  location.reload();
}

/**
 * Toggles the checked state of all checkboxes.
 * If an element is provided, it toggles the checked state of checkboxes associated with that element.
 * If no element is provided, it toggles the checked state of all checkboxes.
 *
 * @param {HTMLElement} el - The element associated with the checkboxes to toggle (optional).
 */
function checkAll(el) {
  let checkboxes = document.querySelectorAll(".btn-check");
  if (el !== undefined) {
    let checkBoxDay = [
      el.id + "1Checkbox",
      el.id + "2Checkbox",
      el.id + "3Checkbox",
    ];
    checkboxes.forEach((checkbox) => {
      if (checkBoxDay.indexOf(checkbox.id) !== -1) {
        checkbox.checked = !checkbox.checked;
      }
    });
  } else {
    checkboxes.forEach((checkbox) => {
      checkbox.checked = !checkbox.checked;
    });
  }
}

/**
 * Clears the localStorage and removes all users from the DOM.
 * @function localStorageClear
 */
function localStorageClear() {
  // Show confirmation modal
  $("#confirmClearModal").modal("show");

  // Handle clear action on confirmation
  $("#confirmClearBtn").click(function () {
    localStorage.clear();
    Array.from($("#sigend-user-container button")).forEach((el) => {
      removeUser(el);
    });
    location.reload();
  });
}
