import { Form, Input, Button } from "antd";
import Title from "antd/lib/typography/Title";
import { remote } from "electron";
import { useHistory } from "react-router";
import useHttp from "../hooks/useHttp";

const Login = () => {
  const history = useHistory();
  const [form] = Form.useForm();
  const { login } = useHttp();

  const onFinish = async (values: any) => {
    try {
      let data = await login("auth/local", values);

      new remote.Notification({
        title: "BIENVENIDO AL SISTEMA",
        body: values.identifier,
      }).show();

      let token = data.user;
      localStorage.setItem("userData", JSON.stringify(token));
      localStorage.setItem("token", data.jwt);

      history.push("/menu");
    } catch (error) {
      new remote.Notification({
        title: "ERROR AL INCIAR SESION",
        body: "USUARIO O CONTRASEÑA MAL ESCRITOS",
      }).show();
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="container pt-5">
      <Title className="text-center">COSBIOME SERVICIOS TECNICOS</Title>

      <div className="row mt-5">
        <div className="col-md-12">
          <Form
            name="basic"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            form={form}
            layout="vertical"
          >
            <Form.Item
              label="Usuario"
              name="identifier"
              rules={[
                { required: true, message: "Ingresa tu usuario por favor" },
              ]}
            >
              <Input autoFocus={true} />
            </Form.Item>

            <Form.Item
              label="Contraseña"
              name="password"
              rules={[
                { required: true, message: "Ingresa tu contraseña por favor" },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                INCIAR SESION
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
