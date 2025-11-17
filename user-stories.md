# Backlog del Proyecto: Startup CRM

## Módulo 1: Gestión de Contactos y Clientes
Este módulo se centra en la organización de la base de datos de clientes y la colaboración del equipo.

| ID | Historia de Usuario | Criterios de Aceptación (Definición de Hecho) | Prioridad |
| :--- | :--- | :--- | :--- |
| **HU-01** | **Como** usuario, **quiero** crear y editar perfiles de contactos manualmente, **para** mantener la base de datos actualizada con su información básica (nombre, teléfono, email). | - Debe validar formato de email y teléfono.<br>- Debe permitir guardar sin todos los campos llenos (flexibilidad). | Alta |
| **HU-02** | **Como** usuario, **quiero** asignar **etiquetas personalizadas** (ej: *Hot Lead*, *Frío*) a los contactos, **para** segmentarlos visualmente y priorizar mi atención. | - Poder crear nuevas etiquetas "al vuelo".<br>- Poder filtrar la lista de contactos por estas etiquetas. | Alta |
| **HU-03** | **Como** usuario, **quiero** cambiar el **estado del funnel** de un cliente (ej: *Prospecto*, *En Negociación*, *Cerrado*), **para** visualizar en qué etapa del proceso de venta se encuentra. | - El cambio de estado debe quedar registrado en el historial.<br>- Debe reflejarse visualmente en el perfil. | Alta |
| **HU-04** | **Como** líder de equipo, **quiero** asignar un contacto a un usuario específico (agente), **para** definir la responsabilidad de la cuenta (Colaboración). | - El agente asignado debe recibir una notificación o ver el contacto en su vista de "Mis Leads". | Media |

## Módulo 2: Comunicación Unificada (Inbox)
Este módulo cubre la interacción vía WhatsApp y Email.

| ID | Historia de Usuario | Criterios de Aceptación (Definición de Hecho) | Prioridad |
| :--- | :--- | :--- | :--- |
| **HU-05** | **Como** usuario, **quiero** ver una **bandeja de entrada unificada**, **para** gestionar conversaciones de WhatsApp y Email en un mismo hilo cronológico. | - Diferenciar visualmente si el mensaje es de WhatsApp o Email (iconos/colores).<br>- Ordenar por mensaje más reciente. | **Crítica** |
| **HU-06** | **Como** usuario, **quiero** enviar un mensaje de **WhatsApp** desde la plataforma, **para** responder al cliente sin usar mi teléfono personal. | - Integración con API Meta.<br>- Feedback visual de "Enviado" y "Leído" (doble check). | **Crítica** |
| **HU-07** | **Como** usuario, **quiero** enviar correos electrónicos desde la plataforma, **para** formalizar propuestas o enviar información extensa. | - Integración SMTP/Brevo.<br>- Editor de texto enriquecido básico (negritas, listas). | Alta |
| **HU-08** | **Como** usuario, **quiero** seleccionar **plantillas de mensajes predefinidas**, **para** responder preguntas frecuentes rápidamente. | - Un selector rápido de plantillas al redactar.<br>- Las plantillas deben permitir variables básicas (ej: `Hola {{nombre}}`). | Media |
| **HU-09** | **Como** sistema, **quiero** crear un nuevo contacto automáticamente cuando recibo un mensaje de un número desconocido, **para** no perder ningún lead entrante. | - Crear contacto con el número de teléfono como nombre temporal.<br>- Notificar al equipo de un "Nuevo Lead Entrante". | Alta |

## Módulo 3: Automatización y Notificaciones
Funcionalidades inteligentes para el seguimiento asincrónico.

| ID | Historia de Usuario | Criterios de Aceptación (Definición de Hecho) | Prioridad |
| :--- | :--- | :--- | :--- |
| **HU-10** | **Como** usuario, **quiero** recibir **notificaciones en tiempo real** (burbuja en la UI) cuando llega un mensaje nuevo, **para** responder lo antes posible. | - No debe requerir recargar la página (uso de WebSockets/Polling).<br>- Debe sonar un sonido de alerta (configurable). | Alta |
| **HU-11** | **Como** usuario, **quiero** programar **recordatorios de seguimiento** (ej: "Llamar mañana"), **para** que el sistema me alerte y no olvidar la tarea. | - Debe aparecer en un panel de "Tareas del día".<br>- Debe enviar una alerta o email al usuario cuando venza el plazo. | Media |
| **HU-12** | **Como** usuario, **quiero** configurar reglas de **seguimiento automático** (ej: enviar email si no responde en 3 días), **para** reactivar leads sin intervención manual. | - El sistema debe verificar la última fecha de interacción.<br>- El sistema debe detener la automatización si el cliente responde antes. | Baja (MVP 2) |

## Módulo 4: Analítica y Reportes
Visualización de datos para la toma de decisiones.

| ID | Historia de Usuario | Criterios de Aceptación (Definición de Hecho) | Prioridad |
| :--- | :--- | :--- | :--- |
| **HU-13** | **Como** administrador, **quiero** ver un gráfico de barras con la cantidad de **mensajes enviados/recibidos por semana**, **para** medir la carga de trabajo del equipo. | - Filtrar por rango de fechas.<br>- Diferenciar entre WhatsApp y Email. | Media |
| **HU-14** | **Como** administrador, **quiero** visualizar la distribución de leads por **etapa del funnel**, **para** saber cuántos clientes potenciales están cerca del cierre. | - Gráfico de embudo o torta.<br>- Debe actualizarse en tiempo real o diariamente. | Media |
| **HU-15** | **Como** usuario, **quiero** exportar los reportes o listas de contactos a **PDF o CSV**, **para** presentar informes externos o analizar datos en Excel. | - El archivo descargado debe tener formato legible.<br>- Respetar los filtros aplicados en la vista actual. | Baja |

## Módulo 5: Configuración (Técnico/Admin)

| ID | Historia de Usuario | Criterios de Aceptación (Definición de Hecho) | Prioridad |
| :--- | :--- | :--- | :--- |
| **HU-16** | **Como** administrador, **quiero** configurar las credenciales de las APIs (WhatsApp Cloud API y SMTP), **para** activar las integraciones sin tocar el código fuente. | - Panel de configuración seguro.<br>- Validación de conexión exitosa al guardar. | Alta |
