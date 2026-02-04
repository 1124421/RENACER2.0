package modelo;

public class Comuna {
    private int idComuna;
    private String nombre;

    public Comuna() {}

    public Comuna(int idComuna, String nombre) {
        this.idComuna = idComuna;
        this.nombre = nombre;
    }

    public int getIdComuna() { return idComuna; }
    public void setIdComuna(int idComuna) { this.idComuna = idComuna; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
}
