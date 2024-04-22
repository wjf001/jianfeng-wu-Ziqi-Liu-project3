import React from 'react';
import NavBar from './NavBar.jsx'
import './Home.css'
import { NavLink } from 'react-router-dom'

function HomePage() {
    return (
        <>
        <h1>Password Manager Application</h1>
        <NavBar />

        <div className="intro">
            <div> The is a password manager application that allows you to store and manage your passwords securely. 
                    This application can store your passwords in a secure way. 
                    The application also can share your passwords with other users.
            </div>
        </div>

        <div>
            <h2 className='instruction'>User Instructure</h2>
            <ol className="rules">
                <li>If you have an account, please log in.</li>
                <li>If you don't have an account, please sign up.</li>
                <li>You can store your passwords in the application.</li>
                <li>You can share your passwords with other users.</li>
                <li>You can delete your passwords from the application.</li>
                <li>You can update your passwords.</li>
            </ol>
        </div>

        <div>
            <h2 className='instruction'>Instruction of the Website</h2>
            <ol className="rules">
                <li>Nav-Bar have three links to 3 different Pages: Home Page, Log in Page, and Register Page.</li>
                <li>You are in Home page now.</li>
                <li>After you log in or sign up, you will directed to the application page.</li>
                <li>In the application page, you can store your passwords and share them with other users.</li>
            </ol>
        </div>

        <div>
            <h2 className='instruction'>Name of Creators</h2>
            <ol className="rules">
                <li>Jianfeng Wu</li>
                <li>Put your name here</li>
            </ol>
        </div>

        </>
    )
}

export default HomePage