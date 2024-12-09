// src/components/Donations.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";

const baseUrl = process.env.REACT_APP_BASE_API_URL;

const Donations = () => {
  const [donations, setDonations] = useState([]);
  const [donors, setDonors] = useState([]);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    donor: "",
    amount: "",
    date: "",
    method: "",
    description: "",
    voucher: null, // For storing file
  });
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await axios.get(`${baseUrl}donations/`);
        setDonations(response.data);
      } catch (error) {
        console.error("Error fetching donations:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchDonors = async () => {
      try {
        const response = await axios.get(`${baseUrl}donors/`);
        setDonors(response.data);
      } catch (error) {
        console.error("Error fetching donors:", error);
      }
    };

    const fetchOrganization = async () => {
      try {
        const response = await axios.get(`${baseUrl}organizations/`);
        setOrganization(response.data[0]);
      } catch (error) {
        console.error("Error fetching organization details:", error);
      }
    };

    fetchDonations();
    fetchDonors();
    fetchOrganization();
  }, []);

  const handleEdit = (row) => {
    setEditing(row.id);
    setFormData({
      donor: row.donor.id,
      amount: row.amount,
      date: row.date,
      method: row.method,
      description: row.description,
      voucher: null, // Reset file on edit
    });
    
  };

  const handleView = (row) => {
    const printWindow = window.open("", "", "width=210mm,height=297mm");

    // HTML content structure for the receipt using a table layout with A4 portrait size
    printWindow.document.write("<html><head><title>Donation Receipt</title>");

    printWindow.document.write(`
      <style>
        /* Set the page size to A4 portrait */
        @page {
          size: A4 portrait;
          margin: 05mm;
        }

        body {
          font-family: 'Courier New', monospace;
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
        }

        .receipt-container {
          width: 100%;
          padding: 20px;
          box-sizing: border-box;
        }

        /* Table Styling */
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }

        th, td {
          border: 1px solid #000;
          padding: 8px;
          text-align: left;
          font-size: 14px;
        }

        th {
          font-weight: bold;
          background-color: #f2f2f2;
        }

        .total-amount {
          text-align: right;
          font-weight: bold;
          padding-top: 20px;
        }

        .footer {
          text-align: center;
          font-size: 10px;
          margin-top: 30px;
          padding-top: 10px;
          border-top: 1px solid #000;
        }

        /* Header for the receipt */
        .receipt-header {
          text-align: center;
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 20px;
        }
      </style>
    `);

    // Writing content to the print window with a table structure
    printWindow.document.write("</head><body>");
    printWindow.document.write(`
      <div class="receipt-container">
        <!-- Header for the receipt -->
        <div class="receipt-header">
          <h3>Donation Receipt</h3>
          ${organization ? organization.name : "Organization Name"}<br>
          ${organization ? organization.address : "Organization Address"}<br>
          ${organization ? organization.email : "Organization Email"}<br>
          ${organization ? organization.phone : "Organization Phone"}
          ${organization ? organization.pan_no : "Organization Pan Number"}


        </div>
        <div class="row">
          <div class="col-md-4">
            <img src="${organization ? organization.logo : ''}" alt="Organization Logo" style="width: 150px; height: 150px;">
          </div>
          <div class="col-md-8">
          <p></p><strong>Donor Name:</strong> ${row.donor.name}</p>
          <p></p><strong>Donor Address:</strong> ${row.donor.address}</p>
          <p></p><strong>Donor PAN No:</strong> ${row.donor.pan_no}</p>
          <p></p><strong>Donor Email:</strong> ${row.donor.email}</p>

            <p><strong>Receipt Number:</strong> ${row.receipt_number}</p>
            <p><strong>Donation Date:</strong> ${row.date}</p>

        </div>

        <!-- Donation details in a table -->
        <table>
          <tr>
            <th>Amount</th>
            <td>Rs. ${row.amount} /-</td>
          </tr>
          <tr>
            <th>Date</th>
            <td>${new Date(row.date).toLocaleDateString()}</td>
          </tr>
          <tr>
            <th>Method</th>
            <td>${row.method}</td>
          </tr>
          <tr>
            <th>Description</th>
            <td>${row.description}</td>
          </tr>
        </table>

        <!-- Total Amount Section -->
        <div class="total-amount">
          <p><strong>Total: </strong>Rs. ${row.amount} /-</p>
        </div>

        <!-- Footer Section -->
        <div class="footer">
          <p>Thank you for your donation!</p>
          <p>For more information, visit our website.</p>
        </div>
      </div>
    `);

    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // const getDonorNameById = (id) => {
  //   const donor = donors.find((donor) => donor.id === id);
  //   return donor ? donor.name : "Unknown";
  // };

  const handleDelete = async (id) => {
    // confirm before deleting
    if (!window.confirm("Are you sure you want to delete this donation?")) {
      return;
    }

    try {
      await axios.delete(`${baseUrl}donations/${id}/`);
      setDonations(donations.filter((donation) => donation.id !== id));
    } catch (error) {
      console.error("Error deleting donation:", error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Log the current form data for debugging purposes
    console.log("FormData before sending:", formData);

    // Validate that the necessary fields are populated
    if (!formData.donor || !formData.amount || !formData.date || !formData.method) {
      alert("Please fill in all required fields.");
      return;
    }

    const data = new FormData();
    data.append("donor", formData.donor);
    data.append("amount", formData.amount);
    data.append("date", formData.date);
    data.append("method", formData.method);
    data.append("description", formData.description || ""); // Optional field

    // Only append voucher if a file is selected
    if (formData.voucher) {
      data.append("voucher", formData.voucher);
    } else {
      console.log("No voucher image provided.");
    }

    try {
      let response;
      if (editing) {
        // Update existing donation
        response = await axios.put(`${baseUrl}donations/${editing}/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setDonations(
          donations.map((donation) =>
            donation.id === editing ? response.data : donation
          )
        );



      } else {
        // Create new donation
        response = await axios.post(`${baseUrl}donations/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setDonations([...donations, response.data]);
      }
      alert("Donation saved successfully!");
      // Reset the form
      setEditing(null);
      setFormData({
        donor: "",
        amount: "",
        date: "",
        method: "",
        description: "",
        voucher: null,
      });
      window.location.reload();
    } catch (error) {
      console.error("Error saving donation:", error.response.data);
      alert("There was an error saving the donation. Please try again.");
    }
  };

  // const filteredDonations = donations.filter(
  //   (donation) =>
  //     donation.donor &&
  //     getDonorNameById(donation.donor)
  //       .toLowerCase()
  //       .includes(filterText.toLowerCase())
  // );
  const filteredDonations = donations.filter(
    (donation) =>
      donation.donor &&
      donation.donor.name.toLowerCase().includes(filterText.toLowerCase())
  );

  const columns = [
    {
      name: "Donor",
      selector: (row) => row.donor.name,
      sortable: true,
    },
    { name: "Amount", selector: (row) => 'Rs. ' + row.amount + ' /-', sortable: true },
    { name: "Date", selector: (row) => row.date, sortable: true },
    { name: "Method", selector: (row) => row.method, sortable: true },
    {
      name: "Receipt Number",
      selector: (row) => row.receipt_number,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div>
          <button
            className="btn btn-sm btn-primary me-2"
            onClick={() => handleView(row)}
          >
            View
          </button>
          <button
            className="btn btn-sm btn-primary me-2"
            onClick={() => handleEdit(row)}
          >
            Edit
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => handleDelete(row.id)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mt-4">
      {(editing !== null || editing === null) && (
        <div className="card mb-4">
          <div className="card-body">
            <h3 className="card-title">
              {editing ? "Edit Donation" : "Add New Donation"}
            </h3>
            <form onSubmit={handleSave}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Donor</label>
                  <select
                    className="form-select"
                    value={formData.donor}
                    onChange={(e) =>
                      setFormData({ ...formData, donor: e.target.value })
                    }
                  >
                    <option value="">Select Donor</option>
                    {donors.map((donor) => (
                      <option key={donor.id} value={donor.id}>
                        {donor.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Amount"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    placeholder="Date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Method</label>
                  <select
                    className="form-select"
                    value={formData.method}
                    onChange={(e) =>
                      setFormData({ ...formData, method: e.target.value })
                    }
                  >
                    <option value="">Select Method</option>
                    <option value="Online">Online</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div className="col-md-6"></div>
              <div className="mb-3"></div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-6">
                  {/* Field for voucher image upload */}
                  <label className="form-label">Upload Voucher</label>
                  <input
                    type="file"
                    className="form-control"
                    accept=".pdf,.jpg,.jpeg,.png,.heic"
                    onChange={(e) =>
                      setFormData({ ...formData, voucher: e.target.files[0] })
                    }
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary me-2">
                {editing ? "Save" : "Add"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
      <div className="mb-3">
      <input
          type="text"
          className="form-control"
          placeholder="Search by Donor Name"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>
      <DataTable
        title="Donations List"
        columns={columns}
        data={filteredDonations}
        progressPending={loading}
      />
    </div>
  );
};

export default Donations;