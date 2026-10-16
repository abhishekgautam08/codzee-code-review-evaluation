require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`TaskFlow API server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
});
