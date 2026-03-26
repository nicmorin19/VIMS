const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

const Vendor = sequelize.define('Vendor', {
  name: { type: DataTypes.STRING, allowNull: false }
});

const Customer = sequelize.define('Customer', {
  name: { type: DataTypes.STRING, allowNull: false }
});

const Service = sequelize.define('Service', {
  workOrderCode: { type: DataTypes.STRING, unique: true }, // The W0001 ID
  description: { type: DataTypes.STRING, allowNull: false },
  hours: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  rate: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  status: { type: DataTypes.STRING, defaultValue: 'pending' }
});

const Invoice = sequelize.define('Invoice', {
  invoiceNumber: { type: DataTypes.STRING, unique: true },
  total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 }
});

// Associations
Vendor.hasMany(Service);
Service.belongsTo(Vendor);

Customer.hasMany(Service);
Service.belongsTo(Customer);

Customer.hasMany(Invoice);
Invoice.belongsTo(Customer);

Invoice.hasMany(Service);
Service.belongsTo(Invoice);

const initDb = async () => {
  try {
    // Set to true once if you get errors, then back to false
    await sequelize.sync({ force: false }); 
    console.log("✅ Database Ready with Work Order IDs");
  } catch (err) {
    console.error("❌ Sync Error:", err);
  }
};

module.exports = { sequelize, Vendor, Customer, Service, Invoice, initDb };