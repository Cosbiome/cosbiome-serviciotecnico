import { ColumnsType } from "antd/lib/table";
import Title from "antd/lib/typography/Title";
import { useEffect, useState } from "react";
import { IClientesDB } from "../../@types";
import { connection as conn } from "../../lib/DataBase";
import moment from "moment";
import { useHistory } from "react-router";
import useFiltersTables from "../../hooks/useFiltersTables";
import { Button, Space, Table } from "antd";

const Clientes = () => {
  const [clientes, setClientes] = useState<IClientesDB[]>([]);
  const [load, setLoad] = useState<boolean>(true);

  useEffect(() => {
    handleGetClientes();
  }, []);

  const dropMenuFilter = useFiltersTables();
  const history = useHistory();

  const handleGetClientes = async () => {
    const result: IClientesDB[] = await (
      await conn
    ).query(`
      SELECT 
        ClienteNombre,
        ClienteDireccion,
        ClienteEstado,
        ClienteTelefono,
        user.id as ClienteId,
        user.created_at as ClienteFechaCreacion,
        COUNT( CASE WHEN MaquinaCliente IS NOT NULL THEN 1 ELSE NULL END) AS 'ClienteTotalMaquinas'
      FROM  ${"`users-permissions_user`"} as user
      LEFT JOIN maquinas ON user.id = MaquinaCliente
      GROUP BY ClienteNombre
      ORDER BY user.id;
    `);

    console.log(result);

    setClientes(result);
    setLoad(false);
  };

  const columns: ColumnsType<IClientesDB> = [
    {
      title: "ID",
      ...dropMenuFilter("ClienteId"),
      dataIndex: "ClienteId",
    },

    {
      title: "NOMBRE",
      ...dropMenuFilter("ClienteNombre"),
      dataIndex: "ClienteNombre",
    },
    {
      title: "DIRECCION",
      dataIndex: "ClienteDireccion",
    },
    {
      title: "ESTADO",
      dataIndex: "ClienteEstado",
    },
    {
      title: "TELEFONO",
      ...dropMenuFilter("ClienteTelefono"),
      dataIndex: "ClienteTelefono",
    },
    {
      title: "TOTAL MAQUINAS",
      dataIndex: "ClienteTotalMaquinas",
    },
    {
      title: "Cliente desde",
      dataIndex: "LoteFecha",
      render: (text: Date, record) => {
        return moment(record.ClienteCreacion).format("YYYY-MM-DD");
      },
    },
    {
      title: "Detalle",
      key: "action",
      render: (text: any, record) => (
        <Space size="middle">
          <Button
            onClick={() => {
              history.push("/clientes/detalle/" + record.ClienteId);
            }}
            type="primary"
          >
            DETALLE DEL CLIENTE
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="container">
      <Title className="text-center">LISTADO DE CLIENTES</Title>

      <div className="row mt-5">
        <div className="col-md-12">
          <Table
            loading={load}
            columns={columns}
            bordered
            dataSource={clientes}
          />
        </div>
      </div>
    </div>
  );
};

export default Clientes;
