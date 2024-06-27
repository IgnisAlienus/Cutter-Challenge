const timerNames = [`Cutter 1`, `Cutter 2`, `Cutter 3`];
const timerSubtitles = [
  `Rudy's New Braunfels`,
  `Rudy's Kyle`,
  `Rudy's Round Rock`,
];
let timers = [null, null, null];
let intervals = [null, null, null];
const durations = [300, 600, 900];
let lastResetTimestamp = null;

function updateTimerTitle(timerNumber) {
  const titleInput = document.getElementById(`title${timerNumber}`);
  const title = titleInput.value || `Cutter ${timerNumber}`;
  timerNames[timerNumber - 1] = title;
  localStorage.setItem(`title${timerNumber}`, title);
  document.querySelector(`#timer${timerNumber} .timer-title`).innerHTML = title;
}

function updateTimerSubtitle(timerNumber) {
  const subtitleInput = document.getElementById(`subtitle${timerNumber}`);
  const subtitle = subtitleInput.value || `Rudy's ${timerNumber}`;
  timerSubtitles[timerNumber - 1] = subtitle;
  localStorage.setItem(`subtitle${timerNumber}`, subtitle);
  document.querySelector(`#timer${timerNumber} .timer-subtitle`).innerHTML =
    subtitle;
}

// Show specific timer screen
function showScreen(timerNumber) {
  intervals.forEach(clearInterval);
  ['timer1', 'timer2', 'timer3'].forEach(
    (id, index) => (document.getElementById(id).style.display = 'none')
  );
  document
    .querySelectorAll('.timer-title')
    .forEach((title, index) => (title.style.display = 'none'));
  document.getElementById('timer' + timerNumber).style.display = 'block';
  document.querySelector('#timer' + timerNumber + ' .timer-title').innerHTML =
    timerNames[timerNumber - 1];
  document.querySelector(
    '#timer' + timerNumber + ' .timer-title'
  ).style.display = 'block';
  document.querySelector(
    '#timer' + timerNumber + ' .timer-subtitle'
  ).innerHTML = timerSubtitles[timerNumber - 1];
  document.querySelector(
    '#timer' + timerNumber + ' .timer-subtitle'
  ).style.display = 'block';
}

function showAllTimers() {
  ['timer1', 'timer2', 'timer3'].forEach((id, index) => {
    document.getElementById(id).style.display = 'block';
    document.querySelector(`#${id} .timer-title`).innerHTML = timerNames[index];
    document.querySelector(`#${id} .timer-subtitle`).innerHTML =
      timerSubtitles[index];
    document.querySelector(`#${id} .timer-subtitle`).style.display = 'block';
  });
}

// Initialize to show the first screen by default
document.addEventListener('DOMContentLoaded', () => {
  showScreen(1);
  // Initialize default titles and subtitles
  ['1', '2', '3'].forEach((index) => {
    updateTimerTitle(parseInt(index));
    updateTimerSubtitle(parseInt(index));
  });
  // Clear localStorage items related to timer starts/stops
  localStorage.removeItem('timersStarted');
  ['1', '2', '3'].forEach((index) => {
    localStorage.removeItem(`timer${index}Started`);
    localStorage.removeItem(`timer${index}Stopped`);
  });
});

function startAllTimers() {
  if (intervals.some((interval) => interval !== null)) return;

  // Toggle timersStarted between 'true' and 'false' to ensure a change is detected
  const newTimersStartedValue =
    localStorage.getItem('timersStarted') === 'true' ? 'false' : 'true';
  localStorage.setItem('timersStarted', newTimersStartedValue);

  for (let i = 0; i < 3; i++) startTimer(i);
}

function stopTimer(index) {
  if (intervals[index] !== null) {
    clearInterval(intervals[index]);
    intervals[index] = null;
    localStorage.setItem(`timer${index + 1}Stopped`, 'true');
  }
}

function resetAllTimers() {
  // Reset the timer values and intervals
  timers = [null, null, null];
  intervals.forEach(clearInterval);
  intervals = [null, null, null];

  // Update the display for each timer to 00:00:00
  ['display1', 'display2', 'display3'].forEach((id) => {
    document.getElementById(id).innerText = '00:00:00';
  });

  // Set timersStarted to 'false' to ensure a change is detected when starting again
  localStorage.setItem('timersStarted', 'false');

  // Update localStorage to trigger reset across all tabs
  // Use a timestamp to ensure uniqueness
  localStorage.setItem('timersReset', new Date().toISOString());
}

