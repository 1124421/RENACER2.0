package modelo;

import java.time.LocalDate;

public class TarifaCompra {
    private int idTarifa;
    private int idMaterial;
    private double precioCompraKg;
    private LocalDate fechaVigencia;

    public TarifaCompra() {}

    public TarifaCompra(int idTarifa, int idMaterial, double precioCompraKg, LocalDate fechaVigencia) {
        this.idTarifa = idTarifa;
        this.idMaterial = idMaterial;
        this.precioCompraKg = precioCompraKg;
        this.fechaVigencia = fechaVigencia;
    }
}
