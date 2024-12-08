// src/components/DonorsTable.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';

const baseUrl = process.env.REACT_APP_BASE_API_URL;

const Donors = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const response = await axios.get(`${baseUrl}donors/`);
        setDonors(response.data);
      } catch (error) {
        console.error('Error fetching donors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonors();
  }, []);

  const handleEdit = (row) => {
    setEditing(row.id);
    setFormData({ name: row.name, email: row.email, phone: row.phone, address: row.address });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${baseUrl}donors/${id}/`);
      setDonors(donors.filter(donor => donor.id !== id));
    } catch (error) {
      console.error('Error deleting donor:', error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const response = await axios.put(`${baseUrl}donors/${editing}/`, formData);
        setDonors(donors.map(donor => (donor.id === editing ? response.data : donor)));
      } else {
        const response = await axios.post(`${baseUrl}donors/`, formData);
        setDonors([...donors, response.data]);
      }
      setEditing(null);
      setFormData({ name: '', email: '', phone: '', address: '' });
    } catch (error) {
      console.error('Error saving donor:', error);
    }
  };


  const columns = [
    { name: 'ID', selector: row => row.id, sortable: true },
    { name: 'Name', selector: row => row.name, sortable: true },
    { name: 'Email', selector: row => row.email, sortable: true },
    { name: 'Phone', selector: row => row.phone, sortable: true },
    { name: 'Address', selector: row => row.address, sortable: true },
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
      {(editing !== null || editing === null) && (
        <div>
          <h3>{editing ? 'Edit Donor' : 'Add New Donor'}</h3>
          <form onSubmit={handleSave}>
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <input
              type="text"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <input
              type="text"
              placeholder="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <button type="submit">{editing ? 'Save' : 'Add'}</button>
            <button type="button" onClick={() => setEditing(null)}>Cancel</button>
          </form>
        </div>
      )}
      <DataTable
        title="Donors"
        columns={columns}
        data={donors}
        progressPending={loading}
      />
    </div>
  );
};

export default Donors;