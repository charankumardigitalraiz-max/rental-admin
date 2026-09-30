const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/carrental';

const adminSchema = new mongoose.Schema({
  name: String,
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  role: String,
  password: String,
  status: Boolean,
}, { timestamps: true });

const customerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  custId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String },
  status: { type: Boolean, default: true },
}, { timestamps: true });

const driverSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String },
  driverId: { type: String, required: true, unique: true },
  licenseNumber: { type: String, required: true, unique: true },
  status: { type: Boolean, default: true },
}, { timestamps: true });

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);
const Driver = mongoose.models.Driver || mongoose.model('Driver', driverSchema);

async function seedDatabase() {
  try {
    console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully.');

    // 1. Seed Admin User
    const adminEmail = 'admin@drivepulse.com';
    const existingAdmin = await Admin.findOne({ email: adminEmail });

    const hashedPassword = bcrypt.hashSync('123456', 10);

    if (existingAdmin) {
      existingAdmin.password = hashedPassword;
      existingAdmin.status = true;
      await existingAdmin.save();
      console.log(`[Admin Updated]: ${adminEmail} (password: admin123)`);
    } else {
      await Admin.create({
        name: 'Super Admin',
        username: 'admin',
        email: adminEmail,
        role: 'Super Admin',
        password: hashedPassword,
        status: true,
      });
      console.log(`[Admin Created]: ${adminEmail} (password: admin123)`);
    }

    // 2. Seed Customer
    const customerPhone = '9876543210';
    const existingCustomer = await Customer.findOne({ phone: customerPhone });
    if (!existingCustomer) {
      await Customer.create({
        firstName: 'John',
        lastName: 'Doe',
        custId: 'CUST-001',
        email: 'john.doe@example.com',
        phone: customerPhone,
        address: '123 Main St, City',
        status: true,
      });
      console.log(`[Customer Created]: John Doe (${customerPhone})`);
    } else {
      console.log(`[Customer Exists]: John Doe (${customerPhone})`);
    }

    // 3. Seed Driver
    const driverPhone = '5551234567';
    const existingDriver = await Driver.findOne({ phone: driverPhone });
    if (!existingDriver) {
      await Driver.create({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: driverPhone,
        address: '456 Auto Drive, City',
        driverId: 'DRV-001',
        licenseNumber: 'DL-987654321',
        status: true,
      });
      console.log(`[Driver Created]: Jane Smith (${driverPhone})`);
    } else {
      console.log(`[Driver Exists]: Jane Smith (${driverPhone})`);
    }

    console.log('\nSeed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
