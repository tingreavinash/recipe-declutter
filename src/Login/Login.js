import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./Login.css";
import SignUp from "../SignUp/SignUp";

import FirebaseUtils from "../FirebaseUtil/FirebaseUtils";
import CommonUtils from "../CommonUtils/CommonUtils";
import { FcGoogle } from "react-icons/fc";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

function Login({ setToken, showLogin, setShowLogin }) {
  const [username, setUserName] = useState();
  const [password, setPassword] = useState();
  const [accountCreation, setAccountCreation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    let timer;

    if (showPassword) {
      timer = setTimeout(() => {
        setShowPassword(false);
      }, 2000);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [showPassword]);

  const handleSignInWithGoogle = async (e) => {
    e.preventDefault();
    const token = await FirebaseUtils.signInWithGoogle();
    if (token) {
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

    if (token) {
      setToken(token);
      setShowLogin(false);
      CommonUtils.showSuccessToast("Welcome back!");
    }
  };

  const handleModalClose = () => {
    setShowLogin(false);
  };

  const renderLoginForm = () => {
    return (
      <div>
        <Modal
          show={showLogin}
          onHide={handleModalClose}
          keyboard={true}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {accountCreation ? "Register" : "Sign In"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {accountCreation ? (
              <SignUp setAccountCreation={setAccountCreation} />
            ) : (
              <>
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
                    <label
                      htmlFor="exampleInputPassword1"
                      className="form-label"
                    >
                      Password
                    </label>
                    <div className="password-container">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        className="form-control"
                        id="exampleInputPassword1"
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <span
                        className="toggle-password"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </span>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-outline-success">
                      Submit
                    </button>
                    <p>
                      Don't have account?
                      <a
                        style={{ cursor: "pointer", color: "blue" }}
                        onClick={handleAccountCreate}
                      >
                        {" "}
                        Create new account
                      </a>
                    </p>
                    <button
                      type="button"
                      onClick={handleSignInWithGoogle}
                      className="btn btn-outline-dark"
                    >
                      SignIn with <FcGoogle />
                    </button>
                  </div>
                </form>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleModalClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  };

  return <div className="container">{renderLoginForm()}</div>;
}

Login.propTypes = {
  setToken: PropTypes.func.isRequired,
};

export default Login;
