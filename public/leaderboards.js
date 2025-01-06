let eventData = {};

document.addEventListener('DOMContentLoaded', async () => {
  // Get input values from local storage
  const inputValues = JSON.parse(localStorage.getItem('inputValuesChanged'));
  // Get the hash value
  const gameFilter = window.location.hash.substring(1);
  updateLeaderboards(inputValues, gameFilter);

  // Listen for custom event to update leaderboards when input values change
  window.addEventListener('storage', (event) => {
    if (event.key === 'inputValuesChanged') {
      eventData = JSON.parse(event.newValue);
      // Handle the event data
      updateLeaderboards(eventData, gameFilter);
    }
  });

  // Listen for changes to localStorage
  window.addEventListener('storage', (event) => {
    if (event.key === 'currentCompetitors') {
      updateLeaderboards(eventData, gameFilter);
    }
  });
});

async function updateLeaderboards(data, gameFilter) {
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

    for (const key in personData) {
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

    const entry = {
      name: person,
      ...games,
    };

    leaderboardEntries.push(entry);
  }

  if (gameFilter === 'selected') {
    // Use currentCompetitorsData to build leaderboard
    // Up to 3 Current Competitors
    // Create 3 columns, not a table, side by side, one for each competitor to display thier data and points
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
  } else if (gameFilter !== 'all') {
    // Sort leaderboard entries if a specific game filter is applied
    leaderboardEntries.sort(
      (a, b) => (b[gameFilter] || 0) - (a[gameFilter] || 0)
    );
    createTable(leaderboardEntries, leaderboards, gameFilter);
  } else {
    // Sort by each game column
    leaderboardEntries.sort((a, b) => {
      for (const game of ['game1', 'game2', 'game3']) {
        if ((b[game] || 0) !== (a[game] || 0)) {
          return (b[game] || 0) - (a[game] || 0);
        }
      }
      return 0;
    });
    createTable(leaderboardEntries, leaderboards, gameFilter);
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
  gameHeaders.forEach((game, index) => {
    let classList = 'tableHeader';
    let possiblePointsClass = 'possiblePoints';
    if (gameFilter !== game && gameFilter !== 'all') {
      classList += ' red';
      possiblePointsClass += ' red';
    }
    const gameHeader = document.createElement('th');
    let gameCellTotalPoints = 0;
    if (game === 'game1') {
      gameCellTotalPoints = 60;
    } else if (game === 'game2') {
      gameCellTotalPoints = 35;
    } else if (game === 'game3') {
      gameCellTotalPoints = 40;
    }
    gameHeader.innerHTML = `<div class="${classList}">Game ${
      index + 1
    }</div></ br><div class="${possiblePointsClass}">Possible Points: ${gameCellTotalPoints}</div>`;
    headerRow.appendChild(gameHeader);
  });

  table.appendChild(headerRow);

  // Create table rows
  leaderboardEntries.forEach((entry) => {
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    nameCell.textContent = entry.name;
    row.appendChild(nameCell);

    gameHeaders.forEach((game) => {
      let gameCellClass = 'tableCell';
      if (gameFilter !== game && gameFilter !== 'all') {
        gameCellClass += ' red';
      }
      const gameCell = document.createElement('td');
      const gameCellPoints = entry[game] || 0;
      gameCell.innerHTML = `<div class="${gameCellClass}">${gameCellPoints}</div>`;
      row.appendChild(gameCell);
    });

    table.appendChild(row);
  });

  leaderboards.appendChild(table);
}
