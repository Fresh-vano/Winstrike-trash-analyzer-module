import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import MDBox from "components/MDBox";
import {
  navbar,
  navbarContainer,
  navbarRow,
} from "examples/Navbars/DashboardNavbar/styles";

import {
  useMaterialUIController,
} from "context";

function DashboardNavbar({ absolute, light, isMini }) {
  const [controller] = useMaterialUIController();
  const { transparentNavbar, darkMode } = controller;

  return (
    <AppBar
      position={absolute ? "absolute" : "static"}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light, darkMode })}
    >
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        {isMini ? null : (
          <MDBox sx={(theme) => navbarRow(theme, { isMini })}>
          </MDBox>
        )}
      </Toolbar>
    </AppBar>
  );
}

DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;
