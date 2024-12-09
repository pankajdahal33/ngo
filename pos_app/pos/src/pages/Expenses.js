// src/components/Expenses.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const baseUrl = process.env.REACT_APP_BASE_API_URL;

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    date: "",
    description: "",
    reversed: false,
    bill: null, // For storing file
    program: "",
  });
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await axios.get(`${baseUrl}expenses/`);
        setExpenses(response.data);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPrograms = async () => {
      try {
        const response = await axios.get(`${baseUrl}programs/`);
        setPrograms(response.data);
      } catch (error) {
        console.error("Error fetching programs:", error);
      }
    };

    fetchExpenses();
    fetchPrograms();
  }, []);

  const handleEdit = (row) => {
    setEditing(row.id);
    setFormData({
      title: row.title,
      amount: row.amount,
      date: row.date,
      description: row.description,
      reversed: row.reversed,
      bill: null, // Reset file on edit
      program: row.program.id,
    });
  };

  const handleDelete = async (id) => {
    // confirm before deleting
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    try {
      await axios.delete(`${baseUrl}expenses/${id}/`);
      setExpenses(expenses.filter((expense) => expense.id !== id));
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Log the current form data for debugging purposes
    console.log("FormData before sending:", formData);

    // Validate that the necessary fields are populated
    if (!formData.title || !formData.amount || !formData.date || !formData.program) {
      alert("Please fill in all required fields.");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("amount", formData.amount);
    data.append("date", formData.date);
    data.append("description", formData.description || ""); // Optional field
    data.append("reversed", formData.reversed);
    data.append("program", formData.program);

    // Only append bill if a file is selected
    if (formData.bill) {
      data.append("bill", formData.bill);
    } else {
      console.log("No bill file provided.");
    }

    try {
      let response;
      if (editing) {
        // Update existing expense
        response = await axios.put(`${baseUrl}expenses/${editing}/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setExpenses(
          expenses.map((expense) =>
            expense.id === editing ? response.data : expense
          )
        );
      } else {
        // Create new expense
        response = await axios.post(`${baseUrl}expenses/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setExpenses([...expenses, response.data]);
      }
      alert("Expense saved successfully!");
      // Reset the form
      setEditing(null);
      setFormData({
        title: "",
        amount: "",
        date: "",
        description: "",
        reversed: false,
        bill: null,
        program: "",
      });
    } catch (error) {
      console.error("Error saving expense:", error.response.data);
      alert("There was an error saving the expense. Please try again.");
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

  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.title.toLowerCase().includes(filterText.toLowerCase())
  );

  const columns = [
    { name: "Title", selector: (row) => row.title, sortable: true },
    { name: "Amount", selector: (row) => 'Rs. ' + row.amount + ' /-', sortable: true },
    { name: "Date", selector: (row) => row.date, sortable: true },
    { name: "Description", selector: (row) => row.description, sortable: true },
    { name: "Reversed", selector: (row) => (row.reversed ? "Yes" : "No"), sortable: true },
    { name: "Program", selector: (row) => row.program.name, sortable: true },
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
            onClick={() => generateReport(row.program)}
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
              {editing ? "Edit Expense" : "Add New Expense"}
            </h3>
            <form onSubmit={handleSave}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
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
                  <label className="form-label">Program</label>
                  <select
                    className="form-select"
                    value={formData.program}
                    onChange={(e) =>
                      setFormData({ ...formData, program: e.target.value })
                    }
                  >
                    <option value="">Select Program</option>
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.name}
                      </option>
                    ))}
                  </select>
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
                  <label className="form-label">Reversed</label>
                  <select
                    className="form-select"
                    value={formData.reversed}
                    onChange={(e) =>
                      setFormData({ ...formData, reversed: e.target.value })
                    }
                  >
                    <option value={false}>No</option>
                    <option value={true}>Yes</option>
                  </select>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  {/* Field for bill file upload */}
                  <label className="form-label">Upload Bill</label>
                  <input
                    type="file"
                    className="form-control"
                    accept=".pdf,.jpg,.jpeg,.png,.heic"
                    onChange={(e) =>
                      setFormData({ ...formData, bill: e.target.files[0] })
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
          placeholder="Search by Expense Title"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>
      <DataTable
        title="Expenses List"
        columns={columns}
        data={filteredExpenses}
        progressPending={loading}
      />
    </div>
  );
};

export default Expenses;