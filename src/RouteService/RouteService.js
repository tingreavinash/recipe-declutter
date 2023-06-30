import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import App from "../App";
import About from "../About/About";
import RecipeSearch from "../RecipeSearch/RecipeSearch";

function RouteService() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={RecipeSearch} />
        <Route path="/about" component={About} />
        <Route path="/homepage" component={RecipeSearch} />
      </Switch>
    </Router>
  );
}

export default RouteService;
