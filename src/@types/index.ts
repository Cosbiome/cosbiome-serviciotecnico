export interface ILoteCreacion {
  fecha: string;
  descripcion: string;
}

export interface ILoteDB {
  LoteConfirmacion: string;
  LoteDescripcion: string;
  LoteFecha: string;
  LoteHora: string;
  LoteId: number;
}

export interface ILotesReporteGeneral {
  LoteId: number;
  LoteFecha: Date;
  LoteTotalMaquinas: number;
  LoteVendidas: number;
  LoteNoVendidas: number;
  LoteReparacion: number;
  LoteNoReparacion: number;
}

export interface IMaquinasPorLote {
  LoteId: string;
  MaquinaId: string;
  MaquinaReparacion: number;
  MaqNombre: string;
  ClienteNombre: string;
  MaquinaEntradaReparacion: string;
  MaquinaGarantia: string;
  ClienteTelefono: string;
  ClienteEstado: string;
  MaquinaIdLote: number;
  MaquinaRevisada: number;
}

export interface IMaqNombres {
  MaqId: number;
  MaqNombre: string;
}

export interface IFormAddMaqLote {
  maquinas: {
    cantidad: string;
    tipo: string;
    nombre: number;
  }[];
}

export interface ICreateCliente {
  ClienteNombre: string;
  ClienteDireccion: string;
  ClienteEstado: string;
  ClienteTelefono: string;
  colonia: string;
  cp: string;
}

export interface IClientesDB {
  [key: string]: any;
  ClienteDireccion: string;
  ClienteEstado: string;
  ClienteNombre: string;
  ClienteTelefono: string;
  ClienteId: number;
  ClienteCreacion: Date;
}
