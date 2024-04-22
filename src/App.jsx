import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import NavBar from './NavBar';
import HomePage from './HomePage';
import Login from './Login';
import Register from './Register';

function App() {
    return (
        <AuthProvider>
                <NavBar />
        </AuthProvider>
    );
};

export default App;
