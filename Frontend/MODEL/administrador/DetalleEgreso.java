package modelo;

public class DetalleEgreso {
    private int idDetalleEgreso;
    private int idEgreso;
    private int idMaterial;
    private double cantidad;
    private double precioKgVenta;
    private int idBodegaOrigen;

    public DetalleEgreso() {}

    public DetalleEgreso(int idDetalleEgreso, int idEgreso, int idMaterial, double cantidad, double precioKgVenta, int idBodegaOrigen) {
        this.idDetalleEgreso = idDetalleEgreso;
        this.idEgreso = idEgreso;
        this.idMaterial = idMaterial;
        this.cantidad = cantidad;
        this.precioKgVenta = precioKgVenta;
        this.idBodegaOrigen = idBodegaOrigen;
    }
}
