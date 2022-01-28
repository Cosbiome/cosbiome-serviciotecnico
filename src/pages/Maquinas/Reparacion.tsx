import { AutoComplete, Button, Form, Input, Select } from "antd";
import Title from "antd/lib/typography/Title";
import { connection as conn } from "../../lib/DataBase";
import { remote } from "electron";
import { useEffect, useState } from "react";
import { PosPrintData, PosPrintOptions } from "electron-pos-printer";
import { join } from "path";
import moment from "moment";
import usePersm from "../../hooks/usePersm";
import useHttp from "../../hooks/useHttp";
const { PosPrinter } = remote.require("electron-pos-printer");

interface IOptionsAutoC {
  label: string;
  value: number;
}

interface ClienteBasicModel {
  ClienteId: number;
  ClienteNombre: string;
}

interface MaquinaBasicModel {
  MaquinaId: number;
  MaqNombre: string;
  MaquinaCliente: number;
}

interface IFormReparacion {
  cliente: number;
  maquina: number;
  costoIncial: number;
  motivo: string;
  metodo: string;
  estatus: string;
}

const Reparacion = () => {
  const [optionsC, setOptionsC] = useState<IOptionsAutoC[]>([]);
  const [clientes, setClientes] = useState<ClienteBasicModel[]>([]);
  const [maquinas, setMaquinas] = useState<MaquinaBasicModel[]>([]);
  const [maquinasFake, setMaquinasFake] = useState<MaquinaBasicModel[]>([]);
  const [optionsM, setOptionsM] = useState<IOptionsAutoC[]>([]);

  const [form] = Form.useForm();
  const { post } = useHttp();
  const { user } = usePersm();

  useEffect(() => {
    handleGetClientesMaquinas();
  }, []);

  const onFinish = async (values: IFormReparacion) => {
    try {
      values.costoIncial = parseInt(values.costoIncial.toString());
      console.log(values);

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

      // const result = await (
      //   await conn
      // ).query(`
      //   insert into reparaciones (
      //     ReparacionCliente,
      //     ReparacionMAquina,
      //     ReparacionCostoInicial,
      //     ReparacionMotivo,
      //     ReparacionMetodoPago,
      //     ReparacionEstatus
      //   ) values(
      //     ${values.cliente},
      //     ${values.maquina},
      //     ${values.costoIncial},
      //     '${values.motivo}',
      //     '${values.metodo}',
      //     '${values.estatus}'
      //   );
      // `);

      const result = await post("reparaciones", {
        ReparacionFecha: new Date().toISOString(),
        ReparacionMotivo: values.motivo,
        ReparacionEntrega: new Date().toISOString(),
        ReparacionCostoInicial: values.costoIncial,
        ReparacionCostoTotal: 0,
        ReparacionCompletada: false,
        ReparacionMetodoPago: values.metodo,
        ReparacionDescripcion: "",
        ReparacionEstatus: values.estatus,
        ReparacionCliente: values.cliente,
        ReparacionMaquina: values.maquina,
      });

      await (
        await conn
      ).query(`
        UPDATE maquinas SET MaquinaReparacion = true
        WHERE maquinas.id = ${values.maquina};
      `);

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
          value: `${
            clientes.filter((a) => a.ClienteId === values.cliente)[0]
              .ClienteNombre
          } - 3335607808`,
          style: `text-align:center; margin-top: 10px`,
        },
        {
          type: "text",
          value: `Operador: ${user}`,
          style: `text-align:center; margin-top: 10px`,
        },
        {
          type: "text",
          value: `TICKET NO. ${result.id}`,
          style: `text-align:center; margin-top: 10px`,
        },
        {
          type: "text",
          value: `MAQUINA EN REAPARACION: ${
            maquinas.filter((a) => a.MaquinaId === values.maquina)[0].MaqNombre
          }`,
          style: `text-align:center; margin-top: 30px`,
        },
        {
          type: "text",
          value: `MOTIVO<br/>${values.motivo}`,
          style: `text-align:center; margin-top: 10px`,
        },
        {
          type: "text",
          value: `COSTO DE REVISION<br/>${values.costoIncial}$`,
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
          value: `${
            clientes.filter((a) => a.ClienteId === values.cliente)[0]
              .ClienteNombre
          } - 3335607808`,
          style: `text-align:center; margin-top: 10px`,
        },
        {
          type: "text",
          value: `Operador: ${user}`,
          style: `text-align:center; margin-top: 10px`,
        },
        {
          type: "text",
          value: `TICKET NO. ${result.id}`,
          style: `text-align:center; margin-top: 10px`,
        },
        {
          type: "text",
          value: `MAQUINA EN REAPARACION: ${
            maquinas.filter((a) => a.MaquinaId === values.maquina)[0].MaqNombre
          }`,
          style: `text-align:center; margin-top: 30px`,
        },
        {
          type: "text",
          value: `MOTIVO<br/>${values.motivo}`,
          style: `text-align:center; margin-top: 10px`,
        },
        {
          type: "text",
          value: `COSTO DE REVISION<br/>${values.costoIncial}$`,
          style: `text-align:center; margin-top: 10px`,
        },
      ];

      await PosPrinter.print(data, options);
      await PosPrinter.print(dataCliente, options);

      new remote.Notification({
        title: "REPARACION AGENDADA EXITOSAMENTE",
        body: `ID DE REPARACION: ${result.id}`,
      }).show();

      handleGetClientesMaquinas();

      form.resetFields();
    } catch (error) {
      new remote.Notification({
        title: "ERROR AL CREAR EL MODELO COMUNICA A SISTEMAS",
        body: `ERROR DE CREACION DE MODELO`,
      }).show();
      console.log(error);
    }
  };

  const handleGetClientesMaquinas = async () => {
    const clientesDB: ClienteBasicModel[] = await (
      await conn
    ).query(`
      SELECT
          user.id as ClienteId,
          ClienteNombre
      FROM ${"`users-permissions_user`"} as user
      WHERE user.id != 1
      ORDER BY ClienteNombre;
    `);

    const maquinasDB: MaquinaBasicModel[] = await (
      await conn
    ).query(`
      select
          maquinas.id as MaquinaId,
          MaqNombre,
          MaquinaCliente
      from maquinas
      inner join ${"`users-permissions_user`"} as user on user.id = MaquinaCLiente
      inner join maquinasnombres on MaquinaNombre = maquinasnombres.id
      where user.id  != 1 AND MaquinaReparacion = false
      order by MaqNombre;
    `);

    setOptionsC(
      clientesDB.map((a) => {
        return {
          value: a.ClienteId,
          label: a.ClienteNombre,
        };
      })
    );

    setMaquinas(maquinasDB);
    setClientes(clientesDB);
  };

  const handleSearchCliente = (searchText: string) => {
    setOptionsC(
      !searchText
        ? []
        : clientes
            .filter((a) =>
              a.ClienteNombre.toLowerCase().trim().includes(searchText)
            )
            .map((a) => {
              return {
                value: a.ClienteId,
                label: a.ClienteNombre,
              };
            })
    );
  };

  const handleSearchMaquina = (searchText: string) => {
    setOptionsM(
      !searchText
        ? []
        : maquinasFake
            .filter((a) =>
              a.MaqNombre.toLowerCase().trim().includes(searchText)
            )
            .map((a) => {
              return {
                label: a.MaqNombre,
                value: a.MaquinaId,
              };
            })
    );
  };

  const handleSelectCliente = (data: number | string) => {
    setMaquinasFake(maquinas.filter((a) => a.MaquinaCliente === data));
    setOptionsM(
      maquinas
        .filter((a) => a.MaquinaCliente === data)
        .map((a) => {
          return {
            value: a.MaquinaId,
            label: a.MaqNombre,
          };
        })
    );
  };

  return (
    <div className="container">
      <Title className="text-center">ENTRADA A REPARACION</Title>

      <div className="row mt-5">
        <div className="col-md-12">
          <Form
            name="creacionlote"
            initialValues={{
              costoIncial: 0,
              metodo: "CONTADO",
            }}
            onFinish={onFinish}
            form={form}
            layout="vertical"
          >
            <Form.Item
              label="CLIENTE"
              name="cliente"
              rules={[
                {
                  required: true,
                  message: "Es necesario agregar el cliente a asignar",
                },
              ]}
            >
              <AutoComplete
                onSelect={handleSelectCliente}
                onSearch={handleSearchCliente}
                options={optionsC}
              />
            </Form.Item>

            <Form.Item
              label="MAQUINA"
              name="maquina"
              rules={[
                {
                  required: true,
                  message: "Es necesario agregar la maquina a asignar",
                },
              ]}
            >
              <AutoComplete onSearch={handleSearchMaquina} options={optionsM} />
            </Form.Item>

            <Form.Item
              label="COSTO INICIAL"
              name="costoIncial"
              rules={[
                {
                  required: true,
                  message: "Es necesario agregar el costo inicial",
                },
              ]}
            >
              <Input type="number" />
            </Form.Item>

            <Form.Item
              label="ESTATUS"
              name="estatus"
              rules={[
                {
                  required: true,
                  message: "Es necesario agregar el estatus de reparacion",
                },
              ]}
            >
              <Select>
                <Select.Option value="REPARACION">REPARACION</Select.Option>
                <Select.Option value="MANTENIMIENTO">
                  MANTENIMIENTO
                </Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="METODO DE PAGO"
              name="metodo"
              rules={[
                {
                  required: true,
                  message: "Es necesario agregar el costo inicial",
                },
              ]}
            >
              <Select>
                <Select.Option value="CONTADO">CONTADO</Select.Option>
                <Select.Option value="MERCADO PAGO">MERCADO PAGO</Select.Option>
                <Select.Option value="TRANSFERENCIA">
                  TRANSFERENCIA
                </Select.Option>
                <Select.Option value="DESPOSITO BANCARIO">
                  DESPOSITO BANCARIO
                </Select.Option>
                <Select.Option value="TARJETA">TARJETA</Select.Option>
                <Select.Option value="3 MESES">3 MESES</Select.Option>
                <Select.Option value="6 MESES">6 MESES</Select.Option>
                <Select.Option value="1 2MESES">12 MESES</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="MOTIVO DE LA REPARACION"
              name="motivo"
              rules={[
                {
                  required: true,
                  message:
                    "Es necesario agregar el motivo por el cual se hace la reparacion",
                },
              ]}
            >
              <Input.TextArea />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                ASIGNAR REPARACION
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Reparacion;
