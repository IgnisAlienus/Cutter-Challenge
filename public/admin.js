function updateTimerTitle(timerNumber) {
  const titleInput = document.getElementById(`title${timerNumber}`);
  const title = titleInput.value || `Cutter ${timerNumber}`;
  timerNames[timerNumber - 1] = title;
  localStorage.setItem(`title${timerNumber}`, title);
  // Update the title in timers.html
  const timerTitleElement = document.querySelector(
    `#timer${timerNumber} .timer-title`
  );
  if (timerTitleElement) {
    timerTitleElement.innerHTML = title;
  }
}

function updateTimerSubtitle(timerNumber) {
  const subtitleInput = document.getElementById(`subtitle${timerNumber}`);
  const subtitle = subtitleInput.value || `Rudy's ${timerNumber}`;
  timerSubtitles[timerNumber - 1] = subtitle;
  localStorage.setItem(`subtitle${timerNumber}`, subtitle);
  // Update the subtitle in timers.html
  const timerSubtitleElement = document.querySelector(
    `#timer${timerNumber} .timer-subtitle`
  );
  if (timerSubtitleElement) {
    timerSubtitleElement.innerHTML = subtitle;
  }
}

document.getElementById('closeButton').addEventListener('click', () => {
  window.electron.closeWindows();
});

document.addEventListener('DOMContentLoaded', () => {
  const competitorsList = document.getElementById('competitorsList');
  competitorsList.innerHTML = contestants
    .map(
      (c, index) => `
    <li>
      <input type="checkbox" id="competitor${index}" value="${index}" onchange="updateCurrentCompetitors()">
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

function updateCurrentCompetitors() {
  const selectedCompetitors = [];
  let selectedCount = 0;

  document
    .querySelectorAll('#competitorsList input[type="checkbox"]')
    .forEach((checkbox) => {
      if (checkbox.checked) {
        selectedCount++;
        if (selectedCount > 3) {
          alert('You can only select up to 3 competitors.');
          checkbox.checked = false;
          return;
        }
        selectedCompetitors.push(contestants[checkbox.value]);
      }
    });

  // Fill the remaining slots with default values if less than 3 are selected
  while (selectedCompetitors.length < 3) {
    selectedCompetitors.push({
      name: `Select Cutter`,
      location: `Cutter Challenge`,
    });
  }

  currentCompetitors = selectedCompetitors;
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

  // Update the titles and subtitles in the timers page
  currentCompetitors.forEach((competitor, index) => {
    localStorage.setItem(`title${index + 1}`, competitor.name);
    localStorage.setItem(`subtitle${index + 1}`, competitor.location);
  });
}

// Initialize the checkboxes with the current competitors
currentCompetitors.forEach((competitor) => {
  const index = contestants.indexOf(competitor);
  if (index !== -1) {
    document.getElementById(`competitor${index}`).checked = true;
  }
});
