const timerNames = [`Cutter 1`, `Cutter 2`, `Cutter 3`];
const timerSubtitles = [`Rudy's 1`, `Rudy's 2`, `Rudy's 3`];
let timers = [null, null, null];
let intervals = [null, null, null];
let timerValues = [0, 0, 0];
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
    // Ensure the title is correctly fetched and displayed
    const titleElement = document.querySelector(`#${id} .timer-title`);
    const subtitleElement = document.querySelector(`#${id} .timer-subtitle`);
    if (titleElement) {
      titleElement.innerHTML = timerNames[index];
      titleElement.style.display = 'block';
    }
    if (subtitleElement) {
      subtitleElement.innerHTML = timerSubtitles[index];
      subtitleElement.style.display = 'block';
    }
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

async function startAllTimers() {
  if (intervals.some((interval) => interval !== null)) return;

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Initial delay of 1 second
  ['1', '2', '3'].forEach((index) => changeLight(index - 1, 'reset'));
  await delay(1000);

  // Start 3 Second Countdown
  // 3 Play Sound / Flash Light
  playSound('countdown.mp3');
  ['1', '2', '3'].forEach((index) => changeLight(index - 1, 'countdown2'));
  await delay(500);
  ['1', '2', '3'].forEach((index) => changeLight(index - 1, 'countdown1'));
  await delay(500);

  // 2 Play Sound / Flash Light
  playSound('countdown.mp3');
  ['1', '2', '3'].forEach((index) => changeLight(index - 1, 'countdown2'));
  await delay(500);
  ['1', '2', '3'].forEach((index) => changeLight(index - 1, 'countdown1'));
  await delay(500);

  // 1 Play Sound / Flash Light
  playSound('countdown.mp3');
  ['1', '2', '3'].forEach((index) => changeLight(index - 1, 'countdown2'));
  await delay(500);
  ['1', '2', '3'].forEach((index) => changeLight(index - 1, 'countdown1'));
  await delay(500);

  // Start Timer / Solid Light
  playSound('knife.mp3');
  ['1', '2', '3'].forEach((index) => changeLight(index - 1, 'start'));
  await delay(100);

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
  // If all 3 timers stopped, compare and show only the fastest timer
  if (intervals.every((interval) => interval === null)) {
    setTimeout(() => {
      const timerValues = [
        getTimerValue(0),
        getTimerValue(1),
        getTimerValue(2),
      ];
      const fastestIndex = timerValues.indexOf(Math.min(...timerValues));
      ['timer1', 'timer2', 'timer3'].forEach((id, idx) => {
        document.getElementById(id).style.display =
          idx === fastestIndex ? 'block' : 'none';
        changeLight(idx, idx === fastestIndex ? 'white' : 'off');
      });
      // Remove display none from winner id
      document.getElementById('winner').style.display = 'block';
      playSound('yay.mp3');
      triggerConfetti();

      // Clear the Intervals for all timers after the comparison and display update
      intervals.forEach((interval, idx) => {
        if (interval !== null) {
          clearInterval(interval);
          intervals[idx] = null;
        }
      });
    }, 5000);
  }
}

function getTimerValue(index) {
  const value =
    parseInt(localStorage.getItem(`timer${index + 1}Value`), 10) || 0;
  return value;
}

function triggerConfetti() {
  // Confetti from the bottom left
  confetti({
    particleCount: 500,
    spread: 200,
    origin: { x: 0, y: 1 },
  });

  // Confetti from the bottom right
  confetti({
    particleCount: 500,
    spread: 200,
    origin: { x: 1, y: 1 },
  });
}

function resetAllTimers() {
  // Call show all timers
  showAllTimers();

  // Add display none back to winner id
  document.getElementById('winner').style.display = 'none';

  // Reset the timer values and intervals
  timers = [null, null, null];
  timerValues = [0, 0, 0];
  intervals.forEach(clearInterval);
  intervals = [null, null, null];

  // Update the display for each timer to 00:00:00
  ['display1', 'display2', 'display3'].forEach((id) => {
    document.getElementById(id).innerText = '00:00:00';
  });

  // Set timersStarted to 'false' to ensure a change is detected when starting again
  localStorage.setItem('timersStarted', 'false');

  // Update localStorage to trigger reset across all tabs
  localStorage.setItem('timersReset', new Date().toISOString());

  // Change all lights to white
  ['1', '2', '3'].forEach((index) => changeLight(index - 1, 'reset'));
}

function startTimer(index) {
  if (intervals[index] !== null) return;
  const startTime = Date.now();
  intervals[index] = setInterval(() => {
    timerValues[index]++;
    const elapsedTime = Date.now() - startTime;
    const minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);
    const seconds = Math.floor((elapsedTime / 1000) % 60);
    const milliseconds = Math.floor((elapsedTime % 1000) / 10);
    document.getElementById(`display${index + 1}`).textContent = `${
      minutes < 10 ? '0' : ''
    }${minutes}:${seconds < 10 ? '0' : ''}${seconds}:${
      milliseconds < 10 ? '0' : ''
    }${milliseconds}`;
    localStorage.setItem(`timer${index + 1}Value`, timerValues[index]);
  }, 10);
  localStorage.setItem(`timer${index + 1}Started`, 'true');
}

function toggleButtonVisibility() {
  // Check the current display state of the first button to determine action
  const firstButton = document.querySelector('button');
  const currentlyVisible = firstButton.style.display !== 'none';

  // Toggle visibility based on the current state
  const newDisplayValue = currentlyVisible ? 'none' : '';

  document.querySelectorAll('button').forEach((button) => {
    button.style.display = newDisplayValue;
  });
  document.querySelectorAll('input[type="text"]').forEach((input) => {
    input.style.display = newDisplayValue;
  });

  // Also toggle the visibility of the <p> element with keybinds
  const keybindsParagraph = document.querySelector('div > p');
  keybindsParagraph.style.display = newDisplayValue;

  // Update localStorage to reflect the new state
  const newState = !currentlyVisible;
  localStorage.setItem('buttonsVisible', newState);
  localStorage.setItem('inputsVisible', newState);
}

function playSound(soundFile) {
  const audio = new Audio(`/resources/${soundFile}`);
  audio.play();
}

function changeLight(index, action) {
  // Send POST request to change the light
  fetch(`/light?lightNumber=${index}&action=${action}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

document.body.addEventListener('keydown', (event) => {
  // Check if the event target is an input element
  if (event.target.tagName.toLowerCase() === 'input') {
    return;
  }
  if (event.key === 's') {
    startAllTimers();
  } else if (['1', '2', '3'].includes(event.key)) {
    const index = parseInt(event.key, 10) - 1;
    stopTimer(index);
    playSound('bell.mp3');
    changeLight(index, 'stop');
    localStorage.setItem(`timer${index + 1}Started`, 'false');
    const uniqueStopValue = `true-${new Date().toISOString()}`;
    localStorage.setItem(`timer${index + 1}Stopped`, uniqueStopValue);
  } else if (event.key === 'r') {
    console.log('Resetting timers due to storage event.');
    resetAllTimers();
  } else if (event.key === 'h') {
    toggleButtonVisibility();
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
