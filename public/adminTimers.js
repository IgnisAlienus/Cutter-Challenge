// Function to ensure startTimers is set to false by default
function ensureDefaultTimerState() {
  localStorage.setItem('startTimers', 'false');
}

// Function to start all timers on the page
function startAllTimers() {
  // Set a flag in localStorage to indicate that timers should start
  localStorage.setItem('startTimers', 'true');
}

function resetAllTimers() {
  // Clear the flag in localStorage to stop timers
  localStorage.removeItem('startTimers');
  // Clear all timer values
  for (let i = 1; i <= 4; i++) {
    localStorage.removeItem(`timer${i}Value`);
  }
  // Set timersReset to trigger reset across all tabs
  localStorage.setItem('timersReset', new Date().toISOString());
}

// Function to stop a specific timer
function stopTimer(timerIndex) {
  localStorage.setItem(`stopTimer${timerIndex}`, 'true');
}

// Add keybinds to stop respective timers
document.addEventListener('keydown', (event) => {
  if (event.key === '1') {
    stopTimer(1);
  } else if (event.key === '2') {
    stopTimer(2);
  } else if (event.key === '3') {
    stopTimer(3);
  }
});

// Ensure default timer state on page load
ensureDefaultTimerState();
