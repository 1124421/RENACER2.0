package modelo;

public class Material {
    private int idMaterial;
    private String nombre;
    private int idCategoria;

    public Material() {}

    public Material(int idMaterial, String nombre, int idCategoria) {
        this.idMaterial = idMaterial;
        this.nombre = nombre;
        this.idCategoria = idCategoria;
    }
}
