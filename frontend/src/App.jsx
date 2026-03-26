import { useEffect, useState } from 'react';
import axios from 'axios';

// UPDATE THIS TO YOUR PORT 5000 URL
const API_URL = "https://fuzzy-fishstick-g4g69wvw6x6xf94p-5000.app.github.dev";

function App() {
  const [vendors, setVendors] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  
  const [newVendorName, setNewVendorName] = useState("");
  const [newCustName, setNewCustName] = useState("");
  const [desc, setDesc] = useState("");
  const [hours, setHours] = useState(0);
  const [rate, setRate] = useState(0);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedCust, setSelectedCust] = useState("");

  const fetchData = async () => {
    try {
      const [v, c, s] = await Promise.all([
        axios.get(`${API_URL}/api/vendors`),
        axios.get(`${API_URL}/api/customers`),
        axios.get(`${API_URL}/api/services`)
      ]);
      setVendors(v.data); setCustomers(c.data); setServices(s.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, []);

  const addService = async (e) => {
    e.preventDefault();
    await axios.post(`${API_URL}/api/services`, {
      description: desc, hours, rate, vendorId: selectedVendor, customerId: selectedCust
    });
    setDesc(""); fetchData();
  };

  const deleteService = async (id, code) => {
    if (window.confirm(`Are you sure you want to delete Work Order ${code}?`)) {
      await axios.delete(`${API_URL}/api/services/${id}`);
      fetchData();
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>VIMS: Service Tracker</h1>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', background: '#eee', padding: '15px' }}>
        <input value={newVendorName} onChange={e => setNewVendorName(e.target.value)} placeholder="Vendor Name" />
        <button onClick={async () => { await axios.post(`${API_URL}/api/vendors`, {name: newVendorName}); setNewVendorName(""); fetchData(); }}>Add Vendor</button>
        <input value={newCustName} onChange={e => setNewCustName(e.target.value)} placeholder="Customer Name" />
        <button onClick={async () => { await axios.post(`${API_URL}/api/customers`, {name: newCustName}); setNewCustName(""); fetchData(); }}>Add Customer</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        <section style={{ border: '1px solid #ccc', padding: '15px' }}>
          <h3>New Work Order</h3>
          <form onSubmit={addService} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <select onChange={e => setSelectedVendor(e.target.value)} required>
              <option value="">Select Vendor</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
            <select onChange={e => setSelectedCust(e.target.value)} required>
              <option value="">Select Customer</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" required />
            <input type="number" placeholder="Hours" onChange={e => setHours(e.target.value)} />
            <input type="number" placeholder="Rate" onChange={e => setRate(e.target.value)} />
            <button type="submit" style={{ background: '#28a745', color: 'white', border: 'none', padding: '10px' }}>Save Order</button>
          </form>
        </section>

        <section>
          <h3>Service History</h3>
          <table width="100%" border="1" style={{ borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8f9fa' }}>
              <tr>
                <th>ID #</th>
                <th>Vendor</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 'bold', padding: '8px' }}>{s.workOrderCode}</td>
                  <td>{s.Vendor?.name}</td>
                  <td>{s.Customer?.name}</td>
                  <td>${s.total}</td>
                  <td>{s.status}</td>
                  <td>
                    <button onClick={() => deleteService(s.id, s.workOrderCode)} style={{ color: 'red' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

export default App;