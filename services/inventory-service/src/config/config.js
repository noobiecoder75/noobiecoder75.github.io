require('dotenv').config();

const config = {
  port: process.env.PORT,
  amadeus: {
    clientId: process.env.AMADEUS_CLIENT_ID,
    clientSecret: process.env.AMADEUS_CLIENT_SECRET,
    apiUrl: process.env.AMADEUS_API_URL,
  },
  hotelbeds: {
    apiKey: process.env.HOTELBEDS_API_KEY,
    secretKey: process.env.HOTELBEDS_SECRET_KEY,
    apiUrl: process.env.HOTELBEDS_API_URL,
  },
  database: {
    url: process.env.DATABASE_URL,
  }
};

module.exports = { config }; 