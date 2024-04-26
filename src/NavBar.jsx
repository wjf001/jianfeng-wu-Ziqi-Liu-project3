import { NavLink } from 'react-router-dom'
import './NavBar.css'
import HomePage from './HomePage.jsx'
import { useAuth } from './AuthContext.jsx'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';



function NavBar() {
    const navigate = useNavigate();

    const { isAuthenticated, user, logout } = useAuth();

    async function handleLogout() {
        try {
            await axios.post('/api/users/logout');
            logout();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    return (
        <header className="header">
          <nav className="navbar">
            <NavLink to="/" exact>Home Page</NavLink>
            {/* {isAuthenticated ? (
              <>
                <span>Hi, {user.username}</span>
                <button onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <> */}
                <NavLink to="/login">Log In</NavLink>
                <NavLink to="/register">Sign Up</NavLink>
              {/* </>
            )} */}
          </nav>
          <div className="logo">
            <p className="nav-logo">Password Manager</p>
          </div>
        </header>
      );
    }
    
export default NavBar;