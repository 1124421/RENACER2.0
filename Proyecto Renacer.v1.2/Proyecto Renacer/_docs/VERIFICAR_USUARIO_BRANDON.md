# 🔍 Verificar Usuario Brandon

## 🚨 Problema: Usuario o Contraseña Incorrectos

El error indica que el usuario no existe o la contraseña no coincide. Vamos a verificarlo y solucionarlo.

---

## 🔧 Solución Paso a Paso

### Paso 1: Eliminar Base de Datos (IMPORTANTE)

1. **Detén el servidor** (Ctrl+C en la ventana del servidor)

2. **Elimina la base de datos:**
   - Ve a: `Backend/renacer.db`
   - Elimínalo (o usa el script: `ELIMINAR_DB_Y_REINICIAR.bat`)

3. **Inicia el servidor:**
   - Ejecuta: `INICIAR_SERVIDOR.bat`

4. **Busca estos mensajes en los logs:**
   ```
   ============================================
   INICIALIZANDO DATOS DE LA APLICACION
   ============================================
   ✅ Rol ADMIN creado
   ℹ️  Creando nuevo usuario 'Brandon'...
   ℹ️  Usuario guardado en BD (ID: X)
   ✅ Usuario 'Brandon' creado/actualizado con éxito
      - ID: X
      - Username: Brandon
      - Contraseña: brandon256
      - Rol: ADMIN
      - Estado: Activo
      - Verificación de contraseña: ✅ OK
   ============================================
   ```

### Paso 2: Verificar Usuario (Opcional)

He creado un endpoint de prueba para verificar usuarios:

1. **Con el servidor corriendo**, abre tu navegador
2. Ve a: `http://localhost:8080/api/test/usuarios`
3. Verás información sobre los usuarios en la base de datos

### Paso 3: Probar Login

1. Ve a: `http://localhost:8080`
2. Usuario: `Brandon` (exactamente así, con B mayúscula)
3. Contraseña: `brandon256`
4. Debería funcionar ✅

---

## 🔍 Qué Revisar en los Logs

Cuando el servidor inicie, busca específicamente:

### ✅ Mensajes Correctos:
- `✅ Rol ADMIN creado` o `ℹ️ Rol ADMIN ya existe`
- `✅ Usuario 'Brandon' creado/actualizado con éxito`
- `✅ Verificación de contraseña: ✅ OK`

### ❌ Si ves Errores:
- `❌ ERROR: La contraseña no se pudo verificar` → Hay un problema con el guardado
- `El rol ADMIN no existe` → El rol no se creó correctamente
- `No se pudo encontrar el usuario después de guardarlo` → Error al guardar en BD

---

## 📝 Credenciales Correctas

- **Usuario:** `Brandon` (exactamente así, con B mayúscula)
- **Contraseña:** `brandon256` (todo en minúsculas)

---

## ⚠️ Importante

**La base de datos debe eliminarse y recrearse** para asegurar que el usuario se cree correctamente con las credenciales actualizadas.

---

## 🎯 Scripts Útiles

- `ELIMINAR_DB_Y_REINICIAR.bat` - Elimina la BD y te indica que reinicies
- `INICIAR_SERVIDOR.bat` - Inicia el servidor
- `VERIFICAR_SERVIDOR.bat` - Verifica que el servidor esté corriendo

---

**¡Elimina la base de datos, reinicia el servidor y prueba el login nuevamente!**

