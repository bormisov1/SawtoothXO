# SawtoothXO
Client for Hyperledger Sawtooth's XO transaction family

1. ```npm i```
2. ```npm run build```
2. Open index.html in any browser

Appropriate docker-compose file: https://sawtooth.hyperledger.org/docs/core/releases/1.0.1/app_developers_guide/sawtooth-default.yaml

If having issues with 405 method unallowed for OPTIONS or CORS:
1. Install apache2
2. Create or edit following file /etc/apache2/sites-enabled/000-default.conf:
```
  <VirtualHost *:80>
    ProxyPreserveHost On
    ProxyRequests Off
    ServerName bormisovVlad.local.plou
    ProxyPass / http://localhost:8080/
    ProxyPassReverse / http://localhost:8080/

    # enable cross domain access control
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "POST, GET, OPTIONS"

    # force apache to return 200 without executing my scripts
    RewriteEngine On
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule .* / [R=200,L]
  </VirtualHost>
```
3. ```sudo apachectl restart```
4. change port to 80 at src/state.js:16
5. ```npm run build```
