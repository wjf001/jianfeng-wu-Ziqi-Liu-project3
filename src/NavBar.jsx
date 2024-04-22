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
        <div className="NavBarCon">
            <div><NavLink to="/" >Home Page</NavLink></div>
            {isAuthenticated ? (
                <>
                    <span>
                        Hi, {user.username}
                    </span>
                    <button onClick={handleLogout}>Logout</button>
                </>
            ) : (
                <>
                    <div><NavLink to="/login">Log In</NavLink></div>
                    <div><NavLink to="/register">Sign Up</NavLink></div>
                </>
            )}
        </div>
    )
}


export default NavBar