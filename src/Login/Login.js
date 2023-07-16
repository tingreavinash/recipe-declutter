import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "./Login.css";
import SignUp from "../SignUp/SignUp";
import { Link, NavLink, useNavigate } from "react-router-dom";

import FirebaseUtils from "../FirebaseUtil/FirebaseUtils";
import App from "../App";
import CommonUtils from "../CommonUtils/CommonUtils";

function Login({ setToken, showLogin, setShowLogin }) {
  const [username, setUserName] = useState();
  const [password, setPassword] = useState();
  const [accountCreation, setAccountCreation] = useState(false);
  const navigate = useNavigate();

  const handleSignInWithGoogle = async (e) => {
    e.preventDefault();
    const token = await FirebaseUtils.signInWithGoogle();
    if(token){
      setToken(token);
      setShowLogin(false);  
      CommonUtils.showSuccessToast("Welcome back!");
    }

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

    if(token){
      setToken(token);
      setShowLogin(false);
      CommonUtils.showSuccessToast("Welcome back!");

    }
  };

  const handleModalClose = async (e) => {
    e.preventDefault();
    setShowLogin(false);
  };

  const renderLoginForm = () => {
    return (
      <div>
        <div
          className={`modal fade ${showLogin ? "show" : ""}`}
          id="loginModal"
          tabindex="-1"
          aria-labelledby="exampleModalLabel"
          style={{ display: `${showLogin ? "block" : "none"}` }}
          role="dialog"
          aria-modal={`${showLogin ? "true" : "false"}`}
          aria-hidden="false"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="exampleModalLabel">
                  Authenticate
                </h1>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleModalClose}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {accountCreation ? (
                  <SignUp setAccountCreation={setAccountCreation} />
                ) : (
                  <>
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label
                          htmlFor="exampleInputEmail1"
                          className="form-label"
                        >
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
                        <label
                          htmlFor="exampleInputPassword1"
                          className="form-label"
                        >
                          Password
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="exampleInputPassword1"
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>

                      <button type="submit" className="btn btn-sm btn-primary">
                        Login
                      </button>
                      <p>Don't have account?
                      <a style={{cursor: 'pointer', color: 'blue'}} onClick={handleAccountCreate}> Create new account</a>
                      </p>
                      
                    </form>
                    <button
                      type="button"
                      onClick={handleSignInWithGoogle}
                      className="btn btn-sm btn-warning"
                    >
                      SignIn with Google
                    </button>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleModalClose}
                >
                  Close
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      {renderLoginForm()}
    </div>
  );
}

Login.propTypes = {
  setToken: PropTypes.func.isRequired,
};

export default Login;
