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

let namesArray = [];
let maxShiftsArr = [];
let minShiftsArr = [];
let sholtimObjectArray = [];

let shiftsAvailability = [];
let shiftNeeds = [];
let Vertix = 0;
let graph = [];
let rGraph = new Array(Vertix);
let BEST_graph = [];
let BEST_rGraph = new Array(Vertix);
let BEST_graphConflictsNumber = 100;
let u, v;
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

let dayTags = [
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
];
let hasMinShifts = "";
let minShifts;
class Sholet {
  constructor(name, shifts, maxShifts, minShifts) {
    this.name = name;
    this.shifts = shifts;
    this.maxShifts = maxShifts;
    this.minShifts = minShifts;
  }
}
const popoverTriggerList = document.querySelectorAll(
  '[data-bs-toggle="popover"]'
);
const popoverList = [...popoverTriggerList].map(
  (popoverTriggerEl) => new bootstrap.Popover(popoverTriggerEl)
);
