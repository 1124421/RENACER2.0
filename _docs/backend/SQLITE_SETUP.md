# Configuración de SQLite para el Proyecto Renacer

## ✅ Cambios Realizados

El proyecto ha sido configurado para usar **SQLite** en lugar de MySQL. Esto significa que:

1. **No necesitas instalar ningún servidor de base de datos** - SQLite es un archivo de base de datos embebida
2. **La base de datos se crea automáticamente** cuando inicies la aplicación
3. **Todo se guarda en un único archivo** llamado `renacer.db` en la raíz del proyecto

## 📁 Ubicación de la Base de Datos

Por defecto, la base de datos se creará en:
```
Backend/renacer.db
```

Si quieres cambiarla a otra ubicación, edita `application.properties`:
```properties
spring.datasource.url=jdbc:sqlite:/ruta/completa/renacer.db
```

## 🔧 Dependencias Agregadas

Las siguientes dependencias fueron agregadas/modificadas en `build.gradle`:

- ✅ `org.xerial:sqlite-jdbc` - Driver JDBC para SQLite
- ✅ `org.hibernate.orm:hibernate-community-dialects` - Dialecto de Hibernate para SQLite

Se removió:
- ❌ `com.mysql:mysql-connector-j` - Ya no es necesario

## 🚀 Cómo Iniciar

1. **Compila el proyecto:**
   ```bash
   cd Backend
   ./gradlew build
   ```

2. **Ejecuta la aplicación:**
   ```bash
   ./gradlew bootRun
   ```

3. **La base de datos se creará automáticamente** en `Backend/renacer.db`

4. **Hibernate creará todas las tablas automáticamente** gracias a `spring.jpa.hibernate.ddl-auto=update`

## ⚙️ Configuraciones Aplicadas

### Foreign Keys
SQLite tiene las foreign keys deshabilitadas por defecto. Se han configurado automáticamente para que estén habilitadas a través de `DataSourceConfig.java`.

### Optimizaciones
- **Modo WAL (Write-Ahead Logging)**: Mejor rendimiento con operaciones concurrentes
- **Synchronous NORMAL**: Balance entre rendimiento y seguridad de datos

## 📊 Ventajas de SQLite

✅ **Portable**: El archivo de base de datos se puede copiar fácilmente  
✅ **Sin instalación**: No necesitas instalar ningún servidor  
✅ **Ideal para desarrollo**: Perfecto para desarrollo local y pruebas  
✅ **Rápido**: Excelente rendimiento para aplicaciones pequeñas/medianas  
✅ **Autocontenido**: Todo en un solo archivo  

## ⚠️ Consideraciones

1. **Producción**: Para aplicaciones en producción con mucho tráfico, considera usar PostgreSQL o MySQL
2. **Concurrencia**: SQLite maneja bien la concurrencia de lectura, pero tiene limitaciones en escritura concurrente
3. **Tamaño**: Ideal para bases de datos pequeñas/medianas (hasta varios GB)

## 🔍 Verificar que Funciona

Después de iniciar la aplicación, deberías ver en la consola:
```
✅ SQLite configurado correctamente: foreign keys habilitadas, modo WAL activado
```

Y verás que se crea el archivo `renacer.db` en la carpeta `Backend/`.

## 🛠️ Herramientas para Ver la Base de Datos

Puedes usar cualquiera de estas herramientas para ver/editar la base de datos:

- **DB Browser for SQLite** (Gratis, recomendado): https://sqlitebrowser.org/
- **SQLiteStudio** (Gratis): https://sqlitestudio.pl/
- **DBeaver** (Gratis): https://dbeaver.io/
- **Comando línea**: `sqlite3 renacer.db`

## 📝 Notas Adicionales

- El modelo `Asociado` fue ajustado para ser compatible con SQLite (removido `columnDefinition` del ENUM)
- Todas las foreign keys funcionan correctamente
- La configuración de autenticación sigue igual, no se requiere cambio


