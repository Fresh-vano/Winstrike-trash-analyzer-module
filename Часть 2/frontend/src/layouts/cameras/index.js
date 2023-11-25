import Grid from "@mui/material/Grid";
import Camera from "./components/Camera/Camera";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

function Cameras() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Grid container spacing={3}>
        <Grid>
          <Camera/>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}

export default Cameras;
