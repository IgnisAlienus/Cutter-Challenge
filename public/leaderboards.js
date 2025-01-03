document.addEventListener('DOMContentLoaded', async () => {
  // Get input values from local storage
  const inputValues = JSON.parse(localStorage.getItem('inputValuesChanged'));
  // Get the hash value
  const gameFilter = window.location.hash.substring(1);
  updateLeaderboards(inputValues, gameFilter);

  // Listen for custom event to update leaderboards when input values change
  window.addEventListener('storage', (event) => {
    if (event.key === 'inputValuesChanged') {
      const eventData = JSON.parse(event.newValue);
      // Handle the event data
      updateLeaderboards(eventData, gameFilter);
    }
  });
});

async function updateLeaderboards(data, gameFilter) {
  const leaderboards = document.getElementById('leaderboards');
  leaderboards.innerHTML = '';

  const leaderboardEntries = [];

  for (const person in data) {
    const personData = data[person];
    const games = {};

    for (const key in personData) {
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

    console.log(`Entry for ${person}:`, entry);
    leaderboardEntries.push(entry);
  }

  // Sort leaderboard entries if a specific game filter is applied
  if (gameFilter !== 'all') {
    leaderboardEntries.sort(
      (a, b) => (b[gameFilter] || 0) - (a[gameFilter] || 0)
    );
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
  }

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
