import { useState } from "react";
import Grid from "@mui/material/Grid";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useDropzone } from "react-dropzone";
import serverUrl from 'config';
import axios from 'axios';
import { Card, Typography } from "@mui/material";
import MDBox from "components/MDBox";
import DataTable from "examples/Tables/DataTable";
import MDTypography from "components/MDTypography";
import MDSnackbar from "components/MDSnackbar";

function Cameras() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarProps, setSnackbarProps] = useState({
    color: "info",
    title: "Загрузка",
    loadingProgress: 0,
    content: "",
  });

  const toggleSnackbar = () => setShowSnackbar(!showSnackbar);

  const onDrop = async (acceptedFiles) => {
    const formDataArray = acceptedFiles.map((file) => {
      const formData = new FormData();
      formData.append("files", file);
      return formData;
    });
  
    const requests = formDataArray.map((formData) =>
      axios.post(`${serverUrl}/video`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
  
          setSnackbarProps((prevProps) => ({
            ...prevProps,
            loadingProgress: percentCompleted,
            content: "",
          }));
  
          toggleSnackbar();
        },
      })
    );
  
    try {
      await Promise.all(requests);
  
      setUploadedFiles(acceptedFiles);
      setSnackbarProps({
        color: "success",
        title: "Загрузка",
        content: "Загрузка завершена!",
      });
      toggleSnackbar();
    } catch (error) {
      console.error("Error uploading files:", error);
      setSnackbarProps({
        color: "error",
        title: "Загрузка",
        content: "Ошибка загрузки файлов!",
      });
      toggleSnackbar();
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: ".mp4" });

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Grid
                {...getRootProps()}
                elevation={3}
                sx={{
                  padding: "20px",
                  border: "1px dashed #ccc",
                  borderRadius: "4px",
                  textAlign: "center",
                }}
              >
                <input {...getInputProps()} />
                <Typography variant="h6">Перетащите файлы сюда или кликните для выбора файлов</Typography>
              </Grid>
          </Grid>
        </Grid>
        {uploadedFiles.length > 0 && (
          <MDBox pt={6} pb={3}>
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <Card>
                  <MDBox
                    mx={2}
                    mt={-3}
                    py={3}
                    px={2}
                    variant="gradient"
                    bgColor="info"
                    borderRadius="lg"
                    coloredShadow="info"
                  >
                    <MDTypography variant="h6" color="white">
                      Загружены файлы
                    </MDTypography>
                  </MDBox>
                  <MDBox pt={3}>
                    <DataTable
                      table={{ 
                        columns: [{Header: "Название файла", accessor: "name", align: "left" }],
                        rows: uploadedFiles.map((file, index) => ({ "name": file.name })) 
                      }}
                      isSorted={false}
                      entriesPerPage={false}
                      showTotalEntries={false}
                      noEndBorder
                    />
                  </MDBox>
                </Card>
              </Grid>
            </Grid>
          </MDBox>
        )}
      </MDBox>
      <MDSnackbar
        color={snackbarProps.color}
        title={snackbarProps.title}
        loadingProgress={snackbarProps.loadingProgress}
        content={snackbarProps.content}
        open={showSnackbar}
        close={toggleSnackbar}
      />
    </DashboardLayout>
  );
}

export default Cameras;