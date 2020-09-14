import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { logout } from "../../_helpers/services/auth.service";
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';


import EventIcon from '@material-ui/icons/Event';
import ListIcon from '@material-ui/icons/List';
import ShoppingBasketOutlinedIcon from '@material-ui/icons/ShoppingBasketOutlined';
import FastfoodOutlinedIcon from '@material-ui/icons/FastfoodOutlined';

function Navigation(props) {
  const pathname = window.location.pathname;
  const [selected, setSelected] = useState(pathname);
  const [dropdown, setDropdown] = useState(false);

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('sm'));

  function openDropdown() {
    setDropdown(dropdown => !dropdown);
  }


  return (
    <div
      className="flex-container flex-align-center flex-justify-spacebetween b-primary shadow"
      style={{ height: "60px" }}
    >
      {!matches ? (
        <BottomNavigation value={selected} onChange={(e, value) => setSelected(value)} style={{
          width: '100%',
          position: 'fixed',
          bottom: 0,
          zIndex: 100
        }}>
          <BottomNavigationAction label="My week" value="/week" icon={<EventIcon />} component={Link} to="/week" />
          <BottomNavigationAction label="Meals" value="/meals" icon={<FastfoodOutlinedIcon />} component={Link} to="/meals" />
          <BottomNavigationAction label="Ingredients" value="/ingredients" icon={<ShoppingBasketOutlinedIcon />} component={Link} to="/ingredients" />
          <BottomNavigationAction label="List" value="/list" icon={<ListIcon />} component={Link} to="/list" />
        </BottomNavigation>) : null}
      <div className="flex-container flex-align-center fill-height">
        <div>
          <h2 className="c-white margin-right margin-left">Meals</h2>
        </div>


        {matches ? (
          <div className="flex-container flex-align-center fill-height">
            <NavLink
              exact
              to="/week"
              className="nav-item"
              activeClassName="nav-item-active"
            >
              My week
          </NavLink>
            <NavLink
              exact
              to="/meals"
              className="nav-item"
              activeClassName="nav-item-active"
            >
              My meals
          </NavLink>

            <NavLink
              exact
              to="/ingredients"
              className="nav-item"
              activeClassName="nav-item-active"
            >
              My ingredients
          </NavLink>

            <NavLink
              exact
              to="/list"
              className="nav-item"
              activeClassName="nav-item-active"
            >
              My list
          </NavLink>
          </div>
        ) : null}
      </div>

      <div className="flex-container flex-align-center fill-height">
        {matches ? (
          <NavLink exact to="/meals/add" className="nav-item margin-right">
            Add a meal
          </NavLink>
        ) : null}


        <div style={{ position: "relative", height: "100%" }}>
          <div
            onClick={openDropdown}
            style={{
              backgroundColor: dropdown
                ? "var(--c-dark-grey)"
                : "",

              height: "100%",
              cursor: "pointer",
            }}
            className="flex-container flex-align-center nav-item"
          >
            <div
              className="margin-left c-primary margin-right b-white flex-container flex-justify-center flex-align-center"
              style={{
                color: dropdown ? "var(--c-black)" : "",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
              }}
            >
              <p>
                {props.current_user.firstName.substring(0, 1) +
                  props.current_user.lastName.substring(0, 1)}
              </p>
            </div>
          </div>

          {dropdown ? (
            <div
              className="position-absolute b-dark-grey"
              style={{ top: "60px", right: 0, width: "150px", zIndex: 300 }}
            >
              <p className="c-white margin-topbottom margin-left" style={{ textTransform: "uppercase" }}>
                {props.current_user.firstName +
                  " " +
                  props.current_user.lastName}
              </p>

                  {!matches ? (<NavLink exact to="/meals/add" className="link c-white dropdown-nav-item">
                  Add meal
          </NavLink>) : null}

              <div className="padding-top">
                <NavLink exact to="/settings" className="link c-white dropdown-nav-item">
                  Settings
          </NavLink>
              </div>

              <div className="padding-top">
                <span className="link c-white dropdown-nav-item cursor-pointer" onClick={logout}>
                  Logout
                  </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div >
  );

}

export default Navigation;