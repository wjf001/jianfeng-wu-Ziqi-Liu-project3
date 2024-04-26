import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import Footer from './Footer';
import './Login.css';


function Register() {
    const [usernameState, setUsernameState] = useState('');
    const [passwordState, setPasswordState] = useState('');
    const [verifyPasswordState, setVerifyPasswordState] = useState('');
    const [errorMsgState, setErrorMsgState] = useState('');
    const navigate = useNavigate();
  

    async function onSubmit() {
      setErrorMsgState('')
      // verify password
      if(verifyPasswordState !== passwordState) {
        setErrorMsgState('Please verify passwords are the same :)')
        return;
      }

      try {
        await axios.post('/api/users/register', {
            username: usernameState,
            password: passwordState,
        });

        await axios.post('/api/users/login', {
            username: usernameState,
            password: passwordState,
        });
        navigate('/account');

        setPasswordState('');
        setUsernameState('');
      } catch (error) {
          setErrorMsgState('This username has already been registered');
        }
    }
  
    function updatePassword(event) {
        setPasswordState(event.target.value);
    }

    function updateVerifyPassword(event) {
        setVerifyPasswordState(event.target.value);
    }
  
    function updateUsername(event) {
        setUsernameState(event.target.value);
    }

  
    return (
      <>
        <NavBar />
            <div className='login-container'>
                <div className="text-box">
                    <div className="login-form">
                        <h2>Sign Up</h2>
                        {errorMsgState && <p className="error-message">{errorMsgState}</p>}
                        <div className="form-group">
                            <label>Username:</label>
                            <input
                                value={usernameState}
                                onInput={(event) => updateUsername(event)}
                            />
                        </div>
                    <div className="form-group">
                        <label>Password:</label>
                        <input
                            type="password"
                            value={passwordState}
                            onInput={(event) => updatePassword(event)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Verify Password:</label>
                        <input
                            type="password"
                            value={verifyPasswordState}
                            onInput={(event) => updateVerifyPassword(event)}
                        />
                    </div>
                    <div className="form-group">
                        <button onClick={() => onSubmit()}>Submit</button>
                    </div>
                    </div>
                </div>
            </div>
        <Footer />
      </>
    )
  }
  
  export default Register;
  