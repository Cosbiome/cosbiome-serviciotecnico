import { AutoComplete, Button, DatePicker, Form } from "antd";
import Title from "antd/lib/typography/Title";
import { connection as conn } from "../../lib/DataBase";
import { remote } from "electron";
import { useEffect, useState } from "react";
import moment from "moment";
import useHttp from "../../hooks/useHttp";

interface IOptionsAuto {
  label: string;
  value: number;
}
interface IAsignacionMaquina {
  maquina: number;
  cliente: number;
  garantia: string;
}

interface ClienteBasicModel {
  ClienteId: number;
  ClienteNombre: string;
}

interface MaquinaBasicModel {
  MaquinaId: number;
  MaqNombre: string;
}

const AsignarCliente = () => {
  const [clientes, setClientes] = useState<ClienteBasicModel[]>([]);
  const [maquinas, setMaquinas] = useState<MaquinaBasicModel[]>([]);
  const [optionsC, setOptionsC] = useState<IOptionsAuto[]>([]);
  const [optionsM, setOptionsM] = useState<IOptionsAuto[]>([]);

  const [form] = Form.useForm();
  const { update } = useHttp();

  useEffect(() => {
    handleGetClientesMaquinas();
  }, []);

  const onFinish = async (values: IAsignacionMaquina) => {
    try {
      await (
        await conn
      ).query(`
        UPDATE maquinas SET 
          MaquinaCliente = ${values.cliente},
          MaquinaEntrega = '${moment().format("YY-MM-DD")}',
          MaquinaGarantia = '${moment(values.garantia).format("YY-MM-DD")}'
        WHERE maquinas.id = ${values.maquina};
      `);

      new remote.Notification({
        title: "ASGINACION DE MAQUINA EXITOSA",
        body: `MAQUINA NO. ${values.maquina} ASIGNADA AL CLIENTE ${
          clientes.filter((a) => a.ClienteId === values.cliente)[0]
            .ClienteNombre
        }`,
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
        FROM  ${"`users-permissions_user`"} as user
        WHERE  user.id != 1
        ORDER BY ClienteNombre;
    `);

    const maquinasDB: MaquinaBasicModel[] = await (
      await conn
    ).query(`
        select
            maquinas.id as MaquinaId,
            MaqNombre
        from maquinas
        inner join ${"`users-permissions_user`"} as user on user.id = MaquinaCLiente
        inner join maquinasnombres on MaquinaNombre = maquinasnombres.id
        where user.id = 1
        order by MaqNombre;
    `);

    setOptionsC(
      clientesDB.map((a) => {
        return {
          label: a.ClienteNombre,
          value: a.ClienteId,
        };
      })
    );
    setOptionsM(
      maquinasDB.map((a) => {
        return {
          label: `${a.MaqNombre} - ${a.MaquinaId}`,
          value: a.MaquinaId,
        };
      })
    );

    setMaquinas(maquinasDB);
    setClientes(clientesDB);
  };

  const handleSearchCliente = (searchText: string) => {
    setOptionsC(
      !searchText
        ? clientes.map((a) => {
            return {
              label: a.ClienteNombre,
              value: a.ClienteId,
            };
          })
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
        ? maquinas.map((a) => {
            return {
              label: `${a.MaqNombre} - ${a.MaquinaId}`,
              value: a.MaquinaId,
            };
          })
        : maquinas
            .filter((a) =>
              a.MaqNombre.toLowerCase().trim().includes(searchText)
            )
            .map((a) => {
              return {
                label: `${a.MaqNombre} - ${a.MaquinaId}`,
                value: a.MaquinaId,
              };
            })
    );
  };

  return (
    <div className="container">
      <Title className="text-center"> ASIGNAR MAQUINA A CLIENTE </Title>

      <div className="row mt-5">
        <div className="col-md-12">
          <Form
            name="creacionlote"
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
              <AutoComplete onSearch={handleSearchCliente} options={optionsC} />
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
              label="FECHA DE GARANTIA"
              name="garantia"
              rules={[
                {
                  required: true,
                  message:
                    "Es necesario agregar la fecha de garantia de la maquina",
                },
              ]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                ASIGNAR MAQUINA
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AsignarCliente;
