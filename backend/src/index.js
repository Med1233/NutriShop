const app = require('./app');
const { initDb } = require('./db');

const PORT = 4000;

app.listen(PORT, async () => {
  console.log(`Backend listening on port ${PORT}`);
  try {
    await initDb();
    console.log('Database initialized');
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }
});
