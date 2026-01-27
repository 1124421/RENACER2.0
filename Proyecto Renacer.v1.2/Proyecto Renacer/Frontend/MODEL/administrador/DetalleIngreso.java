package modelo;

public class DetalleIngreso {
    private int idDetalleIngreso;
    private int idIngreso;
    private int idMaterial;
    private double cantidad;
    private double precioPorKg;
    private int idBodegaDestino;

    public DetalleIngreso() {}

    public DetalleIngreso(int idDetalleIngreso, int idIngreso, int idMaterial, double cantidad, double precioPorKg, int idBodegaDestino) {
        this.idDetalleIngreso = idDetalleIngreso;
        this.idIngreso = idIngreso;
        this.idMaterial = idMaterial;
        this.cantidad = cantidad;
        this.precioPorKg = precioPorKg;
        this.idBodegaDestino = idBodegaDestino;
    }
}
