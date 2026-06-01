# TLS certificates for production Nginx

Place your production certificate files in this directory on the server:

- `fullchain.pem`
- `privkey.pem`

Expected container paths used by Nginx:

- `/etc/nginx/ssl/fullchain.pem`
- `/etc/nginx/ssl/privkey.pem`

Notes:

- Do not commit real certificate or private key files to Git.
- Keep this directory as deployment-only secret material.
- On Hostinger, copy certificate files to this path before running:
  - `docker compose -f compose.prod.yaml up -d`
