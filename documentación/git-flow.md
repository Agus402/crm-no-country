# Flujo de Trabajo Git (Gitflow) - Startup CRM

Este documento define la estrategia de ramas y el flujo de trabajo que utilizaremos para el desarrollo del CRM. El objetivo es mantener un código ordenado, minimizar conflictos y asegurar que `main` siempre sea estable.

## Estructura de Ramas

### 1. Ramas Principales (Protected)
Estas ramas son permanentes y **no se debe hacer push directo** sobre ellas.

* **`main`**: Contiene el código de **producción**. Es la versión estable, probada y lista para el cliente. Todo lo que entra aquí viene de `develop` (o de un `hotfix` crítico).
* **`develop`**: Es la rama de **integración**. Aquí se mezclan todas las nuevas funcionalidades. Es la base para empezar cualquier tarea nueva.

### 2. Ramas de Trabajo (Temporales)
Estas ramas las crean los desarrolladores y se eliminan una vez fusionadas.

* **`feature/*`**: Para nuevas funcionalidades o historias de usuario. Nacen de `develop` y vuelven a `develop`.
* **`bugfix/*`**: Para corregir errores encontrados durante el desarrollo (antes de producción). Nacen de `develop`.
* **`hotfix/*`**: (Uso excepcional) Para errores críticos en producción. Nacen de `main` y se fusionan en `main` y `develop`.

---

## Convención de Nombres

Al crear una rama, usaremos el siguiente formato para mantener el orden. Si es posible, **incluir el ID de la Historia de Usuario (HU)**.

| Tipo | Formato | Ejemplo |
| :--- | :--- | :--- |
| **Feature** | `feature/HU-{ID}-{descripcion-breve}` | `feature/HU-01-login-usuario` |
| **Bugfix** | `bugfix/{descripcion-del-error}` | `bugfix/error-conexion-whatsapp` |
| **Hotfix** | `hotfix/{error-critico}` | `hotfix/parche-seguridad-login` |

---

## Flujo de Trabajo (Paso a Paso)

### 1. Empezar una tarea
Antes de empezar, asegúrate de tener la última versión del código y asignarsela en la sección correspondiente (Front, Back, DevOps, etc)

```bash
# Cambiar a develop y actualizar
git checkout develop
git pull origin develop

# Crear tu rama (Ejemplo para la HU-05 Inbox)
git checkout -b feature/HU-05-inbox-unificado