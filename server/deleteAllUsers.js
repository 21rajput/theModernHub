const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const userModel = require('./models/users');

const MONGO_URL = process.env.MONGO_URL || process.env.DATABASE || process.env.MONGODB_URI;

if (!MONGO_URL) {
  console.error('MongoDB connection string not found in .env');
  process.exit(1);
}

mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    const result = await userModel.deleteMany({});
    console.log(`Deleted ${result.deletedCount} users.`);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }); 