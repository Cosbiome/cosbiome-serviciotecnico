import Table, { ColumnsType } from "antd/lib/table";
import Title from "antd/lib/typography/Title";
import { useHistory, useParams } from "react-router";
import { IFormAddMaqLote, IMaqNombres, IMaquinasPorLote } from "../../@types";
import useFiltersTables from "../../hooks/useFiltersTables";
import { useEffect, useState } from "react";
import { connection as conn } from "../../lib/DataBase";
import { Button, Form, Input, Select, Space, Switch } from "antd";
import { Pie } from "@ant-design/charts";
import { Add, Minimize } from "@material-ui/icons";
const { Option } = Select;

const DetalleLote = () => {
  const [maquinas, setMaquinas] = useState<IMaquinasPorLote[]>([]);
  const [conteos, setConteos] = useState<
    { MaqNombre: string; TOTAL: number }[]
  >([]);
  const [namesMaqsm, setNamesMaqs] = useState<IMaqNombres[]>([]);
  const [sutrido, setSurtido] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const dropMenuFilter = useFiltersTables();
  const history = useHistory();
  const params = useParams<{ id: string }>();
  const [form] = Form.useForm();

  useEffect(() => {
    handleGetMaquinasRequisicion();
    handleGetNamesMaq();
    // eslint-disable-next-line
  }, []);

  const handleGetNamesMaq = async () => {
    const maqs: IMaqNombres[] = await (
      await conn
    ).query(`

      SELECT * FROM maquinasnombres;

    `);

    setNamesMaqs(maqs);
  };

  const handleGetMaquinasRequisicion = async () => {
    try {
      const result: IMaquinasPorLote[] = await (
        await conn
      ).query(`
        SELECT                 
            MaquinaId,
            MaquinaReparacion,
            MaqNombre,
            ClienteNombre,
            MaquinaEntradaReparacion,                
            MaquinaGarantia,
            ClienteTelefono,
            ClienteEstado,
            MaquinaIdLote,
            LoteId,
            MaquinaRevisada
        FROM maquinas 
        INNER JOIN clientes ON ClienteId = MaquinaCliente
        INNER JOIN lotes ON LoteId = MaquinaLote
        INNER JOIN maquinasnombres ON MaqId = MaquinaNombre
        WHERE LoteId = ${params.id}
        ORDER BY MaqNombre ASC;
      `);

      const resultCharts: { MaqNombre: string; TOTAL: number }[] = await (
        await conn
      ).query(`
        SELECT
          MaqNombre,
          COUNT(*) AS 'TOTAL'
        FROM maquinas
        INNER JOIN lotes ON LoteId = MaquinaLote
        INNER JOIN maquinasnombres ON MaquinaNombre = MaqId
        WHERE LoteId = ${params.id}
        GROUP BY MaqNombre;
      `);

      const surt = await (
        await conn
      ).query(`
        select LoteSurtido from lotes 
        where LoteId = ${params.id};
      `);

      setSurtido(surt[0].LoteSurtido === 1 ? true : false);

      setMaquinas(result);
      setConteos(resultCharts);
    } catch (error) {}
  };

  const onFinish = async (values: IFormAddMaqLote) => {
    try {
      values.maquinas.forEach(async (a) => {
        for (let i = 0; i < parseInt(a.cantidad); i++) {
          await (
            await conn
          ).query(`
            INSERT INTO maquinas (
                MaquinaNombre,
                MaquinaDescripcion,
                MaquinaLote,
                MaquinaCliente,
                MaquinaIdLote
            ) VALUES(
                ${a.nombre},
                'LLEGO EN BUEN ESTADO',
                ${params.id},
                1,
                ${i + 1}
            );
          `);
        }
      });

      setTimeout(async () => {
        await (
          await conn
        ).query(`
          UPDATE lotes SET LoteSurtido = true 
          WHERE LoteId = ${params.id};
        `);

        handleGetMaquinasRequisicion();
        form.resetFields();
      }, 2000);
    } catch (error) {}
  };

  const columns: ColumnsType<IMaquinasPorLote> = [
    {
      title: "ID Maquina",
      ...dropMenuFilter("LoteId"),
      dataIndex: "MaquinaId",
      render: (value: number) => {
        return value + "M";
      },
    },
    {
      title: "ID Maquina en lote",
      ...dropMenuFilter("MaquinaIdLote"),
      dataIndex: "MaquinaIdLote",
      render: (value: number, tar) => {
        return tar.LoteId.toString() + tar.MaquinaId.toString() + value + "ML";
      },
    },
    {
      title: "Maquina",
      ...dropMenuFilter("MaqNombre"),
      dataIndex: "MaqNombre",
    },
    {
      title: "Cliente",
      ...dropMenuFilter("ClienteNombre"),
      dataIndex: "ClienteNombre",
    },
    {
      title: "Telefono",
      dataIndex: "ClienteTelefono",
    },
    {
      title: "Reparacion",
      dataIndex: "MaquinaReparacion",
      render: (value: number) => {
        return value === 1 ? "Si" : "No";
      },
    },
    {
      title: "Revisada",
      key: "MaquinaRevisada",
      dataIndex: "MaquinaRevisada",
      render: (text: any, record) => {
        return (
          <Switch
            disabled={isLoading}
            checked={record.MaquinaRevisada === 0 ? false : true}
            onChange={() => {
              setIsLoading(true);
              if (record.MaquinaRevisada === 0) {
                (async () => {
                  await (
                    await conn
                  ).query(`
                  UPDATE maquinas SET MaquinaRevisada = 1 
                  WHERE MaquinaId = ${record.MaquinaId};
                `);

                  setIsLoading(false);
                  handleGetMaquinasRequisicion();
                })();
              } else {
                (async () => {
                  await (
                    await conn
                  ).query(`
                  UPDATE maquinas SET MaquinaRevisada = 0 
                  WHERE MaquinaId = ${record.MaquinaId};
                `);
                  setIsLoading(false);
                  handleGetMaquinasRequisicion();
                })();
              }
            }}
          />
        );
      },
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

  const config = {
    appendPadding: 10,
    data: conteos,
    angleField: "TOTAL",
    colorField: "MaqNombre",
    radius: 1,
    label: {
      type: "outer",
      content: "{name} {percentage}",
    },
    interactions: [{ type: "pie-legend-active" }, { type: "element-active" }],
  };

  return (
    <div className="container">
      <Title className="text-center">DETALLE DEL LOTE: {params.id}</Title>

      <div className="row mt-5">
        <div className="col-md-12">
          <Title level={3} type="success">
            AGREGAR MAQUINAS AL LOTE
          </Title>
          <Form
            form={form}
            name="dynamic_form_nest_item"
            onFinish={onFinish}
            autoComplete="on"
          >
            <Form.List name="maquinas">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, fieldKey, ...restField }) => (
                    <Space
                      key={key}
                      style={{ display: "flex", marginBottom: 8 }}
                      align="baseline"
                    >
                      <Form.Item
                        {...restField}
                        name={[name, "nombre"]}
                        fieldKey={[name, "nombre"]}
                        rules={[
                          { required: true, message: "Missing first name" },
                        ]}
                      >
                        <Select style={{ width: "450px" }} placeholder="Nombre">
                          {namesMaqsm.map((maq) => {
                            return (
                              <Option value={maq.MaqId}>{maq.MaqNombre}</Option>
                            );
                          })}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "cantidad"]}
                        fieldKey={[name, "cantidad"]}
                        rules={[
                          { required: true, message: "Missing last name" },
                        ]}
                      >
                        <Input placeholder="Cantidad" type="number" />
                      </Form.Item>
                      <Minimize
                        style={{ cursor: "pointer" }}
                        onClick={() => remove(name)}
                      />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<Add />}
                    >
                      Add field
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
            <Form.Item>
              <Button disabled={sutrido} type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      <div className="row mt-5">
        <div className="col-md-12">
          <Table bordered columns={columns} dataSource={maquinas} />
        </div>
      </div>

      <div className="row mt-5 mb-5">
        <div className="col-md-12">
          <Pie {...config} />
        </div>
      </div>
    </div>
  );
};

export default DetalleLote;
