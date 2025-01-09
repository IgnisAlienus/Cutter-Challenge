import { currentCompetitors, inputValues } from './globals.js';

let competitors = [];
const selectedCompetitorsSet = new Set();

document.addEventListener('DOMContentLoaded', () => {
  const competitorsList = document.getElementById('competitorsList');

  // Fetch competitors data from the server
  fetch('/competitors')
    .then((response) => response.json())
    .then((data) => {
      competitors = data;

      // Update the competitors list
      competitorsList.innerHTML = competitors
        .map(
          (c, index) => `
          <li class="competitor-item">
            <div class="competitor-header">
              <input type="checkbox" id="competitor${index}" value="${index}" onchange="updateCurrentCompetitors(${index})">
              <label for="competitor${index}">
                <span id="competitorName${index}">${c.name}</span> - <span id="competitorLocation${index}">${c.location}</span>
              </label>
              <button class="editButton" id="editButton${index}" onclick="editCompetitor(${index})">✏️</button>
                  <input type="checkbox" id="eliminated${index}" onchange="toggleEliminated(${index}, \`${c.name}\`)">
                  <label class="eliminated" for="eliminated${index}">Eliminated</label>
            </div>
            <div class="scoring hidden" id="scoring-${index}">
              <h4>Game 1</h4>
              <div class="rounds-container">
                <div>
                  <span><b>Round 1:</b> Speed</span>
                  <div class="speed-inputs">
                    <input type="number" id="game1-round1-speed-minutes-${index}" placeholder="MM" min="0" max="59" oninput="validateInput(this); storeInputValue(${index}, 'game1', 'round1', 'speed-minutes', \`${c.name}\`)" />
                    <span>:</span>
                    <input type="number" id="game1-round1-speed-seconds-${index}" placeholder="SS" min="0" max="59" oninput="validateInput(this); storeInputValue(${index}, 'game1', 'round1', 'speed-seconds', \`${c.name}\`)" />
                    <span>:</span>
                    <input type="number" id="game1-round1-speed-centiseconds-${index}" placeholder="CS" min="0" max="99" oninput="validateInput(this); storeInputValue(${index}, 'game1', 'round1', 'speed-centiseconds', \`${c.name}\`)" />
                  </div>
                </div>
                <div>
                  <span><b>Round 1:</b> Accuracy</span>
                  <input type="number" id="game1-round1-accuracy-${index}" placeholder="#.##" min="0" max="5" step="0.01" oninput="updateVariance(${index}, 1); storeInputValue(${index}, 'game1', 'round1', 'variance', \`${c.name}\`, this.dataset.variance)" />
                  <span id="game1-round1-variance-${index}"></span>
                </div>
                <div>
                  <span><b>Round 1:</b> Presentation</span>
                  <input type="number" id="game1-round1-presentation-${index}" placeholder="0-30" min="0" max="30" oninput="validateInput(this); storeInputValue(${index}, 'game1', 'round1', 'presentation', \`${c.name}\`)" />
                </div>
                <div>
                  <span><b>Round 2:</b> Speed</span>
                  <div class="speed-inputs">
                    <input type="number" id="game1-round2-speed-minutes-${index}" placeholder="MM" min="0" max="59" oninput="validateInput(this); storeInputValue(${index}, 'game1', 'round2', 'speed-minutes', \`${c.name}\`)" />
                    <span>:</span>
                    <input type="number" id="game1-round2-speed-seconds-${index}" placeholder="SS" min="0" max="59" oninput="validateInput(this); storeInputValue(${index}, 'game1', 'round2', 'speed-seconds', \`${c.name}\`)" />
                    <span>:</span>
                    <input type="number" id="game1-round2-speed-centiseconds-${index}" placeholder="CS" min="0" max="99" oninput="validateInput(this); storeInputValue(${index}, 'game1', 'round2', 'speed-centiseconds', \`${c.name}\`)" />
                  </div>
                </div>
                <div>
                  <span><b>Round 2:</b> Accuracy</span>
                  <input type="number" id="game1-round2-accuracy-${index}" placeholder="#.##" min="0" max="5" step="0.01" oninput="updateVariance(${index}, 2); storeInputValue(${index}, 'game1', 'round2', 'variance', \`${c.name}\`, this.dataset.variance)" />
                  <span id="game1-round2-variance-${index}"></span>
                </div>
                <div>
                  <span><b>Round 2:</b> Presentation</span>
                  <input type="number" id="game1-round2-presentation-${index}" placeholder="0-30" min="0" max="30" oninput="validateInput(this); storeInputValue(${index}, 'game1', 'round2', 'presentation', \`${c.name}\`)" />
                </div>
                <div>
                  <span><b>Round 3:</b> Speed</span>
                  <div class="speed-inputs">
                    <input type="number" id="game1-round3-speed-minutes-${index}" placeholder="MM" min="0" max="59" oninput="validateInput(this); storeInputValue(${index}, 'game1', 'round3', 'speed-minutes', \`${c.name}\`)" />
                    <span>:</span>
                    <input type="number" id="game1-round3-speed-seconds-${index}" placeholder="SS" min="0" max="59" oninput="validateInput(this); storeInputValue(${index}, 'game1', 'round3', 'speed-seconds', \`${c.name}\`)" />
                    <span>:</span>
                    <input type="number" id="game1-round3-speed-centiseconds-${index}" placeholder="CS" min="0" max="99" oninput="validateInput(this); storeInputValue(${index}, 'game1', 'round3', 'speed-centiseconds', \`${c.name}\`)" />
                  </div>
                </div>
                <div>
                  <span><b>Round 3:</b> Accuracy</span>
                  <input type="number" id="game1-round3-accuracy-${index}" placeholder="#.##" min="0" max="5" step="0.01" oninput="updateVariance(${index}, 3); storeInputValue(${index}, 'game1', 'round3', 'variance', \`${c.name}\`, this.dataset.variance)" />
                  <span id="game1-round3-variance-${index}"></span>
                </div>
                <div>
                  <span><b>Round 3:</b> Presentation</span>
                  <input type="number" id="game1-round3-presentation-${index}" placeholder="0-30" min="0" max="30" oninput="validateInput(this); storeInputValue(${index}, 'game1', 'round3', 'presentation', \`${c.name}\`)" />
                </div>
              </div>
              <h4>Game 2</h4>
              <div class="rounds-container">
                <div>
                  <span><b>Round 1:</b> Speed</span>
                  <div class="speed-inputs">
                    <input type="number" id="game2-round1-speed-minutes-${index}" placeholder="MM" min="0" max="59" oninput="validateInput(this); storeInputValue(${index}, 'game2', 'round1', 'speed-minutes', \`${c.name}\`)" />
                    <span>:</span>
                    <input type="number" id="game2-round1-speed-seconds-${index}" placeholder="SS" min="0" max="59" oninput="validateInput(this); storeInputValue(${index}, 'game2', 'round1', 'speed-seconds', \`${c.name}\`)" />
                    <span>:</span>
                    <input type="number" id="game2-round1-speed-centiseconds-${index}" placeholder="CS" min="0" max="99" oninput="validateInput(this); storeInputValue(${index}, 'game2', 'round1', 'speed-centiseconds', \`${c.name}\`)" />
                  </div>
                </div>
                <div>
                  <span><b>Round 1:</b> Presentation</span>
                  <input type="number" id="game2-round1-presentation-${index}" placeholder="0-30" min="0" max="30" oninput="validateInput(this); storeInputValue(${index}, 'game2', 'round1', 'presentation', \`${c.name}\`)" />
                </div>
              </div>
              <h4>Game 3</h4>
              <div class="rounds-container">
                <div>
                  <span><b>Round 1:</b> Speed</span>
                  <div class="speed-inputs">
                    <input type="number" id="game3-round1-speed-minutes-${index}" placeholder="MM" min="0" max="59" oninput="validateInput(this); storeInputValue(${index}, 'game3', 'round1', 'speed-minutes', \`${c.name}\`)" />
                    <span>:</span>
                    <input type="number" id="game3-round1-speed-seconds-${index}" placeholder="SS" min="0" max="59" oninput="validateInput(this); storeInputValue(${index}, 'game3', 'round1', 'speed-seconds', \`${c.name}\`)" />
                    <span>:</span>
                    <input type="number" id="game3-round1-speed-centiseconds-${index}" placeholder="CS" min="0" max="99" oninput="validateInput(this); storeInputValue(${index}, 'game3', 'round1', 'speed-centiseconds', \`${c.name}\`)" />
                  </div>
                </div>
                <div>
                  <span><b>Round 1:</b> Presentation</span>
                  <input type="number" id="game3-round1-presentation-${index}" placeholder="0-30" min="0" max="30" oninput="validateInput(this); storeInputValue(${index}, 'game3', 'round1', 'presentation', \`${c.name}\`)" />
                </div>
              </div>
            </div>
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
          <li id="currentCompetitor${index}">${index + 1}. ${c.name} - ${
            c.location
          }</li>
        `
        )
        .join('');
    });

  // Add event listeners to update target weights in localStorage
  document
    .getElementById('targetWeightRound1')
    .addEventListener('input', (e) => {
      localStorage.setItem('targetWeightRound1', e.target.value);
    });
  document
    .getElementById('targetWeightRound2')
    .addEventListener('input', (e) => {
      localStorage.setItem('targetWeightRound2', e.target.value);
    });
  document
    .getElementById('targetWeightRound3')
    .addEventListener('input', (e) => {
      localStorage.setItem('targetWeightRound3', e.target.value);
    });

  // Initialize target weights from localStorage
  document.getElementById('targetWeightRound1').value =
    localStorage.getItem('targetWeightRound1') || '';
  document.getElementById('targetWeightRound2').value =
    localStorage.getItem('targetWeightRound2') || '';
  document.getElementById('targetWeightRound3').value =
    localStorage.getItem('targetWeightRound3') || '';
});

