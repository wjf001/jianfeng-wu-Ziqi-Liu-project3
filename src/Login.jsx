import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from './AuthContext';
import NavBar from './NavBar';
import Footer from './Footer';
import './Login.css';

function Login() {
    const navigate = useNavigate()
    const { login } = useAuth();

    const [usernameState, setUsernameState] = useState('');
    const [passwordState, setPasswordState] = useState('');
    const [errorMsgState, setErrorMsgState] = useState('');
  

    async function onSubmit() {
      setErrorMsgState('');
      try {
        await axios.post('/api/users/login', {
            username: usernameState,
            password: passwordState,
        });
        login({ username: usernameState });
        navigate('/account');
      } catch (error) {
          setErrorMsgState(error.response.data);
      }
    }
  
    function updatePassword(event) {
        setPasswordState(event.target.value);
    }
  
    function updateUsername(event) {
        setUsernameState(event.target.value);
    }

    function togglePassword(event) {
      event.preventDefault();
      let passwordInput = document.getElementById('password');
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
      } else {
        passwordInput.type = 'password';
      }
    }

  
    return (
        <>
          <NavBar />
          <div className="login-container">
            <div className="text-box">
              <div className="login-form">
                <h2>Login</h2>
                {errorMsgState && <p className="error-message">{errorMsgState}</p>}
                <div className="form-group">
                  <label>Username:</label>
                  <input
                    value={usernameState}
                    onInput={(event) => updateUsername(event)}
                  />
                </div>
                <div id="form-group-password">
                  <label>Password:</label>
                  <div className="password-container">
                    <input
                      type="password"
                      id="password"
                      value={passwordState}
                      onInput={(event) => updatePassword(event)}
                    />
                    { passwordState ? <div className="toggle-password" onClick={togglePassword} /> : <></>}
                  </div>
                </div>
                <div className="form-group">
                  <button onClick={() => onSubmit()}>Submit</button>
                </div>
              </div>
            </div>
          </div>
        <Footer />
    </>
    );
}

export default Login;