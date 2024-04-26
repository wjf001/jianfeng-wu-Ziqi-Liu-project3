import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router';
import './AccountPage.css';
import NavBar from './NavBar';
import Footer from './Footer';
import './AccountPage.css';
import LoggedInNavBar from './LoggedInNavBar';
import './Login.css';

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

  const [searchDomain, setSearchDomain] = useState('');

  // const [searchResult, setSearchResult] = useState({ found: false, password: '', message: '' });



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
        let charset = [
            includeAlphabet ? 'alphabet' : '',
            includeNumerals ? 'numerals' : '',
            includeSymbols ? 'symbols' : ''
            ].filter(Boolean).join(',');
        
        console.log(accountAddressState);
        let password = accountPasswordState;
        // Check if password needs to be generated for a new entry
        if (!password && !editingState.isEditing) {
           password = generatePassword(passwordLength, charset);
            // payload.password = undefined; // Trigger backend to generate password
        }

        console.log(password);

        const payload = {
          siteAddress: accountAddressState,
          password: password,
          charset: charset,
          length: passwordLength
        };

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

  function copyText(index) {
    console.log(accountListState[index]);
    navigator.clipboard.writeText(accountListState[index].password);
  }


  // const accountListElement = [];
  // for(let i = 0; i < accountListState.length; i++) {
    
  //   accountListElement.push(<li>Site Address: {accountListState[i].siteAddress} 
  //       - Password: {accountListState[i].password} 
  //       - Last Updated: {accountListState[i].created} 
  //       - <button onClick={() => deleteAccount(accountListState[i]._id)}>Delete</button>
  //       - <button onClick={() => setEditingAccount(accountListState[i].siteAddress, accountListState[i].password, accountListState[i]._id)}>Edit</button>
  //   </li>)
  // }

  const accountListElement = accountListState.map((account, index) => (
    <li key={account._id} className="account-item">
      <input type="checkbox"  className='account-checkbox'/>
      <div className="account-info">
        <div className='account-site'>Site: {account.siteAddress}</div>
        <div className='account-password'>Password: {account.password}</div>
      </div>
      <div className="account-last-used">
        Last Used: {account.created}
      </div>
      <div className="account-actions">
        <button onClick={() => deleteAccount(account._id)}>Delete</button>
        <button onClick={() => setEditingAccount(account.siteAddress, account.password, account._id)}>Edit</button>
        <button onClick={() => copyText(index)}>Copy password</button>
      </div>
    </li>
  ));

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
      console.log(shareUsername);
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

  function generatePassword(length, charset) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numerals = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    let characters = '';
    if (charset.includes('alphabet')) characters += alphabet;
    if (charset.includes('numerals')) characters += numerals;
    if (charset.includes('symbols')) characters += symbols;
  
    let password = '';
    for (let i = 0; i < length; i++) {
      password += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return password;
   }

  function searchPassword(event) {
    event.preventDefault();

    let domain = document.getElementById('textInput').value;
    
    for (let i = 0; i < accountListState.length; i++) {
      if (accountListState[i].siteAddress === domain) {
        setSearchDomain(accountListState[i].password);
        return;
      }
    }

    setSearchDomain('');
  }



  return (
    <>
      <LoggedInNavBar username={username}/>
      <div className="account-container">
        <div className="account-header">
          <h1>Hi, {username}! Here're your passwords.</h1>
        </div>

        <div className='search-container'>
          <form id="searchForm" onSubmit={searchPassword} className='search-form'>
              <input type="text" id="textInput" placeholder='search by domain'/>
              <button type="submit" className="search-btn">Search</button>
              {searchDomain && (
                <div className="search-result">
                  <input type="text" value={searchDomain} readOnly className="search-answer" />
                  <button onClick={() => navigator.clipboard.writeText(searchDomain)} className="copy-btn">Copy</button>
                </div>
              )}
          </form>
        </div>

        <ul className="account-list">
          {accountListElement}
        </ul>

        <div className="account-form">
          <h2>{inputFieldTitleText}</h2>
          <div className="form-group">
            <label>Site Name:</label>
            <input type="text" value={accountAddressState} onInput={(event) => updateAccountAddress(event)} />
            {errorMsgState && <p className="error-message">{errorMsgState}</p>}

          </div>

          <div className="form-group">
            <label>Password:</label>
            <input type="password" value={accountPasswordState} onInput={(event) => updateAccountPassword(event)} />
          </div>
          
          <div className="form-group">
            <label>Password Length:</label>
            <input type="number" value={passwordLength} onChange={e => setPasswordLength(parseInt(e.target.value, 10))} min="4" max="50" />
          </div>

          {/* <div className="form-group">
            <label>
              <input type="checkbox" checked={includeAlphabet} onChange={e => setIncludeAlphabet(e.target.checked)} />
              Alphabet
            </label>
            <label>
              <input type="checkbox" checked={includeNumerals} onChange={e => setIncludeNumerals(e.target.checked)} />
              Numerals
            </label>
            <label>
              <input type="checkbox" checked={includeSymbols} onChange={e => setIncludeSymbols(e.target.checked)} />
              Symbols
            </label>
          </div> */}

          <div className="form-group">
            <div className="checkbox-group">
              <label>
                <input type="checkbox" checked={includeAlphabet} onChange={e => setIncludeAlphabet(e.target.checked)} />
                Alphabet
              </label>
              <label>
                <input type="checkbox" checked={includeNumerals} onChange={e => setIncludeNumerals(e.target.checked)} />
                Numerals
              </label>
              <label>
                <input type="checkbox" checked={includeSymbols} onChange={e => setIncludeSymbols(e.target.checked)} />
                Symbols
              </label>
            </div>
          </div>

          <div>
            <button onClick={() => onSubmit()}>Submit</button>
            <button onClick={() => onCancel()}>Cancel</button>
          </div>
        </div>

          <div className="share-form">
            <input
              type="text"
              placeholder="Username to share with"
              value={shareUsername}
              onChange={(e) => setShareUsername(e.target.value)}
            />
            <button onClick={handleShareRequest}>Share Passwords</button>
          </div>

          {shareRequests.map(request => (
            <div className="share-request" key={request._id}>
              {request.from} wants to share passwords with you.
              <button onClick={() => handleResponseToShareRequest(request._id, true)}>Accept</button>
              <button onClick={() => handleResponseToShareRequest(request._id, false)}>Reject</button>
            </div>
          ))}

          {/* <form id="searchForm" onSubmit={searchPassword}>
            <input type="text" id="textInput" />
            <input id="searchInput" type="submit" />
          </form> */}
          {/* {searchDomain} */}
      </div>
      <Footer />

      
    </>
  );
}

export default AccountPage;
