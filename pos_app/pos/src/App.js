// import React, { useState, useEffect } from 'react';
import React, { useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import axios from "axios";

import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Overview from "./pages/Overview";

import Settings from "./pages/Settings";
import Donors from "./pages/Donors";
import Donations from "./pages/Donations";
import Programs from "./pages/Programs";
import SubPrograms from "./pages/SubPrograms";
import Expenses from "./pages/Expenses";


import Login from "./components/Login";
import useAutoLogout from "./hooks/useAutoLogout";

function App() {
  const [activeLink, setActiveLink] = useState("overview");
  const navigate = useNavigate();
  const [isTransactionOpen, setisTransactionOpen] = useState(false);

  useAutoLogout(300000); // Auto logout after 5 minutes of inactivity

  // useEffect(() => {
  //   const token = localStorage.getItem('access_token');
  //   if (token) {
  //     axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
  //   } else {
  //     navigate('/login');
  //   }

  // }, [navigate]);

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  // const handleSubLinkClick = (link) => {
  //   setActiveLink(link);
  // };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    axios.defaults.headers.common["Authorization"] = "";
    navigate("/login");
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className="sidebar bg-dark text-white vh-100 p-3">
        <h4 className="text-center mb-4">Wfn</h4>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link
              className={`nav-link text-white ${
                activeLink === "overview" ? "active-link" : ""
              }`}
              to="/overview"
              onClick={() => handleLinkClick("overview")}
            >
              <i className="bi bi-speedometer2 me-2"></i> Overview
            </Link>
          </li>
          <li className="nav-item">
            <Link
              className={`nav-link text-white ${
                activeLink === "donors" ? "active-link" : ""
              }`}
              to="/donors"
              onClick={() => handleLinkClick("donors")}
            >
              <i className="bi bi-people me-2"></i> Donors
            </Link>
          </li>
         
          <li className="nav-item">
            <Link
              className={`nav-link text-white ${
                activeLink === "programs" ? "active-link" : ""
              }`}
              to="/programs"
              onClick={() => handleLinkClick("programs")}
            >
              <i className="bi bi-gift me-2"></i> Program
            </Link>
          </li>
          <li className="nav-item">
            <Link
              className={`nav-link text-white ${
                activeLink === "subPrograms" ? "active-link" : ""
              }`}
              to="/subPrograms"
              onClick={() => handleLinkClick("subPrograms")}
            >
              <i className="bi bi-gift me-2"></i> Sub Program
            </Link>
          </li>
         
          <li className="nav-item">
            <div
              className={`nav-link text-white ${
                activeLink === "inventory" ? "active-link" : ""
              }`}
              onClick={() => {
                handleLinkClick("inventory");
                setisTransactionOpen(!isTransactionOpen);
              }}
              style={{ cursor: "pointer" }}
            >
              <i className="bi bi-box-seam me-2"></i> Transactions
            </div>
            {isTransactionOpen && (
              <ul className="nav flex-column ms-3">
                 <li className="nav-item">
            <Link
              className={`nav-link text-white ${
                activeLink === "donations" ? "active-link" : ""
              }`}
              to="/donations"
              onClick={() => handleLinkClick("donations")}
            >
              <i className="bi bi-gift me-2"></i> Donations
            </Link>
          </li>
                 <li className="nav-item">
            <Link
              className={`nav-link text-white ${
                activeLink === "expenses" ? "active-link" : ""
              }`}
              to="/expenses"
              onClick={() => handleLinkClick("expenses")}
            >
              <i className="bi bi-gift me-2"></i> Expenses
            </Link>
          </li>
              </ul>
            )}
          </li>

          <li className="nav-item">
            <Link
              className={`nav-link text-white ${
                activeLink === "settings" ? "active-link" : ""
              }`}
              to="/settings"
              onClick={() => handleLinkClick("settings")}
            >
              <i className="bi bi-gear me-2"></i> Settings
            </Link>
          </li>
         
          <li className="nav-item">
            <div
              className="nav-link text-white"
              onClick={handleLogout}
              style={{ cursor: "pointer" }}
            >
              <i className="bi bi-box-arrow-right me-2"></i> Logout
            </div>
          </li>
        </ul>
      </div>

      <div className="main-content flex-grow-1 p-3 bg-light">
        <Routes>
          <Route path="/overview" element={<Overview />} />
          <Route path="/donors" element={<Donors />} />
          <Route path="/donations" element={<Donations />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/subPrograms" element={<SubPrograms />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
