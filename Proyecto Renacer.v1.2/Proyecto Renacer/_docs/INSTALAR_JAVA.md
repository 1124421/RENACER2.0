# 📥 Instalación de Java 21

## 🔍 Verificación Actual

Antes de instalar, el script `VERIFICAR_SISTEMA.bat` ha detectado que Java no está en el PATH del sistema.

---

## 📋 Opción 1: Instalación Automática (Recomendada)

### Para Windows 10/11:

1. **Descarga el instalador oficial:**
   - Ve a: https://www.oracle.com/java/technologies/downloads/#java21-windows
   - Descarga: **Windows x64 Installer** (archivo `.exe`)

2. **Ejecuta el instalador:**
   - Haz doble clic en el archivo descargado
   - Sigue el asistente de instalación
   - ⚠️ **IMPORTANTE:** Asegúrate de marcar la casilla **"Add to PATH"** o **"Agregar al PATH"**

3. **Verifica la instalación:**
   - Ejecuta `VERIFICAR_SISTEMA.bat`
   - O abre CMD y ejecuta: `java -version`

---

## 📋 Opción 2: Instalación Manual con Chocolatey (Si tienes Chocolatey)

Si tienes Chocolatey instalado, puedes ejecutar:

```powershell
choco install openjdk21
```

---

## 📋 Opción 3: Usando Winget (Windows 10/11)

Ejecuta en PowerShell (como Administrador):

```powershell
winget install Microsoft.OpenJDK.21
```

---

## 🔧 Si Java ya está instalado pero no funciona

### Verificar ubicaciones comunes:

Java podría estar instalado en:
- `C:\Program Files\Java\`
- `C:\Program Files (x86)\Java\`
- `C:\Program Files\Eclipse Adoptium\`

### Agregar Java al PATH manualmente:

1. **Encuentra la carpeta de Java:**
   - Busca la carpeta `bin` dentro de la instalación de Java
   - Ejemplo: `C:\Program Files\Java\jdk-21\bin`

2. **Agregar al PATH:**
   - Presiona `Win + R`
   - Escribe: `sysdm.cpl` y presiona Enter
   - Ve a la pestaña "Opciones avanzadas"
   - Haz clic en "Variables de entorno"
   - En "Variables del sistema", busca `Path`
   - Haz clic en "Editar"
   - Haz clic en "Nuevo"
   - Pega la ruta al `bin` de Java (ejemplo: `C:\Program Files\Java\jdk-21\bin`)
   - Haz clic en "Aceptar" en todas las ventanas
   - **Reinicia** cualquier terminal/CMD abierto

3. **Verificar:**
   - Abre una **nueva** ventana de CMD
   - Ejecuta: `java -version`

---

## ✅ Verificación Post-Instalación

Después de instalar Java:

1. **Cierra todas las ventanas de CMD/PowerShell**
2. **Ejecuta `VERIFICAR_SISTEMA.bat`**
3. Deberías ver:
   ```
   [OK] Java encontrado
   java version "21.x.x"
   ```

---

## 🚀 Una vez Java esté instalado

Podrás ejecutar:
- `INICIAR_SERVIDOR.bat` - Para iniciar el servidor backend

---

## 📞 Enlaces Útiles

- **Java 21 Descarga Directa (Windows x64):**
  https://download.oracle.com/java/21/latest/jdk-21_windows-x64_bin.exe

- **Documentación oficial:**
  https://www.oracle.com/java/technologies/downloads/#java21

---

## ⚠️ Nota Importante

Después de instalar Java, **DEBES**:
1. Cerrar todas las ventanas de terminal/CMD
2. Abrir una nueva terminal
3. Verificar con `java -version`

El PATH solo se actualiza en nuevas ventanas de terminal.


