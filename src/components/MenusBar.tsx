import { Menu } from "antd";
import {
  // MenuUnfoldOutlined,
  // MenuFoldOutlined,
  DesktopOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import {
  PostAddOutlined,
  ListAltOutlined,
  People,
  TabletAndroid,
  Build,
  AssignmentInd,
  Healing,
  CropFree,
  FlightTakeoff,
  PowerSettingsNew,
  DateRange,
} from "@material-ui/icons/";
import SubMenu from "antd/lib/menu/SubMenu";
import { Link, useHistory } from "react-router-dom";
import usePersm from "../hooks/usePersm";

const MenusBar = ({ setCollapsed, collapsed, online }: any) => {
  // const toggle = () => {
  //   setCollapsed(!collapsed);
  // };

  const { ar, ad } = usePersm();
  const history = useHistory();

  return (
    <Menu mode="inline" defaultSelectedKeys={["1"]}>
      <Menu.Item
        style={{ fontSize: 17 }}
        key="1"
        icon={<DesktopOutlined style={{ fontSize: 17 }} />}
      >
        <Link to="/menu">INICIO</Link>
      </Menu.Item>
      <Menu.Item
        hidden={ar}
        style={{ fontSize: 17 }}
        key="2"
        icon={<CropFree style={{ fontSize: 22 }} />}
      >
        <Link to="/maquinas/scanner">ESCANEO DE MAQUINA</Link>
      </Menu.Item>
      <SubMenu
        disabled={ar}
        key="sub0"
        icon={<ShoppingCartOutlined style={{ fontSize: 17 }} />}
        title="LOTES"
      >
        <Menu.Item
          hidden={ad}
          style={{ fontSize: 14 }}
          key="sub00"
          icon={<PostAddOutlined style={{ fontSize: 20 }} />}
        >
          <Link to="/lotes/crear">NUEVO LOTE</Link>
        </Menu.Item>
        <Menu.Item
          style={{ fontSize: 14 }}
          key="sub01"
          icon={<ListAltOutlined style={{ fontSize: 20 }} />}
        >
          <Link to="/lotes">LOTES</Link>
        </Menu.Item>
      </SubMenu>
      <SubMenu
        key="sub1"
        icon={<DatabaseOutlined style={{ fontSize: 17 }} />}
        title="FUNCIONALIDADES"
      >
        <SubMenu
          disabled={ar}
          key="sub1materia"
          icon={<People style={{ fontSize: 20 }} />}
          style={{ fontSize: 12 }}
          title="CLIENTES"
        >
          <Menu.Item
            style={{ fontSize: 14 }}
            key="sub1materia1"
            icon={<PostAddOutlined style={{ fontSize: 20 }} />}
          >
            <Link to="/clientes/creacion">CREAR</Link>
          </Menu.Item>

          <Menu.Item
            style={{ fontSize: 14 }}
            key="sub1materia2"
            icon={<ListAltOutlined style={{ fontSize: 20 }} />}
          >
            <Link to="/clientes">CRM</Link>
          </Menu.Item>
        </SubMenu>
        <SubMenu
          key="sub1envases"
          icon={<TabletAndroid style={{ fontSize: 19 }} />}
          style={{ fontSize: 12 }}
          title="MAQUINAS"
        >
          <Menu.Item
            style={{ fontSize: 14 }}
            key="sub1envases1"
            icon={<Build style={{ fontSize: 20 }} />}
          >
            <Link to="/maquinas/reparacion">REPARACION</Link>
          </Menu.Item>
          <Menu.Item
            hidden={ar}
            style={{ fontSize: 14 }}
            key="sub1envases2"
            icon={<ListAltOutlined style={{ fontSize: 20 }} />}
          >
            <Link to="/maquinas">LISTADO GENERAL</Link>
          </Menu.Item>
          <Menu.Item
            hidden={ar}
            style={{ fontSize: 14 }}
            key="sub1envases3"
            icon={<PostAddOutlined style={{ fontSize: 20 }} />}
          >
            <Link to="/maquinas/modelos">AGREGAR MODELOS</Link>
          </Menu.Item>
          <Menu.Item
            hidden={ar}
            style={{ fontSize: 14 }}
            key="sub1envases4"
            icon={<AssignmentInd style={{ fontSize: 20 }} />}
          >
            <Link to="/maquinas/asignar">ASIGNAR MAQUINA A CLIENTE</Link>
          </Menu.Item>
          <Menu.Item
            style={{ fontSize: 14 }}
            key="sub1envases5"
            icon={<FlightTakeoff style={{ fontSize: 20 }} />}
          >
            <Link to="/maquinas/externa">MAQUINA EXTERNA</Link>
          </Menu.Item>
        </SubMenu>
        <SubMenu
          key="sub1productos"
          icon={<Healing style={{ fontSize: 22 }} />}
          style={{ fontSize: 12 }}
          title="REPERACIONES/MANTENIMIENTOS"
        >
          <Menu.Item
            hidden={ar}
            style={{ fontSize: 14 }}
            key="sub1productos1"
            icon={<Build style={{ fontSize: 20 }} />}
          >
            <Link to="/reparaciones/pendientes">REPARACIONES PENDIENTES</Link>
          </Menu.Item>

          <Menu.Item
            style={{ fontSize: 14 }}
            key="sub1productos2"
            icon={<ListAltOutlined style={{ fontSize: 20 }} />}
          >
            <Link to="/reparaciones/lista">REPARACIONES EN CURSO</Link>
          </Menu.Item>
        </SubMenu>

        {/* <Menu.Item
          style={{ fontSize: 14 }}
          key="sb13"
          icon={<DollarCircleOutlined style={{ fontSize: 14 }} />}
        >
          <Link to="/ProductoTerminado">PRODUCTO TERMINADO</Link>
        </Menu.Item> */}
      </SubMenu>
      <SubMenu
        icon={<BarChartOutlined style={{ fontSize: 17 }} />}
        key="sub2"
        title="REPORTES"
        disabled={ar}
      >
        <Menu.Item
          hidden={ar}
          style={{ fontSize: 17 }}
          key="sub2diasreparacion"
          icon={<DateRange style={{ fontSize: 20 }} />}
        >
          <Link to="/reportes/reparacionesdias">REPARACIONES DIAS</Link>
        </Menu.Item>
      </SubMenu>
      <Menu.Item
        onClick={() => history.push("/")}
        style={{ fontSize: 20 }}
        key="4"
        icon={<PowerSettingsNew />}
      >
        CERRAR SESION
      </Menu.Item>
      {/* <Menu.Item
        onClick={toggle}
        style={{ fontSize: 17 }}
        key="4"
        icon={
          collapsed ? (
            <MenuUnfoldOutlined style={{ fontSize: 17 }} />
          ) : (
            <MenuFoldOutlined style={{ fontSize: 17 }} />
          )
        }
      ></Menu.Item> */}
    </Menu>
  );
};

export default MenusBar;
