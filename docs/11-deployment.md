# Production Deployment

## Overview

NutriShop runs on a **DigitalOcean Droplet** (VPS) using Docker Compose — the same setup as local development. A GitHub Actions workflow auto-deploys on every push to `main`.

```
GitHub (push to main) → GitHub Actions → SSH into Droplet → git pull → docker compose build → docker compose up -d
```

## Infrastructure

| Component    | Details                                |
| ------------ | -------------------------------------- |
| **Provider** | DigitalOcean                           |
| **Product**  | Droplet (VPS)                          |
| **Region**   | Frankfurt (FRA1)                       |
| **OS**       | Ubuntu 24.04 LTS                       |
| **Plan**     | $4/month (512MB RAM, 1 vCPU, 10GB SSD) |
| **Swap**     | 1GB (configured manually)              |
| **IP**       | `68.183.214.69`                        |

### URLs

| Service     | URL                              |
| ----------- | -------------------------------- |
| Frontend    | http://68-183-214-69.nip.io:3000 |
| Backend API | http://68-183-214-69.nip.io:4000 |

### Domain — nip.io

Google OAuth requires a domain name (bare IP addresses are rejected). We use **nip.io**, a free wildcard DNS service that maps any IP to a hostname:

```
68-183-214-69.nip.io → resolves to 68.183.214.69
```

No setup needed — it works instantly. If you buy a real domain later, update:

1. DNS A record pointing to the Droplet IP
2. `.env` on the server (`FRONTEND_URL`, `NEXT_PUBLIC_BACKEND_URL`, `GOOGLE_CALLBACK_URL`)
3. Google Cloud Console (authorized origins + redirect URIs)
4. Rebuild the frontend (`docker compose build --no-cache frontend && docker compose up -d`)

## Server Setup (One-Time)

### 1. Create Droplet

- Region: **Frankfurt**
- Image: **Ubuntu 24.04 LTS**
- Plan: **$4/month** (or $6 for 1GB RAM)
- Auth: **SSH key** (use existing key from your machine)

### 2. Enable Swap (for $4 plan)

512MB RAM is tight for 3 Docker containers. Add 1GB swap:

```bash
ssh root@<DROPLET_IP>
fallocate -l 1G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### 3. Install Docker

```bash
apt-get update
apt-get install -y docker.io git curl

# Add Docker Compose plugin from official repo
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu noble stable" > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-compose-plugin

systemctl enable docker
systemctl start docker
```

### 4. Set Up Deploy Key (for private repo)

Generate a deploy key on the server so it can pull from GitHub:

```bash
ssh-keygen -t ed25519 -f /root/.ssh/deploy_key -N "" -C "deploy@nutrishop"
cat /root/.ssh/deploy_key.pub
```

Add the public key to **GitHub → Repo → Settings → Deploy keys**.

Configure git to use the deploy key:

```bash
git config --global core.sshCommand "ssh -i /root/.ssh/deploy_key -o StrictHostKeyChecking=no"
```

### 5. Clone the Repo

```bash
cd /opt
GIT_SSH_COMMAND="ssh -i /root/.ssh/deploy_key -o StrictHostKeyChecking=accept-new" \
  git clone git@github.com:Med1233/NutriShop.git app
```

### 6. Create Production `.env`

```bash
cat > /opt/app/.env << 'EOF'
POSTGRES_USER=admin
POSTGRES_PASSWORD=<generate-with-openssl-rand-hex-16>
POSTGRES_DB=appdb
DATABASE_URL=postgresql://admin:<same-password>@postgres:5432/appdb
JWT_SECRET=<generate-with-openssl-rand-hex-32>
JWT_REFRESH_SECRET=<generate-with-openssl-rand-hex-32>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_CALLBACK_URL=http://<IP-WITH-DASHES>.nip.io:4000/api/auth/google/callback
FRONTEND_URL=http://<IP-WITH-DASHES>.nip.io:3000
NEXT_PUBLIC_BACKEND_URL=http://<IP-WITH-DASHES>.nip.io:4000
ADMIN_EMAIL=<your-admin-email>
ADMIN_PASSWORD=<strong-password>
ADMIN_NAME=Admin
EOF
```

Generate secure secrets:

```bash
openssl rand -hex 32   # for JWT_SECRET
openssl rand -hex 32   # for JWT_REFRESH_SECRET
openssl rand -hex 16   # for POSTGRES_PASSWORD
```

### 7. Configure Google OAuth

In [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials), update your OAuth 2.0 Client:

- **Authorised JavaScript origins**: add `http://<IP-WITH-DASHES>.nip.io:3000`
- **Authorised redirect URIs**: add `http://<IP-WITH-DASHES>.nip.io:4000/api/auth/google/callback`

Keep the `localhost` entries for local development.

