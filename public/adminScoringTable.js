import { recalculateScores } from './adminCompetitorsList.js';

let pointsDistribution = {};

document.addEventListener('DOMContentLoaded', () => {
  const scoringDiv = document.getElementById('scoringTable');

  // Fetch scoring data from the server
  fetch('/pointDistribution')
    .then((response) => response.json())
    .then((data) => {
      pointsDistribution = data;
      createTable(pointsDistribution);
    });

  function createTable(data) {
    // Add input for perfect-cut-bonus before the table
    const perfectCutBonusDiv = document.createElement('div');
    perfectCutBonusDiv.classList.add('perfectCutBonusDiv');

    const perfectCutBonusLabel = document.createElement('span');
    perfectCutBonusLabel.innerHTML = 'Game 1 Perfect Cut Bonus: ';

    const perfectCutBonusInput = document.createElement('input');
    perfectCutBonusInput.classList.add('perfectCutBonusInput');
    perfectCutBonusInput.type = 'number';
    perfectCutBonusInput.value = data['perfect-cut-bonus'];
    perfectCutBonusInput.dataset.key = 'perfect-cut-bonus';
    perfectCutBonusInput.addEventListener('change', handleInputChange);

    perfectCutBonusDiv.appendChild(perfectCutBonusLabel);
    perfectCutBonusDiv.appendChild(perfectCutBonusInput);

    scoringDiv.appendChild(perfectCutBonusDiv);

    const table = document.createElement('table');
    table.classList.add('scoreTable');

    // Create header row
    const headerRow = document.createElement('tr');
    const nameHeader = document.createElement('th');
    nameHeader.innerHTML = 'Event';
    headerRow.appendChild(nameHeader);

    function getPlaceSuffix(place) {
      if (place === 1) return '1st';
      if (place === 2) return '2nd';
      if (place === 3) return '3rd';
      return `${place}th`;
    }

    for (let i = 1; i <= 12; i++) {
      const placeHeader = document.createElement('th');
      placeHeader.innerHTML = getPlaceSuffix(i);
      headerRow.appendChild(placeHeader);
    }

    const totalHeader = document.createElement('th');
    totalHeader.innerHTML = 'Total';
    headerRow.appendChild(totalHeader);

    table.appendChild(headerRow);

    for (const [key, values] of Object.entries(data)) {
      if (key === 'perfect-cut-bonus') {
        perfectCutBonusInput.value = values;
        continue;
      }
      const row = document.createElement('tr');
      const headerCell = document.createElement('th');
      headerCell.innerHTML = key.replace(/-/g, '<br>');
      headerCell.innerHTML = headerCell.innerHTML.replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
      headerCell.innerHTML = headerCell.innerHTML.replace(/(\d+)/g, ' $1');
      row.appendChild(headerCell);

      let rowTotal = 0;

      values.forEach((value, index) => {
        const cell = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'number';
        input.value = value;
        input.dataset.key = key;
        input.dataset.index = index;
        input.classList.add('scoreTableInputs');
        input.addEventListener('change', handleInputChange);
        cell.appendChild(input);
        row.appendChild(cell);

        rowTotal += value;
      });

      const totalCell = document.createElement('td');
      totalCell.classList.add('totalCell');
      totalCell.innerHTML = rowTotal;
      row.appendChild(totalCell);

      table.appendChild(row);
    }

    scoringDiv.appendChild(perfectCutBonusDiv);
    scoringDiv.appendChild(table);
  }

  function handleInputChange(event) {
    const input = event.target;
    const key = input.dataset.key;
    const index = input.dataset.index;
    const newValue = parseFloat(input.value);

    if (key === 'perfect-cut-bonus') {
      pointsDistribution[key] = newValue;
    } else {
      pointsDistribution[key][index] = newValue;

      // Update the total cell
      const row = input.closest('tr');
      const totalCell = row.querySelector('.totalCell');
      const inputs = row.querySelectorAll('input');
      let rowTotal = 0;
      inputs.forEach((input) => {
        rowTotal += parseFloat(input.value) || 0;
      });
      totalCell.innerHTML = rowTotal;
    }

    // Send POST request to update the JSON on the server
    fetch('/updatePointDistribution', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pointsDistribution),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) {
          alert('Failed to update point distribution');
        }
        // Trigger recaclulation of scores in adminCompetitorsList.js
        recalculateScores();
      });
  }

  // Listen for button click reloadDefaultData
  document.getElementById('reloadDefaultData').addEventListener('click', () => {
    fetch('/reloadDefaultData')
      .then((response) => response.json())
      .then((data) => {
        // Update table input values from data
        for (const [key, values] of Object.entries(data)) {
          if (key === 'perfect-cut-bonus') {
            document.querySelector('.perfectCutBonusInput').value = values;
            continue;
          }

          const inputs = document.querySelectorAll(`input[data-key="${key}"]`);
          inputs.forEach((input, index) => {
            input.value = values[index];
          });
        }
        // Update totals
        const rows = document.querySelectorAll('tr');
        rows.forEach((row) => {
          if (row.querySelector('.totalCell')) {
            const inputs = row.querySelectorAll('input');
            let rowTotal = 0;
            inputs.forEach((input) => {
              rowTotal += parseFloat(input.value) || 0;
            });
            row.querySelector('.totalCell').innerHTML = rowTotal;
          }
        });
      });
  });
});
