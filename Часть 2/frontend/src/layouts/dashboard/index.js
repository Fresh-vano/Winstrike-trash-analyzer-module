import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards";
import { useEffect, useState } from "react";
import serverUrl from 'config';
import axios from 'axios';

function Dashboard() {
  const [camerasChartData, setCamerasChartData] = useState(
    {
      labels: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
      datasets: { label: "Камеры", data: [0, 0, 0, 0, 0, 0, 0] },
    }
  );
  const [detectedChartData, setDetectedChartData] = useState(
    {
      labels: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
      datasets: { label: "Распознаные автомобили", data: [0, 0, 0, 0, 0, 0, 0] },
    }
  );
  const [detectedFailChartData, setDetectedFailChartData] = useState(
    {
      labels: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
      datasets: { label: "Найдены несоответствия", data: [0, 0, 0, 0, 0, 0, 0] },
    }
  );

  const [statisticsData, setStatisticsData] = useState({
    todayCars: 0,
    availableCameras: 0,
    recognizedCars: 0,
    detectedFailures: 0,
  });

  useEffect(() => {
    axios.get(`${serverUrl}/all`)
    .then(response => {
      setStatisticsData(prevData => ({
        ...prevData,
        todayCars: response.data.count,
      }));
    })
    .catch(error => {
      console.error('Ошибка при получении данных:', error);
    });

    axios.get(`${serverUrl}/cameras`)
      .then(response => {
        setStatisticsData(prevData => ({
          ...prevData,
          availableCameras: response.data.count,
        }));
        setBarChartData(response.data.chartData);
      })
      .catch(error => {
        console.error('Ошибка при получении данных:', error);
      });

    axios.get(`${serverUrl}/detected`)
      .then(response => {
        setStatisticsData(prevData => ({
          ...prevData,
          recognizedCars: response.data.count,
        }));
        setSalesChartData(response.data.chartData);
      })
      .catch(error => {
        console.error('Ошибка при получении данных:', error);
      });

    axios.get(`${serverUrl}/detected_fail`)
      .then(response => {
        setStatisticsData(prevData => ({
          ...prevData,
          detectedFailures: response.data.count,
        }));
        setTasksChartData(response.data.chartData);
      })
      .catch(error => {
        console.error('Ошибка при получении данных:', error);
      });

    axios.get(`${serverUrl}/chart/cameras`)
      .then(response => {
        setCamerasChartData(response.data);
      })
      .catch(error => {
        console.error('Ошибка при получении данных:', error);
      });

    axios.get(`${serverUrl}/chart/detected`)
      .then(response => {
        setDetectedChartData(response.data);
      })
      .catch(error => {
        console.error('Ошибка при получении данных:', error);
      });

    axios.get(`${serverUrl}/chart/detected_fail`)
      .then(response => {
        setDetectedFailChartData(response.data);
      })
      .catch(error => {
        console.error('Ошибка при получении данных:', error);
      });
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon="weekend"
                title="Автомобилей за сегодня"
                count={statisticsData.todayCars}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon="leaderboard"
                title="Записей за день"
                count={statisticsData.availableCameras}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="store"
                title="Распознано автомобилей"
                count={statisticsData.recognizedCars}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon="person_add"
                title="Найдены несоответствия"
                count={statisticsData.detectedFailures}
              />
            </MDBox>
          </Grid>
        </Grid>
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsBarChart
                  color="info"
                  title="Записей за день"
                  description="Количество обработанных записей по дням"
                  chart={camerasChartData}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="success"
                  title="Распознано верно"
                  description="Распознаные автомобили за последнюю неделю"
                  chart={detectedChartData}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="dark"
                  title="Несоответствия"
                  description="Найденые несоответствия мусора за последнюю неделю"
                  chart={detectedFailChartData}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default Dashboard;
