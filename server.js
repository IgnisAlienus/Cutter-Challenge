const app = require('electron').app;
const express = require('express');
const fs = require('fs');
const path = require('path');
const DMX = require('dmx');

const server = express();

// Initialize DMX
const dmx = new DMX();
let universe;

try {
  // Check Device Manager to find Assigned COM Port ('my_universe' is the name of the universe), 'enttec-usb-dmx-pro' is the type of DMX device (Enttec USB DMX Pro)
  universe = dmx.addUniverse('my_universe', 'enttec-usb-dmx-pro', 'COM10');
  console.log('DMX universe initialized successfully');
} catch (error) {
  console.error('Failed to initialize DMX universe:', error);
  process.exit(1); // Exit the application if DMX initialization fails
}

// Serve static files from the current directory
server.use(express.static(path.join(__dirname, 'public')));
server.use(express.json());

// Serve the bbq.html file when the root route is accessed
server.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.get('/timers', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'timers.html'));
});

server.get('/current-competitors', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'currentCompetitors.html'));
});

server.get('/leaderboards', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'leaderboards.html'));
});

server.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

server.post('/light', (req, res) => {
  try {
    const lightNumber = parseInt(req.query.lightNumber, 10);
    const action = req.query.action;

    // CH1: Brightness (0-255)
    // CH2: Red (0 OFF / 1-255 ON with Brightness)
    // CH3: Green (0 OFF / 1-255 ON with Brightness)
    // CH4: Blue (0 OFF / 1-255 ON with Brightness)
    // CH5: Strobe (0-7 No Strobe / 8-255 Strobe Speed)
    // CH6: Other Functionality (0-10 Manual Control CH1-CH5 / 11-60 Color Selection (colors contorted by CH7) / 61-110 Colors Shade (colors contorted by CH7) / 111-160 Color Selection (colors contorted by CH7) / 161-210 Color Transition (speed contorted by CH7) / 211-255 Sound Control)
    // CH7: Color Selection/Colors Shade (0-255)

    const actionMap = {
      start: {
        intensity: 255,
        color1: 255,
        color2: 255,
        color3: 255,
        strobe: 0,
        other1: 0,
        other2: 0,
      },
      reset: {
        intensity: 255,
        color1: 255,
        color2: 255,
        color3: 255,
        strobe: 0,
        other1: 0,
        other2: 0,
      },
      stop: {
        intensity: 255,
        color1: 0,
        color2: 255,
        color3: 0,
        strobe: 0,
        other1: 0,
        other2: 0,
      },
      countdown1: {
        intensity: 255,
        color1: 255,
        color2: 0,
        color3: 0,
        strobe: 0,
        other1: 0,
        other2: 0,
      },
      countdown2: {
        intensity: 0,
        color1: 0,
        color2: 0,
        color3: 0,
        strobe: 0,
        other1: 0,
        other2: 0,
      },
      off: {
        intensity: 0,
        color1: 0,
        color2: 0,
        color3: 0,
        strobe: 0,
        other1: 0,
        other2: 0,
      },
      white: {
        intensity: 255,
        color1: 255,
        color2: 255,
        color3: 255,
        strobe: 0,
        other1: 0,
        other2: 0,
      },
      red: {
        intensity: 255,
        color1: 255,
        color2: 0,
        color3: 0,
        strobe: 0,
        other1: 0,
        other2: 0,
      },
    };

    if (!isNaN(lightNumber) && action !== undefined) {
      if (actionMap[action] !== undefined) {
        const dmxValues = actionMap[action];
        const startingChannel = (lightNumber - 1) * 7 + 1;

        const updateLight = (strobeValue) => {
          universe.update({
            [startingChannel]: dmxValues.intensity,
            [startingChannel + 1]: dmxValues.color1,
            [startingChannel + 2]: dmxValues.color2,
            [startingChannel + 3]: dmxValues.color3,
            [startingChannel + 4]: strobeValue,
            [startingChannel + 5]: dmxValues.other1,
            [startingChannel + 6]: dmxValues.other2,
          });
        };

        if (action === 'stop') {
          let flashes = 0;
          const flashInterval = setInterval(() => {
            // Toggle strobe on and off
            updateLight(flashes % 2 === 0 ? 255 : 0);
            flashes++;
            if (flashes >= 12) {
              // Flash 3 times (on and off counts as one flash)
              clearInterval(flashInterval);
              res.send(`Action ${action} completed for light ${lightNumber}`);
            }
          }, 50); // Adjust the interval time as needed
        } else {
          updateLight(dmxValues.strobe);
          res.send(`Action ${action} completed for light ${lightNumber}`);
        }
      } else {
        res.status(400).send('Invalid color');
      }
    } else {
      res
        .status(400)
        .send('lightNumber and color query parameters are required');
    }
  } catch (error) {
    console.error('Error handling /light request:', error);
    res.status(500).send('Internal Server Error');
  }
});

