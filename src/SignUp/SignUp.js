import "./SignUp.css";
import React, { useState, useEffect } from "react";
import FirebaseUtils from "../FirebaseUtil/FirebaseUtils";
import CommonUtils from "../CommonUtils/CommonUtils";

function SignUp({ setAccountCreation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
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

  const handleLoginOption = async (e) => {
    e.preventDefault();
    setAccountCreation(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      CommonUtils.showWarnToast("Password mismatch, please try again.");
      return;
    }

    await FirebaseUtils.createAccountWithEmailAndPass({
      firstname,
      lastname,
      email,
      password,
    });
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <div className="row mb-3">
          <div class="col-md-6">
            <label for="userFirstname" class="form-label">
              First name
            </label>
            <input
              type="text"
              class="form-control"
              onChange={(e) => setFirstname(e.target.value)}
              id="userFirstname"
              required
            />
          </div>
          <div class="col-md-6">
            <label for="userLastname" class="form-label">
              Last name
            </label>
            <input
              type="text"
              class="form-control"
              onChange={(e) => setLastname(e.target.value)}
              id="userLastname"
              required
            />
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            Email
          </label>
          <input
            type="email"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            onChange={(e) => setEmail(e.target.value)}
          />
          <div id="emailHelp" className="form-text">
            We'll never share your email with anyone else.
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputPassword1" className="form-label">
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
        <div className="mb-3">
          <label htmlFor="exampleInputPassword2" className="form-label">
            Confirm Password
          </label>
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              className="form-control"
              id="exampleInputPassword2"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <span
              className="toggle-password"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>
        </div>
        {/* <div className="mb-3 form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="exampleCheck1"
          />
          <label className="form-check-label" htmlFor="exampleCheck1">
            Check me out
          </label>
        </div> */}
        <div className="form-actions">
          <button type="submit" className="btn btn-outline-success">
            Submit
          </button>
          <p>
            Already registered?
            <a
              style={{ cursor: "pointer", color: "blue" }}
              onClick={handleLoginOption}
            >
              {" "}
              Login
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}

export default SignUp;
