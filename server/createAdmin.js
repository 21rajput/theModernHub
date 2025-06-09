const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userModel = require('./models/users');
require('dotenv').config();

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete any existing admin users
    await userModel.deleteMany({ userRole: 1 });
    console.log('Cleared existing admin users');

    // Create new admin user
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    const adminUser = new userModel({
      name: 'Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      userRole: 1
    });

    const savedAdmin = await adminUser.save();
    console.log('Admin user created:', {
      id: savedAdmin._id,
      email: savedAdmin.email,
      role: savedAdmin.userRole
    });

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin(); 