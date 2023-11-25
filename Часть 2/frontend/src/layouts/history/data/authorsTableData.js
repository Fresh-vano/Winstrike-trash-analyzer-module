import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";
import React, { useEffect, useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import serverUrl from 'config';
import axios from 'axios';
import MDButton from "components/MDButton";

export default function data() {
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideoSecond, setSelectedVideoSecond] = useState("");
  const [dataRows, setDataRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleOpen = (imageSrc, second) => {
    setLoading(false);
    setSelectedImage(serverUrl + "/get-photo" + imageSrc);
    setSelectedVideoSecond(second);
    setOpen(true);
  };

  const handleClose = () => {
    setLoading(true);
    setOpen(false);
    setSelectedImage(null);
    setSelectedVideoSecond("");
  };

  useEffect(() => {
    axios.get(`${serverUrl}/history`)
      .then(response => {
        setDataRows(response.data.map(item => ({
          address: item.address,
          type: item.type,
          status: (
            <MDBox ml={-1}>
              < MDBadge badgeContent={item.status ? "Соответствует" : "Не соответствует"} color={item.status ? "success" : "error"} variant="gradient" size="sm" />
            </MDBox>
          ),
          dateTime: item.dateTime,
          watch: (
            <React.Fragment>
              <MDTypography
                component="a"
                href="#"
                variant="caption"
                color="text"
                fontWeight="medium"
                onClick={() => handleOpen(item.result_photo_path, item.video_time)}
              >
                Просмотреть
              </MDTypography>
              {!loading ?
                <Dialog open={open} onClose={handleClose}>
                  <DialogTitle>Изображение</DialogTitle>
                  <DialogContent>
                    {selectedImage && (
                      <img src={selectedImage} alt="Изображение" style={{ maxWidth: 512, maxHeight: 512 }} />
                    )}
                    {selectedVideoSecond != "" ? 
                      <MDTypography>Машина была обнаружена в {selectedVideoSecond}</MDTypography>
                    :
                      <></>
                    }
                  </DialogContent>
                  <DialogActions>
                    <MDButton variant="gradient" color="info" onClick={handleClose} fullWidth>
                      Закрыть
                    </MDButton>
                  </DialogActions>
                </Dialog>
              :
                <></>
              }
            </React.Fragment>
          ),
        })));
      })
      .catch(error => {
        console.error('Ошибка при получении данных:', error);
      });
  }, [open]);

  return {
    columns: [
      { Header: "Адрес", accessor: "address", align: "left" },
      { Header: "Тип груза", accessor: "type", align: "center" },
      { Header: "Статус", accessor: "status", align: "center" },
      { Header: "Время", accessor: "dateTime", align: "center" },
      { Header: "Просмотр", accessor: "watch", align: "right" },
    ],

    rows: dataRows
  };
}
