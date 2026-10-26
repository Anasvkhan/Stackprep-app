require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`StackPrep API running on http://localhost:${PORT}`);
      // Names only, never the values: shows at a glance whether password reset emails can be sent.
      const mailVars = ['MAILJET_API_KEY', 'MAILJET_SECRET_KEY', 'MAIL_FROM_EMAIL'];
      const missing = mailVars.filter((k) => !process.env[k]);
      console.log(missing.length ? `[mail] NOT configured, missing: ${missing.join(', ')}` : `[mail] Mailjet configured, sender ${process.env.MAIL_FROM_EMAIL}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
