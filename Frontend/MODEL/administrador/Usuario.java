package modelo;

public class Usuario {
    private int idUsuario;
    private String nombreUsuario;
    private String passwordHash;
    private int idRol;
    private boolean activo;

    public Usuario() {}

    public Usuario(int idUsuario, String nombreUsuario, String passwordHash, int idRol, boolean activo) {
        this.idUsuario = idUsuario;
        this.nombreUsuario = nombreUsuario;
        this.passwordHash = passwordHash;
        this.idRol = idRol;
        this.activo = activo;
    }
}
