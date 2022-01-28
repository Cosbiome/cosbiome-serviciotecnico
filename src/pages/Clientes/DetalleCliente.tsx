import { Button, List, Space, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import moment from "moment";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import { IClientesDB } from "../../@types";
import useFiltersTables from "../../hooks/useFiltersTables";
import { connection as conn } from "../../lib/DataBase";

interface IMaquinasDetalleCLiente {
  MaquinaId: number;
  MaquinaReparacion: number;
  MaquinaLote: number;
  MaqNombre: string;
}

const DetalleCliente = () => {
  const [dataCliente, setDataCliente] = useState<IClientesDB[]>([]);
  const [maquinasCliente, setMaquinasClientes] = useState<
    IMaquinasDetalleCLiente[]
  >([]);

  const params = useParams<{ id: string }>();
  const dropMenuFilter = useFiltersTables();
  const history = useHistory();

  useEffect(() => {
    handleGetClientOnDataBase();
    // eslint-disable-next-line
  }, []);

  const handleGetClientOnDataBase = async () => {
    const clienteDB: IClientesDB[] = await (
      await conn
    ).query(`
      SELECT * FROM ${"`users-permissions_user`"} as user WHERE user.id = ${
      params.id
    }
    `);

    const maquinasClienteDB: IMaquinasDetalleCLiente[] = await (
      await conn
    ).query(`
      select
        maquinas.id as MaquinaId,
        MaqNombre,
        MaquinaReparacion,
        MaquinaLote
      from maquinas
      inner join ${"`users-permissions_user`"} as user on user.id = MaquinaCLiente
      inner join maquinasnombres on MaquinaNombre = maquinasnombres.id
      where user.id = ${params.id};
    `);

    setMaquinasClientes(maquinasClienteDB);
    setDataCliente(clienteDB);
  };

  const columns: ColumnsType<IMaquinasDetalleCLiente> = [
    {
      title: "ID MAQUINA",
      ...dropMenuFilter("MaquinaId"),
      dataIndex: "MaquinaId",
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
      <h1 className="text-center">DETALLE DEL CLIENTE</h1>

      <div className="row mt-5">
        <div className="col-md-12">
          {dataCliente.length > 0 && (
            <List
              header="DETALLE DEL CLIENTE"
              footer={`COSBIOME @${moment().get("year")}`}
              bordered
              dataSource={Object.keys(dataCliente[0])}
              renderItem={(item: string) => {
                if (typeof dataCliente[0][item] === "object") {
                  return (
                    <List.Item>{`${item}: ${moment(dataCliente[0][item]).format(
                      "L"
                    )}`}</List.Item>
                  );
                } else {
                  return (
                    <List.Item>{`${item}: ${dataCliente[0][
                      item
                    ].toString()}`}</List.Item>
                  );
                }
              }}
            />
          )}
        </div>
      </div>

      <div className="row mt-5">
        <div className="col-md-12">
          <h4>MAQUINAS DEL CLIENTE</h4>

          <Table bordered columns={columns} dataSource={maquinasCliente} />
        </div>
      </div>
    </div>
  );
};

export default DetalleCliente;
