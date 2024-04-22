import React from 'react'
import ReactDOM from 'react-dom/client'
import AccountPage from './AccountPage.jsx'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import Login from './Login.jsx'
import Register from './Register.jsx'
import HomePage from './HomePage.jsx'
import { AuthProvider } from './AuthContext';

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  }, 
  {
    path: '/account',
    element: <AccountPage />
  },
  {
    path: '/',
    element: <HomePage />
  }
])


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
  </React.StrictMode>,
)
