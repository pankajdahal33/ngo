// src/components/Donations.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';

const baseUrl = process.env.REACT_APP_BASE_API_URL;

const Donations = () => {
  const [donations, setDonations] = useState([]);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ donor: '', amount: '', date: '', method: '', description: '' });

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await axios.get(`${baseUrl}donations/`);
        console.log('Fetched donations:', response.data);
        setDonations(response.data);
      } catch (error) {
        console.error('Error fetching donations:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchDonors = async () => {
      try {
        const response = await axios.get(`${baseUrl}donors/`);
        setDonors(response.data);
      } catch (error) {
        console.error('Error fetching donors:', error);
      }
    };

    fetchDonations();
    fetchDonors();
  }, []);

  const handleEdit = (row) => {
    setEditing(row.id);
    setFormData({ donor: row.donor.id, amount: row.amount, date: row.date, method: row.method, description: row.description });
  };
  const getDonorNameById = (id) => {
  const donor = donors.find(donor => donor.id === id);
  return donor ? donor.name : 'Unknown';
};
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${baseUrl}donations/${id}/`);
      setDonations(donations.filter(donation => donation.id !== id));
    } catch (error) {
      console.error('Error deleting donation:', error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const response = await axios.put(`${baseUrl}donations/${editing}/`, formData);
        setDonations(donations.map(donation => (donation.id === editing ? response.data : donation)));
      } else {
        const response = await axios.post(`${baseUrl}donations/`, formData);
        setDonations([...donations, response.data]);
      }
      setEditing(null);
      setFormData({ donor: '', amount: '', date: '', method: '', description: '' });
    } catch (error) {
      console.error('Error saving donation:', error);
    }
  };

  const handleAddNew = () => {
    setEditing(null);
    setFormData({ donor: '', amount: '', date: '', method: '', description: '' });
  };

const columns = [
    { name: 'ID', selector: row => row.id, sortable: true },
    { name: 'Donor', selector: row => getDonorNameById(row.donor), sortable: true },
    { name: 'Amount', selector: row => row.amount, sortable: true },
    { name: 'Date', selector: row => row.date, sortable: true },
    { name: 'Method', selector: row => row.method, sortable: true },
    { name: 'Receipt Generated', selector: row => row.receipt_generated ? 'Yes' : 'No', sortable: true },
    { name: 'Receipt Number', selector: row => row.receipt_number, sortable: true },
    {
        name: 'Actions',
        cell: row => (
            <div>
                <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(row)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(row.id)}>Delete</button>
            </div>
        ),
    },
];

  return (
    <div>
      <button className="btn btn-sm btn-success mb-3" onClick={handleAddNew}>Add New Donation</button>
      {(editing !== null || editing === null) && (
        <div>
          <h3>{editing ? 'Edit Donation' : 'Add New Donation'}</h3>
          <form onSubmit={handleSave}>
            <select
              value={formData.donor}
              onChange={(e) => setFormData({ ...formData, donor: e.target.value })}
            >
              <option value="">Select Donor</option>
              {donors.map(donor => (
                <option key={donor.id} value={donor.id}>{donor.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
            <input
              type="date"
              placeholder="Date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
            <select
              value={formData.method}
              onChange={(e) => setFormData({ ...formData, method: e.target.value })}
            >
              <option value="">Select Method</option>
              <option value="Online">Online</option>
              <option value="Cash">Cash</option>
            </select>
            <input
              type="text"
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <button type="submit">{editing ? 'Save' : 'Add'}</button>
            <button type="button" onClick={() => setEditing(null)}>Cancel</button>
          </form>
        </div>
      )}
      <DataTable
        title="Donations"
        columns={columns}
        data={donations}
        progressPending={loading}
      />
    </div>
  );
};

export default Donations;