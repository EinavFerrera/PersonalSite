const popoverTriggerList = document.querySelectorAll(
  '[data-bs-toggle="popover"]'
);
const popoverList = [...popoverTriggerList].map(
  (popoverTriggerEl) => new bootstrap.Popover(popoverTriggerEl)
);

let namesArray = [];
let click = 0;
let shiftsAvailability = [];
let maxShifts = [];
let shiftNeeds = [];
let Vertix = 0;
let sholtimObjectArray = [];
let graph = [];
let u, v;
let rGraph = new Array(Vertix);
const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const shiftsNames = [
  "Sunday 1",
  "Sunday 2",
  "Sunday 3",
  "Monday 1",
  "Monday 2",
  "Monday 3",
  "Tuesday 1",
  "Tuesday 2",
  "Tuesday 3",
  "Wednesday 1",
  "Wednesday 2",
  "Wednesday 3",
  "Thursday 1",
  "Thursday 2",
  "Thursday 3",
  "Friday 1",
  "Friday 2",
  "Friday 3",
  "Saturday 1",
  "Saturday 2",
  "Saturday 3",
];

class Sholet {
  constructor(name, shifts, maxShifts) {
    this.name = name;
    this.shifts = shifts;
    this.maxShifts = maxShifts;
  }
}

function addUser() {
  // Get user input values
  let userName = $("#userName").val();
  let shifts = getCheckboxValues();
  let maxShift = parseInt($("#maxShifts").val());

  let newSholet = new Sholet(userName, shifts, maxShift);
  addUserBadge(userName, shifts);
  console.log(newSholet);
  // Append values to arrays
  namesArray.push(userName);
  maxShifts.push(maxShift);
  sholtimObjectArray.push(newSholet);

  // Reset form fields
  $("#userName").val("");
  $("#maxShifts").val("");
  generateGraph();
  if (localStorage.getItem(click)) {
    localStorage.setItem(click, Number(localStorage.getItem(click)) + 1);
  } else {
    localStorage.setItem(click, 1);
  }
}

function generateGraph() {
  // Get shift needs values
  shiftNeeds = [];
  for (const day of daysOfWeek) {
    shiftNeeds.push(parseInt($("#" + day.toLowerCase() + "1").val(), 10));
    shiftNeeds.push(parseInt($("#" + day.toLowerCase() + "2").val(), 10));
    shiftNeeds.push(parseInt($("#" + day.toLowerCase() + "3").val(), 10));
  }

  // Build the graph
  graph = buildGraph(shiftNeeds);

  // Log the generated graph
  console.log(graph);
}

function buildGraph() {
  console.log("shiftNeeds:", shiftNeeds);
  console.log("namesArray:", namesArray);
  console.log("maxShifts:", maxShifts);

  let graph = [];
  Vertix = namesArray.length + shiftNeeds.length + 2;

  // Initialize graph with zeros
  for (let i = 0; i < Vertix; i++) {
    graph[i] = new Array(Vertix).fill(0);
  }

  // Build the graph based on user data
  for (let i = 0; i < namesArray.length; i++) {
    // Connect source to sholtim
    graph[0][i + 1] = maxShifts[i];
    // Connect sholtim to shifts
    for (let j = 0; j < shiftNeeds.length; j++) {
      graph[i + 1][j + 1 + namesArray.length] = sholtimObjectArray[i].shifts[j];
    }
  }
  // Connect shifts to sink
  for (let j = 0; j < shiftNeeds.length; j++) {
    graph[j + 1 + namesArray.length][Vertix - 1] = shiftNeeds[j];
  }
  return graph;
}

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

function addUserBadge(userName, userShifts) {
  let dayShifts = "";

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
  }
  $(el).parent().remove();
  // Update the graph
  generateGraph();
}

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

function localStorageClear() {
  localStorage.clear();
}
