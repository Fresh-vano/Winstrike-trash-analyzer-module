import Dashboard from "layouts/dashboard";
import History from "layouts/history";
import Cameras from "layouts/cameras";
import Notifications from "layouts/notifications";
import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "Панель управления",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "История",
    key: "history",
    icon: <Icon fontSize="small">history</Icon>,
    route: "/history",
    component: <History />,
  },
  {
    type: "collapse",
    name: "Видеокамеры",
    key: "cameras",
    icon: <Icon fontSize="small">camera</Icon>,
    route: "/cameras",
    component: <Cameras />,
  },
  {
    type: "collapse",
    name: "Уведомления",
    key: "notifications",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/notifications",
    component: <Notifications />,
  },
];

export default routes;
