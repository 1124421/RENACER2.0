package modelo;

public class Asociado {
    private int idAsociado;
    private String nombreCompleto;
    private String documento;
    private String carreta;
    private String telefono;
    private String correo;
    private String tipo;

    public Asociado() {}

    public Asociado(int idAsociado, String nombreCompleto, String documento, String carreta,
                    String telefono, String correo, String tipo) {
        this.idAsociado = idAsociado;
        this.nombreCompleto = nombreCompleto;
        this.documento = documento;
        this.carreta = carreta;
        this.telefono = telefono;
        this.correo = correo;
        this.tipo = tipo;
    }

    // Getters y Setters
    public int getIdAsociado() { return idAsociado; }
    public void setIdAsociado(int idAsociado) { this.idAsociado = idAsociado; }

    public String getNombreCompleto() { return nombreCompleto; }
    public void setNombreCompleto(String nombreCompleto) { this.nombreCompleto = nombreCompleto; }

    public String getDocumento() { return documento; }
    public void setDocumento(String documento) { this.documento = documento; }

    public String getCarreta() { return carreta; }
    public void setCarreta(String carreta) { this.carreta = carreta; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
}
