import Title from "antd/lib/typography/Title";
import { Form, Input, Button } from "antd";
import { ILoteCreacion } from "../../@types";
import { connection as conn } from "../../lib/DataBase";
import { remote } from "electron";
import useHttp from "../../hooks/useHttp";

const CrearLotes = () => {
  const [form] = Form.useForm();
  const { post } = useHttp();

  const onFinish = async (values: ILoteCreacion) => {
    try {
      // const result = await (await conn).query(`
      //   INSERT INTO lotes (
      //     LoteFecha,
      //     LoteDescripcion,
      //     LoteConfirmacion
      //   ) VALUES (
      //     '${values.fecha}',
      //     '${values.descripcion}',
      //     'Pablo Rizo'
      //   );
      // `);

      const result = await post("lotes", {
        LoteFecha: new Date(values.fecha).toISOString(),
        LoteDescripcion: values.descripcion,
        LoteConfirmacion: "Pablo Rizo",
      });

      new remote.Notification({
        title: "LOTE DE MAQUINAS CREADO EXITOSA MENTE",
        body: `NUMERO DE LOTE: ${result.id}`,
      }).show();

      form.resetFields();
    } catch (error) {
      new remote.Notification({
        title: "ERROR AL CREAR EL LOTE COMUNICA A SISTEMA",
        body: `ERROR DE CREACION DE LOTE`,
      }).show();
      console.log(error);
    }
  };

  const onFinishFailed = (errorInfo: any) => {};

  return (
    <div className="container">
      <Title className="text-center">CREAR NUEVO LOTE DE MAQUINAS</Title>

      <div className="row mt-5">
        <div className="col-md-12">
          <Form
            name="creacionlote"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            form={form}
            layout="vertical"
          >
            <Form.Item
              label="Fecha de llegada"
              name="fecha"
              rules={[
                {
                  required: true,
                  message: "Ingresa la fecha de llegada del lote",
                },
              ]}
            >
              <Input type="date" />
            </Form.Item>

            <Form.Item
              label="Descripcion"
              name="descripcion"
              rules={[
                { required: true, message: "Ingresa la descripcion del lote" },
              ]}
            >
              <Input.TextArea />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                CREAR LOTE
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CrearLotes;
