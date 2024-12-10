import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const baseUrl = process.env.REACT_APP_BASE_API_URL;

const Overview = () => {
  const [programs, setPrograms] = useState([]);
  const [donors, setDonors] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await axios.get(`${baseUrl}programs/`);
        setPrograms(response.data);
      } catch (error) {
        console.error("Error fetching programs:", error);
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

    const fetchExpenses = async () => {
      try {
        const response = await axios.get(`${baseUrl}expenses/`);
        setExpenses(response.data);
      } catch (error) {
        console.error("Error fetching expenses:", error);
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

    fetchPrograms();
    fetchDonors();
    fetchExpenses();
    fetchOrganization();
    setLoading(false);
  }, []);

  const calculateTotalBudget = () => {
    return programs.reduce((total, program) => total + parseFloat(program.total_budget || 0), 0);
  };

  const calculateTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
  };

  const calculateCompletedProjects = () => {
    return programs.filter(program => new Date(program.end_date) < new Date()).length;
  };

  const calculateOngoingProjects = () => {
    return programs.filter(program => new Date(program.end_date) >= new Date()).length;
  };

  const calculateTotalDonors = () => {
    return donors.length;
  };

  const calculateTotalDonatedAmount = () => {
    return donors.reduce((total, donor) => total + donor.total_donations, 0);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const chartData = {
    labels: programs.map(program => program.name),
    datasets: [
      {
        label: 'Total Budget',
        data: programs.map(program => program.total_budget),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Total Expenses',
        data: programs.map(program => {
          const programExpenses = expenses.filter(expense => expense.program.id === program.id);
          return programExpenses.reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
        }),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  return (
    <div className="container my-5">
      <div className="text-center mb-4">
        {organization && (
          <>
            <img src={organization.logo} alt="Organization Logo" className="mb-3" style={{ width: '150px', height: '150px' }} />
            <h2 className="text-uppercase fw-bold text-primary">Welcome to {organization.name}</h2>
          </>
        )}
      </div>
      <div className="row gy-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Total Budget</h5>
              <p className="card-text">Rs. {calculateTotalBudget().toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Total Expenses</h5>
              <p className="card-text">Rs. {calculateTotalExpenses().toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Completed Projects</h5>
              <p className="card-text">{calculateCompletedProjects()}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Ongoing Projects</h5>
              <p className="card-text">{calculateOngoingProjects()}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Total Donors</h5>
              <p className="card-text">{calculateTotalDonors()}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Total Donated Amount</h5>
              <p className="card-text">Rs. {calculateTotalDonatedAmount().toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="row gy-4 mt-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Project Status</h5>
              <ul className="list-group">
                {programs.map((program) => (
                  <li key={program.id} className="list-group-item d-flex justify-content-between align-items-center">
                    {program.name}
                    <span className="badge bg-secondary rounded-pill">Rs. {program.total_budget}</span>
                    <span className="badge bg-info rounded-pill">Expenses: Rs. {calculateTotalExpenses().toFixed(2)}</span>
                    <span className={`badge ${new Date(program.end_date) < new Date() ? 'bg-success' : 'bg-warning'} rounded-pill`}>
                      {new Date(program.end_date) < new Date() ? 'Completed' : 'Ongoing'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="row gy-4 mt-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Budget vs Expenses</h5>
              <Bar data={chartData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;