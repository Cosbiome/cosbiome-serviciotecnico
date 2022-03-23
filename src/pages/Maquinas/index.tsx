import { Button, Space, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import Title from "antd/lib/typography/Title";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import useFiltersTables from "../../hooks/useFiltersTables";
import { connection as conn } from "../../lib/DataBase";

interface IMaquinasDetalleCLiente {
  MaquinaId: number;
  MaquinaReparacion: number;
  MaquinaLote: number;
  MaqNombre: string;
  ClienteNombre: string;
  ClienteTelefono: string;
}

const Maquinas = () => {
  const [maquinas, setMaquinas] = useState<IMaquinasDetalleCLiente[]>([]);

  const dropMenuFilter = useFiltersTables();
  const history = useHistory();

  useEffect(() => {
    handleGetMaquinas();
  }, []);

  const handleGetMaquinas = async () => {
    const maquinasDB = await (
      await conn
    ).query(`
        select
            maquinas.id as MaquinaId,
            MaqNombre,
            MaquinaReparacion,
            MaquinaLote,
            ClienteNombre,
            ClienteTelefono
        from maquinas
        inner join ${"`users-permissions_user`"} as user on user.id = MaquinaCLiente
        inner join maquinasnombres on MaquinaNombre = maquinasnombres.id
        ORDER BY ClienteNombre;
    `);

    setMaquinas(maquinasDB);
  };

  const columns: ColumnsType<IMaquinasDetalleCLiente> = [
    {
      title: "ID MAQUINA",
      ...dropMenuFilter("MaquinaId"),
      dataIndex: "MaquinaId",
    },
    {
      title: "CLIENTE",
      ...dropMenuFilter("ClienteNombre"),
      dataIndex: "ClienteNombre",
    },
    {
      title: "TELFONO CLIENTE",
      ...dropMenuFilter("ClienteTelefono"),
      dataIndex: "ClienteTelefono",
    },

    {
      title: "MAQUINA",
      ...dropMenuFilter("MaqNombre"),
      dataIndex: "MaqNombre",
    },
    {
      title: "REPARACION",
      dataIndex: "MaquinaReparacion",
      render: (value: number, record) => {
        if (value === 0) {
          return "NO";
        } else {
          return "SI";
        }
      },
    },
    {
      title: "LOTE",
      ...dropMenuFilter("MaquinaLote"),
      dataIndex: "MaquinaLote",
    },
    {
      title: "Detalle",
      key: "action",
      render: (text: any, record) => (
        <Space size="middle">
          <Button
            onClick={() => {
              history.push("/maquinas/detalle/" + record.MaquinaId);
            }}
            type="primary"
          >
            DETALLE DE LA MAQUINA
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="container">
      <Title className="text-center">MAQUINAS GENERALES COSBIOME</Title>

      <div className="row mt-5">
        <div className="col-md-12">
          <Table
            className="text-center"
            columns={columns}
            dataSource={maquinas}
          />
        </div>
      </div>
    </div>
  );
};

export default Maquinas;
