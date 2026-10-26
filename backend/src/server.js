require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`StackPrep API running on http://localhost:${PORT}`);
      // Shows at a glance whether password reset emails can be sent (never prints key values).
      console.log(require('./utils/mailer').describeMailConfig());
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
