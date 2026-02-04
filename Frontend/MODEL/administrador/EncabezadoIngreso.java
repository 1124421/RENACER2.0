package modelo;

import java.time.LocalDateTime;

public class EncabezadoIngreso {
    private int idIngreso;
    private LocalDateTime fecha;
    private int idAsociado;
    private int idBarrio;
    private double totalPagado;
    private int idUsuario;

    public EncabezadoIngreso() {}

    public EncabezadoIngreso(int idIngreso, LocalDateTime fecha, int idAsociado, int idBarrio, double totalPagado, int idUsuario) {
        this.idIngreso = idIngreso;
        this.fecha = fecha;
        this.idAsociado = idAsociado;
        this.idBarrio = idBarrio;
        this.totalPagado = totalPagado;
        this.idUsuario = idUsuario;
    }
}
