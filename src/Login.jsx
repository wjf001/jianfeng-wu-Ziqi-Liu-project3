import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from './AuthContext';
import NavBar from './NavBar';

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

  
    return (
      <div>
            <h1>Login Page</h1>
            <NavBar />
          {errorMsgState && <h1>
              {errorMsgState}
          </h1>}

          <div>
              <div>
                  <label>Username:</label> <input value={usernameState} onInput={(event) => updateUsername(event)}/>
              </div>
              <div>
                  <label>Password:</label> <input value={passwordState} onInput={(event) => updatePassword(event)}/>
              </div>
              <div>
                  <button onClick={() => onSubmit()}>Submit</button>
              </div>
          </div>
      </div>
    )
  }
  
  export default Login;
  