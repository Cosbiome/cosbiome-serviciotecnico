import { useEffect, useState } from "react";
import Title from "antd/lib/typography/Title";
import {
  DateRangeInput,
  FocusedInput,
  OnDatesChangeProps,
} from "@datepicker-react/styled";
import { connection as conn } from "../../lib/DataBase";
import moment from "moment";
import { Card, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { Link } from "react-router-dom";
const { Meta } = Card;

interface IDataMaquinas {
  ClienteNombre: string;
  MaqNombre: string;
  ReparacionMetodoPago: string;
  ReparacionCostoInicial: number;
  ReparacionCostoTotal: number;
  ReparacionId: number;
  total: number;
  ReparacionFecha: Date;
  ReparacionEntrega: Date;
  ReparacionCompletada: number;
}

interface IDataGeneral {
  cantidad: number;
  totalDias: number;
  totalDinero: number;
}

const ReporteDiasReparacion = () => {
  const [focusInput, setFocusInput] = useState<FocusedInput>(null);
  const [fechas, setFechas] = useState<OnDatesChangeProps>({
    endDate: null,
    startDate: null,
    focusedInput: "startDate",
  });
  const [dataMaquinas, setDataMaquinas] = useState<IDataMaquinas[]>([]);
  const [dataGeneral, setDataGeneral] = useState<IDataGeneral>({
    cantidad: 0,
    totalDias: 0,
    totalDinero: 0,
  });

  useEffect(() => {
    if (fechas.focusedInput === null) {
      handleReportForDataBase();
    }
    // eslint-disable-next-line
  }, [fechas.focusedInput]);

  const handleReportForDataBase = async () => {
    let startF = moment(fechas.startDate).format("YY-MM-DD");
    let endF = moment(fechas.endDate).format("YY-MM-DD");
    let dataMaquinasDB: IDataMaquinas[] = await (await conn).query(`
      select 
        ReparacionId,
        ReparacionMetodoPago,
        ReparacionFecha,
        ReparacionEntrega,
        ClienteNombre,
        MaqNombre,
        ReparacionCostoInicial,
        ReparacionCostoTotal,
        ReparacionCompletada,
        AVG(TO_DAYS(ReparacionEntrega) - TO_DAYS(ReparacionFecha)) as total
      from reparaciones
      inner join clientes on ClienteId = ReparacionCliente
      inner Join maquinas on MaquinaId = ReparacionMaquina
      inner join maquinasnombres on MaquinaNombre = MaqId
      where ReparacionFecha >= '${startF}' and ReparacionEntrega <= '${endF}'
      group by ReparacionId;
    `);
    let dataGeneralDB: IDataGeneral[] = await (await conn).query(`
      select 
        count(*) AS cantidad,
        AVG(TO_DAYS(ReparacionEntrega) - TO_DAYS(ReparacionFecha)) as totalDias,
        SUM(ReparacionCostoTotal) as totalDinero
      from reparaciones
      where ReparacionFecha >= '${startF}' and ReparacionEntrega <= '${endF}';
    `);

    console.log(dataGeneralDB);

    if (dataGeneralDB[0].cantidad > 0) {
      setDataGeneral(dataGeneralDB[0]);
      setDataMaquinas(dataMaquinasDB);
    } else {
      setDataGeneral({
        cantidad: 0,
        totalDias: 0,
        totalDinero: 0,
      });
      setDataMaquinas([]);
    }
  };

  const columns: ColumnsType<IDataMaquinas> = [
    {
      title: "ID REPARACION",
      dataIndex: "ReparacionId",
      width: 10,
    },
    {
      title: "CLIENTE",
      dataIndex: "ClienteNombre",
    },
    {
      title: "MAQUINA",
      dataIndex: "MaqNombre",
    },
    {
      title: "ENTRADA",
      dataIndex: "ReparacionFecha",
      render: (value: Date, record) => {
        return moment(value).format("YYYY-MM-DD");
      },
      width: 150,
    },
    {
      title: "SALIDA",
      dataIndex: "ReparacionEntrega",
      render: (value: Date, record) => {
        return moment(value).format("YYYY-MM-DD");
      },
      width: 150,
    },
    {
      title: "DIAS EN REPRACION",
      dataIndex: "total",
    },
    {
      title: "METODO DE PAGO",
      dataIndex: "ReparacionMetodoPago",
    },
    {
      title: "COSTO TOTAL",
      dataIndex: "ReparacionCostoTotal",
      render: (value: number, record) => {
        return value + " $";
      },
    },
    {
      title: "COMPLETA",
      dataIndex: "ReparacionCompletada",
      render: (value: number, record) => {
        if (value === 0) {
          return "NO";
        } else {
          return "SI";
        }
      },
    },
    {
      title: "DETALLE",
      render: (value: any, record) => {
        return (
          <Link to={`/reparaciones/detalle/${record.ReparacionId}`}>
            DETALLE
          </Link>
        );
      },
    },
  ];

  return (
    <div className="container">
      <Title className="text-center">REPORTE DE DIAS EN REPARACIONES</Title>

      <div className="row mt-5">
        <div className="col-md-4 offset-md-3">
          <DateRangeInput
            onDatesChange={(e) => {
              setFocusInput(e.focusedInput);
              setFechas(e);
            }}
            onFocusChange={(e) => setFocusInput(e)}
            startDate={fechas.startDate}
            endDate={fechas.endDate}
            focusedInput={focusInput}
          />
        </div>
      </div>

      {dataGeneral.totalDias !== 0 && (
        <div className="row mt-5">
          <div className="col-md-4 text-center">
            <Card>
              <Meta
                description={dataGeneral.cantidad.toString()}
                title="TOTAL MAQUINAS ATENDIDAS"
              />
            </Card>
          </div>
          <div className="col-md-4 text-center">
            <Card>
              <Meta
                title="PROMEDIO DE DIAS EN ARREGLO"
                description={dataGeneral.totalDias.toString()}
              />
            </Card>
          </div>
          <div className="col-md-4 text-center">
            <Card>
              <Meta
                title="TOTAL DE DINDERO RECAUDADO"
                description={dataGeneral.totalDinero + "$"}
              />
            </Card>
          </div>
        </div>
      )}

      <div className="row mt-5">
        <div className="col-md-12">
          <Table columns={columns} dataSource={dataMaquinas} />
        </div>
      </div>
    </div>
  );
};

export default ReporteDiasReparacion;
