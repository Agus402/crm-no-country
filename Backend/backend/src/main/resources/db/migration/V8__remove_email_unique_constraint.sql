-- Eliminar la restricción UNIQUE del email si existe
-- Esto permite que diferentes usuarios tengan leads con el mismo email

-- MySQL 5.7+ soporta DROP INDEX IF EXISTS
ALTER TABLE crm_lead DROP INDEX IF EXISTS UKbygvcik6lx2u4qj9n7vdb878k;
