import React from "react";
import { Router, Switch, Route } from "react-router-dom";
import Home from "./Home";
import AuthenticatedComponent from "./AuthenticatedComponent";
import Login from "./user/Login";
import Dashboard from "./user/Meals";
import history from "../history";
import "../css/main.css";
import "../css/helpers.css";
import "../css/mobile.css";

import Error404 from "./Error404";
import Ingredients from "./user/Ingredients";
import AddMeal from "./meals/AddMeal";
import Week from "./user/Week";
import NotificationProvider from "../_helpers/providers/NotificationProvider";
import ErrorNotification from "./Notification";
import ShoppingList from "./user/ShoppingList";
import UserSettings from "./user/Settings";

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
          <AuthenticatedComponent
            path="/ingredients"
            exact
            Component={Ingredients}
          />

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
