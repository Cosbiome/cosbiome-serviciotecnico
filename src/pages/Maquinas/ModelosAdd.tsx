import Title from "antd/lib/typography/Title";
import { Button, Form, Input, Select } from "antd";
import { connection as conn } from "../../lib/DataBase";
import { remote } from "electron";
import { useEffect, useState } from "react";
import useHttp from "../../hooks/useHttp";
interface IModeloAdd {
  modelo: string;
  clas: number;
}

const ModelosAdd = () => {
  const [clasificaciones, setClasificaciones] = useState<any[]>([]);

  const [form] = Form.useForm();
  const { post } = useHttp();

  useEffect(() => {
    handleGetClas();
  }, []);

  const handleGetClas = async () => {
    const clasi: any[] = await (
      await conn
    ).query(`

      select * from clasificacionesmaquinas;

    `);

    setClasificaciones(clasi);
  };

  const onFinish = async (values: IModeloAdd) => {
    try {
      // const result = await (await conn).query(`
      //   INSERT INTO maquinasnombres (MaqNombre, MaqClasificacion) VALUES(
      //     '${values.modelo}',
      //     '${values.clas}'
      //   );
      // `);

      await post("maquinasnombres", {
        MaqNombre: values.modelo,
        MaqClasificacion: values.clas,
      });

      new remote.Notification({
        title: "MODELO CREADO EXITOSAMENTE",
        body: `NUMERO DEL MODELO: ${values.modelo}`,
      }).show();

      form.resetFields();

      console.log(values);
    } catch (error) {
      new remote.Notification({
        title: "ERROR AL CREAR EL MODELO COMUNICA A SISTEMAS",
        body: `ERROR DE CREACION DE MODELO`,
      }).show();
      console.log(error);
    }
  };

  return (
    <div className="container">
      <Title className="text-center">AGREGAR MODELOS DE MAQUINAS</Title>

      <div className="row mt-5">
        <div className="col-md-12">
          <Form
            name="creacionlote"
            onFinish={onFinish}
            form={form}
            layout="vertical"
          >
            <Form.Item
              label="Nombre Del Modelo"
              name="modelo"
              rules={[
                {
                  required: true,
                  message: "Ingresa el nombre del modelo",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Clasificacion Del Modelo"
              name="clas"
              rules={[
                {
                  required: true,
                  message: "Ingresa la clasificacion de la maquinas",
                },
              ]}
            >
              <Select>
                {clasificaciones.map((cl) => {
                  return (
                    <Select.Option value={cl.id}>{cl.ClasNombre}</Select.Option>
                  );
                })}
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                CREAR MODELO
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ModelosAdd;
