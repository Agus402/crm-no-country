package com.nocountry.backend.enums;

/**
 * Tipo de cuenta en el sistema CRM.
 * - CLIENT: Cuenta de cliente individual (usuarios con rol USER)
 * - COMPANY: Cuenta empresarial (usuarios con rol ADMIN)
 */
public enum AccountType {
    CLIENT,
    COMPANY
}
