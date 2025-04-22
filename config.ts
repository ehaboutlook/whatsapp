require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  DATABASE_URI: process.env.DATABASE_URI || '',
  MISTRAL_API_KEY: process.env.MISTRAL_API_KEY || '',
  MISTRAL_AGENT_ID: process.env.MISTRAL_AGENT_ID || ''
};
