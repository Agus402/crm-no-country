-- Agregar campo account_type a la tabla accounts
-- Este campo determina el tipo de cuenta y el rol automático de los usuarios

ALTER TABLE accounts ADD COLUMN account_type VARCHAR(20) AFTER date_format;

-- Actualizar cuentas existentes con un valor por defecto (COMPANY)
UPDATE accounts SET account_type = 'COMPANY' WHERE account_type IS NULL;
