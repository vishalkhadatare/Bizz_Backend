const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

// Path to JSON file
const DATA_FILE = path.join(__dirname, 'topics.json');

// Function to load topics.json
async function loadTopics() {
  const raw = await fs.readFile(DATA_FILE, 'utf8');
  const data = JSON.parse(raw);

  if (!Array.isArray(data)) {
    throw new Error("topics.json must contain an array");
  }

  return data;
}

// Default route
app.get('/', (req, res) => {
  res.send("Express server working!");
});

// API endpoint: GET /api/topics?search=query&sort=name
app.get('/api/topics', async (req, res, next) => {
  try {
    const { search, sort } = req.query;

    // Validate search parameter
    if (Object.prototype.hasOwnProperty.call(req.query, 'search')) {
      if (!search || search.trim() === '') {
        return res.status(400).json({ error: "Invalid search query" });
      }
    }

    let topics = await loadTopics();

    // Filter by search
    if (search) {
      const q = search.toLowerCase();
      topics = topics.filter(t => t.name.toLowerCase().includes(q));
    }

    // Sort ascending by name
    if (sort === 'name') {
      topics.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Return required fields only
    const result = topics.map(t => ({
      id: t.id,
      name: t.name,
      category: t.category
    }));

    res.status(200).json(result);

  } catch (err) {
    next(err); // send to error handler
  }
});

// Global Error Handler (500)
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
