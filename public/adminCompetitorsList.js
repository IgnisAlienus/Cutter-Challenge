import { contestants, currentCompetitors } from './globals.js';

const selectedCompetitorsSet = new Set();

document.addEventListener('DOMContentLoaded', () => {
  const competitorsList = document.getElementById('competitorsList');
  competitorsList.innerHTML = contestants
    .map(
      (c, index) => `
      <li>
        <input type="checkbox" id="competitor${index}" value="${index}" onchange="updateCurrentCompetitors(${index})">
        <label for="competitor${index}">${c.name} - ${c.location}</label>
      </li>
    `
    )
    .join('');

  const currentCompetitorsList = document.getElementById(
    'currentCompetitorsList'
  );
  currentCompetitorsList.innerHTML = currentCompetitors
    .map(
      (c, index) => `
      <li id="currentCompetitor${index}">${c.name} - ${c.location}</li>
    `
    )
    .join('');
});

window.updateCurrentCompetitors = function updateCurrentCompetitors(index) {
  const checkbox = document.getElementById(`competitor${index}`);
  if (checkbox.checked) {
    if (selectedCompetitorsSet.size >= 3) {
      alert('You can only select up to 3 competitors.');
      checkbox.checked = false;
      return;
    }
    selectedCompetitorsSet.add(index);
  } else {
    selectedCompetitorsSet.delete(index);
  }

  const selectedCompetitors = Array.from(selectedCompetitorsSet).map(
    (i) => contestants[i]
  );

  while (selectedCompetitors.length < 3) {
    selectedCompetitors.push({
      name: 'Select Cutter',
      location: 'Cutter Challenge',
    });
  }

  currentCompetitors.length = 0;
  currentCompetitors.push(...selectedCompetitors);

  // Update localStorage with the new currentCompetitors
  localStorage.setItem(
    'currentCompetitors',
    JSON.stringify(currentCompetitors)
  );

  const currentCompetitorsList = document.getElementById(
    'currentCompetitorsList'
  );
  currentCompetitorsList.innerHTML = currentCompetitors
    .map(
      (c, index) => `
        <li id="currentCompetitor${index}">${c.name} - ${c.location}</li>
      `
    )
    .join('');
};
