import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import App from "../App";
import About from "../About/About";
import RecipeSummarizer from "../RecipeSummarizer/RecipeSummarizer";

function RouteService() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={RecipeSummarizer} />
        <Route path="/about" component={About} />
        <Route path="/homepage" component={RecipeSummarizer} />
      </Switch>
    </Router>
  );
}

export default RouteService;