server.post('/save-scores', (req, res) => {
  try {
    const inputValues = req.body;

    const processId = process.pid;
    const userDataPath = app.getPath('userData');
    const filePath = path.join(
      userDataPath,
      `scores/inputValues-${processId}.json`
    );

    // Ensure the directory exists
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    fs.writeFileSync(filePath, JSON.stringify(inputValues, null, 2));
    res.json({ message: 'File saved successfully' });
  } catch (error) {
    console.error('Error saving file:', error);
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
});

server.get('/competitors', (req, res) => {
  try {
    const userDataPath = app.getPath('userData');
    const competitorsFilePath = path.join(userDataPath, 'competitors.json');

    let competitorsData;
    if (fs.existsSync(competitorsFilePath)) {
      competitorsData = JSON.parse(
        fs.readFileSync(competitorsFilePath, 'utf8')
      );
    } else {
      const defaultCompetitorsFilePath = path.join(
        __dirname,
        'data',
        'competitors.json'
      );
      competitorsData = JSON.parse(
        fs.readFileSync(defaultCompetitorsFilePath, 'utf8')
      );

      // Save a copy to the user's app data directory
      fs.writeFileSync(
        competitorsFilePath,
        JSON.stringify(competitorsData, null, 2)
      );
    }

    res.json(competitorsData);
  } catch (error) {
    console.error('Error reading competitors data:', error);
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
});

server.post('/updateCompetitor', (req, res) => {
  try {
    const { index, name, location } = req.body;

    // Construct the path to the competitors.json file in the user's app data directory
    const userDataPath = app.getPath('userData');
    const competitorsPath = path.join(userDataPath, 'competitors.json');

    // Check if the file exists
    if (!fs.existsSync(competitorsPath)) {
      return res
        .status(404)
        .json({ success: false, message: 'File not found' });
    }

    // Read the existing competitors data
    const competitorsData = JSON.parse(
      fs.readFileSync(competitorsPath, 'utf8')
    );

    // Update the competitor's information
    if (competitorsData[index]) {
      competitorsData[index].name = name;
      competitorsData[index].location = location;

      // Write the updated data back to the file
      fs.writeFileSync(
        competitorsPath,
        JSON.stringify(competitorsData, null, 2)
      );

      res.json({ success: true, message: 'Competitor updated successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Competitor not found' });
    }
  } catch (error) {
    console.error('Error updating competitor:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
});

server.get('/reloadDefaultData', (req, res) => {
  // Get /data/pointDistribution.json and update the user's pointDistribution.json file
  try {
    const userDataPath = app.getPath('userData');
    const pointDistributionFilePath = path.join(
      userDataPath,
      'pointDistribution.json'
    );

    const defaultPointDistributionFilePath = path.join(
      __dirname,
      'data',
      'pointDistribution.json'
    );
    const pointDistributionData = JSON.parse(
      fs.readFileSync(defaultPointDistributionFilePath, 'utf8')
    );

    fs.writeFileSync(
      pointDistributionFilePath,
      JSON.stringify(pointDistributionData, null, 2)
    );

    // Send point distribution data to the client
    res.json(pointDistributionData);
  } catch (error) {
    console.error('Error reloading default data:', error);
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
});

server.get('/pointDistribution', (req, res) => {
  try {
    const userDataPath = app.getPath('userData');
    const pointDistributionFilePath = path.join(
      userDataPath,
      'pointDistribution.json'
    );

    let pointDistributionData;
    if (fs.existsSync(pointDistributionFilePath)) {
      pointDistributionData = JSON.parse(
        fs.readFileSync(pointDistributionFilePath, 'utf8')
      );
    } else {
      const defaultPointDistributionFilePath = path.join(
        __dirname,
        'data',
        'pointDistribution.json'
      );
      pointDistributionData = JSON.parse(
        fs.readFileSync(defaultPointDistributionFilePath, 'utf8')
      );

      // Save a copy to the user's app data directory
      fs.writeFileSync(
        pointDistributionFilePath,
        JSON.stringify(pointDistributionData, null, 2)
      );
    }

    res.json(pointDistributionData);
  } catch (error) {
    console.error('Error reading point distribution data:', error);
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
});

server.post('/updatePointDistribution', (req, res) => {
  try {
    const pointDistributionData = req.body;
    const userDataPath = app.getPath('userData');
    const pointDistributionFilePath = path.join(
      userDataPath,
      'pointDistribution.json'
    );
    fs.writeFileSync(
      pointDistributionFilePath,
      JSON.stringify(pointDistributionData, null, 2)
    );
    res.json({
      success: true,
      message: 'Point distribution updated successfully',
    });
  } catch (error) {
    console.error('Error updating point distribution:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
});

module.exports = server;
