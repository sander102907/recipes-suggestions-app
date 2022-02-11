import React from "react";
import { Nav, NavItem } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { Basket, Star, Gear, StarFill } from "react-bootstrap-icons";
import "./navigation.css";

const tabs = [
  {
    route: "/",
    icon: Basket,
    label: "Suggestions",
  },
  {
    route: "/recipes",
    icon: Star,
    label: "My Recipes",
  },
  {
    route: "/settings",
    icon: Gear,
    label: "Settings",
  },
];

const Navigation = (props) => {
  return (
    <div>
      {/* Top Bar*/}
      <nav
        className="navbar navbar-expand-md navbar-light d-none d-lg-block sticky-top"
        role="navigation"
      >
        <div className="container-fluid">
          <a className="navbar-logo" href="/">
            Recipes
          </a>
          <Nav className="ml-auto">
            <NavItem>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? " nav-link active" : "nav-link"
                }
              >
                <div className="nav-item top">
                  <div className="nav-item-text">
                    <div className="nav-item-top">This weeks</div>
                    <div className="nav-item-bottom">Suggestions</div>
                  </div>
                  <Basket className="icon" size={24} />
                </div>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                to="/recipes"
                className={({ isActive }) =>
                  isActive ? " nav-link active" : "nav-link"
                }
              >
                <div className="nav-item top">
                  <div className="nav-item-text">
                    <div className="nav-item-top">My</div>
                    <div className="nav-item-bottom">Recipes</div>
                  </div>
                  <StarFill className="icon" size={24} />
                </div>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  isActive ? " nav-link active" : "nav-link"
                }
              >
                <Gear className="icon" size={24} />
              </NavLink>
            </NavItem>
          </Nav>
        </div>
      </nav>

      {/* Bottom Tab Navigator*/}
      <nav
        className="navbar fixed-bottom navbar-light d-block d-lg-none bottom-tab-nav"
        role="navigation"
      >
        <Nav className="w-100">
          <div className=" d-flex flex-row justify-content-around w-100">
            {tabs.map((tab, index) => (
              <NavItem key={`tab-${index}`}>
                <NavLink
                  to={tab.route}
                  className={({ isActive }) =>
                    isActive
                      ? " nav-link bottom-nav-link active"
                      : "nav-link bottom-nav-link"
                  }
                >
                  <div className="row d-flex flex-column justify-content-center align-items-center">
                    <tab.icon size={24} />
                    <div className="bottom-tab-label">{tab.label}</div>
                  </div>
                </NavLink>
              </NavItem>
            ))}
          </div>
        </Nav>
      </nav>
    </div>
  );
};

export default Navigation;
