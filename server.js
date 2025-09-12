import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/api/key', (req, res) => {
  if (process.env.VITE_GEMINI_API_KEY) {
    res.json({ apiKey: process.env.VITE_GEMINI_API_KEY });
  } else {
    res.status(500).json({ error: 'API key not configured on the server.' });
  }
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});