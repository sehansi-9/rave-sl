import React, { useContext } from "react";
import AccountCircle from "@mui/icons-material/AccountCircle";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import HomeIcon from "@mui/icons-material/Home";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import useUser from "./hooks/useUser";
import {getAuth, signOut} from "firebase/auth";
import {useNavigate} from "react-router-dom";

const NavBar = () => {
    const {user} = useUser();
    const navigate = useNavigate();
  return (
    <>
      <div className="container">
        <ul>
          <li>
          <a href="/#">
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
              <a>
              {user
                  ?<ExitToAppIcon
                      onClick={()=>{signOut(getAuth())}}
                      style={{ fontSize: "30px", verticalAlign: "middle" }}
                    />
                  :<AccountCircle
                      onClick = {()=>{navigate('/login')}}
                      style={{ fontSize: "30px", verticalAlign: "middle" }}
                    />
              }
              </a>

          </li>
        </ul>
      </div>
    </>
  );
};

export default NavBar;
