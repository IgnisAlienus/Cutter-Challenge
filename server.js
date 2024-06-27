const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files from the current directory
app.use(express.static('.'));

// Serve the bbq.html file when the root route is accessed
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'bbq.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
