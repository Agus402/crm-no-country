# Guía Completa de Docker para el Proyecto CRM

Esta documentación detalla cómo utilizar el entorno Dockerizado para el desarrollo y despliegue local del proyecto CRM.

## Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:
- **Docker Engine**
- **Docker Compose** (generalmente incluido con Docker Desktop o las versiones recientes de Docker Engine)

## Inicio Rápido

Para levantar todo el entorno (Base de datos, Backend y Frontend), abre una terminal en la raíz del proyecto y ejecuta:

```bash
docker compose up --build
```

- El flag `--build` asegura que se reconstruyan las imágenes si hiciste cambios en el código o en los `Dockerfile`.
- El flag `-d` ejecuta los contenedores en **segundo plano** (background), liberando tu terminal.
- Si usas Linux y tienes errores de permisos, antepone `sudo`.

### ¿Qué sucede al ejecutar este comando?
1.  **MySQL**: Se inicia un contenedor de base de datos y se crea automáticamente la base de datos `crm-nocountry`.
2.  **Backend**: Se compila el código Java (Spring Boot) y se inicia el servidor en el puerto `8080`. Espera a que MySQL esté listo antes de iniciar.
3.  **Frontend**: Se construye la aplicación Next.js y se sirve en el puerto `3000`.

---

## Acceso a los Servicios

| Servicio | URL / Dirección | Descripción |
|----------|-----------------|-------------|
| **Frontend** | [http://localhost:3000](http://localhost:3000) | Interfaz de usuario (Next.js) |
| **Backend** | [http://localhost:8080](http://localhost:8080) | API REST (Spring Boot) |
| **Base de Datos** | `localhost:3306` | Servidor MySQL |

---

## Flujo de Trabajo y Desarrollo

### Realizar Cambios en el Código
Actualmente, la configuración está optimizada para **inmutabilidad**. Esto significa que el código se "copia" dentro de los contenedores al momento de construir.

**Si modificas código (Frontend o Backend):**
Debes detener los contenedores y volver a construir para ver los cambios reflejados:

1.  Detén los servicios: `Ctrl + C` o `docker compose down`
2.  Vuelve a levantar con construcción:
    ```bash
    docker compose up --build
    ```

### Persistencia de Datos
La base de datos utiliza un **volumen de Docker** llamado `mysql_data`.
- **¿Qué significa esto?**: Si detienes o eliminas los contenedores (`docker compose down`), **tus datos NO se perderán**. La próxima vez que inicies, la base de datos mantendrá la información guardada.
- **Para borrar todo (reset de fábrica)**:
    ```bash
    docker compose down -v
    ```
    (El flag `-v` elimina también los volúmenes de datos).

---

## Configuración y Variables de Entorno

El proyecto utiliza un archivo `.env` en la raíz para configurar credenciales y puertos.

**Variables Importantes:**
- `MYSQL_ROOT_PASSWORD`: Contraseña root de MySQL.
- `MYSQL_DATABASE`: Nombre de la base de datos a crear.
- `DB_URL`: URL de conexión para el backend (Usa el nombre del servicio `mysql` como host).
- `NEXT_PUBLIC_API_URL`: URL de la API para el frontend.

> **Nota**: Si cambias estas variables, debes reiniciar los contenedores para que surtan efecto.

---

## ❓ Solución de Problemas Comunes

### 1. Error: "Bind for 0.0.0.0:3000 failed: port is already allocated"
**Causa**: Tienes otro proceso (quizás otro servidor de Node o Docker) usando el puerto 3000.
**Solución**:
- Identifica qué proceso usa el puerto: `sudo lsof -i :3000`
- Mátalo o cambia el mapeo de puertos en `docker-compose.yml` (ej: `"3001:3000"`).

### 2. Error de Conexión a Base de Datos al inicio
**Síntoma**: El backend falla diciendo "Connection refused".
**Solución**:
- Docker Compose está configurado para esperar (`depends_on`), pero a veces MySQL tarda más en iniciar la primera vez.
- Simplemente espera unos segundos, el contenedor de backend se reiniciará automáticamente e intentará conectar de nuevo.

### 3. Permisos denegados (Linux)
**Síntoma**: `permission denied while trying to connect to the Docker daemon socket`.
**Solución**:
- Agrega tu usuario al grupo docker: `sudo usermod -aG docker $USER` (requiere reiniciar sesión).
- O usa `sudo` antes de cada comando docker.
