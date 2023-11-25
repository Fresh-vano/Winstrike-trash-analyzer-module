import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAlert from "components/MDAlert";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import axios from "axios";
import serverUrl from "config";

function Notifications() {
  const [alertData, setAlertData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${serverUrl}/notification`)
      .then((response) => {
        console.log(response.data)
        setAlertData(response.data);
        setLoading(true);
      })
      .catch((error) => {
        console.error("Ошибка при получении данных:", error);
      });
  }, []);

  const alertContent = (alert) => (
    <MDTypography variant="body2" color="white">
      {alert.dateTime} - {alert.type}
    </MDTypography>
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={6} mb={3}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} lg={8}>
            <Card>
              <MDBox p={2}>
                <MDTypography variant="h5">Уведомления</MDTypography>
              </MDBox>
              <MDBox pt={2} px={2}>
                {loading && alertData.length != 0 ?
                  alertData.map((alert) => {
                    return (
                    <MDAlert color={alert.status ? "info": "error"} dismissible>
                      {alertContent(alert)}
                    </MDAlert>
                  )})
                  :
                  <Grid container
                    spacing={0}
                    direction="column"
                    alignItems="center"
                    justifyContent="center"
                    style={{ minHeight: "10vh" }}
                  >
                    <MDTypography>Нет новых уведомлений</MDTypography>
                  </Grid>
                }
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default Notifications;
