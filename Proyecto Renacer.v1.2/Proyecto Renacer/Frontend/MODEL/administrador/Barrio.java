package modelo;

public class Barrio {
    private int idBarrio;
    private String nombre;
    private int idComuna;

    public Barrio() {}

    public Barrio(int idBarrio, String nombre, int idComuna) {
        this.idBarrio = idBarrio;
        this.nombre = nombre;
        this.idComuna = idComuna;
    }

    public int getIdBarrio() { return idBarrio; }
    public void setIdBarrio(int idBarrio) { this.idBarrio = idBarrio; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public int getIdComuna() { return idComuna; }
    public void setIdComuna(int idComuna) { this.idComuna = idComuna; }
}
