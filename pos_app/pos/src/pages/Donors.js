// src/components/DonorsTable.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import 'bootstrap/dist/css/bootstrap.min.css';

const baseUrl = process.env.REACT_APP_BASE_API_URL;

const Donors = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', pan_no: '' });
  const [filterText, setFilterText] = useState('');

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
    setFormData({ name: row.name, email: row.email, phone: row.phone, address: row.address, pan_no: row.pan_no });
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
      setFormData({ name: '', email: '', phone: '', address: '', pan_no: '' });
    } catch (error) {
      console.error('Error saving donor:', error);
    }
  };

  const handleAddNew = () => {
    setEditing(null);
    setFormData({ name: '', email: '', phone: '', address: '', pan_no: '' });
  };

  const filteredDonors = donors.filter(
    donor =>
      (donor.name && donor.name.toLowerCase().includes(filterText.toLowerCase())) ||
      (donor.email && donor.email.toLowerCase().includes(filterText.toLowerCase())) ||
      (donor.phone && donor.phone.toLowerCase().includes(filterText.toLowerCase())) ||
      (donor.address && donor.address.toLowerCase().includes(filterText.toLowerCase())) ||
      (donor.pan_no && donor.pan_no.toLowerCase().includes(filterText.toLowerCase()))
  );

  const columns = [
    { name: 'ID', selector: row => row.id, sortable: true },
    { name: 'Name', selector: row => row.name, sortable: true },
    { name: 'Email', selector: row => row.email, sortable: true },
    { name: 'Phone', selector: row => row.phone, sortable: true },
    { name: 'Address', selector: row => row.address, sortable: true },
    { name: 'Pan No', selector: row => row.pan_no, sortable: true },
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
    <div className="container mt-4">
      <button className="btn btn-sm btn-success mb-3" onClick={handleAddNew}>Add New Donor</button>
      {(editing !== null || editing === null) && (
        <div className="card mb-4">
          <div className="card-body">
            <h3 className="card-title">{editing ? 'Edit Donor' : 'Add New Donor'}</h3>
            <form onSubmit={handleSave}>
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Pan No</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Pan No"
                    value={formData.pan_no}
                    onChange={(e) => setFormData({ ...formData, pan_no: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary me-2">{editing ? 'Save' : 'Add'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by Name, Email, Phone, Address, or Pan No"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>
      <DataTable
        title="Donors"
        columns={columns}
        data={filteredDonors}
        progressPending={loading}
      />
    </div>
  );
};

export default Donors;