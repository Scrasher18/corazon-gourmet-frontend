export interface DetallePedidoDTO {
  tipoServicio: string;       
  platoSeleccionado: string;   
  entradaSeleccionada: string; 
  bebidaSeleccionada: string;  
  precio: number;             
}

export interface PedidoRequestDTO {
  mesa: number;
  totalPersonas: number;
  detalles: DetallePedidoDTO[]; 
  totalPagar: number;
}