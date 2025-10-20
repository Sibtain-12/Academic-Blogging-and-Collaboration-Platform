const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@academic.com' });

    if (adminExists) {
      console.log('Admin user already exists');
      process.exit();
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@academic.com',
      password: 'Admin@123',
      role: 'admin',
    });

    console.log('Admin user created successfully');
    console.log('Email: admin@academic.com');
    console.log('Password: Admin@123');
    
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();

