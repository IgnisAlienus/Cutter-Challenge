// Global Variables
const timerNames = [`Select Cutter`, `Select Cutter`, `Select Cutter`];
const timerSubtitles = [
  `Cutter Challenge`,
  `Cutter Challenge`,
  `Cutter Challenge`,
];

const contestants = [
  { name: 'Marvin Macario', location: `Rudy's 1` },
  { name: 'Jessica Annabel Cadena', location: `Rudy's 2` },
  { name: 'Zair Villanueva', location: `Rudy's 3` },
  { name: 'Theo Lechman', location: `Rudy's 4` },
  { name: 'Leo Anaya', location: `Rudy's 5` },
  { name: 'Mohammad Rastkaraghazadeh', location: `Rudy's 6` },
  { name: 'Jacob Kearns', location: `Rudy's 7` },
  { name: 'Alfredo Marquez', location: `Rudy's 8` },
  { name: 'Juan Paxtor', location: `Rudy's 9` },
  { name: 'Martin Olascoaga Benites', location: `Rudy's 10` },
  { name: 'Angel Robles', location: `Rudy's 11` },
  { name: 'Trey Ford', location: `Rudy's 12` },
];

let currentCompetitors = [
  { name: 'Select Cutter', location: `Cutter Challenge` },
  { name: 'Select Cutter', location: `Cutter Challenge` },
  { name: 'Select Cutter', location: `Cutter Challenge` },
];

const intervals = [null, null, null];
const timerValues = [0, 0, 0];

export {
  timerNames,
  timerSubtitles,
  contestants,
  currentCompetitors,
  intervals,
  timerValues,
};
