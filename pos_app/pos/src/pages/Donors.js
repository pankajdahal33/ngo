import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import 'bootstrap/dist/css/bootstrap.min.css';

const baseUrl = process.env.REACT_APP_BASE_API_URL;

const Donors = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // Keeps track of whether we are editing a donor
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    pan_no: '',
    donor_type: 'Individual',
  });
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
    setFormData({
      name: row.name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      pan_no: row.pan_no,
      donor_type: row.donor_type,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this donor?')) {
      return;
    }
    try {
      await axios.delete(`${baseUrl}donors/${id}/`);
      setDonors(donors.filter((donor) => donor.id !== id));
    } catch (error) {
      console.error('Error deleting donor:', error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editing) {
        response = await axios.put(`${baseUrl}donors/${editing}/`, formData);
        setDonors(
          donors.map((donor) => (donor.id === editing ? response.data : donor))
        );
      } else {
        response = await axios.post(`${baseUrl}donors/`, formData);
        setDonors([...donors, response.data]);
      }
      setEditing(null); // Reset editing mode after save
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        pan_no: '',
        donor_type: 'Individual',
      });
    } catch (error) {
      console.error('Error saving donor:', error);
    }
  };

  const filteredDonors = donors.filter(
    (donor) =>
      (donor.name && donor.name.toLowerCase().includes(filterText.toLowerCase())) ||
      (donor.email && donor.email.toLowerCase().includes(filterText.toLowerCase())) ||
      (donor.phone && donor.phone.toLowerCase().includes(filterText.toLowerCase())) ||
      (donor.address && donor.address.toLowerCase().includes(filterText.toLowerCase())) ||
      (donor.pan_no && donor.pan_no.toLowerCase().includes(filterText.toLowerCase()))
  );

  const columns = [
    { name: 'Name', selector: (row) => row.name, sortable: true },
    { name: 'Email', selector: (row) => row.email, sortable: true },
    { name: 'Phone', selector: (row) => row.phone, sortable: true },
    { name: 'Address', selector: (row) => row.address, sortable: true },
    { name: 'Pan No', selector: (row) => row.pan_no, sortable: true },
    { name: 'Donor Type', selector: (row) => row.donor_type, sortable: true },
    // total amount donated
    { name: 'Count', selector: (row) => row.donation_count, sortable: true },
    { name: 'TDA', selector: (row) =>'Rs. '+ row.total_donations, sortable: true },

    {
      name: 'Actions',
      cell: (row) => (
        <div>
      
          
          <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(row)}>
            🖋️
          </button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(row.id)}>
            🗑️
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mt-4">
      {/* Add New Donor Button */}
      {/* <button className="btn btn-success mb-3" onClick={() => setEditing(null)}>
        Add New Donor
      </button> */}

      {/* Form for Add/Edit Donor */}
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
                <div className="col-md-4">
                  <label className="form-label">Donor Type</label>
                  <select
                    className="form-control"
                    value={formData.donor_type}
                    onChange={(e) => setFormData({ ...formData, donor_type: e.target.value })}
                  >
                    <option value="Individual">Individual</option>
                    <option value="Corporate">Corporate</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary me-2">
                {editing ? 'Save' : 'Add'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Data Table with Donors */}
      <div className="card">
        <div className="card-body">
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Search..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
          <DataTable
            title="Donors List"
            columns={columns}
            data={filteredDonors}
            progressPending={loading}
            pagination
            highlightOnHover
            striped
            responsive
          />
        </div>
      </div>
    </div>
  );
};

export default Donors;
