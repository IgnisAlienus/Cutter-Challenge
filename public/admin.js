import { playSound, changeLight } from './av.js';

function changePage(page) {
  window.electron.changePage(page);
}

document.addEventListener('DOMContentLoaded', () => {
  // Clear localStorage
  localStorage.clear();

  document.getElementById('closeButton').addEventListener('click', () => {
    window.electron.closeWindows();
  });

  document.getElementById('goToLogoButton').addEventListener('click', () => {
    changePage('');
  });

  document.getElementById('goToTimersButton').addEventListener('click', () => {
    changePage('timers');
  });

  document
    .getElementById('goToCurrentCompetitorsButton')
    .addEventListener('click', () => {
      changePage('current-competitors');
    });

  document
    .getElementById('goToLeaderboardsButton')
    .addEventListener('click', () => {
      changePage('leaderboards#all');
    });

  document
    .getElementById('goToCompetitorsLeaderboards')
    .addEventListener('click', () => {
      changePage('leaderboards#selected');
    });

  document
    .getElementById('goToTop6Leaderboards')
    .addEventListener('click', () => {
      changePage('leaderboards#top6');
    });

  document
    .getElementById('goToTop3Leaderboards')
    .addEventListener('click', () => {
      changePage('leaderboards#top3');
    });

  document
    .getElementById('goToFinalLeaderboards')
    .addEventListener('click', () => {
      changePage('leaderboards#final');
    });

  // Populate comPortSelector with available COM ports
  window.electron.getComPorts().then((ports) => {
    const comPortSelector = document.getElementById('comPortSelector');

    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.text = 'Choose COM Port';
    defaultOption.value = '';
    defaultOption.selected = true;
    defaultOption.disabled = true;
    comPortSelector.appendChild(defaultOption);

    ports.forEach((port) => {
      const option = document.createElement('option');
      option.value = port.path;
      option.text = `${port.path} - ${port.manufacturer}`;
      comPortSelector.appendChild(option);
    });

    comPortSelector.addEventListener('change', (event) => {
      // Post Event
      const comPort = event.target.value;

      fetch('/changeComPort', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comPort }),
      })
        .then((response) => response.text())
        .then((data) => console.log(data))
        .catch((error) => console.error('Error:', error));
    });
  });

  document
    .getElementById('changeLightsWhiteButton')
    .addEventListener('click', () => {
      ['1', '2', '3'].forEach((index) => changeLight(index, 'reset'));
    });

  document
    .getElementById('changeLightsRedButton')
    .addEventListener('click', () => {
      ['1', '2', '3'].forEach((index) => changeLight(index, 'red'));
    });

  document
    .getElementById('turnOffLightsButton')
    .addEventListener('click', () => {
      ['1', '2', '3'].forEach((index) => changeLight(index, 'off'));
    });
});
