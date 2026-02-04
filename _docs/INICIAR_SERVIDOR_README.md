# 🚀 Scripts para Iniciar el Servidor

## 📁 Archivos Creados

He creado **2 archivos .bat** que puedes ejecutar con doble clic:

### 1. `INICIAR_SERVIDOR.bat` (En la raíz del proyecto)
**Ubicación:** `C:\Users\brand\Desktop\Proyecto Renacer\INICIAR_SERVIDOR.bat`

✅ **Ventaja:** Puedes ejecutarlo desde cualquier lugar  
✅ **Ideal para:** Acceso rápido desde el escritorio o donde quieras

### 2. `Backend\INICIAR_SERVIDOR.bat` (En la carpeta Backend)
**Ubicación:** `C:\Users\brand\Desktop\Proyecto Renacer\Backend\INICIAR_SERVIDOR.bat`

✅ **Ventaja:** Más directo si ya estás en la carpeta Backend  
✅ **Ideal para:** Desarrollo cuando trabajas con los archivos del backend

---

## 🎯 Cómo Usar

### Opción 1: Doble clic (Más fácil)
1. Ve a la carpeta del proyecto
2. Haz doble clic en `INICIAR_SERVIDOR.bat`
3. Espera a que aparezca:
   ```
   Started RenacerApplication in X.XXX seconds
   ```

### Opción 2: Desde el escritorio
1. Crea un acceso directo del archivo `.bat`
2. Arrástralo al escritorio
3. Doble clic para iniciar el servidor

---

## ✅ Qué Verás Cuando Funcione

Cuando el servidor inicie correctamente, verás:

```
============================================
   SERVIDOR RENACER - INICIANDO...
============================================

Puerto: http://localhost:8080
Usuario: Brandon
Contrasena: brandon256

============================================

Iniciando servidor backend...

NOTA: Esta ventana debe permanecer abierta mientras uses la aplicacion
Para detener el servidor, presiona Ctrl+C

============================================

✅ SQLite configurado correctamente: foreign keys habilitadas, modo WAL activado
✅ Rol ADMIN creado
✅ Usuario 'Brandon' creado con éxito
...
Started RenacerApplication in X.XXX seconds
```

---

## 🛑 Detener el Servidor

Para detener el servidor:
1. Haz clic en la ventana de la consola
2. Presiona **Ctrl + C**
3. Confirma con **S** o simplemente cierra la ventana

---

## ⚠️ Requisitos Previos

Antes de ejecutar el script, asegúrate de tener:

1. ✅ **Java 21 instalado**
   - Verifica: Abre CMD y ejecuta `java -version`
   - Debe mostrar: `java version "21"` o superior
   - Si no lo tienes: https://www.oracle.com/java/technologies/downloads/#java21

2. ✅ **Puerto 8080 libre**
   - Si otro programa usa el puerto 8080, el servidor no podrá iniciar
   - Para verificar: `netstat -ano | findstr :8080`

---

## 🔧 Solución de Problemas

### Error: "Java no está instalado"
**Solución:** Instala Java 21 desde el sitio oficial de Oracle

### Error: "Puerto 8080 ya está en uso"
**Solución:** 
- Cierra otros programas que usen el puerto 8080
- O cambia el puerto en `Backend/src/main/resources/application.properties`:
  ```properties
  server.port=8081
  ```

### La ventana se cierra inmediatamente
**Solución:** 
- Abre CMD manualmente
- Ejecuta el .bat desde ahí para ver el error
- O agrega `pause` al final del archivo

### "No se encuentra gradlew.bat"
**Solución:** 
- Asegúrate de estar en la carpeta correcta
- Verifica que exista `Backend/gradlew.bat`

---

## 📝 Notas Importantes

1. **Mantén la ventana abierta**: El servidor debe estar corriendo mientras uses la aplicación
2. **Primera ejecución**: Puede tardar más (Gradle descarga dependencias)
3. **Base de datos**: Se crea automáticamente en `Backend/renacer.db`
4. **Usuario automático**: Se crea el usuario "Brandon" con contraseña "brandon256"

---

## 🎉 ¡Listo!

Ahora solo necesitas hacer **doble clic** en `INICIAR_SERVIDOR.bat` y el servidor se iniciará automáticamente.

Una vez que veas "Started RenacerApplication", puedes usar el frontend normalmente. 🚀


