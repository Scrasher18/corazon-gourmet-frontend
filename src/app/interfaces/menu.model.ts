export interface Menu {
  id?: number;
  nombreItem: string;
  precioNormal: number;
  precioConadis: number;
  stockDisponible: number;
  categoria: 'PLATO_FONDO' | 'PLATO_ESPECIAL' | 'ENTRADA' | 'BEBIDA' | 'BEBIDA_EXTRA' | 'POSTRE_ADICIONAL';
}