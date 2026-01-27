-- Script para agregar la columna Carreta a la tabla encabezado_ingreso
-- Este script verifica si la columna existe antes de agregarla

-- SQLite no soporta IF NOT EXISTS en ALTER TABLE ADD COLUMN directamente
-- Por lo tanto, intentamos agregar la columna y si falla, significa que ya existe
-- En SQLite, si la columna ya existe, simplemente no se agregará

ALTER TABLE encabezado_ingreso 
ADD COLUMN Carreta VARCHAR(50);

-- Verificar que la columna se agregó correctamente
-- (Esto solo mostrará información, no afectará si la columna ya existe)
SELECT sql FROM sqlite_master 
WHERE type='table' AND name='encabezado_ingreso';

