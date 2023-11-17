import React, { useState } from "react";
import "./componentscss/Login.css";
import sterlite_eye from "../Images/sterlite-eye.png";
import quant_viz_logo from "../Images/quant-viz.png";
import { FiLock, FiUnlock } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleLogin = () => {
    // Check the entered username and password
    if (username === "admin@gmail.com" && password === "Quantic@123") {
      // Successful login, you can redirect or perform other actions here
    //   alert("Login successful!");
      
      // Reset the error message
      setErrorMessage("");
      navigate('/dashboard');
    } else {
      // Display an error message for unsuccessful login
      setErrorMessage("Invalid username or password");
    }
  };
  return (
    <div className="login-container">
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      <div className="login-box">
        <div className="logo-container">
          <img
            className="logo sterlite-eye"
            src={sterlite_eye}
            alt="quant-viz-logo"
          />
          <img
            className="logo quant-text"
            src={quant_viz_logo}
            alt="quant-viz"
          />
        </div>
        <div className="login-input-container">
          <input
            className="login-email-input"
            type="email"
            placeholder="Email address"
            pattern=".+@(.+\.(com|in|org))"
            size="64"
            maxLength="64"
            title="Please provide a valid email address ending in .com, .in, or .org."
            onChange={(e) => setUsername(e.target.value)}
          />
          <div className="password-input-container">
            <input
              className="login-password-input"
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              onChange={(e) => setPassword(e.target.value)}
            />
            {showPassword ? (
              <FiUnlock
                className="password-toggle-icon"
                onClick={handleTogglePassword}
              />
            ) : (
              <FiLock
                className="password-toggle-icon"
                onClick={handleTogglePassword}
              />
            )}
          </div>
          <button className="login-btn" onClick={handleLogin}>Login</button>
        </div>
        <div className="forgot-container">
          <div className="keep-me-logged-in-div">
            <input className="keep-me-logged-in-checkbox" type="checkbox" />
            <span>Keep me logged in</span>
          </div>
          <button className="forgot-pasword-btn">Forgot Password?</button>
        </div>
      </div>
      <div className="login-footer">
        <div className="login-footer-left">
          <a href="https://www.w3schools.com" target="_blank" rel="noreferrer">
            Terms of use
          </a>
          |
          <a href="https://www.w3schools.com" target="_blank" rel="noreferrer">
            Privacy Policy
          </a>
        </div>
        <div className="login-footer-right">
          <span className="quant-copyrights">
            © 2023, Quant-Viz Unit Of Quantic Tech Analysis Pvt Ltd
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;
