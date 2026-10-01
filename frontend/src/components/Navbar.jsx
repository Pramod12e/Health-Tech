import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  Box,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { deleteProfile } from "../api/profileApi";
import { toast } from "react-toastify";

function Navbar() {
  const { user, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const isMobile = useMediaQuery("(max-width:600px)");
  const navigate = useNavigate();

  const menuItems = [
    { label: "Home", path: "/" },
    { label: "Doctors", path: "/doctors" },
    { label: "Pharmacies", path: "/pharmacies" },
  ];
  
  if (user?.role === "pharmacy") {
    menuItems.push({ label: "Manage Medicine", path: "/pharmacy/medicine" });
  }
  if (user?.role === "doctor") {
    menuItems.push({ label: "My Appointments", path: "/doctor/appointments" });
  }
  if (user?.role === "patient") {
    menuItems.push({ label: "Symptom Checker", path: "/symptom-checker" });
    menuItems.push({ label: "My Consultations", path: "/my-consultations" });
  }

  const handleAvatarClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Delete your account permanently? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteProfile(user.role);

      toast.success("Account deleted");

      logout();
      navigate("/");
    } catch (err) {
      toast.error("Delete failed");
    }

    handleMenuClose();
  };

  return (
    <AppBar
      position="sticky"
      className="main-navbar"
      elevation={0}
    >
      <Toolbar className="navbar-toolbar">

        {/* =================================================
            LOGO
        ================================================= */}

        <Box
          component={Link}
          to="/"
          className="brand-wrapper"
        >
          <Box className="brand-logo">
            A
          </Box>

          <Box className="brand-text">
            <Typography className="brand-name">
              Telehealth
            </Typography>

            <Typography className="brand-subtitle">
              Bridge
            </Typography>
          </Box>
        </Box>


        {/* =================================================
            MOBILE
        ================================================= */}

        {isMobile ? (
          <>
            <IconButton
              className="mobile-menu-button"
              onClick={() => setOpen(true)}
            >
              <MenuIcon />
            </IconButton>

            <Drawer
              anchor="right"
              open={open}
              onClose={() => setOpen(false)}
              PaperProps={{
                className: "mobile-drawer",
              }}
            >
              {/* Drawer Header */}

              <Box className="mobile-drawer-header">
                <Box className="brand-logo small-logo">
                  A
                </Box>

                <Typography className="mobile-brand-name">
                  Telehealth Bridge
                </Typography>
              </Box>


              {/* Navigation */}

              <List className="mobile-nav-list">

                {menuItems.map((item) => (
                  <ListItem
                    key={item.label}
                    component={Link}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className="mobile-nav-item"
                  >
                    <ListItemText primary={item.label} />
                  </ListItem>
                ))}


                {/* Login */}

                {!user && (
                  <ListItem
                    component={Link}
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="mobile-nav-item"
                  >
                    <ListItemText primary="Login" />
                  </ListItem>
                )}


                {/* Logged-in User */}

                {user && (
                  <>
                    <ListItem
                      component={Link}
                      to="/profile"
                      onClick={() => setOpen(false)}
                      className="mobile-nav-item"
                    >
                      <ListItemText primary="My Profile" />
                    </ListItem>

                    <ListItem
                      component={Link}
                      to="/profile/edit"
                      onClick={() => setOpen(false)}
                      className="mobile-nav-item"
                    >
                      <ListItemText primary="Edit Profile" />
                    </ListItem>

                    <ListItem
                      onClick={() => {
                        handleDeleteAccount();
                        setOpen(false);
                      }}
                      className="mobile-nav-item delete-item"
                    >
                      <ListItemText primary="Delete Account" />
                    </ListItem>

                    <ListItem
                      onClick={() => {
                        handleLogout();
                        setOpen(false);
                      }}
                      className="mobile-nav-item"
                    >
                      <ListItemText primary="Logout" />
                    </ListItem>
                  </>
                )}

              </List>
            </Drawer>
          </>
        ) : (

          /* =================================================
             DESKTOP
          ================================================= */

          <Box className="desktop-nav">

            {menuItems.map((item) => (
              <Button
                key={item.label}
                component={Link}
                to={item.path}
                className="nav-link"
              >
                {item.label}
              </Button>
            ))}


            {/* Login */}

            {!user && (
              <Button
                component={Link}
                to="/login"
                className="nav-link"
              >
                Login
              </Button>
            )}


            {/* User Avatar */}

            {user && (
              <>
                <IconButton
                  onClick={handleAvatarClick}
                  className="profile-avatar-button"
                >
                  <Avatar className="profile-avatar">
                    {user.role.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  className="profile-menu"
                >
                  <MenuItem
                    component={Link}
                    to="/profile"
                    onClick={handleMenuClose}
                  >
                    My Profile
                  </MenuItem>

                  <MenuItem
                    component={Link}
                    to="/profile/edit"
                    onClick={handleMenuClose}
                  >
                    Edit Profile
                  </MenuItem>

                  <MenuItem
                    onClick={handleDeleteAccount}
                    sx={{ color: "error.main" }}
                  >
                    Delete Account
                  </MenuItem>

                  <MenuItem onClick={handleLogout}>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            )}

          </Box>
        )}

      </Toolbar>
    </AppBar>
  );
}

export default Navbar;