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
import { join } from "path";
import { PosPrintData, PosPrintOptions } from "electron-pos-printer";
import useHttp from "../../hooks/useHttp";

const { PosPrinter } = remote.require("electron-pos-printer");
const { Option } = Select;

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
  const [conetoStikers, setConetoStikers] = useState<number>(0);
  const [conetoStikersTotal, setConetoStikersTotal] = useState<number>(0);

  const dropMenuFilter = useFiltersTables();
  const history = useHistory();
  const params = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const { post, update } = useHttp();

  useEffect(() => {
    handleGetMaquinasRequisicion();
    handleGetNamesMaq();
    // eslint-disable-next-line
  }, []);

  const handleGetNamesMaq = async () => {
    const maqs: IMaqNombres[] = await (
      await conn
    ).query(`

      SELECT
      id as MaqId,
      MaqNombre,
      MaqClasificacion
      FROM maquinasnombres;

    `);

    setNamesMaqs(maqs);
  };

  const handleGetMaquinasRequisicion = async () => {
    try {
      const result: IMaquinasPorLote[] = await (
        await conn
      ).query(`
        SELECT                 
            maquinas.id as MaquinaId,
            MaquinaReparacion,
            MaqNombre,
            ClienteNombre,
            MaquinaEntradaReparacion,                
            MaquinaGarantia,
            ClienteTelefono,
            ClienteEstado,
            MaquinaIdLote,
            lotes.id as LoteId,
            MaquinaRevisada
        FROM maquinas 
        INNER JOIN ${"`users-permissions_user`"} as user ON user.id = MaquinaCliente
        INNER JOIN lotes ON lotes.id = MaquinaLote
        INNER JOIN maquinasnombres ON maquinasnombres.id = MaquinaNombre
        WHERE lotes.id = ${params.id}
        ORDER BY MaqNombre ASC;
      `);

      const resultCharts: { MaqNombre: string; TOTAL: number }[] = await (
        await conn
      ).query(`
        SELECT
          MaqNombre,
          COUNT(*) AS 'TOTAL'
        FROM maquinas
        INNER JOIN lotes ON lotes.id = MaquinaLote
        INNER JOIN maquinasnombres ON MaquinaNombre = maquinasnombres.id
        WHERE lotes.id = ${params.id}
        GROUP BY MaqNombre;
      `);

      const surt = await (
        await conn
      ).query(`
        select LoteSurtido from lotes 
        where id = ${params.id};
      `);

      const optionsMaquinas: IOptionsAuto[] = result.map<IOptionsAuto>(
        (maquina) => ({
          label: maquina.MaqNombre,
          value: maquina.MaqNombre,
        })
      );

      console.log(surt[0].LoteSurtido);

      console.log(`
      select LoteSurtido from lotes 
      where id = ${params.id};
    `);

      setSurtido(surt[0].LoteSurtido === 1 ? true : false);

      setMaquinas(result);
      setConteos(resultCharts);
      setOptionsStikers(optionsMaquinas);
    } catch (error) {
      console.log(error);
    }
  };

  const onFinish = async (values: IFormAddMaqLote) => {
    try {
      values.maquinas.forEach(async (a) => {
        for (let i = 0; i < parseInt(a.cantidad); i++) {
          // await (
          //   await conn
          // ).query(`
          //   INSERT INTO maquinas (
          //       MaquinaNombre,
          //       MaquinaDescripcion,
          //       MaquinaLote,
          //       MaquinaCliente,
          //       MaquinaIdLote
          //   ) VALUES(
          //       ${a.nombre},
          //       'LLEGO EN BUEN ESTADO',
          //       ${params.id},
          //       1,
          //       ${i + 1}
          //   );
          // `);

          await post("maquinas", {
            MaquinaDescripcion: "LLEGO EN BUEN ESTADO",
            MaquinaNombre: a.nombre,
            MaquinaLote: params.id,
            MaquinaCliente: 1,
            MaquinaIdLote: (i + 1).toString(),
            MaquinaEntrega: new Date().toISOString(),
            MaquinaEntradaReparacion: new Date().toISOString(),
            MaquinaGarantia: new Date().toISOString(),
            MaquinaEntregaReparacion: new Date().toISOString(),
            MaquinaRevisada: false,
            MaquinaReparacion: false,
          });
        }
      });

      setTimeout(async () => {
        // await (
        //   await conn
        // ).query(`
        //   UPDATE lotes SET LoteSurtido = true
        //   WHERE lotes.id = ${params.id};
        // `);

        await update(`lotes/${params.id}`, {
          LoteSurtido: true,
        });

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
    setIsLoading(true);
    const maquinasName = maquinas.filter(
      (maquina) => maquina.MaqNombre === maquinaStikerSelect
    );

    setConetoStikersTotal(maquinasName.length);

    if (maquinasName.length === 0 || maquinaStikerSelect === "") {
      await Swal.fire("Error", "No se encontraron maquinas", "error");

      return 0;
    }

    for (const maquina of maquinasName) {
      setConetoStikers((value) => {
        return value + 1;
      });
      const dataCliente: PosPrintData[] = [
        {
          type: "text",
          value: "======",
          style: `text-align:center;`,
          css: { "font-weight": "700", "font-size": "18px" },
        },
        {
          type: "text",
          value: maquina.MaqNombre,
          style: `text-align:center;`,
          css: { "font-weight": "700", "font-size": "14px" },
        },
        {
          type: "barCode",
          value: maquina.MaquinaId,
          position: "center",
          style: `text-align:center;`,
          width: "2px",
          height: "45px",
        },
        {
          type: "text",
          value: `*${maquina.MaquinaId}M*`,
          style: `text-align:center;`,
          css: { "font-weight": "700", "font-size": "12px" },
        },
        {
          type: "text",
          value: `Cosbiome\n01/22 L:${params.id}`,
          style: `text-align:center;`,
          css: { "font-weight": "700", "font-size": "18px" },
        },
      ];

      const options: PosPrintOptions = {
        preview: false, // Preview in window or print
        width: "300px", //  width of content body
        margin: "0 0 0 0", // margin of content body
        copies: 1, // Number of copies to print
        printerName: "Brother QL-810W", // printerName: string, check with webContent.getPrinters()
        timeOutPerLine: 400,
        pageSize: { height: 39000, width: 62000 }, // page size
        silent: true,
      };

      await PosPrinter.print(dataCliente, options);
    }

    setIsLoading(false);
    setConetoStikers(0);
    setConetoStikersTotal(0);
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
                  WHERE id = ${record.MaquinaId};
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
                  WHERE id = ${record.MaquinaId};
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
              <Button
                disabled={sutrido || isLoading}
                type="primary"
                htmlType="submit"
              >
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
          <Button
            disabled={isLoading}
            onClick={handleGenStikersPrint}
            type="primary"
          >
            {isLoading
              ? `${conetoStikers}/${conetoStikersTotal}`
              : "IMRPIMIR ETIQUETAS DE SERIE"}
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
