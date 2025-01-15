let eventData = {};

document.addEventListener('DOMContentLoaded', async () => {
  // Get input values from local storage
  const inputValues = JSON.parse(localStorage.getItem('inputValuesChanged'));
  // Get the hash value
  const leaderboardsFilter = window.location.hash.substring(1);
  updateLeaderboards(inputValues, leaderboardsFilter);

  // Listen for custom event to update leaderboards when input values change
  window.addEventListener('storage', (event) => {
    if (event.key === 'inputValuesChanged') {
      eventData = JSON.parse(event.newValue);
      // Handle the event data
      updateLeaderboards(eventData, leaderboardsFilter);
    }
  });

  // Listen for changes to localStorage
  window.addEventListener('storage', (event) => {
    if (event.key === 'currentCompetitors') {
      updateLeaderboards(eventData, leaderboardsFilter);
    }
  });
});

async function updateLeaderboards(data, leaderboardsFilter) {
  const leaderboards = document.getElementById('leaderboards');
  leaderboards.innerHTML = '';

  const leaderboardEntries = [];
  const currentCompetitorsData = [];

  for (const person in data) {
    let currentCompetitorMatch = false;

    // get currentCompetitors from local storage
    const currentCompetitors = JSON.parse(
      localStorage.getItem('currentCompetitors')
    );
    for (const selectedPerson in currentCompetitors) {
      if (currentCompetitors[selectedPerson].name === person) {
        currentCompetitorMatch = true;
      }
    }
    const personData = data[person];
    const games = {};
    let eliminated = false;

    for (const key in personData) {
      if (key === 'eliminated') {
        eliminated = personData[key];
      }
      // If current competitor, add to currentCompetitorsData
      if (currentCompetitorMatch) {
        currentCompetitorsData[person] = {
          ...personData,
        };
      }
      if (key.endsWith('points')) {
        // Extract the game identifier
        const game = key.split('-')[0];
        if (!games[game]) {
          games[game] = 0;
        }
        games[game] += Number(personData[key]);
      }
    }

    // Accumulate points from previous games
    let totalPoints = 0;
    for (const game of ['game1', 'game2', 'game3']) {
      if (games[game]) {
        totalPoints += games[game];
      }
      // Update the game points to include previous games' points
      games[game] = totalPoints;
    }

    const entry = {
      name: person,
      location: personData.location,
      eliminated,
      ...games,
    };

    leaderboardEntries.push(entry);
  }

  if (leaderboardsFilter === 'selected') {
    // Use currentCompetitorsData to build leaderboard
    // Up to 3 Current Competitors
    // Create 3 columns, not a table, side by side, one for each competitor to display their data and points
    const currentCompetitorsDiv = document.createElement('div');
    currentCompetitorsDiv.classList.add('currentCompetitorsDiv');
    leaderboards.appendChild(currentCompetitorsDiv);

    for (const person in currentCompetitorsData) {
      const currentCompetitor = currentCompetitorsData[person];
      const currentCompetitorDiv = document.createElement('div');
      currentCompetitorDiv.classList.add('currentCompetitorDiv');
      currentCompetitorsDiv.appendChild(currentCompetitorDiv);

      const currentCompetitorName = document.createElement('h3');
      currentCompetitorName.classList.add('currentCompetitorName');
      currentCompetitorName.textContent = person;
      currentCompetitorDiv.appendChild(currentCompetitorName);

      // Find amount of different games and rounds within each game
      const games = {};
      for (const key in currentCompetitor) {
        if (key === 'eliminated') {
          continue;
        }
        if (key === 'location') {
          continue;
        }
        const game = key.split('-')[0];
        if (!games[game]) {
          games[game] = {};
        }
        const round = key.split('-')[1];
        if (!games[game][round]) {
          games[game][round] = {};
        }
      }

      // Create a div for each game and a div within each game for each round
      for (const game in games) {
        const gameDiv = document.createElement('div');
        gameDiv.classList.add('gameDiv');
        currentCompetitorDiv.appendChild(gameDiv);

        const gameHeader = document.createElement('h4');
        gameHeader.classList.add('gameHeader');
        gameHeader.textContent = game;
        gameDiv.appendChild(gameHeader);

        for (const round in games[game]) {
          const roundDiv = document.createElement('div');
          roundDiv.classList.add('roundDiv');
          gameDiv.appendChild(roundDiv);

          const roundHeader = document.createElement('h5');
          roundHeader.classList.add('roundHeader');
          roundHeader.textContent = round;
          roundDiv.appendChild(roundHeader);

          // Create a scoring div
          const scoringsDiv = document.createElement('div');
          scoringsDiv.classList.add('scoringsDiv');

          for (const key in currentCompetitor) {
            const keyGame = key.split('-')[0];
            const keyRound = key.split('-')[1];
            if (keyGame === game && keyRound === round) {
              if (key.includes('speed-total')) {
                // Create scoreDiv
                const scoreDiv = document.createElement('div');
                scoreDiv.classList.add('scoreDiv');
                // Display speed total
                const speedTotal = document.createElement('p');
                speedTotal.innerHTML = `Speed<br>${currentCompetitor[key]}`;

                scoreDiv.appendChild(speedTotal);

                // Add scoreDiv to scoringsDiv
                scoringsDiv.appendChild(scoreDiv);
              }
              if (key.endsWith('variance')) {
                const scoreDiv = document.createElement('div');
                scoreDiv.classList.add('scoreDiv');
                // Display variance
                const variance = document.createElement('p');
                variance.innerHTML = `Variance<br>${currentCompetitor[key]}`;

                scoreDiv.appendChild(variance);

                // Add scoreDiv to scoringsDiv
                scoringsDiv.appendChild(scoreDiv);
              }
              if (key.endsWith('presentation')) {
                const scoreDiv = document.createElement('div');
                scoreDiv.classList.add('scoreDiv');
                // Display presentation
                const presentation = document.createElement('p');
                presentation.innerHTML = `Presentation<br>${currentCompetitor[key]}`;

                scoreDiv.appendChild(presentation);

                // Add scoreDiv to scoringsDiv
                scoringsDiv.appendChild(scoreDiv);
              }
            }
          }
          roundDiv.appendChild(scoringsDiv);
        }
      }
    }
  } else if (leaderboardsFilter !== 'all') {
    let gameFilter;
    let limit;
    if (leaderboardsFilter === 'top6') {
      gameFilter = 'game1';
      limit = 6;
    } else if (leaderboardsFilter === 'top3') {
      gameFilter = 'game2';
      limit = 3;
    } else if (leaderboardsFilter === 'final') {
      gameFilter = 'game3';
      limit = 3;
    }
    // Sort leaderboard entries if a specific game filter is applied
    leaderboardEntries.sort(
      (a, b) => (b[gameFilter] || 0) - (a[gameFilter] || 0)
    );

    // Limit the number of entries displayed
    leaderboardEntries.splice(limit);

    createTable(leaderboardEntries, leaderboards, gameFilter);
  } else if (leaderboardsFilter === 'all') {
    // Sort by each game column
    leaderboardEntries.sort((a, b) => {
      for (const game of ['game1', 'game2', 'game3']) {
        if ((b[game] || 0) !== (a[game] || 0)) {
          return (b[game] || 0) - (a[game] || 0);
        }
      }
      return 0;
    });
    createTable(leaderboardEntries, leaderboards, leaderboardsFilter);
  }
}

