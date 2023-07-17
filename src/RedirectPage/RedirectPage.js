import React, { useEffect, useState } from "react";
import "./RedirectPage.css";

function RedirectPage() {
  const newWebsiteURL = "https://reciperevamp.web.app";
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = newWebsiteURL;
    }, countdown * 1000); 

    return () => clearTimeout(timer); 
  }, [countdown]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="container">
        <div className="vh-100 d-flex justify-content-center align-items-center">
          <div className="card">
            <h5 className="card-header text-bg-warning">Redirecting</h5>
            <div className="card-body">
              <p>
                This application has been moved to new website{" "}
                <a href={newWebsiteURL}>{newWebsiteURL}</a>.<br />
                You will be redirected to the new website in <b>{countdown}</b> seconds or{" "}
                <a href={newWebsiteURL} class="btn btn-sm btn-outline-primary">
                  Click Here
                </a>{" "}
                if you are not redirected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default RedirectPage;
