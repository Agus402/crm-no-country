# 🚀 CRM No Country

Sistema CRM moderno para gestión de leads y comunicación multicanal.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-green)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

## 📋 Características

### 💬 Comunicación Multicanal
- **WhatsApp Business** - Envío y recepción de mensajes, imágenes, videos, audios y documentos
- **Email** - Composición con editor rico, threading automático de respuestas
- Selector de canal al crear nuevas conversaciones

### 👥 Gestión de Contactos
- Vista de tabla y cards responsive
- Filtros por etapa del funnel (Lead, Follow-up, Cliente)
- Exportación a CSV
- Etiquetas personalizables

### 📊 Panel de Control
- Métricas en tiempo real
- Historial de conversaciones
- Asignación de leads a usuarios

### ⚙️ Configuración
- Integración con WhatsApp Cloud API
- Configuración SMTP/IMAP para emails
- Gestión de plantillas de email

---

## 🛠️ Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| **Frontend** | Next.js 16, React 19, TailwindCSS, shadcn/ui |
| **Backend** | Spring Boot 3, Java 17, Spring Security + JWT |
| **Base de Datos** | MySQL 8.0 |
| **Mensajería** | WhatsApp Cloud API, JavaMail (SMTP/IMAP) |
| **Infraestructura** | Docker, Nginx, WebSockets |

---

## 🚀 Instalación Rápida (Docker)

### Prerrequisitos
- Docker y Docker Compose
- Cuenta de WhatsApp Business API (opcional)
- Credenciales SMTP/IMAP (opcional)

### 1. Clonar el repositorio
```bash
git clone https://github.com/Agus402/crm-no-country.git
cd crm-no-country
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

### 3. Ejecutar con Docker
```bash
# Producción
sudo docker compose -f docker-compose.prod.yml up --build

# Desarrollo (con hot-reload)
sudo docker compose up --build
```

### 4. Acceder
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **Swagger**: http://localhost:8080/swagger-ui.html

---

## 🔧 Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `MYSQL_ROOT_PASSWORD` | Contraseña root MySQL | `password123` |
| `MYSQL_DATABASE` | Nombre de la base de datos | `crm_db` |
| `JWT_SECRET_KEY` | Clave secreta para JWT | `mi-clave-secreta-256-bits` |
| `WHATSAPP_TOKEN` | Token de WhatsApp Cloud API | `EAABpX...` |
| `WHATSAPP_PHONE_NUMBER_ID` | ID del número de WhatsApp | `123456789` |
| `MAIL_IMAP_HOST` | Servidor IMAP | `imap.gmail.com` |
| `MAIL_IMAP_USERNAME` | Usuario de email | `user@gmail.com` |
| `MAIL_IMAP_PASSWORD` | Contraseña de aplicación | `xxxx xxxx xxxx xxxx` |

---

## 📁 Estructura del Proyecto

```
crm-no-country/
├── Backend/
│   └── backend/
│       ├── src/main/java/com/nocountry/backend/
│       │   ├── controller/     # Endpoints REST
│       │   ├── services/       # Lógica de negocio
│       │   ├── entity/         # Entidades JPA
│       │   ├── repository/     # Repositorios Spring Data
│       │   └── dto/            # Data Transfer Objects
│       └── Dockerfile
├── frontend/
│   ├── app/                    # App Router de Next.js
│   ├── components/             # Componentes React
│   ├── services/               # Servicios API
│   └── Dockerfile
├── nginx/
│   └── default.conf            # Configuración reverse proxy
└── docker-compose.prod.yml     # Orquestación Docker
```

---

## 📡 API Endpoints Principales

### Autenticación
```
POST /api/auth/register     # Registrar usuario
POST /api/auth/login        # Iniciar sesión
```

### Conversaciones
```
GET  /api/conversations          # Listar conversaciones
POST /api/conversations          # Crear conversación
GET  /api/conversations/{id}     # Obtener conversación
```

### Mensajes
```
GET  /api/messages/conversation/{id}  # Mensajes de una conversación
POST /api/messages                    # Enviar mensaje
```

### Leads
```
GET  /api/crmleads          # Listar leads
POST /api/crmleads          # Crear lead
PUT  /api/crmleads/{id}     # Actualizar lead
```

---

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 👥 Equipo

Desarrollado para **No Country** - Simulación laboral tech.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
