import React, { useContext } from "react";
import AccountCircle from "@mui/icons-material/AccountCircle";
import HomeIcon from "@mui/icons-material/Home";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";

const NavBar = () => {
  return (
    <>
      <div class="container">
        <ul>
          <li>
          <a href="/home">
              <HomeIcon style={{ fontSize: "30px", verticalAlign: "middle" }} />
            </a>
          </li>
          <li>
          <a href="/find">
              <TravelExploreIcon
                style={{ fontSize: "30px", verticalAlign: "middle" }}
              />
            </a>
          </li>
          <li>
          <a href="/create">
              <AddLocationAltIcon
                style={{ fontSize: "30px", verticalAlign: "middle" }}
              />
            </a>
          </li>
          <li>
          <a href="/profile">
              <AccountCircle
                style={{ fontSize: "30px", verticalAlign: "middle" }}
              />
            </a>
          </li>
        </ul>
      </div>
    </>
  );
};

export default NavBar;
