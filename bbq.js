let timers = [null, null, null];
let intervals = [null, null, null];
const durations = [300, 600, 900];
let lastResetTimestamp = null;

// Show specific timer screen
function showScreen(timerNumber) {
  intervals.forEach(clearInterval);
  ['timer1', 'timer2', 'timer3'].forEach(
    (id) => (document.getElementById(id).style.display = 'none')
  );
  document
    .querySelectorAll('.timer-title')
    .forEach((title) => (title.style.display = 'none'));
  document.getElementById('timer' + timerNumber).style.display = 'block';
  document.querySelector(
    '#timer' + timerNumber + ' .timer-title'
  ).style.display = 'block';
}

function showAllTimers() {
  ['timer1', 'timer2', 'timer3'].forEach(
    (id) => (document.getElementById(id).style.display = 'block')
  );
  document
    .querySelectorAll('.timer-title')
    .forEach((title) => (title.style.display = 'block'));
}

// Initialize to show the first screen by default
document.addEventListener('DOMContentLoaded', () => {
  showScreen(1);
  // Clear localStorage items related to timer starts/stops to prevent unintended behavior
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

document.body.addEventListener('keydown', (event) => {
  if (event.key === 's') {
    startAllTimers();
  } else if (['1', '2', '3'].includes(event.key)) {
    const index = parseInt(event.key, 10) - 1;
    // Generate a unique value for stopping the timer
    const uniqueStopValue = `true-${new Date().toISOString()}`;
    localStorage.setItem(`timer${index + 1}Stopped`, uniqueStopValue);
  } else if (event.key === 'r') {
    resetAllTimers();
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
  }
});
