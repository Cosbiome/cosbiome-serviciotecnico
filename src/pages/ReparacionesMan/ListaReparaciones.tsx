import { Table, Tag } from "antd";
import { ColumnsType } from "antd/lib/table";
import Title from "antd/lib/typography/Title";
import moment from "moment";
import { useEffect, useState } from "react";
import useFiltersTables from "../../hooks/useFiltersTables";
import { connection as conn } from "../../lib/DataBase";

interface IReparacionDB {
  ClienteNombre: string;
  ReparacionMotivo: string;
  MaqNombre: string;
  ClienteTelefono: string;
  ReparacionFecha: Date;
  MaquinaLote: number;
  ReparacionId: number;
}

const ListaReparaciones = () => {
  const [reparaciones, setReparaciones] = useState<IReparacionDB[]>([]);

  const dropMenuFilter = useFiltersTables();

  useEffect(() => {
    handleGetReparaciones();
  }, []);

  const handleGetReparaciones = async () => {
    const reparacionesDB: IReparacionDB[] = await (
      await conn
    ).query(`
      select
	      reparaciones.id as ReparacionId,
        ReparacionFecha,
        ClienteNombre,
        ReparacionMotivo,
        MaqNombre,
        MaquinaLote,
        ClienteTelefono,
        ReparacionEntrega,
        ReparacionDescripcion
      from reparaciones
      inner join ${"`users-permissions_user`"} as user on user.id = ReparacionCliente
      inner join maquinas on maquinas.id = ReparacionMaquina
      inner join maquinasnombres on MaquinaNombre = maquinasnombres.id
      where ReparacionCompletada = false
      ORDER BY ReparacionEntrega desc;
    `);

    setReparaciones(reparacionesDB);
  };

  const columns: ColumnsType<IReparacionDB> = [
    {
      title: "ID REPARACION",
      ...dropMenuFilter("ReparacionId"),
      dataIndex: "ReparacionId",
    },
    {
      title: "CLIENTE",
      ...dropMenuFilter("ClienteNombre"),
      dataIndex: "ClienteNombre",
    },
    {
      title: "TELEFONO CLIENTE",
      ...dropMenuFilter("ClienteTelefono"),
      dataIndex: "ClienteTelefono",
    },
    {
      title: "MAQUINA",
      ...dropMenuFilter("MaqNombre"),
      dataIndex: "MaqNombre",
    },
    {
      title: "FECHA DE INGRESO",
      dataIndex: "ReparacionFecha",
      render: (value: Date, record) => {
        return moment(value).format("L");
      },
    },
    {
      title: "DES REPARACION",
      dataIndex: "ReparacionDescripcion",
    },
    {
      title: "FECHA DE ENTREGA",
      dataIndex: "ReparacionEntrega",
      render: (value: Date, record) => {
        return moment(value).format("L");
      },
    },
    {
      title: "TIEMPO",
      key: "ReparacionEntrega",
      dataIndex: "ReparacionEntrega",
      render: (value: Date, record) => {
        let color =
          moment(value).format("L") < moment().format("L") ? "red" : "green";

        let mensaje =
          moment(value).format("L") < moment().format("L")
            ? "RETRASADA"
            : "A TIEMPO";

        return <Tag color={color}>{mensaje}</Tag>;
      },
    },
  ];

  return (
    <div className="container">
      <Title className="text-center">REPARACIONES EN COLA</Title>

      <div className="row mt-5">
        <div className="col-md-12">
          <Table columns={columns} dataSource={reparaciones} />
        </div>
      </div>
    </div>
  );
};

export default ListaReparaciones;
