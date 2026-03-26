const express = require('express');
const cors = require('cors');
const { Vendor, Customer, Service, Invoice, initDb } = require('./db');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

initDb();

// Master Data Routes
app.get('/api/vendors', async (req, res) => res.json(await Vendor.findAll()));
app.post('/api/vendors', async (req, res) => res.json(await Vendor.create(req.body)));
app.get('/api/customers', async (req, res) => res.json(await Customer.findAll()));
app.post('/api/customers', async (req, res) => res.json(await Customer.create(req.body)));

// Service Routes with Unique W-Code Logic
app.post('/api/services', async (req, res) => {
  try {
    const { description, hours, rate, customerId, vendorId } = req.body;
    
    // Calculate the next W-Code
    const count = await Service.count({ paranoid: false }); // count even deleted if using soft-delete
    const nextNum = count + 1;
    
    // Formatting: W0001, W0045, or W10000+
    const code = nextNum <= 9999 
      ? `W${nextNum.toString().padStart(4, '0')}` 
      : `W${nextNum}`;

    const service = await Service.create({
      workOrderCode: code,
      description,
      hours,
      rate,
      total: parseFloat(hours) * parseFloat(rate),
      CustomerId: customerId,
      VendorId: vendorId
    });
    
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/services', async (req, res) => {
  res.json(await Service.findAll({ include: [Vendor, Customer] }));
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (service) await service.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Invoice Routes
app.post('/api/invoices', async (req, res) => {
  try {
    const { customerId } = req.body;
    const pending = await Service.findAll({ where: { CustomerId: customerId, status: 'pending' } });
    if (pending.length === 0) return res.status(400).json({ error: "No pending work" });

    const total = pending.reduce((sum, s) => sum + parseFloat(s.total), 0);
    const invoice = await Invoice.create({
      invoiceNumber: `INV-${Date.now()}`,
      total: total,
      CustomerId: customerId
    });

    for (let s of pending) {
      s.status = 'invoiced';
      s.InvoiceId = invoice.id;
      await s.save();
    }
    res.json(invoice);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));