const express = require('express');
const path = require('path');
const DMX = require('dmx');

const app = express();
const port = 3000;

// Initialize DMX
const dmx = new DMX();
// Check Device Manager to find Assigned COM Port
const universe = dmx.addUniverse('my_universe', 'enttec-usb-dmx-pro', 'COM3');

// Serve static files from the current directory
app.use(express.static('public'));

// Serve the bbq.html file when the root route is accessed
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'bbq.html'));
});

app.post('/light', (req, res) => {
  const lightNumber = parseInt(req.query.lightNumber, 10);
  const color = req.query.color;

  // CH1: Brightness (0-255)
  // CH2: Red (0 OFF / 1-255 ON with Brightness)
  // CH3: Green (0 OFF / 1-255 ON with Brightness)
  // CH4: Blue (0 OFF / 1-255 ON with Brightness)
  // CH5: Strobe (0-7 No Strobe / 8-255 Strobe Speed)
  // CH6: Other Functionality (0-10 Manual Control CH1-CH5 / 11-60 Color Selection (colors contorted by CH7) / 61-110 Colors Shade (colors contorted by CH7) / 111-160 Color Selection (colors contorted by CH7) / 161-210 Color Transition (speed contorted by CH7) / 211-255 Sound Control)
  // CH7: Color Selection/Colors Shade (0-255)

  // Map color names to DMX values (example values, adjust as needed)
  const colorMap = {
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

  if (!isNaN(lightNumber) && color !== undefined) {
    console.log(`Light changed ${lightNumber} to ${color}`);

    // Check if the color is in the colorMap
    if (colorMap[color] !== undefined) {
      const dmxValues = colorMap[color];
      // Calculate the starting DMX channel
      const startingChannel = lightNumber * 7 + 1;

      // Use DMX to change the light
      universe.update({
        [startingChannel]: dmxValues.intensity, // Brightness channel
        [startingChannel + 1]: dmxValues.color1, // Red channel
        [startingChannel + 2]: dmxValues.color2, // Green channel
        [startingChannel + 3]: dmxValues.color3, // Blue channel
        [startingChannel + 4]: dmxValues.strobe, // Strobe channel
        [startingChannel + 5]: dmxValues.other1, // Other functionality channel
        [startingChannel + 6]: dmxValues.other2, // Color selection/shade channel
      });

      res.send(`Light changed ${lightNumber} to ${color}`);
    } else {
      res.status(400).send('Invalid color');
    }
  } else {
    res.status(400).send('lightNumber and color query parameters are required');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