function createTable(leaderboardEntries, leaderboards, gameFilter) {
  // Create table headers
  const table = document.createElement('table');

  const headerRow = document.createElement('tr');
  const nameHeader = document.createElement('th');
  nameHeader.textContent = `Cutter's Name`;
  headerRow.appendChild(nameHeader);
  const gameHeaders = ['game1', 'game2', 'game3'];

  if (gameFilter === 'all') {
    gameHeaders.forEach((game, index) => {
      let classList = 'tableHeader';
      if (gameFilter !== game && gameFilter !== 'all') {
        classList += ' red';
      }
      const gameHeader = document.createElement('th');
      gameHeader.innerHTML = `<div class="${classList}">Game ${
        index + 1
      }</div>`;
      headerRow.appendChild(gameHeader);
    });
  }
  if (gameFilter === 'game3') {
    // Add Header for Final Score
    const finalHeader = document.createElement('th');
    finalHeader.innerHTML = `<div class="tableHeader">Final Score</div>`;
    headerRow.appendChild(finalHeader);
  }

  table.appendChild(headerRow);

  // Create table rows
  let position = 1;

  function getOrdinalSuffix(position) {
    const j = position % 10,
      k = position % 100;
    if (j == 1 && k != 11) {
      return position + 'st';
    }
    if (j == 2 && k != 12) {
      return position + 'nd';
    }
    if (j == 3 && k != 13) {
      return position + 'rd';
    }
    return position + 'th';
  }

  leaderboardEntries.forEach((entry) => {
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    nameCell.innerHTML = `<span class=otherFont>${getOrdinalSuffix(
      position
    )}</span> ${entry.name} - ${entry.location}`;
    position++;
    if (entry.eliminated) {
      nameCell.classList.add('eliminated');
    }
    row.appendChild(nameCell);

    if (gameFilter === 'all') {
      gameHeaders.forEach((game) => {
        let gameCellClass = 'tableCell';
        if (gameFilter !== game && gameFilter !== 'all') {
          gameCellClass += ' red';
        }
        if (entry.eliminated) {
          gameCellClass += ' eliminated';
        }
        const gameCell = document.createElement('td');
        const gameCellPoints = entry[game] || 0;
        gameCell.innerHTML = `<div class="${gameCellClass}">${gameCellPoints}</div>`;
        row.appendChild(gameCell);
      });
    }
    if (gameFilter === 'game3') {
      // Add Final Score
      const finalScore = document.createElement('td');
      const finalScorePoints = entry.game3 || 0;
      finalScore.innerHTML = `<div class="tableCell">${finalScorePoints}</div>`;
      row.appendChild(finalScore);
    }

    table.appendChild(row);
  });

  leaderboards.appendChild(table);
}
