// src/components/SettingsTable.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';

const baseUrl = process.env.REACT_APP_BASE_API_URL;

const SettingsTable = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${baseUrl}organizations/`);
        setSettings(response.data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleEdit = (row) => {
    setEditing(row.id);
    setFormData({ name: row.name, email: row.email, phone: row.phone, address: row.address });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${baseUrl}organizations/${id}/`);
      setSettings(settings.filter(setting => setting.id !== id));
    } catch (error) {
      console.error('Error deleting setting:', error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(`${baseUrl}organizations/${editing}/`, formData);
      setSettings(settings.map(setting => (setting.id === editing ? response.data : setting)));
      setEditing(null);
      setFormData({ name: '', email: '', phone: '', address: '' });
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const columns = [
    { name: 'Logo', selector: row => <img src={row.logo} alt={row.name} style={{ width: '50px' }} />, sortable: true },
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
      {editing && (
        <div>
          <h3>Edit Organization</h3>
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
            <button type="button" onClick={handleSave}>Save</button>
            <button type="button" onClick={() => setEditing(null)}>Cancel</button>
          </form>
        </div>
      )}
      <DataTable
        title="Settings"
        columns={columns}
        data={settings}
        progressPending={loading}
      />
    </div>
  );
};

export default SettingsTable;