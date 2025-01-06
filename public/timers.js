import { currentCompetitors as defaultCompetitors } from './globals.js';
import { intervals, timerValues } from './globals.js';
import { playSound, changeLight } from './av.js';

document.addEventListener('DOMContentLoaded', () => {
  // Function to update the timers
  const updateTimers = (competitors) => {
    competitors.forEach((competitor, index) => {
      const timerTitle = document.querySelector(
        `#timer${index + 1} .timer-title`
      );
      const timerSubtitle = document.querySelector(
        `#timer${index + 1} .timer-subtitle`
      );
      if (timerTitle && timerSubtitle) {
        timerTitle.innerHTML = competitor.name;
        timerSubtitle.innerHTML = competitor.location;
      } else {
        console.error(`Timer elements not found for index ${index + 1}`);
      }
    });
  };

  const startAllTimers = async () => {
    if (intervals.some((interval) => interval !== null)) return;

    const countdownElement = document.createElement('div');
    countdownElement.classList.add('countdown');

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Initial delay of 1 second
    ['1', '2', '3'].forEach((index) => changeLight(index, 'reset'));
    await delay(1000);

    // Start 3 Second Countdown
    document.body.appendChild(countdownElement);
    for (let i = 3; i > 0; i--) {
      countdownElement.innerHTML = i;
      //playSound('countdown.mp3');
      playSound(`${i}.mp3`);
      ['1', '2', '3'].forEach((index) => changeLight(index, 'countdown2'));
      await delay(600);
      ['1', '2', '3'].forEach((index) => changeLight(index, 'countdown1'));
      await delay(600);
    }

    // Display "CUT!" and start timers
    countdownElement.innerHTML = 'CUT!';
    playSound('knife.mp3', 0.25);
    playSound('cut.mp3', 1.0);
    ['1', '2', '3'].forEach((index) => changeLight(index, 'start'));
    await delay(100);

    const timers = document.querySelectorAll('.timer');
    timers.forEach((timer, index) => {
      if (intervals[index] !== null) return;
      const startTime = Date.now();
      intervals[index] = setInterval(() => {
        timerValues[index]++;
        const elapsedTime = Date.now() - startTime;
        const minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);
        const seconds = Math.floor((elapsedTime / 1000) % 60);
        const milliseconds = Math.floor((elapsedTime % 1000) / 10);
        timer.querySelector('.display').textContent = `${
          minutes < 10 ? '0' : ''
        }${minutes}:${seconds < 10 ? '0' : ''}${seconds}:${
          milliseconds < 10 ? '0' : ''
        }${milliseconds}`;
        localStorage.setItem(`timer${index + 1}Value`, timerValues[index]);
      }, 10);
      localStorage.setItem(`timer${index + 1}Started`, 'true');
    });

    // Remove the countdown element after 1 second
    await delay(1000);
    countdownElement.remove();
  };

  // Function to reset all timers
  const resetAllTimers = () => {
    // Reset the timer values and intervals
    timerValues.fill(0);
    intervals.forEach(clearInterval);
    intervals.fill(null);

    // Update the display for each timer to 00:00:00
    ['display1', 'display2', 'display3'].forEach((id) => {
      document.getElementById(id).innerText = '00:00:00';
    });

    // Change all lights to white
    ['1', '2', '3'].forEach((index) => changeLight(index, 'reset'));

    // Set timersStarted to 'false' to ensure a change is detected when starting again
    localStorage.setItem('timersStarted', 'false');

    // Update localStorage to trigger reset across all tabs
    localStorage.setItem('timersReset', new Date().toISOString());
  };

  // Function to stop a specific timer
  const stopTimer = (index) => {
    clearInterval(intervals[index - 1]);
    intervals[index - 1] = null;
    changeLight(index, 'stop');
    localStorage.removeItem(`stopTimer${index}`);
  };

  // Get the initial currentCompetitors from localStorage
  const storedCompetitors = localStorage.getItem('currentCompetitors');
  if (storedCompetitors) {
    updateTimers(JSON.parse(storedCompetitors));
  } else {
    // If no stored competitors, use default values
    updateTimers(defaultCompetitors);
    localStorage.setItem(
      'currentCompetitors',
      JSON.stringify(defaultCompetitors)
    );
  }

  // Listen for changes to localStorage
  window.addEventListener('storage', (event) => {
    if (event.key === 'currentCompetitors') {
      updateTimers(JSON.parse(event.newValue));
    } else if (event.key === 'startTimers' && event.newValue === 'true') {
      startAllTimers();
    } else if (event.key === 'timersReset') {
      resetAllTimers();
    } else if (event.key.startsWith('stopTimer')) {
      const timerIndex = parseInt(event.key.replace('stopTimer', ''), 10);
      stopTimer(timerIndex);
    }
  });

  // Check if the startTimers flag is already set
  if (localStorage.getItem('startTimers') === 'true') {
    startAllTimers();
  }
});
