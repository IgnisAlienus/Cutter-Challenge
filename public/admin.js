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
    .getElementById('goToGame1Leaderboards')
    .addEventListener('click', () => {
      changePage('leaderboards#game1');
    });

  document
    .getElementById('goToGame2Leaderboards')
    .addEventListener('click', () => {
      changePage('leaderboards#game2');
    });

  document
    .getElementById('goToGame3Leaderboards')
    .addEventListener('click', () => {
      changePage('leaderboards#game3');
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
