package modelo;

import java.time.LocalDateTime;

public class EncabezadoEgreso {
    private int idEgreso;
    private LocalDateTime fecha;
    private int idCliente;
    private double totalVenta;
    private int idUsuario;

    public EncabezadoEgreso() {}

    public EncabezadoEgreso(int idEgreso, LocalDateTime fecha, int idCliente, double totalVenta, int idUsuario) {
        this.idEgreso = idEgreso;
        this.fecha = fecha;
        this.idCliente = idCliente;
        this.totalVenta = totalVenta;
        this.idUsuario = idUsuario;
    }
}