function startTimer(index) {
  if (intervals[index] !== null) return;
  const startTime = Date.now();
  intervals[index] = setInterval(() => {
    const elapsedTime = Date.now() - startTime;
    const minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);
    const seconds = Math.floor((elapsedTime / 1000) % 60);
    const milliseconds = Math.floor((elapsedTime % 1000) / 10);
    document.getElementById(`display${index + 1}`).textContent = `${
      minutes < 10 ? '0' : ''
    }${minutes}:${seconds < 10 ? '0' : ''}${seconds}:${
      milliseconds < 10 ? '0' : ''
    }${milliseconds}`;
  }, 10);
  localStorage.setItem(`timer${index + 1}Started`, 'true');
}

// Assuming these functions are called when hardware buttons are pressed
function onHardwareStartButtonPressed() {
  startAllTimers();
}

function onHardwareStopButtonPressed(index) {
  stopTimer(index);
  localStorage.setItem(`timer${index + 1}Started`, 'false');
}

function toggleButtonVisibility() {
  const shouldShowButtons = localStorage.getItem('buttonsVisible') === 'true';
  document.querySelectorAll('button').forEach((button) => {
    button.style.display = shouldShowButtons ? '' : 'none';
  });

  // Toggle visibility for all input boxes
  const inputsVisible = localStorage.getItem('inputsVisible') === 'true'; // Use the same logic for inputs
  document.querySelectorAll('input[type="text"]').forEach((input) => {
    input.style.display = inputsVisible ? 'none' : '';
  });
  localStorage.setItem('inputsVisible', !inputsVisible); // Save the new state
}

document.body.addEventListener('keydown', (event) => {
  if (event.key === 's') {
    startAllTimers();
  } else if (['1', '2', '3'].includes(event.key)) {
    const index = parseInt(event.key, 10) - 1;
    const uniqueStopValue = `true-${new Date().toISOString()}`;
    localStorage.setItem(`timer${index + 1}Stopped`, uniqueStopValue);
  } else if (event.key === 'r') {
    console.log('Resetting timers due to storage event.');
    resetAllTimers();
  } else if (event.key === 'h') {
    // Toggle the visibility state in local storage for buttons
    const isVisible = localStorage.getItem('buttonsVisible') === 'true';
    localStorage.setItem('buttonsVisible', !isVisible);
    // Manually toggle visibility in the current tab for buttons
    toggleButtonVisibility();

    // Toggle visibility for all input boxes
    const inputsVisible = localStorage.getItem('inputsVisible') !== 'false'; // Default to true
    document.querySelectorAll('input[type="text"]').forEach((input) => {
      input.style.display = inputsVisible ? 'none' : '';
    });
    localStorage.setItem('inputsVisible', !inputsVisible);
  }
});

window.addEventListener('storage', (event) => {
  console.log(
    `Storage event triggered: key=${event.key}, value=${event.newValue}`
  );
  if (event.key === 'timersStarted' && event.newValue === 'true') {
    startAllTimers();
  } else if (
    event.key.startsWith('timer') &&
    event.key.endsWith('Started') &&
    event.newValue === 'true'
  ) {
    const timerIndex = parseInt(event.key.charAt(5), 10) - 1;
    startTimer(timerIndex);
  } else if (event.key.startsWith('timer') && event.key.endsWith('Stopped')) {
    const timerIndex = parseInt(event.key.charAt(5), 10) - 1;
    stopTimer(timerIndex);
  } else if (event.key === 'timersReset') {
    if (lastResetTimestamp !== event.newValue) {
      lastResetTimestamp = event.newValue;
      resetAllTimers();
    }
  } else if (event.key === 'buttonsVisible') {
    toggleButtonVisibility();
  } else if (event.key === 'inputsVisible') {
    const inputsVisible = event.newValue === 'true';
    document.querySelectorAll('input[type="text"]').forEach((input) => {
      input.style.display = inputsVisible ? '' : 'none';
    });
  } else if (
    event.key.startsWith('title') ||
    event.key.startsWith('subtitle')
  ) {
    const timerNumber = event.key.match(/\d+/)[0];
    if (event.key.startsWith('title')) {
      const title = localStorage.getItem(event.key);
      document.querySelector(`#timer${timerNumber} .timer-title`).innerHTML =
        title;
    } else if (event.key.startsWith('subtitle')) {
      const subtitle = localStorage.getItem(event.key);
      document.querySelector(`#timer${timerNumber} .timer-subtitle`).innerHTML =
        subtitle;
    }
  }
});
