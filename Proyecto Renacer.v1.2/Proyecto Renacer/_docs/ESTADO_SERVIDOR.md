# 🚀 Estado del Servidor

## ✅ Servidor Iniciado

El servidor backend se ha iniciado en una **ventana nueva** que se abrió automáticamente.

---

## 📋 Información del Servidor

- **URL:** http://localhost:8080
- **Puerto:** 8080
- **Estado:** En ejecución

---

## 🔐 Credenciales de Acceso

- **Usuario:** `Brandon`
- **Contraseña:** `brandon256`
- **Rol:** ADMIN

---

## ⏱️ Tiempo de Inicio

El servidor puede tardar **30-60 segundos** en iniciar completamente, especialmente la primera vez.

Durante el inicio verás mensajes como:
```
✅ SQLite configurado correctamente
✅ Rol ADMIN creado
✅ Usuario 'Brandon' creado con éxito
...
Started RenacerApplication in X.XXX seconds
```

---

## ✅ Cómo Verificar que Está Funcionando

### Método 1: Ver la ventana del servidor
- Busca la ventana de consola que se abrió
- Debe mostrar: `Started RenacerApplication`

### Método 2: Probar en el navegador
1. Abre tu navegador
2. Ve a: http://localhost:8080/api/usuarios
3. Debe pedirte usuario y contraseña (esto confirma que está funcionando)

### Método 3: Probar el login en el frontend
1. Abre `Frontend/client/index.html` en tu navegador
2. Haz clic en "Ingresar"
3. Ingresa:
   - Usuario: `Brandon`
   - Contraseña: `brandon256`
4. Debe funcionar sin errores

---

## 🛑 Detener el Servidor

Para detener el servidor:
1. Ve a la ventana de consola del servidor
2. Presiona **Ctrl + C**
3. O simplemente cierra la ventana

---

## 📝 Notas Importantes

1. **Mantén la ventana abierta**: El servidor debe estar corriendo mientras uses la aplicación
2. **Base de datos**: Se crea automáticamente en `Backend/renacer.db`
3. **Primera ejecución**: Puede tardar más porque descarga dependencias de Gradle
4. **Si hay errores**: Revisa la ventana de la consola para ver los mensajes de error

---

## 🎉 ¡Listo para Usar!

Ahora puedes:
- ✅ Usar el frontend con el login
- ✅ Acceder a todas las funcionalidades de la aplicación
- ✅ Los datos se guardarán en SQLite automáticamente

---

## 🔄 Reiniciar el Servidor

Si necesitas reiniciar:
1. Detén el servidor actual (Ctrl+C)
2. Ejecuta `INICIAR_SERVIDOR.bat` nuevamente

---

## ⚠️ Solución de Problemas

### Si el servidor no inicia:
1. Verifica que Java esté instalado: Ejecuta `VERIFICAR_SISTEMA.bat`
2. Verifica que el puerto 8080 esté libre
3. Revisa los mensajes de error en la ventana de consola

### Si el frontend no conecta:
1. Asegúrate de que el servidor esté corriendo
2. Verifica la URL en `Frontend/client/js/api.js`: debe ser `http://localhost:8080/api`
3. Verifica que no haya un firewall bloqueando la conexión


