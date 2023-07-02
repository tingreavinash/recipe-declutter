import "./SignUp.css";
import React, { useState } from "react";
import FirebaseUtils from "../FirebaseUtil/FirebaseUtils";

function SignUp({ setAccountCreation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLoginOption = async (e) => {
    e.preventDefault();
    setAccountCreation(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    await FirebaseUtils.createAccountWithEmailAndPass({
      email,
      password,
    });
  };

  return (
    <div>
      <h2>Create Account</h2>
      <form onSubmit={onSubmit}>
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
          Submit
        </button>
        <button
          type="button"
          onClick={handleLoginOption}
          className="btn btn-primary"
        >
          Already have account ?
        </button>
      </form>
    </div>
  );
}

export default SignUp;
