param(
  [Parameter(Mandatory = $true)]
  [string]$Domain,

  [Parameter(Mandatory = $true)]
  [string]$Email
)

$ErrorActionPreference = "Stop"

Write-Host "[1/4] App stack (postgres + app + nginx) başlatılıyor..."
docker compose up -d --build postgres app nginx

Write-Host "[2/4] Let's Encrypt sertifikası alınıyor..."
docker compose run --rm certbot certonly --webroot -w /var/www/certbot -d $Domain --email $Email --agree-tos --no-eff-email

$nginxSslConf = @"
server {
    listen 80;
    server_name $Domain;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name $Domain;

    ssl_certificate /etc/letsencrypt/live/$Domain/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$Domain/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    client_max_body_size 20m;

    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
"@

Set-Content -Path "nginx/conf.d/app.conf" -Value $nginxSslConf -Encoding UTF8

Write-Host "[3/4] Nginx SSL config uygulanıyor..."
docker compose restart nginx

Write-Host "[4/4] Certbot renew servisi başlatılıyor..."
docker compose up -d certbot

Write-Host "Tamamlandı. HTTPS aktif: https://$Domain"
