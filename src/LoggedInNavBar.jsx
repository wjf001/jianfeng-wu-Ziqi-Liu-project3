import React, { useState } from "react";
import { NavLink, useNavigate } from 'react-router-dom';
import './LoggedInNavBar.css';
import axios from'axios';

function LoggedInNavBar({ username }) {
    const [isDrowdown, setIsDropdown] = useState(false);
    const navigate = useNavigate();

    const toggleDropdown = () => {
        setIsDropdown(!isDrowdown);
    };

    const handleLogout = async () => {
        try{
            await axios.post('/api/users/logout');
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header>
            <nav className="navbar">
                <NavLink to="/" exact>Home Page</NavLink>
                <NavLink to="#" onClick={handleLogout}>Log out</NavLink>
                <div className="navbar-user" onClick={toggleDropdown}>
                    <span>{username}</span>
                    <i className={`arrow ${isDrowdown ? 'up' : 'down'}`}></i>
                    {isDrowdown && (
                        <ul className="dropdown-menu">
                            <li onClick={handleLogout}>Log out</li>
                        </ul>
                    )}
                </div>
            </nav>
            <div className="logo">
            <p className="navbar-logo">Password Manager</p>
          </div>
        </header>
    )
}

export default LoggedInNavBar;