package modelo;

public class Cliente {
    private int idCliente;
    private String nombreEmpresa;
    private String documento;
    private String telefono;
    private String correo;

    public Cliente() {}

    public Cliente(int idCliente, String nombreEmpresa, String documento, String telefono, String correo) {
        this.idCliente = idCliente;
        this.nombreEmpresa = nombreEmpresa;
        this.documento = documento;
        this.telefono = telefono;
        this.correo = correo;
    }

    public int getIdCliente() { return idCliente; }
    public void setIdCliente(int idCliente) { this.idCliente = idCliente; }

    public String getNombreEmpresa() { return nombreEmpresa; }
    public void setNombreEmpresa(String nombreEmpresa) { this.nombreEmpresa = nombreEmpresa; }

    public String getDocumento() { return documento; }
    public void setDocumento(String documento) { this.documento = documento; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }
}
