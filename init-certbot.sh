#!/bin/bash

# =========================================================
# CONFIGURACIÓN
# =========================================================
DOMAIN="crm-noc.ddns.net"
EMAIL="adrielscklink@gmail.com"
# =========================================================

# 1. Crear estructura de carpetas local
echo "### Creando directorios..."
mkdir -p ./certbot/www
mkdir -p ./certbot/conf

# 2. Descargar parámetros de seguridad recomendados (ssl-dhparams)
if [ ! -f "./certbot/conf/options-ssl-nginx.conf" ]; then
  echo "### Descargando parámetros de seguridad SSL..."
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "./certbot/conf/options-ssl-nginx.conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "./certbot/conf/ssl-dhparams.pem"
fi

# 3. Crear certificado "dummy" (falso) para que Nginx pueda arrancar la primera vez
# Sin esto, Nginx falla porque no encuentra el archivo .pem configurado en default.conf
if [ ! -f "./certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
  echo "### Creando certificado dummy (temporal) para $DOMAIN..."
  mkdir -p "./certbot/conf/live/$DOMAIN"
  openssl req -x509 -nodes -newkey rsa:4096 -days 1 \
    -keyout "./certbot/conf/live/$DOMAIN/privkey.pem" \
    -out "./certbot/conf/live/$DOMAIN/fullchain.pem" \
    -subj "/CN=localhost"
fi

# 4. Iniciar Nginx (Proxy) en segundo plano
echo "### Iniciando Nginx..."
docker compose -f docker-compose.prod.yml up -d proxy

# 5. Solicitar el certificado REAL usando la imagen oficial de Certbot
# (Esto sobrescribirá el certificado dummy que creamos en el paso 3)
echo "### Eliminando dummy y solicitando certificado Let's Encrypt..."
rm -Rf ./certbot/conf/live/$DOMAIN && \
rm -Rf ./certbot/conf/archive/$DOMAIN && \
rm -Rf ./certbot/conf/renewal/$DOMAIN.conf

docker run --rm \
  -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
  -v "$(pwd)/certbot/www:/var/www/certbot" \
  certbot/certbot \
  certonly --webroot -w /var/www/certbot \
    -d "$DOMAIN" \
    --email "$EMAIL" \
    --rsa-key-size 4096 \
    --agree-tos \
    --force-renewal \
    --non-interactive

# 6. Recargar Nginx para que tome el certificado nuevo
echo "### Recargando Nginx..."
docker compose -f docker-compose.prod.yml exec proxy nginx -s reload

echo "### ¡Proceso finalizado! Accede a https://$DOMAIN"
