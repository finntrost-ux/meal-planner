const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/generate', async (req, res) => {
  const { prompt, apiKey } = req.body;

  if (!apiKey || !apiKey.startsWith('sk-')) {
    return res.status(400).json({ error: 'A valid Claude API key is required (starts with sk-).' });
  }
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const msg = data?.error?.message || `API error ${response.status}`;
      return res.status(response.status).json({ error: msg });
    }

    res.json({ result: data.content[0].text });
  } catch (err) {
    res.status(500).json({ error: `Server error: ${err.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`\n🥗 Meal Planner running at http://localhost:${PORT}\n`);
});
