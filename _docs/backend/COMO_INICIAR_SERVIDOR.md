# 🚀 Cómo Iniciar el Servidor Backend

## ¿Tienes un servidor?

**¡Sí!** Tu proyecto tiene un servidor backend (Spring Boot) que necesita estar corriendo para que el frontend funcione.

El servidor corre en: **http://localhost:8080**

---

## 📋 Requisitos Previos

Antes de iniciar el servidor, asegúrate de tener:

1. ✅ **Java 21** instalado
   - Verifica ejecutando: `java -version`
   - Si no lo tienes, descárgalo de: https://www.oracle.com/java/technologies/downloads/#java21

2. ✅ **Gradle** (ya viene incluido en el proyecto)
   - El proyecto incluye `gradlew.bat` (Windows) o `gradlew` (Linux/Mac)

---

## 🖥️ En Windows (PowerShell o CMD)

### Opción 1: Desde la Terminal (Recomendado)

1. Abre PowerShell o CMD
2. Navega a la carpeta Backend:
   ```powershell
   cd "C:\Users\brand\Desktop\Proyecto Renacer\Backend"
   ```

3. Inicia el servidor:
   ```powershell
   .\gradlew.bat bootRun
   ```

4. Espera a que aparezcan estos mensajes:
   ```
   ✅ SQLite configurado correctamente: foreign keys habilitadas, modo WAL activado
   ✅ Rol ADMIN creado
   ✅ Usuario 'Brandon' creado con éxito
   ...
   Started RenacerApplication in X.XXX seconds
   ```

5. **¡Listo!** El servidor está corriendo en http://localhost:8080

### Opción 2: Desde el IDE (IntelliJ IDEA, Eclipse, VS Code)

1. Abre el proyecto en tu IDE
2. Busca el archivo: `Backend/src/main/java/com/planetapp/renacer/RenacerApplication.java`
3. Haz clic derecho → "Run RenacerApplication"
4. O ejecuta directamente el método `main()`

---

## 🔍 Verificar que el Servidor Está Corriendo

### Método 1: Verificar en el navegador
Abre tu navegador y ve a:
```
http://localhost:8080/api/usuarios
```

Si ves una ventana de autenticación o un error JSON (no un "No se puede conectar"), significa que el servidor está corriendo.

### Método 2: Verificar en la terminal
Si el servidor está corriendo, verás mensajes como:
```
Tomcat started on port(s): 8080 (http)
```

### Método 3: Verificar procesos
En PowerShell:
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*java*"}
```

---

## ⚠️ Solución de Problemas

### Error: "No se puede encontrar 'gradlew.bat'"
**Solución:** Asegúrate de estar en la carpeta `Backend`:
```powershell
cd Backend
.\gradlew.bat bootRun
```

### Error: "Java no está instalado"
**Solución:** Instala Java 21 desde https://www.oracle.com/java/technologies/downloads/#java21

### Error: "Puerto 8080 ya está en uso"
**Solución:** 
1. Busca qué programa está usando el puerto:
   ```powershell
   netstat -ano | findstr :8080
   ```
2. Cierra ese programa o cambia el puerto en `application.properties`:
   ```properties
   server.port=8081
   ```

### El servidor se detiene inmediatamente
**Solución:** Revisa los logs en la consola. Puede ser un error de compilación o configuración.

---

## 🛑 Detener el Servidor

Para detener el servidor, simplemente presiona:
```
Ctrl + C
```
en la terminal donde está corriendo.

---

## 📝 Notas Importantes

1. **Mantén la terminal abierta**: El servidor debe estar corriendo mientras uses la aplicación
2. **Primera ejecución**: La primera vez puede tardar más porque Gradle descarga dependencias
3. **Base de datos**: Se creará automáticamente en `Backend/renacer.db`
4. **Usuario creado automáticamente**: 
   - Username: `Brandon`
   - Contraseña: `brandon256`

---

## ✅ Cuando el Servidor Esté Listo

Verás estos mensajes en la consola:
```
✅ SQLite configurado correctamente
✅ Rol ADMIN creado
✅ Usuario 'Brandon' creado con éxito
Started RenacerApplication in X.XXX seconds
```

¡Ahora puedes usar el frontend sin problemas! 🎉


