import { List, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import Title from "antd/lib/typography/Title";
import moment from "moment";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { connection as conn } from "../../lib/DataBase";
interface IDetalleMaquina {
  [key: string]: any;
  MaqNombre: string;
  ClienteNombre: string;
  ClienteDireccion: string;
  ClienteEstado: string;
  ClienteTelefono: string;
  MaquinaLote: number;
  MaquinaId: number;
  MaquinaGarantia: Date;
}

interface IReparacionesDB {
  ReparacionId: number;
  ReparacionCostoInicial: number;
  ReparacionCostoTotal: number;
  ReparacionCompletada: number;
  ReparacionMotivo: string;
  ReparacionEntrega: Date;
  ReparacionFecha: Date;
}

const DetalleMaquina = () => {
  const [reparaciones, setReparaciones] = useState<IReparacionesDB[]>([]);
  const [maquina, setMaquina] = useState<IDetalleMaquina>({
    MaqNombre: "",
    ClienteNombre: "",
    ClienteDireccion: "",
    ClienteEstado: "",
    ClienteTelefono: "",
    MaquinaLote: 0,
    MaquinaId: 0,
    MaquinaGarantia: new Date(),
  });

  const params = useParams<{ id: string }>();

  useEffect(() => {
    handleGetUtilsInDataBase();

    // eslint-disable-next-line
  }, []);

  const handleGetUtilsInDataBase = async () => {
    const maquinaDB: IDetalleMaquina[] = await (
      await conn
    ).query(`
      select
        maquinas.id as MaquinaId,
	      MaqNombre,
	      MaquinaLote,
	      ClienteNombre,
	      ClienteDireccion,
	      ClienteEstado,
	      ClienteTelefono,
        MaquinaGarantia
      from maquinas
      inner join maquinasnombres on MaquinaNombre = maquinasnombres.id 
      inner join ${"`users-permissions_user`"} as user on user.id = MaquinaCliente
      where maquinas.id = ${params.id};
    `);

    const reparacionesDB: IReparacionesDB[] = await (
      await conn
    ).query(`
      select 
        reparaciones.id as ReparacionId,
        ReparacionFecha,
        ReparacionMotivo,
        ReparacionEntrega,
        ReparacionCostoInicial,
        ReparacionCostoTotal,
        ReparacionCompletada
      from reparaciones
      where ReparacionMaquina = ${params.id};
    `);

    setReparaciones(reparacionesDB);
    setMaquina(maquinaDB[0]);
  };

  const columns: ColumnsType<IReparacionesDB> = [
    {
      title: "ID REPARACION",
      dataIndex: "ReparacionId",
    },
    {
      title: "MOTIVO",
      dataIndex: "ReparacionMotivo",
    },
    {
      title: "FECHA DE INGRESO",
      dataIndex: "ReparacionFecha",
      render: (value: Date, record) => {
        return moment(value).format("L");
      },
    },
    {
      title: "FECHA DE EGRESO",
      dataIndex: "ReparacionEntrega",
      render: (value: Date, record) => {
        return moment(value).format("L");
      },
    },
    {
      title: "COSTO INICIAL",
      dataIndex: "ReparacionCostoInicial",
    },
    {
      title: "COSTO FINAL",
      dataIndex: "ReparacionCostoTotal",
    },
    {
      title: "REPARACION COMPLETADA",
      dataIndex: "ReparacionCompletada",
      render: (value: number, record) => {
        if (value === 0) {
          return "NO";
        } else {
          return "SI";
        }
      },
    },
  ];

  return (
    <div className="container">
      <Title className="text-center">DETALLE DE MAQUINA {params.id}M </Title>

      <div className="row mt-5 mb-5">
        <div className="col-md-12">
          {moment(maquina.MaquinaGarantia).diff(moment(), "days") > 0 ? (
            <Title style={{ color: "green" }} level={3}>
              {`GARANTIA DE LA MAQUINA ESTABLECIDA HASTA EL 
              ${moment(maquina.MaquinaGarantia).format("L")} DIAS RESTANTES: 
              ${moment(maquina.MaquinaGarantia).diff(moment(), "days")}`}
            </Title>
          ) : (
            <Title style={{ color: "red" }} level={3}>
              MAQUINA SIN GARANTIA
            </Title>
          )}
        </div>
      </div>

      <div className="row mt-5">
        <div className="col-md-12">
          <List
            header="DETALLE DE LA MAQUINA"
            footer={`COSBIOME @${moment().get("year")}`}
            bordered
            dataSource={Object.keys(maquina)}
            renderItem={(item: string) => {
              return (
                <List.Item>{`${item}: ${maquina[item]?.toString()}`}</List.Item>
              );
            }}
          />
        </div>
      </div>

      <div className="row mb-5 mt-5">
        <div className="col-md-12">
          <Title level={4}>REPARACIONES DE LA MAQUINA</Title>
          <Table columns={columns} dataSource={reparaciones} />
        </div>
      </div>
    </div>
  );
};

export default DetalleMaquina;
