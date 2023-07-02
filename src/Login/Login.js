import React, { useState } from "react";
import PropTypes from "prop-types";
import "./Login.css";
import SignUp from "../SignUp/SignUp";

import FirebaseUtils from "../FirebaseUtil/FirebaseUtils";

function Login({ setToken }) {
  const [username, setUserName] = useState();
  const [password, setPassword] = useState();
  const [accountCreation, setAccountCreation] = useState(false);

  const handleSignInWithGoogle = async (e) => {
    e.preventDefault();
    const token = await FirebaseUtils.signInWithGoogle();
    setToken(token);
  };
  
  const handleAccountCreate = async (e) => {
    e.preventDefault();
    setAccountCreation(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = await FirebaseUtils.loginWithEmailAndPassword({
      username,
      password,
    });
    setToken(token);
  };

  const renderLoginForm = () => {
    return (
      <div>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="exampleInputEmail1" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="exampleInputEmail1"
              aria-describedby="emailHelp"
              onChange={(e) => setUserName(e.target.value)}
            />
            <div id="emailHelp" className="form-text">
              We'll never share your email with anyone else.
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="exampleInputPassword1" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="exampleInputPassword1"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="exampleCheck1"
            />
            <label className="form-check-label" htmlFor="exampleCheck1">
              Check me out
            </label>
          </div>
          <button type="submit" className="btn btn-primary">
            Login
          </button>
          <button
            type="button"
            onClick={handleAccountCreate}
            className="btn btn-primary"
          >
            Register
          </button>
        </form>
        <button
          type="button"
          onClick={handleSignInWithGoogle}
          className="btn btn-warning"
        >
          SignIn with Google
        </button>
      </div>
    );
  };

  return (
    <div className="container">
      {accountCreation ? (
        <SignUp setAccountCreation={setAccountCreation} />
      ) : (
        renderLoginForm()
      )}
    </div>
  );
}

Login.propTypes = {
  setToken: PropTypes.func.isRequired,
};

export default Login;