> **Note:** Google OAuth rejects bare IP addresses — a domain name is required. The nip.io hostname satisfies this requirement.

### 8. Build and Start

```bash
cd /opt/app
docker compose up --build -d
```

Verify all services are running:

```bash
docker compose ps
curl http://localhost:4000/api/health   # {"status":"ok"}
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000   # 200
```

## Auto-Deploy via GitHub Actions

### How It Works

The `.github/workflows/deploy.yml` workflow triggers on every push to `main`:

```yaml
on:
  push:
    branches: [main]
```

It SSHs into the Droplet and runs:

```bash
cd /opt/app
git pull origin main
docker compose build
docker compose up -d
docker image prune -f
```

### Required GitHub Secrets

Set these at **GitHub → Repo → Settings → Secrets and variables → Actions**:

| Secret            | Value                                     |
| ----------------- | ----------------------------------------- |
| `DROPLET_IP`      | The Droplet's public IP address           |
| `DROPLET_SSH_KEY` | Private key for SSH access to the Droplet |

### CI Deploy Key Setup

Generate a dedicated SSH key for GitHub Actions on the server:

```bash
ssh-keygen -t ed25519 -f /root/.ssh/ci_deploy -N "" -C "ci-deploy"
cat /root/.ssh/ci_deploy.pub >> /root/.ssh/authorized_keys
cat /root/.ssh/ci_deploy   # Copy this as DROPLET_SSH_KEY secret
```

## Manual Deployment

If the GitHub Action fails or you need to deploy manually:

```bash
ssh root@<DROPLET_IP>
cd /opt/app
git pull origin main
docker compose build
docker compose up -d
docker image prune -f
```

## Key Configuration Notes

### NEXT_PUBLIC_BACKEND_URL

This variable is **inlined at build time** by Next.js (not at runtime). It must be:

1. Set in the `.env` file on the server
2. Passed as a Docker build arg in `docker-compose.yml`
3. Point to the **public** backend URL (e.g., `http://<DROPLET_IP>:4000`)

If you change the server IP or add a domain, you must rebuild the frontend:

```bash
docker compose build --no-cache frontend
docker compose up -d frontend
```

### Frontend Dockerfile — pnpm Symlink Resolution

The frontend Dockerfile has a special step to resolve pnpm symlinks in the Next.js standalone output. pnpm uses symlinks for `node_modules`, but these break when copied to the Docker runner stage. The Dockerfile uses `npm install` in the standalone directory to get flat `node_modules`:

```dockerfile
RUN cd /app/frontend/.next/standalone && \
    rm -rf node_modules package-lock.json && \
    echo '{"dependencies":{"next":"14.2.35","react":"18.3.1","react-dom":"18.3.1"}}' > package.json && \
    npm install --omit=dev
```

### Memory Usage ($4 Plan)

| Resource | Usage               |
| -------- | ------------------- |
| RAM      | ~200-250MB of 458MB |
| Swap     | ~200MB of 1GB       |
| Disk     | ~2-3GB of 10GB      |

If performance degrades, upgrade to the **$6/month plan** (1GB RAM) via DigitalOcean dashboard — no data loss, just a reboot.

## Monitoring

### Check service status

```bash
ssh root@<DROPLET_IP> "cd /opt/app && docker compose ps"
```

### View logs

```bash
ssh root@<DROPLET_IP> "cd /opt/app && docker compose logs --tail 50"
ssh root@<DROPLET_IP> "cd /opt/app && docker compose logs -f frontend"   # follow
ssh root@<DROPLET_IP> "cd /opt/app && docker compose logs backend | grep AUDIT"  # audit logs
```

### Check memory

```bash
ssh root@<DROPLET_IP> "free -m"
```

### Restart a service

```bash
ssh root@<DROPLET_IP> "cd /opt/app && docker compose restart frontend"
```

### Full restart

```bash
ssh root@<DROPLET_IP> "cd /opt/app && docker compose down && docker compose up -d"
```

## Troubleshooting

### Frontend shows "No products found"

`NEXT_PUBLIC_BACKEND_URL` is wrong or the frontend wasn't rebuilt after changing it. Fix:

```bash
# Verify the .env has the correct value
grep NEXT_PUBLIC /opt/app/.env

# Rebuild frontend
cd /opt/app && docker compose build --no-cache frontend && docker compose up -d frontend
```

### Container keeps restarting

Check logs:

```bash
docker compose logs --tail 20 <service-name>
```

### Out of memory (OOM kills)

Check if swap is enabled:

```bash
free -m
```

If swap shows 0, re-enable it (see step 2). If still OOM, upgrade the Droplet.

### Deploy Action fails

1. Check the Action logs at GitHub → Actions
2. Verify secrets are set correctly
3. Test SSH manually: `ssh -i ci_deploy root@<DROPLET_IP> "echo ok"`
4. Check the server has disk space: `df -h`
