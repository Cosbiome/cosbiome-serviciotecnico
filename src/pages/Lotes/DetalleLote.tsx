import Table, { ColumnsType } from "antd/lib/table";
import Title from "antd/lib/typography/Title";
import { useHistory, useParams } from "react-router";
import { IFormAddMaqLote, IMaqNombres, IMaquinasPorLote } from "../../@types";
import useFiltersTables from "../../hooks/useFiltersTables";
import { useEffect, useState } from "react";
import { connection as conn } from "../../lib/DataBase";
import { AutoComplete, Button, Form, Input, Select, Space, Switch } from "antd";
import { Pie } from "@ant-design/charts";
import { Add, Minimize } from "@material-ui/icons";
import _ from "lodash";
import Swal from "sweetalert2";
import { remote } from "electron";
import fs from "fs";
import ESCPOSLabelPrinter from "../../lib/brother-ql-810w";
const { Option } = Select;
// const printer = remote.require("printer");
const printer = remote.require("@thiagoelg/node-printer");

interface IOptionsAuto {
  label: string;
  value: string;
}

const DetalleLote = () => {
  const [maquinas, setMaquinas] = useState<IMaquinasPorLote[]>([]);
  const [conteos, setConteos] = useState<
    { MaqNombre: string; TOTAL: number }[]
  >([]);
  const [namesMaqsm, setNamesMaqs] = useState<IMaqNombres[]>([]);
  const [sutrido, setSurtido] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [optionsStikers, setOptionsStikers] = useState<IOptionsAuto[]>([]);
  const [maquinaStikerSelect, setMaquinaStikerSelect] = useState<string>("");

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

      const optionsMaquinas: IOptionsAuto[] = result.map<IOptionsAuto>(
        (maquina) => ({
          label: maquina.MaqNombre,
          value: maquina.MaqNombre,
        })
      );

      setSurtido(surt[0].LoteSurtido === 1 ? true : false);

      setMaquinas(result);
      setConteos(resultCharts);
      setOptionsStikers(optionsMaquinas);
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

  const handleSearchCliente = (searchText: string) => {
    setOptionsStikers(
      !searchText
        ? maquinas.map((a) => {
            return {
              label: a.MaqNombre,
              value: a.MaqNombre,
            };
          })
        : maquinas
            .filter((a) =>
              a.ClienteNombre.toLowerCase().trim().includes(searchText)
            )
            .map((a) => {
              return {
                label: a.MaqNombre,
                value: a.MaqNombre,
              };
            })
    );
  };

  const handleGenStikersPrint = async () => {
    const maquinasName = maquinas.filter(
      (maquina) => maquina.MaqNombre === maquinaStikerSelect
    );

    if (maquinasName.length === 0 || maquinaStikerSelect === "") {
      await Swal.fire("Error", "No se encontraron maquinas", "error");

      return 0;
    }

    console.log(printer.getPrinters()[1]);

    const instance = new ESCPOSLabelPrinter();

    instance.setESCPMode();
    instance.initialize();
    instance.setLength(200);
    instance.setFont(ESCPOSLabelPrinter.Font.LetterGothic);
    instance.setBold();
    instance.setSize(80);
    // instance.setLandscape(false)
    // instance.setBold()
    instance.setAlignment(ESCPOSLabelPrinter.Alignment.CENTER);
    instance.addText("At your side\n");
    instance.code39("846497445");
    // instance.clearCutAfterPrint()
    instance.print();
    console.log(printer);

    // printer.printDirect({
    //   data: Buffer.from(instance.encode()),
    //   printer: "etiquetas",
    //   success: function (jobID: any) {
    //     console.log("sent to printer with ID: " + jobID);
    //   },
    //   error: function (err: any) {
    //     console.log(err);
    //   },
    // });

    fs.appendFileSync("/dev/usb/lp0", Buffer.from(instance.encode()));

    // await printer.printDirect({
    //   // data: Buffer.from(instance.encode()),
    //   data: "dasdasdas",
    //   printer: printer.getPrinters()[1].name,
    //   type: "TEXT",
    // });
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
          <AutoComplete
            style={{ width: "100%" }}
            onSearch={handleSearchCliente}
            options={_.uniqBy(optionsStikers, "label")}
            onChange={(value) => {
              setMaquinaStikerSelect(value);
            }}
          />
        </div>
        <div className="col-md-12 mt-3">
          <Button onClick={handleGenStikersPrint} type="primary">
            IMRPIMIR ETIQUETAS DE SERIE
          </Button>
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
