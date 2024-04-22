import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router';
import './AccountPage.css'
import NavBar from './NavBar'

function AccountPage() {
  const  navigate = useNavigate();

  const [accountListState, setAccountListState] = useState([]);
  const [accountAddressState, setAccountAddressState] = useState('');
  const [accountPasswordState, setAccountPasswordState] = useState('');
  const [editingState, setEditingState] = useState({
    isEditing: false,
    editingAccountId: '',
  });
  const [errorMsgState, setErrorMsgState] = useState('');
  const [username, setUsername] = useState('');

  const [includeAlphabet, setIncludeAlphabet] = useState(false);
  const [includeNumerals, setIncludeNumerals] = useState(false);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [passwordLength, setPasswordLength] = useState(8); // Default length

  const [shareUsername, setShareUsername] = useState('');  // For sharing passwords
  const [shareRequests, setShareRequests] = useState([]);


  async function getAllAccount() {
    const response = await axios.get('/api/account');
    setAccountListState(response.data);
  }

  async function deleteAccount(accountId) {
    await axios.delete('/api/account/' + accountId);
    await getAllAccount();
  }

  async function onSubmit() {
    setErrorMsgState('');
    try {
        const payload = {
            siteAddress: accountAddressState,
            password: accountPasswordState,
            charset: [
                includeAlphabet ? 'alphabet' : '',
                includeNumerals ? 'numerals' : '',
                includeSymbols ? 'symbols' : ''
            ].filter(Boolean).join(','),
            length: passwordLength
        };

        // Check if password needs to be generated for a new entry
        if (!accountPasswordState && !editingState.isEditing) {
            payload.password = undefined; // Trigger backend to generate password
        }

        if (editingState.isEditing) {
            await axios.put(`/api/account/${editingState.editingAccountId}`, payload);
        } else {
            await axios.post('/api/account', payload);
        }

        // Reset states after submission
        setAccountAddressState('');
        setAccountPasswordState('');
        setIncludeAlphabet(false);
        setIncludeNumerals(false);
        setIncludeSymbols(false);
        setPasswordLength(8);
        setEditingState({ isEditing: false, editingAccountId: '' });
        await getAllAccount();
    } catch (error) {
        setErrorMsgState(error.response && error.response.data ? error.response.data : "An error occurred");
    }
}


  function updateAccountPassword(event) {
    setAccountPasswordState(event.target.value);
  }

  function updateAccountAddress(event) {
    setAccountAddressState(event.target.value);
  }

  function setEditingAccount(siteAddress, password, accountId) {
    setAccountAddressState(siteAddress);
    setAccountPasswordState(password);
    setEditingState({
      isEditing: true, 
      editingAccountId: accountId
  });
  }

  function onStart() {
    isLoggedIn()
      .then(() => {
        getAllAccount()
      })
  }

  function onCancel() {
    setAccountAddressState('');
    setAccountPasswordState('');
    setEditingState({
      isEditing: false, 
      editingAccountId: '',
  });
  }


  async function logout() {
    await axios.post('/api/users/logout');
    navigate('/');
  }

  async function isLoggedIn() {
    try {
      const response = await axios.get('/api/users/loggedIn');
      const username = response.data.username;
      setUsername(username);
    } catch (e) {
      navigate('/')
    }
  }

  // useEffect(onStart, []);
  useEffect(() => {
    isLoggedIn().then(() => {
      getAllAccount();
      fetchShareRequests();
    });
  }, []);


  const accountListElement = [];
  for(let i = 0; i < accountListState.length; i++) {
    
    accountListElement.push(<li>Site Address: {accountListState[i].siteAddress} 
        - Password: {accountListState[i].password} 
        - Last Updated: {accountListState[i].created} 
        - <button onClick={() => deleteAccount(accountListState[i]._id)}>Delete</button>
        - <button onClick={() => setEditingAccount(accountListState[i].siteAddress, accountListState[i].password, accountListState[i]._id)}>Edit</button>
    </li>)
  }

  const inputFieldTitleText = editingState.isEditing ? "Edit Account" : "Add new Account";

  if(!username) {
    return <div>Loading...</div>
  }

  async function fetchShareRequests() {
    const response = await axios.get('/api/account/shareRequest');
    setShareRequests(response.data);
  }

  async function handleShareRequest() {
    try {
      const response = await axios.post('/api/account/shareRequest', { toUsername: shareUsername });
      setShareUsername('');
      setErrorMsgState('Share request sent');
      fetchShareRequests();  // Refresh the list of share requests
    } catch (error) {
      setErrorMsgState('Failed to send share request: ' + (error.response ? error.response.data : 'Network error'));
    }
  }

  async function handleResponseToShareRequest(requestId, accept) {
    try {
      await axios.post('/api/account/respondToShareRequest', { requestId, accept });
      fetchShareRequests();  // Refresh after response
    } catch (error) {
      setErrorMsgState('Failed to process request: ' + (error.response ? error.response.data : 'Network error'));
    }
  }



  return (
    <div>
      <NavBar />
        <div>
          <button onClick={logout}>Logout</button>
        
        </div>
        {errorMsgState && <h1>
            {errorMsgState}
        </h1>}
        Here are all your Password Account Logs, {username}!!
        <ul>
            {accountListElement}
        </ul>

        <div>{inputFieldTitleText}</div>
        <div>
            <div>
                <label>Site Name:</label> <input value={accountAddressState} onInput={(event) => updateAccountAddress(event)}/>
            </div>
            <div>
                <label>Password:</label> <input value={accountPasswordState} onInput={(event) => updateAccountPassword(event)}/>
            </div>
            <div>
                <label><input type="checkbox" checked={includeAlphabet} onChange={e => setIncludeAlphabet(e.target.checked)} /> Alphabet</label>
                <label><input type="checkbox" checked={includeNumerals} onChange={e => setIncludeNumerals(e.target.checked)} /> Numerals</label>
                <label><input type="checkbox" checked={includeSymbols} onChange={e => setIncludeSymbols(e.target.checked)} /> Symbols</label>
                <label>Password Length:</label>
                <input type="number" value={passwordLength} onChange={e => setPasswordLength(parseInt(e.target.value, 10))} min="4" max="50" />
            </div>

            <div>
                <button onClick={() => onSubmit()}>Submit</button>
                <button onClick={() => onCancel()}>Cancel</button>
            </div>
        </div>

        <div>
        <input
          type="text"
          placeholder="Username to share with"
          value={shareUsername}
          onChange={(e) => setShareUsername(e.target.value)}
        />
        <button onClick={handleShareRequest}>Share Passwords</button>
      </div>

      {/* Display share requests */}
      {shareRequests.map(request => (
        <div key={request._id}>
          {request.from} wants to share passwords with you.
          <button onClick={() => handleResponseToShareRequest(request._id, true)}>Accept</button>
          <button onClick={() => handleResponseToShareRequest(request._id, false)}>Reject</button>
        </div>
      ))}


    </div>
  )
}

export default AccountPage;