window.editCompetitor = function editCompetitor(index) {
  const nameSpan = document.getElementById(`competitorName${index}`);
  const locationSpan = document.getElementById(`competitorLocation${index}`);
  const editButton = document.getElementById(`editButton${index}`);

  if (editButton.textContent === '✏️') {
    nameSpan.innerHTML = `<input type="text" id="editName${index}" value="${nameSpan.textContent}">`;
    locationSpan.innerHTML = `<input type="text" id="editLocation${index}" value="${locationSpan.textContent}">`;
    editButton.textContent = '\u2705';
  } else {
    const updatedName = document.getElementById(`editName${index}`).value;
    const updatedLocation = document.getElementById(
      `editLocation${index}`
    ).value;

    // Send POST request to update competitor's information
    fetch('/updateCompetitor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        index,
        name: updatedName,
        location: updatedLocation,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          nameSpan.textContent = updatedName;
          locationSpan.textContent = updatedLocation;
          editButton.textContent = '✏️';

          // Update the competitors array
          competitors[index].name = updatedName;
          competitors[index].location = updatedLocation;
        } else {
          alert('Failed to update competitor');
        }
      });
  }
};

window.updateCurrentCompetitors = function updateCurrentCompetitors(index) {
  const checkbox = document.getElementById(`competitor${index}`);
  const scoringDiv = document.getElementById(`scoring-${index}`);
  if (checkbox.checked) {
    if (selectedCompetitorsSet.size >= 3) {
      alert('You can only select up to 3 competitors.');
      checkbox.checked = false;
      return;
    }
    selectedCompetitorsSet.add(index);
    scoringDiv.classList.remove('hidden');
  } else {
    selectedCompetitorsSet.delete(index);
    scoringDiv.classList.add('hidden');
  }

  const selectedCompetitors = Array.from(selectedCompetitorsSet).map(
    (i) => competitors[i]
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

window.validateInput = function validateInput(input) {
  const min = parseFloat(input.min);
  const max = parseFloat(input.max);
  const value = parseFloat(input.value);

  if (value < min) {
    input.value = min;
  } else if (value > max) {
    input.value = max;
  }
};

window.updateVariance = function updateVariance(index, round) {
  const targetWeight = parseFloat(
    localStorage.getItem(`targetWeightRound${round}`)
  );
  const accuracyInput = document.getElementById(
    `game1-round${round}-accuracy-${index}`
  );
  const varianceElement = document.getElementById(
    `game1-round${round}-variance-${index}`
  );

  if (!isNaN(targetWeight) && accuracyInput) {
    const accuracyValue = parseFloat(accuracyInput.value);
    const variance = accuracyValue - targetWeight;
    varianceElement.textContent = `Variance: ${variance.toFixed(2)}`;
    // Store variance in a data attribute
    accuracyInput.dataset.variance = variance.toFixed(2);
  } else {
    varianceElement.textContent = '';
    accuracyInput.dataset.variance = '';
  }
};

window.toggleEliminated = function toggleEliminated(index, name) {
  const isEliminated = document.getElementById(`eliminated${index}`).checked;

  // Get inputValues from localStorage
  const inputValues = JSON.parse(localStorage.getItem('inputValuesChanged'));

  // Find the competitor's inputValues and update the eliminated status
  if (inputValues && inputValues[name]) {
    inputValues[name].eliminated = isEliminated;
    // Store the updated inputValues in localStorage
    localStorage.setItem('inputValuesChanged', JSON.stringify(inputValues));
  }
};

window.storeInputValue = async function storeInputValue(
  index,
  game,
  round,
  metric,
  name,
  variance
) {
  const inputElement = document.getElementById(
    `${game}-${round}-${metric}-${index}`
  );
  if (inputElement) {
    const key = `${game}-${round}-${metric}`;
    if (!inputValues[name]) {
      inputValues[name] = {};
    }

    // Get if competitor is eliminated
    const isEliminated = document.getElementById(`eliminated${index}`).checked;
    inputValues[name].eliminated = isEliminated;

    const value = metric === 'variance' ? variance : inputElement.value;
    const existingValue = inputValues[name][key];
    inputValues[name][key] = value;

    // Fetch scoring data from the server
    const response = await fetch('/pointDistribution');
    const pointsDistribution = await response.json();

    // Calculate total time for speed
    if (metric.includes('speed')) {
      const minutes = parseFloat(
        inputValues[name][`${game}-${round}-speed-minutes`] || 0
      );
      const seconds = parseFloat(
        inputValues[name][`${game}-${round}-speed-seconds`] || 0
      );
      const centiseconds = parseFloat(
        inputValues[name][`${game}-${round}-speed-centiseconds`] || 0
      );
      const totalTime = minutes * 60 + seconds + centiseconds / 100;
      // Round to two decimal places
      const roundedTotalTime = Math.round(totalTime * 100) / 100;

      // Format total time as mm:ss:cc
      const formattedMinutes = Math.floor(roundedTotalTime / 60);
      const formattedSeconds = Math.floor(roundedTotalTime % 60)
        .toString()
        .padStart(2, '0');
      const formattedCentiseconds = (roundedTotalTime % 1)
        .toFixed(2)
        .substring(2);
      const formattedTotalTime = `${formattedMinutes}:${formattedSeconds}:${formattedCentiseconds}`;

      inputValues[name][`${game}-${round}-speed-total`] = formattedTotalTime;
    }

    // Helper function to convert time string to total seconds
    function timeStringToSeconds(timeString) {
      const [minutes, seconds, centiseconds] = timeString
        .split(':')
        .map(parseFloat);
      return minutes * 60 + seconds + centiseconds / 100;
    }

    // Sort competitors by their total speed time
    const sortedSpeedCompetitors = Object.keys(inputValues).sort((a, b) => {
      const aValue = timeStringToSeconds(
        inputValues[a][`${game}-${round}-speed-total`] || '0:00:00'
      );
      const bValue = timeStringToSeconds(
        inputValues[b][`${game}-${round}-speed-total`] || '0:00:00'
      );
      // Ascending for speed
      return aValue - bValue;
    });

    // Assign points based on speed ranking
    let speedRank = 0;
    while (speedRank < sortedSpeedCompetitors.length) {
      let tieCompetitors = [sortedSpeedCompetitors[speedRank]];
      const currentSpeed = timeStringToSeconds(
        inputValues[sortedSpeedCompetitors[speedRank]][
          `${game}-${round}-speed-total`
        ] || '0:00:00'
      );

      // Find all competitors with the same speed score
      while (
        speedRank + tieCompetitors.length < sortedSpeedCompetitors.length &&
        timeStringToSeconds(
          inputValues[
            sortedSpeedCompetitors[speedRank + tieCompetitors.length]
          ][`${game}-${round}-speed-total`] || '0:00:00'
        ) === currentSpeed
      ) {
        tieCompetitors.push(
          sortedSpeedCompetitors[speedRank + tieCompetitors.length]
        );
      }

      // Calculate average points for tied competitors
      const pointsArray = pointsDistribution[`${game}-${round}-speed`];
      const totalPoints = tieCompetitors.reduce((sum, _, index) => {
        return sum + (pointsArray[speedRank + index] || 1);
      }, 0);
      const averagePoints = totalPoints / tieCompetitors.length;

      // Assign average points to each tied competitor
      tieCompetitors.forEach((competitor) => {
        inputValues[competitor][`${game}-${round}-speed-points`] =
          averagePoints;
      });

      // Move to the next speedRank after the tie
      speedRank += tieCompetitors.length;
    }

    // Sort competitors by their presentation score
    const sortedPresentationCompetitors = Object.keys(inputValues).sort(
      (a, b) => {
        const aValue = parseFloat(
          inputValues[a][`${game}-${round}-presentation`] || 0
        );
        const bValue = parseFloat(
          inputValues[b][`${game}-${round}-presentation`] || 0
        );
        // Descending for presentation
        return bValue - aValue;
      }
    );

    // Assign points based on presentation ranking
    let presentationRank = 0;
    while (presentationRank < sortedPresentationCompetitors.length) {
      let tieCompetitors = [sortedPresentationCompetitors[presentationRank]];
      const currentPresentation = parseFloat(
        inputValues[sortedPresentationCompetitors[presentationRank]][
          `${game}-${round}-presentation`
        ] || 0
      );

      // Find all competitors with the same presentation score
      while (
        presentationRank + tieCompetitors.length <
          sortedPresentationCompetitors.length &&
        parseFloat(
          inputValues[
            sortedPresentationCompetitors[
              presentationRank + tieCompetitors.length
            ]
          ][`${game}-${round}-presentation`] || 0
        ) === currentPresentation
      ) {
        tieCompetitors.push(
          sortedPresentationCompetitors[
            presentationRank + tieCompetitors.length
          ]
        );
      }

      // Calculate average points for tied competitors
      const pointsArray = pointsDistribution[`${game}-${round}-presentation`];
      const totalPoints = tieCompetitors.reduce((sum, _, index) => {
        return sum + (pointsArray[presentationRank + index] || 1);
      }, 0);
      const averagePoints = totalPoints / tieCompetitors.length;

      // Assign average points to each tied competitor
      tieCompetitors.forEach((competitor) => {
        inputValues[competitor][`${game}-${round}-presentation-points`] =
          averagePoints;
      });

      // Move to the next presentationRank after the tie
      presentationRank += tieCompetitors.length;
    }

    // Only calculate variance points for game 1
    if (game === 'game1') {
      // Sort competitors by their variance score
      const sortedVarianceCompetitors = Object.keys(inputValues).sort(
        (a, b) => {
          const aValue = Math.abs(
            parseFloat(inputValues[a][`${game}-${round}-variance`] || 0)
          );
          const bValue = Math.abs(
            parseFloat(inputValues[b][`${game}-${round}-variance`] || 0)
          );

          // Ascending for variance
          return aValue - bValue;
        }
      );

      // Assign points based on variance ranking
      let varianceRank = 0;
      while (varianceRank < sortedVarianceCompetitors.length) {
        let tieCompetitors = [sortedVarianceCompetitors[varianceRank]];
        const currentVariance = Math.abs(
          parseFloat(
            inputValues[sortedVarianceCompetitors[varianceRank]][
              `${game}-${round}-variance`
            ] || 0
          )
        );

        // Find all competitors with the same variance
        while (
          varianceRank + tieCompetitors.length <
            sortedVarianceCompetitors.length &&
          Math.abs(
            parseFloat(
              inputValues[
                sortedVarianceCompetitors[varianceRank + tieCompetitors.length]
              ][`${game}-${round}-variance`] || 0
            )
          ) === currentVariance
        ) {
          tieCompetitors.push(
            sortedVarianceCompetitors[varianceRank + tieCompetitors.length]
          );
        }

        // Calculate average points for tied competitors
        const pointsArray = pointsDistribution[`${game}-${round}-variance`];
        const perfectCutPoints = pointsDistribution['perfect-cut-bonus'];
        const totalPoints = tieCompetitors.reduce((sum, _, index) => {
          return sum + (pointsArray[varianceRank + index] || 1);
        }, 0);
        const averagePoints = totalPoints / tieCompetitors.length;

        // Assign average points to each tied competitor
        tieCompetitors.forEach((competitor) => {
          let points = averagePoints;
          if (currentVariance === 0) {
            points += perfectCutPoints;
          }
          inputValues[competitor][`${game}-${round}-variance-points`] = points;
        });

        // Move to the next varianceRank after the tie
        varianceRank += tieCompetitors.length;
      }
    }

    // Store the inputValues in localStorage
    localStorage.setItem('inputValuesChanged', JSON.stringify(inputValues));

    // Use fetch to send the data to a server endpoint
    fetch('/save-scores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputValues),
    })
      .then((response) => response.json())
      .catch((error) => {
        console.error('Error saving file:', error);
      });
  }
};

// Add this function to handle recalculation of scores
function recalculateScores() {
  for (const name in inputValues) {
    for (const key in inputValues[name]) {
      const [game, round, metric] = key.split('-');
      const index = getCompetitorIndexByName(name);
      if (index !== -1) {
        window.storeInputValue(
          index,
          game,
          round,
          metric,
          name,
          inputValues[name][`${game}-${round}-variance`] || undefined
        );
      }
    }
  }
}

function getCompetitorIndexByName(name) {
  for (let i = 0; i < competitors.length; i++) {
    if (competitors[i].name === name) {
      return i;
    }
  }
  return -1;
}

export { recalculateScores };
