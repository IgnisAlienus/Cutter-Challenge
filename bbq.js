function showScreen(timerNumber) {
  // Clear all intervals before showing the selected timer
  intervals.forEach(clearInterval);

  // Hide all timers first
  document.getElementById('timer1').style.display = 'none';
  document.getElementById('timer2').style.display = 'none';
  document.getElementById('timer3').style.display = 'none';

  // Hide all titles
  document.querySelectorAll('.timer-title').forEach((title) => {
    title.style.display = 'none';
  });

  // Show the selected timer and its title
  document.getElementById('timer' + timerNumber).style.display = 'block';
  document.querySelector(
    '#timer' + timerNumber + ' .timer-title'
  ).style.display = 'block';
}

// Listen for changes in localStorage to sync screens
window.addEventListener('storage', (event) => {
  if (event.key === 'currentScreen') {
    showScreen(event.newValue);
  } else if (event.key.startsWith('timer') && event.key.endsWith('Started')) {
    const timerIndex = parseInt(event.key.charAt(5), 10) - 1;
    const timerStarted = event.newValue === 'true';
    if (timerStarted) {
      startTimer(timerIndex);
    } else {
      stopTimer(timerIndex);
    }
  } else if (event.key === 'timersStarted') {
    startAllTimers();
  }
});

function showAllTimers() {
  // Show all timers
  document.getElementById('timer1').style.display = 'block';
  document.getElementById('timer2').style.display = 'block';
  document.getElementById('timer3').style.display = 'block';

  // Hide all titles since we're not focusing on a single timer
  document.querySelectorAll('.timer-title').forEach((title) => {
    title.style.display = 'none';
  });
}

// Initialize to show the first screen by default
document.addEventListener('DOMContentLoaded', () => {
  showScreen(1);
});

let timers = [null, null, null];
let durations = [300, 600, 900];
let intervals = [null, null, null];

function startAllTimers() {
  for (let i = 0; i < 3; i++) {
    startTimer(i);
  }
  // Set a flag in localStorage to indicate timers have started
  localStorage.setItem('timersStarted', Date.now().toString());
}

function stopTimer(index) {
  if (intervals[index] !== null) {
    clearInterval(intervals[index]);
    intervals[index] = null;
    // Removed the line that resets the display to '00:00'
  }
  // Remove the specific timer's start flag from localStorage, if any
  localStorage.setItem(`timer${index + 1}Started`, 'false');
}

function startTimer(index) {
  let timer = 0,
    minutes,
    seconds;
  intervals[index] = setInterval(() => {
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);

    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    document.getElementById(`display${index + 1}`).textContent =
      minutes + ':' + seconds;

    timer++;
  }, 1000);
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
    // Set all timers as started in localStorage
    for (let i = 1; i <= 3; i++) {
      localStorage.setItem(`timer${i}Started`, 'true');
    }
  } else if (['1', '2', '3'].includes(event.key)) {
    const index = parseInt(event.key, 10) - 1;
    onHardwareStopButtonPressed(index);
  }
});
