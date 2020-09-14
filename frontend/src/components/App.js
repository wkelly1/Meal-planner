import React from "react";
import { Router, Switch, Route } from "react-router-dom";
import Home from "./unauthorised/Home";
import AuthenticatedComponent from "./_shared/AuthenticatedComponent";
import Login from "./auth/Login";
import Dashboard from "./authorised/Meals";
import history from "../_helpers/hooks/history";
import "../css/main.css";
import "../css/helpers.css";
import "../css/mobile.css";

import Error404 from "./errors/Error404";
import Ingredients from "./authorised/Ingredients";

import Week from "./authorised/Week";
import NotificationProvider from "../_helpers/providers/NotificationProvider";
import ErrorNotification from "./_shared/Notification";
import ShoppingList from "./authorised/ShoppingList";
import UserSettings from "./authorised/Settings";
import AddMeal from "./authorised/AddMeal";

function App() {
  return (
    <NotificationProvider>
      <Router history={history}>
        <Switch>
          <Route path="/login/:token" component={Login} />
          <Route path="/login" component={Login} />
          <Route path="/" exact component={Home} />
          <AuthenticatedComponent path="/meals/add" Component={AddMeal} />
          <AuthenticatedComponent path="/meals" exact Component={Dashboard} />
          <AuthenticatedComponent path="/ingredients" exact Component={Ingredients}/>
          <AuthenticatedComponent path="/week" exact render={Week} />
          <AuthenticatedComponent path="/list" exact Component={ShoppingList} />
          <AuthenticatedComponent path="/settings" exact Component={UserSettings} />
          <Route path="/*" component={Error404} />
        </Switch>
      </Router>
      <ErrorNotification/>
    </NotificationProvider>
  );
}

export default App;
