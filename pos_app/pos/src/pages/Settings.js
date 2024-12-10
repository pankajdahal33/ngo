import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import 'bootstrap/dist/css/bootstrap.min.css';

const baseUrl = process.env.REACT_APP_BASE_API_URL;

const SettingsTable = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    logo: null,
    pan_no: '',
    website: '',
  });

  // Fetch settings on component mount
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

  // Handle edit
  const handleEdit = (row) => {
    setEditing(row.id);
    setFormData({
      name: row.name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      logo: row.logo || null,
      pan_no: row.pan_no,
      website: row.website,
    });
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${baseUrl}organizations/${id}/`);
      setSettings(settings.filter((setting) => setting.id !== id));
    } catch (error) {
      console.error('Error deleting setting:', error);
    }
  };

  // Handle save (Add/Edit)
  const handleSave = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('address', formData.address);
    data.append('pan_no', formData.pan_no);
    data.append('website', formData.website);

    // Only append logo if it's selected
    if (formData.logo) {
      console.log('Logo file:', formData.logo); // log the logo to check if it's valid
      data.append('logo', formData.logo);
    }

    try {
      let response;
      if (editing) {
        // PUT request to update
        response = await axios.put(`${baseUrl}organizations/${editing}/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSettings(
          settings.map((setting) => (setting.id === editing ? response.data : setting))
        );
      } else {
        // POST request to create
        response = await axios.post(`${baseUrl}organizations/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSettings([...settings, response.data]);
      }

      setEditing(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        logo: null,
        pan_no: '',
        website: '',
      });
    } catch (error) {
      console.error('Error saving setting:', error.response || error);
    }
  };

  // Table columns
  const columns = [
    {
      name: 'Logo',
      selector: (row) => (
        <img
          src={row.logo || '/default-logo.png'} // default logo if not available
          alt={row.name}
          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
        />
      ),
      sortable: true,
    },
    { name: 'ID', selector: (row) => row.id, sortable: true },
    { name: 'Name', selector: (row) => row.name, sortable: true },
    { name: 'Email', selector: (row) => row.email, sortable: true },
    { name: 'Phone', selector: (row) => row.phone, sortable: true },
    { name: 'Pan No', selector: (row) => row.pan_no, sortable: true },
    { name: 'Address', selector: (row) => row.address, sortable: true },
    {
      name: 'Actions',
      cell: (row) => (
        <div>
          <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(row)}>
            Edit
          </button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(row.id)}>
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mt-5">
      <h3 className="mb-4">Organizations</h3>

      {/* Add/Edit Form */}
      {(editing !== null || editing === null) && (
        <div className="card mb-4 shadow-sm">
          <div className="card-body">
            <h4 className="card-title text-center mb-4">
              {editing ? 'Edit Organization' : 'Add New Organization'}
            </h4>
            <form onSubmit={handleSave} encType="multipart/form-data">
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Organization Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Phone Number"
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
                    placeholder="Enter Address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Logo</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={(e) => setFormData({ ...formData, logo: e.target.files[0] })}
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Pan No</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Pan No"
                    value={formData.pan_no}
                    onChange={(e) => setFormData({ ...formData, pan_no: e.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Website</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
              </div>
              <div className="d-flex justify-content-end">
                <button type="submit" className="btn btn-primary me-2">
                  {editing ? 'Save Changes' : 'Add Organization'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        title="Organizations List"
        columns={columns}
        data={settings}
        progressPending={loading}
        highlightOnHover
        pagination
        responsive
        striped
        customStyles={{
          headCells: {
            style: {
              fontSize: '14px',
              fontWeight: 'bold',
              backgroundColor: '#f7f7f7',
            },
          },
          cells: {
            style: {
              fontSize: '13px',
            },
          },
        }}
      />
    </div>
  );
};

export default SettingsTable;
