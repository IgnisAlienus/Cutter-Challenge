import { currentCompetitors as defaultCompetitors } from './globals.js';

document.addEventListener('DOMContentLoaded', () => {
  // Function to update the timers
  const updateNames = (competitors) => {
    competitors.forEach((competitor, index) => {
      const timerTitle = document.querySelector(
        `#competitor${index + 1} .competitor-name`
      );
      const timerSubtitle = document.querySelector(
        `#competitor${index + 1} .competitor-location`
      );
      if (timerTitle && timerSubtitle) {
        timerTitle.innerHTML = competitor.name;
        timerSubtitle.innerHTML = competitor.location;
      } else {
        console.error(`Competitor elements not found for index ${index + 1}`);
      }
    });
  };

  // Get the initial currentCompetitors from localStorage
  const storedCompetitors = localStorage.getItem('currentCompetitors');
  if (storedCompetitors) {
    updateNames(JSON.parse(storedCompetitors));
  } else {
    // If no stored competitors, use default values
    updateNames(defaultCompetitors);
    localStorage.setItem(
      'currentCompetitors',
      JSON.stringify(defaultCompetitors)
    );
  }

  // Listen for changes to localStorage
  window.addEventListener('storage', (event) => {
    if (event.key === 'currentCompetitors') {
      updateNames(JSON.parse(event.newValue));
    }
  });
});
