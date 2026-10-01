import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Chip
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import HealingIcon from "@mui/icons-material/Healing";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import MedicationIcon from "@mui/icons-material/Medication";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAccessibility } from "../context/AccessibilityContext";
import { deleteProfile } from "../api/profileApi";
import { toast } from "react-toastify";

function Navbar() {
  const { user, logout } = useAuth();
  const { lang, t } = useAccessibility();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const isMobile = useMediaQuery("(max-width:960px)");
  const navigate = useNavigate();

  // All navbar options + Added option to see patient history + symptom checker
  const menuItems = [
    {
      label: t("home", "Home"),
      sublabel: lang === "hi" ? "शुरुआत" : lang === "or" ? "ମୂଳପୃଷ୍ଠା" : "Start",
      path: "/",
      icon: <HomeIcon className="nav-item-icon" />
    },
    {
      label: t("doctors", "Doctors"),
      sublabel: lang === "hi" ? "डॉक्टर सूची" : lang === "or" ? "ଡାକ୍ତର" : "Specialists",
      path: "/doctors",
      icon: <MedicalServicesIcon className="nav-item-icon" />
    },
    {
      label: t("symptomChecker", "Symptom Checker"),
      sublabel: lang === "hi" ? "लक्षण जांचें" : lang === "or" ? "ରୋଗ ପରୀକ୍ଷା" : "Self-Check",
      path: "/symptom-checker",
      icon: <HealingIcon className="nav-item-icon" />,
      highlight: true
    },
    {
      label: t("patientHistory", "Patient History"),
      sublabel: lang === "hi" ? "पुरानी पर्ची" : lang === "or" ? "ପୂର୍ବ ରେକର୍ଡ" : "Prescriptions",
      path: "/patient-history",
      icon: <AssignmentIcon className="nav-item-icon" />
    },
    {
      label: t("pharmacies", "Pharmacies"),
      sublabel: lang === "hi" ? "दवा दुकान" : lang === "or" ? "ଔଷଧ" : "Medicines",
      path: "/pharmacies",
      icon: <LocalPharmacyIcon className="nav-item-icon" />
    },
  ];

  if (user?.role === "pharmacy") {
    menuItems.push({
      label: t("manageMedicine", "Manage Medicine"),
      sublabel: lang === "hi" ? "दवा स्टॉक" : lang === "or" ? "ଷ୍ଟକ୍" : "Inventory",
      path: "/pharmacy/medicine",
      icon: <MedicationIcon className="nav-item-icon" />
    });
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
        lang === "hi"
          ? "क्या आप अपना खाता हमेशा के लिए हटाना चाहते हैं?"
          : "Delete your account permanently? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteProfile(user.role);
      toast.success(lang === "hi" ? "खाता हटा दिया गया" : "Account deleted");
      logout();
      navigate("/");
    } catch (err) {
      toast.error(lang === "hi" ? "खाता हटाने में विफल" : "Delete failed");
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
            BRAND / LOGO
        ================================================= */}
        <Box
          component={Link}
          to="/"
          className="brand-wrapper"
          aria-label="Telehealth Bridge Homepage"
        >
          <Box className="brand-logo">
            <HealthAndSafetyIcon sx={{ fontSize: 28, color: "#ffffff" }} />
          </Box>

          <Box className="brand-text">
            <Typography className="brand-name">
              Telehealth
              <span className="brand-name-suffix">Bridge</span>
            </Typography>
            <Typography className="brand-subtitle">
              {lang === "hi" ? "स्वास्थ्य साथी • ग्रामीण सेवा" : lang === "or" ? "ସ୍ୱାସ୍ଥ୍ୟ ସାଥୀ • ଗ୍ରାମୀଣ ସେବା" : "Accessible Healthcare"}
            </Typography>
          </Box>
        </Box>

        {/* =================================================
            MOBILE DRAWER TRIGGER
        ================================================= */}
        {isMobile ? (
          <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                className="mobile-menu-button"
                onClick={() => setOpen(true)}
                aria-label="Open Navigation Menu"
              >
                <MenuIcon fontSize="medium" />
              </IconButton>
            </Box>

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
                <Box className="brand-wrapper">
                  <Box className="brand-logo small-logo">
                    <HealthAndSafetyIcon sx={{ fontSize: 22, color: "#ffffff" }} />
                  </Box>
                  <Box>
                    <Typography className="mobile-brand-name">
                      Telehealth Bridge
                    </Typography>
                    <Typography variant="caption" sx={{ color: "var(--accent)", fontWeight: 700 }}>
                      {lang === "hi" ? "आसान स्वास्थ्य सेवा" : "Simple Healthcare"}
                    </Typography>
                  </Box>
                </Box>
                <IconButton onClick={() => setOpen(false)} sx={{ ml: "auto" }} aria-label="Close menu">
                  <CloseIcon />
                </IconButton>
              </Box>

              {/* Navigation List */}
              <List className="mobile-nav-list">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <ListItem
                      key={item.label}
                      disablePadding
                      sx={{ mb: 1 }}
                    >
                      <ListItemButton
                        component={Link}
                        to={item.path}
                        onClick={() => setOpen(false)}
                        className={`mobile-nav-item ${isActive ? "active" : ""} ${item.highlight ? "highlighted-item" : ""}`}
                      >
                        <ListItemIcon sx={{ minWidth: 42, color: isActive ? "var(--secondary)" : "var(--primary)" }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.label}
                          secondary={item.sublabel}
                          primaryTypographyProps={{
                            fontWeight: isActive ? 700 : 600,
                            fontSize: "1.05rem"
                          }}
                          secondaryTypographyProps={{
                            fontSize: "0.8rem",
                            color: "text.secondary"
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}

                {/* Login Button for mobile */}
                {!user && (
                  <ListItem disablePadding sx={{ mt: 2 }}>
                    <ListItemButton
                      component={Link}
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="mobile-nav-login-btn"
                    >
                      <ListItemIcon sx={{ minWidth: 40, color: "#ffffff" }}>
                        <LoginIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={lang === "hi" ? "लॉगिन करें (Login)" : "Login / Sign In"}
                        primaryTypographyProps={{ fontWeight: 700, color: "#ffffff" }}
                      />
                    </ListItemButton>
                  </ListItem>
                )}

                {/* Logged-in User in mobile */}
                {user && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid var(--border)" }}>
                    <ListItem disablePadding sx={{ mb: 1 }}>
                      <ListItemButton
                        component={Link}
                        to="/profile"
                        onClick={() => setOpen(false)}
                        className="mobile-nav-item"
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <AccountCircleIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={lang === "hi" ? "मेरी प्रोफाइल" : "My Profile"}
                          secondary={user.role}
                        />
                      </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding sx={{ mb: 1 }}>
                      <ListItemButton
                        component={Link}
                        to="/profile/edit"
                        onClick={() => setOpen(false)}
                        className="mobile-nav-item"
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <EditIcon />
                        </ListItemIcon>
                        <ListItemText primary={lang === "hi" ? "प्रोफाइल बदलें" : "Edit Profile"} />
                      </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding sx={{ mb: 1 }}>
                      <ListItemButton
                        onClick={() => {
                          handleDeleteAccount();
                          setOpen(false);
                        }}
                        className="mobile-nav-item delete-item"
                      >
                        <ListItemIcon sx={{ minWidth: 40, color: "error.main" }}>
                          <DeleteIcon />
                        </ListItemIcon>
                        <ListItemText primary={lang === "hi" ? "खाता हटाएं" : "Delete Account"} sx={{ color: "error.main" }} />
                      </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={() => {
                          handleLogout();
                          setOpen(false);
                        }}
                        className="mobile-nav-item"
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary={lang === "hi" ? "लॉगआउट" : "Logout"} />
                      </ListItemButton>
                    </ListItem>
                  </Box>
                )}
              </List>
            </Drawer>
          </>
        ) : (
          /* =================================================
             DESKTOP NAVIGATION
          ================================================= */
          <Box className="desktop-nav">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.label}
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  className={`nav-link ${isActive ? "active" : ""} ${item.highlight ? "nav-link-highlight" : ""}`}
                >
                  <span className="nav-link-content">
                    <span className="nav-link-main">{item.label}</span>
                    <span className="nav-link-sub">{item.sublabel}</span>
                  </span>
                </Button>
              );
            })}

            {/* Login button */}
            {!user && (
              <Button
                component={Link}
                to="/login"
                startIcon={<LoginIcon />}
                className="nav-login-btn"
                variant="contained"
              >
                {t("login", "Login")}
              </Button>
            )}

            {/* User Avatar Menu */}
            {user && (
              <>
                <IconButton
                  onClick={handleAvatarClick}
                  className="profile-avatar-button"
                  title="User Profile"
                  aria-label="User Account Menu"
                >
                  <Avatar className="profile-avatar">
                    {user.role ? user.role.charAt(0).toUpperCase() : "U"}
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
                    <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon>
                    {t("myProfile", "My Profile")} ({user.role})
                  </MenuItem>

                  <MenuItem
                    component={Link}
                    to="/patient-history"
                    onClick={handleMenuClose}
                  >
                    <ListItemIcon><AssignmentIcon fontSize="small" /></ListItemIcon>
                    {t("patientHistory", "Patient History")}
                  </MenuItem>

                  <MenuItem
                    component={Link}
                    to="/profile/edit"
                    onClick={handleMenuClose}
                  >
                    <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                    {lang === "hi" ? "प्रोफाइल बदलें" : "Edit Profile"}
                  </MenuItem>

                  <MenuItem
                    onClick={handleDeleteAccount}
                    sx={{ color: "error.main" }}
                  >
                    <ListItemIcon sx={{ color: "error.main" }}><DeleteIcon fontSize="small" /></ListItemIcon>
                    {lang === "hi" ? "खाता हटाएं" : "Delete Account"}
                  </MenuItem>

                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                    {lang === "hi" ? "लॉगआउट करें" : "Logout"}
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