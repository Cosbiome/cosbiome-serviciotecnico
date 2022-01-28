import { Error } from "@material-ui/icons";
import { Form, Input, List, notification, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import Title from "antd/lib/typography/Title";
import moment from "moment";
import { useState } from "react";
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
  ReparacionDescripcion: string;
}

const ScannerMaquina = () => {
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

  const [form] = Form.useForm();

  const handleScanMaqForBarCode = async (values: { resultScan: string }) => {
    try {
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
        inner join  ${"`users-permissions_user`"} as user on user.id = MaquinaCliente
        where maquinas.id = ${values.resultScan};
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
          ReparacionCompletada,
          ReparacionDescripcion
        from reparaciones
        where ReparacionMaquina = ${values.resultScan};
      `);

      if (maquinaDB.length > 0) {
        setReparaciones(reparacionesDB);
        setMaquina(maquinaDB[0]);
      } else {
        notification.open({
          message: "MAQUINA NO ECONTRADA",
          description:
            "ESTA MAQUINA NO EXITE YA SEA POR QUE NO SE A REGISTRADO O ES DE OTRA EMPRESA",
          icon: <Error />,
        });

        setMaquina({
          MaqNombre: "",
          ClienteNombre: "",
          ClienteDireccion: "",
          ClienteEstado: "",
          ClienteTelefono: "",
          MaquinaLote: 0,
          MaquinaId: 0,
          MaquinaGarantia: new Date(),
        });

        setReparaciones([]);
      }

      form.resetFields();
    } catch (error) {}
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
      title: "DES REPARACION",
      dataIndex: "ReparacionDescripcion",
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
      <Title className="text-center">ESCANEO DE MAQUINAS COSBIOME</Title>

      <div className="row mt-5">
        <div className="col-md-12">
          <Form
            name="scanner maquina"
            layout="vertical"
            form={form}
            onFinish={handleScanMaqForBarCode}
          >
            <Form.Item
              label="ESCANER CODIGO DE BARRAS"
              name="resultScan"
              rules={[
                {
                  required: true,
                  message: "Es necesario agregar un id de maquina a escanear",
                },
              ]}
            >
              <Input onCopy={() => console.log("asdsad")} type="number" />
            </Form.Item>
          </Form>
        </div>
      </div>

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

export default ScannerMaquina;
