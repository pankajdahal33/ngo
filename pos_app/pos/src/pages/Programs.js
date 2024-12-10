import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";

const baseUrl = process.env.REACT_APP_BASE_API_URL;

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
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

    fetchPrograms();
  }, []);

  const handleEdit = (row) => {
    setEditing(row.id);
    setFormData({
      name: row.name,
      description: row.description,
      is_active: row.is_active,
    });
  };

  const handleDelete = async (id) => {
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

    if (!formData.name || !formData.description) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      let response;
      if (editing) {
        response = await axios.put(`${baseUrl}programs/${editing}/`, formData);
        setPrograms(
          programs.map((program) =>
            program.id === editing ? response.data : program
          )
        );
      } else {
        response = await axios.post(`${baseUrl}programs/`, formData);
        setPrograms([...programs, response.data]);
      }
      alert("Program saved successfully!");
      setEditing(null);
      setFormData({
        name: "",
        description: "",
        is_active: true,
      });
    } catch (error) {
      console.error("Error saving program:", error.response.data);
      alert("There was an error saving the program. Please try again.");
    }
  };

  const filteredPrograms = programs.filter(
    (program) =>
      program.name.toLowerCase().includes(filterText.toLowerCase())
  );

  const columns = [
    { name: "Name", selector: (row) => row.name, sortable: true },
    { name: "Description", selector: (row) => row.description, sortable: true },
    { name: "Is Active", selector: (row) => (row.is_active ? "Yes" : "No"), sortable: true },
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
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Is Active</label>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
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