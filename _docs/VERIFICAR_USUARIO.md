# 🔍 Verificar Usuario Brandon

## 📋 Pasos para Verificar

### 1. **Reinicia el Servidor**

Es **MUY IMPORTANTE** reiniciar el servidor para que el DataInitializer cree/actualice el usuario:

1. Detén el servidor (Ctrl+C)
2. Ejecuta: `INICIAR_SERVIDOR.bat`
3. Busca en los logs estos mensajes:
   ```
   ✅ Usuario 'Brandon' creado/actualizado con éxito
      - Username: Brandon
      - Contraseña: brandon256
      - Rol: ADMIN
      - Estado: Activo
      - Verificación de contraseña: ✅ OK
   ```

### 2. **Verifica en los Logs**

Cuando el servidor inicie, deberías ver:
- `✅ Rol ADMIN creado` o `ℹ️  Rol ADMIN ya existe`
- `✅ Usuario 'Brandon' creado/actualizado con éxito`
- `✅ Verificación de contraseña: ✅ OK`

---

## 🔧 Si el Usuario No Se Crea

### Opción 1: Eliminar la Base de Datos (Recargar todo)

Si el usuario aún no funciona, puedes eliminar la base de datos para que se cree desde cero:

1. Detén el servidor
2. Elimina el archivo: `Backend/renacer.db`
3. Inicia el servidor nuevamente
4. El DataInitializer creará todo desde cero

### Opción 2: Verificar la Base de Datos

Puedes usar una herramienta como **DB Browser for SQLite** para verificar:
1. Abre `Backend/renacer.db`
2. Ve a la tabla `usuario`
3. Verifica que exista un usuario con:
   - Username: `Brandon`
   - Password_hash: Debe tener un hash largo
   - ID_rol: Debe tener un ID que corresponda al rol ADMIN

---

## ✅ Credenciales Correctas

- **Usuario:** `Brandon` (exactamente como está escrito, con B mayúscula)
- **Contraseña:** `brandon256`

---

## 🚨 Problemas Comunes

### Error: "Usuario o contraseña incorrectos"
1. Verifica que el servidor se haya reiniciado
2. Verifica los logs del servidor para ver si el usuario se creó
3. Asegúrate de escribir exactamente: `Brandon` (con B mayúscula)

### El usuario no se crea
1. Verifica que no haya errores en los logs del servidor
2. Verifica que el rol ADMIN exista primero
3. Elimina `renacer.db` y reinicia para crear todo desde cero

---

## 📝 Logs Esperados

Cuando el servidor inicie correctamente, deberías ver:

```
✅ SQLite configurado correctamente: foreign keys habilitadas, modo WAL activado
✅ Rol ADMIN creado
✅ Usuario 'Brandon' creado/actualizado con éxito
   - Username: Brandon
   - Contraseña: brandon256
   - Rol: ADMIN
   - Estado: Activo
   - Verificación de contraseña: ✅ OK
Started RenacerApplication in X.XXX seconds
```

---

## 🎯 Próximo Paso

Después de reiniciar el servidor:
1. Ve a `http://localhost:8080`
2. Usuario: `Brandon`
3. Contraseña: `brandon256`
4. Debería funcionar correctamente

