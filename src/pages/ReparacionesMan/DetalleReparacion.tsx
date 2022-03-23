import { Button, Form, Input, List, Space, Spin } from "antd";
import Title from "antd/lib/typography/Title";
import moment from "moment";
import { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { connection as conn } from "../../lib/DataBase";
import { remote } from "electron";
import { PosPrintData, PosPrintOptions } from "electron-pos-printer";
import { join } from "path";
import TextArea from "antd/lib/input/TextArea";
import usePersm from "../../hooks/usePersm";
const { PosPrinter } = remote.require("electron-pos-printer");

interface IDetalleReparacion {
  [key: string]: any;
  MaqNombre: string;
  ClienteTelefono: string;
  ClienteNombre: string;
  ClienteDireccion: string;
  ReparacionCostoTotal: number;
  ReparacionMotivo: string;
  ReparacionCostoInicial: number;
  MaquinaId: number;
  ReparacionId: number;
  ReparacionFecha: Date;
  ReparacionEntrega: Date;
  ReparacionMetodoPago: string;
  ReparacionCompletada: number;
  ReparacionDescripcion: string;
}

const DetalleReparacion = () => {
  const [reparacion, setReparacion] = useState<IDetalleReparacion>({
    MaqNombre: "",
    ClienteTelefono: "",
    ClienteNombre: "",
    ClienteDireccion: "",
    ReparacionMotivo: "",
    ReparacionCostoTotal: 0,
    ReparacionCostoInicial: 0,
    MaquinaId: 0,
    ReparacionId: 0,
    ReparacionFecha: new Date(),
    ReparacionEntrega: new Date(),
    ReparacionMetodoPago: "",
    ReparacionCompletada: 0,
    ReparacionDescripcion: "",
  });

  const params = useParams<{ id: string }>();
  const history = useHistory();
  const { user } = usePersm();
  const [form] = Form.useForm();

  useEffect(() => {
    handleGetReparacion();
    // eslint-disable-next-line
  }, []);

  const handleGetReparacion = async () => {
    const reparacionDB: IDetalleReparacion[] = await (
      await conn
    ).query(`
      select 
        reparaciones.id as ReparacionId,
	      ReparacionFecha,
	      ReparacionCostoInicial,
	      ReparacionCostoTotal,
        ReparacionMotivo,
	      ClienteNombre,
	      ClienteDireccion,
	      ClienteTelefono,
	      maquinas.id as MaquinaId,
	      MaqNombre,
        ReparacionEntrega,
        ReparacionMetodoPago,
        ReparacionCompletada,
        ReparacionDescripcion
      from reparaciones
      inner join ${"`users-permissions_user`"} as user on user.id = ReparacionCliente
      inner join maquinas on maquinas.id = ReparacionMaquina
      inner join maquinasnombres on MaquinaNombre = maquinasnombres.id
      where reparaciones.id = ${params.id};
    `);

    setReparacion(reparacionDB[0]);
  };

  const onFinish = async (values: {
    total: string;
    fecha: string;
    motivo: string;
    diagnostico: number;
  }) => {
    try {
      const options: PosPrintOptions = {
        preview: false, // Preview in window or print
        width: "300px", //  width of content body
        margin: "0 0 0 0", // margin of content body
        copies: 1, // Number of copies to print
        printerName: "TM20", // printerName: string, check with webContent.getPrinters()
        timeOutPerLine: 400,
        pageSize: { height: 301000, width: 71000 }, // page size
        silent: true,
      };
      await (
        await conn
      ).query(`
        UPDATE reparaciones
        SET
          ReparacionCostoTotal = ${parseInt(values.total)},
          ReparacionEntrega = '${moment().format("YY-MM-DD")}',
          ReparacionDescripcion = '${values.motivo}',
          ReparacionCompletada = true,
          ReparacionCostoInicial = ${values.diagnostico}
        WHERE reparaciones.id = ${params.id};
      `);
      await (
        await conn
      ).query(`
        UPDATE maquinas SET MaquinaReparacion = false
        WHERE maquinas.id = ${reparacion.MaquinaId};
      `);
      new remote.Notification({
        title: "REPARACION COMPLETADA",
        body: `REPARACION NO. ${params.id} COMPLETADA`,
      }).show();
      const dataCliente: PosPrintData[] = [
        {
          type: "image",
          path: join(process.cwd(), "src/assets/ticket.png"),
          width: "190px",
        },
        {
          type: "text",
          value: "REPARACION",
          style: `text-align:center;`,
          css: { "font-weight": "700", "font-size": "18px" },
        },
        {
          type: "text",
          value: `${moment().format("L")} - ${moment().format("LTS")}`,
          style: `text-align:center; margin-top: 10px`,
        },
        {
          type: "text",
          value: `${reparacion.ClienteNombre} - 3335607808`,
          style: `text-align:center; margin-top: 10px`,
        },
        {
          type: "text",
          value: `Operador: ${user}`,
          style: `text-align:center; margin-top: 10px`,
        },
        {
          type: "text",
          value: `TICKET NO. ${params.id}`,
          style: `text-align:center; margin-top: 10px`,
        },
        {
          type: "text",
          value: `MAQUINA EN REAPARACION: ${reparacion.MaqNombre}`,
          style: `text-align:center; margin-top: 30px`,
        },
        {
          type: "text",
          value: `DESCRIPCION REPARACION<br/>${values.motivo}`,
          style: `text-align:center; margin-top: 10px`,
        },
        {
          type: "text",
          value: `COSTO TOTAL DE REPARACION<br/>${reparacion.ReparacionCostoTotal}$`,
          style: `text-align:center; margin-top: 10px`,
        },
        {
          type: "text",
          value: `<u>____________________<u/>`,
          style: `text-align:center; margin-top: 30px`,
        },
        {
          type: "text",
          value: `FIRMA DE CLIENTE`,
          style: `text-align:center;`,
        },
      ];
      const data: PosPrintData[] = [
        {
          type: "image",
          path: join(process.cwd(), "src/assets/ticket.png"),
          width: "190px",
        },
        {
          type: "text",
          value: "REPARACION",
          style: `text-align:center;`,
          css: { "font-weight": "700", "font-size": "18px" },
        },
        {
          type: "text",
          value: `${moment().format("L")} - ${moment().format("LTS")}`,
          style: `text-align:center; margin-top: 10px`,
        },
        {
          type: "text",
          value: `${reparacion.ClienteNombre} - 3335607808`,
          style: `text-align:center; margin-top: 10px`,
        },
        {
          type: "text",
          value: `Operador: ${user}`,
          style: `text-align:center; margin-top: 10px`,
        },
        {
          type: "text",
          value: `TICKET NO. ${params.id}`,
          style: `text-align:center; margin-top: 10px`,
        },
        {
          type: "text",
          value: `MAQUINA EN REAPARACION: ${reparacion.MaqNombre}`,
          style: `text-align:center; margin-top: 30px`,
        },
        {
          type: "text",
          value: `DESCRIPCION REPARACION<br/>${values.motivo}`,
          style: `text-align:center; margin-top: 10px`,
        },
        {
          type: "text",
          value: `COSTO TOTAL DE REPARACION<br/>${reparacion.ReparacionCostoTotal}$`,
          style: `text-align:center; margin-top: 10px`,
        },
      ];
      await PosPrinter.print(data, options);
      await PosPrinter.print(dataCliente, options);
      form.resetFields();
      history.goBack();
    } catch (error) {
      new remote.Notification({
        title: "ERROR AL COMPLETAR LA REPACION",
        body: "ERROR DE COMPLETADO EN REPARACION COMUNICA A SISTEMAS",
      }).show();
      console.log(error);
    }
  };

  const handleUpdateDateTotal = async () => {
    try {
      const data: {
        total: string;
        fecha: string;
        motivo: string;
        diagnostico: number;
      } = form.getFieldsValue();

      await (
        await conn
      ).query(`
        UPDATE reparaciones
        SET
          ReparacionCostoTotal = ${parseInt(data.total)},
          ReparacionEntrega = '${moment(data.fecha).format("YY-MM-DD")}',
          ReparacionDescripcion = '${data.motivo}',
          ReparacionCostoInicial = ${data.diagnostico}
        WHERE reparaciones.id = ${params.id};
      `);
      await handleGetReparacion();

      new remote.Notification({
        title: "ESTATUS DE REPARACION ACTUALIZADO",
        body: "ESTATUS DE REPARACION ACTUALIZADO",
      }).show();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container">
      <Title className="text-center">DETALLE DE LA REPACION</Title>

      <div className="row mt-5">
        <div className="col-md-12">
          <List
            header="DETALLE DE LA REPARACION"
            footer={`COSBIOME @${moment().get("year")}`}
            bordered
            dataSource={Object.keys(reparacion)}
            renderItem={(item: string) => {
              if (typeof reparacion[item] === "object") {
                return (
                  <List.Item>{`${item}: ${moment(reparacion[item]).format(
                    "L"
                  )}`}</List.Item>
                );
              } else {
                return (
                  <List.Item>{`${item}: ${reparacion[
                    item
                  ].toString()}`}</List.Item>
                );
              }
            }}
          />
        </div>
      </div>

      {reparacion.ReparacionMotivo !== "" ? (
        <div className="row mt-5 mb-5">
          <div className="col-md-12">
            {reparacion.ReparacionCompletada === 0 && (
              <Form
                name="reparacionterminada"
                initialValues={{
                  fecha: moment(reparacion.ReparacionEntrega).format(
                    "YYYY-MM-DD"
                  ),
                  total: reparacion.ReparacionCostoTotal,
                  motivo: reparacion.ReparacionDescripcion,
                  diagnostico: reparacion.ReparacionCostoInicial,
                }}
                layout="vertical"
                form={form}
                onFinish={onFinish}
              >
                <Form.Item
                  label="COSTO DE DIAGNOSTICO"
                  name="diagnostico"
                  rules={[
                    {
                      required: true,
                      message:
                        "Es necesario agregar el total a cobrar de la reparacion",
                    },
                  ]}
                >
                  <Input
                    disabled={reparacion.ReparacionCostoInicial !== 0}
                    type="number"
                  />
                </Form.Item>
                <Form.Item
                  label="TOTAL DE LA REPARACION"
                  name="total"
                  rules={[
                    {
                      required: true,
                      message:
                        "Es necesario agregar el total a cobrar de la reparacion",
                    },
                  ]}
                >
                  <Input type="number" />
                </Form.Item>
                <Form.Item
                  label="DESCRIPCION DE LA REPARACION"
                  name="motivo"
                  rules={[
                    {
                      required: true,
                      message:
                        "Es necesario agregar el motivo de la reparacion",
                    },
                  ]}
                >
                  <TextArea />
                </Form.Item>
                <Form.Item
                  label="FECHA DE ENTREGA DE LA MAQUINA"
                  name="fecha"
                  rules={[
                    {
                      required: true,
                      message:
                        "Es necesario agregar la fecha de entrega de la reparacion",
                    },
                  ]}
                >
                  <Input type="date" />
                </Form.Item>
                <Space>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      COMPLETAR REPARACION
                    </Button>
                  </Form.Item>
                  <Form.Item>
                    <Button
                      onClick={() => handleUpdateDateTotal()}
                      type="default"
                      htmlType="button"
                    >
                      ACTUALIZAR
                    </Button>
                  </Form.Item>
                </Space>
              </Form>
            )}
          </div>
        </div>
      ) : (
        <div className="row mt-5">
          <div className="col-md-4 offset-md-4">
            <Spin />
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalleReparacion;
