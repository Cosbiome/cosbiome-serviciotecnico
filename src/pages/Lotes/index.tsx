import { Button, Space, Table } from "antd";
import Title from "antd/lib/typography/Title";
import { useEffect, useState } from "react";
import { ILotesReporteGeneral } from "../../@types";
import { connection as conn } from "../../lib/DataBase";
import moment from "moment";
import useFiltersTables from "../../hooks/useFiltersTables";
import { ColumnsType } from "antd/lib/table";
import { useHistory } from "react-router";

const Lotes = () => {
  const [lotes, setLotes] = useState<ILotesReporteGeneral[]>([]);

  useEffect(() => {
    handleGetLotes();
  }, []);

  const dropMenuFilter = useFiltersTables();
  const history = useHistory();

  const handleGetLotes = async () => {
    const result: ILotesReporteGeneral[] = await (
      await conn
    ).query(`
      SELECT 
          lotes.id as LoteId,
          LoteFecha,
          COUNT(MaquinaLote) AS 'LoteTotalMaquinas',
          COUNT(CASE WHEN MaquinaCliente != 1 then 1 else null end) AS 'LoteVendidas',
          COUNT(CASE WHEN MaquinaCliente = 1 then 1 else null end) AS 'LoteNoVendidas',
          COUNT(CASE WHEN MaquinaReparacion IS true then 1 else null end) AS 'LoteReparacion',
          COUNT(CASE WHEN MaquinaReparacion IS NOT true AND MaquinaLote IS NOT NULL then 1 else null end) AS 'LoteNoReparacion'
      FROM lotes
      LEFT JOIN maquinas ON lotes.id = maquinas.MaquinaLote
      GROUP BY LoteId;
    `);

    console.log(result);

    setLotes(result);
  };

  const columns: ColumnsType<ILotesReporteGeneral> = [
    {
      title: "Id Lote",
      ...dropMenuFilter("LoteId"),
      dataIndex: "LoteId",
    },
    {
      title: "Fecha Lote",
      dataIndex: "LoteFecha",
      render: (text: string | Date, record: ILotesReporteGeneral) => {
        return moment(record.LoteFecha).format("YYYY-MM-DD");
      },
    },
    {
      title: "Total Maquinas",
      dataIndex: "LoteTotalMaquinas",
    },
    {
      title: "Total Maquinas Vendidas",
      dataIndex: "LoteVendidas",
    },
    {
      title: "Total Maquinas Sin Vender",
      dataIndex: "LoteNoVendidas",
    },
    {
      title: "Reparacion",
      dataIndex: "LoteReparacion",
    },
    {
      title: "Funcionando",
      dataIndex: "LoteNoReparacion",
    },
    {
      title: "Detalle",
      key: "action",
      render: (text: any, record: ILotesReporteGeneral) => (
        <Space size="middle">
          <Button
            onClick={() => {
              history.push("/lotes/detalle/" + record.LoteId);
            }}
            type="primary"
          >
            DETALLE DE LOTE
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="container">
      <Title className="text-center">LOTES DE MAQUINAS COSBIOME</Title>

      <div className="row mt-5">
        <div className="col-md-12">
          <Table bordered columns={columns} dataSource={lotes} />
        </div>
      </div>
    </div>
  );
};

export default Lotes;
