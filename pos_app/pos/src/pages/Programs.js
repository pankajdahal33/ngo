// src/components/Programs.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const baseUrl = process.env.REACT_APP_BASE_API_URL;

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    total_budget: "",
    aggrement: null, // For storing file
  });
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await axios.get(`${baseUrl}programs/`);
        setPrograms(response.data);
      } catch (error) {
        console.error("Error fetching programs:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchExpenses = async () => {
      try {
        const response = await axios.get(`${baseUrl}expenses/`);
        setExpenses(response.data);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };

    fetchPrograms();
    fetchExpenses();
  }, []);

  const handleEdit = (row) => {
    setEditing(row.id);
    setFormData({
      name: row.name,
      description: row.description,
      start_date: row.start_date,
      end_date: row.end_date,
      total_budget: row.total_budget,
      aggrement: null, // Reset file on edit
    });
  };

  const handleDelete = async (id) => {
    // confirm before deleting
    if (!window.confirm("Are you sure you want to delete this program?")) {
      return;
    }

    try {
      await axios.delete(`${baseUrl}programs/${id}/`);
      setPrograms(programs.filter((program) => program.id !== id));
    } catch (error) {
      console.error("Error deleting program:", error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Log the current form data for debugging purposes
    console.log("FormData before sending:", formData);

    // Validate that the necessary fields are populated
    if (!formData.name || !formData.start_date || !formData.end_date || !formData.total_budget) {
      alert("Please fill in all required fields.");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("start_date", formData.start_date);
    data.append("end_date", formData.end_date);
    data.append("total_budget", formData.total_budget);

    // Only append aggrement if a file is selected
    if (formData.aggrement) {
      data.append("aggrement", formData.aggrement);
    } else {
      console.log("No aggrement file provided.");
    }

    try {
      let response;
      if (editing) {
        // Update existing program
        response = await axios.put(`${baseUrl}programs/${editing}/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setPrograms(
          programs.map((program) =>
            program.id === editing ? response.data : program
          )
        );
      } else {
        // Create new program
        response = await axios.post(`${baseUrl}programs/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setPrograms([...programs, response.data]);
      }
      alert("Program saved successfully!");
      // Reset the form
      setEditing(null);
      setFormData({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        total_budget: "",
        aggrement: null,
      });
    } catch (error) {
      console.error("Error saving program:", error.response.data);
      alert("There was an error saving the program. Please try again.");
    }
  };

  const generateReport = (program) => {
    const programExpenses = expenses.filter(expense => expense.program.id === program.id);
    const totalExpenses = programExpenses.reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);

    const reportContent = `
      <div class="container">
        <h2 class="text-center mb-4">Program Report: ${program.name}</h2>
        <div class="row">
          <div class="col-md-6">
            <p><strong>Total Budget:</strong> Rs. ${program.total_budget}</p>
            <p><strong>Start Date:</strong> ${program.start_date}</p>
            <p><strong>End Date:</strong> ${program.end_date}</p>
            <p><strong>Project Status:</strong> ${new Date(program.end_date) < new Date() ? 'Completed' : 'Ongoing'}</p>
            <p><strong>Total Expenses:</strong> Rs. ${totalExpenses.toFixed(2)}</p>
          </div>
        </div>
        <h3 class="mt-4">Expenses</h3>
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>Title</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            ${programExpenses.map(expense => `
              <tr>
                <td>${expense.title}</td>
                <td>Rs. ${expense.amount}</td>
                <td>${expense.date}</td>
                <td>${expense.description}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    const doc = new jsPDF();
    const reportElement = document.createElement('div');
    reportElement.innerHTML = reportContent;
    document.body.appendChild(reportElement);

    html2canvas(reportElement).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 10, 10, 190, 0);
      doc.save(`${program.name}_report.pdf`);
      document.body.removeChild(reportElement);
    });
  };

  const filteredPrograms = programs.filter(
    (program) =>
      program.name.toLowerCase().includes(filterText.toLowerCase())
  );

  const columns = [
    { name: "Name", selector: (row) => row.name, sortable: true },
    { name: "Description", selector: (row) => row.description, sortable: true },
    { name: "Start Date", selector: (row) => row.start_date, sortable: true },
    { name: "End Date", selector: (row) => row.end_date, sortable: true },
    { name: "Total Budget", selector: (row) => 'Rs. ' + row.total_budget + ' /-', sortable: true },
    {
      name: "Actions",
      cell: (row) => (
        <div>
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
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => generateReport(row)}
          >
            📄
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
              {editing ? "Edit Program" : "Add New Program"}
            </h3>
            <form onSubmit={handleSave}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Total Budget</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Total Budget"
                    value={formData.total_budget}
                    onChange={(e) =>
                      setFormData({ ...formData, total_budget: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    placeholder="Start Date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    placeholder="End Date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                  />
                </div>
              </div>

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
                  {/* Field for aggrement file upload */}
                  <label className="form-label">Upload Aggrement</label>
                  <input
                    type="file"
                    className="form-control"
                    accept=".pdf,.jpg,.jpeg,.png,.heic"
                    onChange={(e) =>
                      setFormData({ ...formData, aggrement: e.target.files[0] })
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
          placeholder="Search by Program Name"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>
      <DataTable
        title="Programs List"
        columns={columns}
        data={filteredPrograms}
        progressPending={loading}
      />
    </div>
  );
};

export default Programs;