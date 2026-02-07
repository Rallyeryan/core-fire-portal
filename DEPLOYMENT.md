# Deployment Guide

This guide covers deploying Core Fire Portal to production environments.

## Prerequisites

Before deploying, ensure you have:

- A MySQL 8.x or TiDB database instance
- An AWS account with S3 access
- An SMTP server for sending emails
- A server or hosting platform (VPS, cloud provider, etc.)
- Node.js 22.x or higher installed on the server
- SSL/TLS certificate for HTTPS

## Environment Setup

### 1. Database Configuration

Create a production database and user with appropriate permissions:

```sql
CREATE DATABASE core_fire_portal;
CREATE USER 'corefire'@'%' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON core_fire_portal.* TO 'corefire'@'%';
FLUSH PRIVILEGES;
```

### 2. AWS S3 Setup

Create an S3 bucket for storing signatures and PDFs:

```bash
# Using AWS CLI
aws s3 mb s3://core-fire-portal-production
aws s3api put-bucket-versioning \
  --bucket core-fire-portal-production \
  --versioning-configuration Status=Enabled
```

Configure bucket policy to restrict public access while allowing your application to read/write.

### 3. Environment Variables

Create a `.env` file on your production server:

```env
# Database
DATABASE_URL=mysql://corefire:password@db-host:3306/core_fire_portal

# AWS S3
AWS_ACCESS_KEY_ID=your_production_access_key
AWS_SECRET_ACCESS_KEY=your_production_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=core-fire-portal-production

# SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@corefire.co.uk
SMTP_PASS=your_smtp_password
SMTP_FROM=noreply@corefire.co.uk
SMTP_FROM_NAME=Core Fire Protection

# Application
NODE_ENV=production
PORT=5000

# Admin
OWNER_OPEN_ID=your_admin_openid
```

**Important**: Never commit this file to version control.

## Deployment Methods

### Method 1: Traditional VPS Deployment

#### Step 1: Clone and Build

```bash
# Clone the repository
git clone https://github.com/Rallyeryan/core-fire-portal.git
cd core-fire-portal

# Install dependencies
pnpm install

# Build the application
pnpm build
```

#### Step 2: Run Database Migrations

```bash
pnpm db:push
```

#### Step 3: Set Up Process Manager

Using PM2 to keep the application running:

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start dist/index.js --name core-fire-portal

# Save PM2 configuration
pm2 save

# Set PM2 to start on system boot
pm2 startup
```

#### Step 4: Configure Nginx Reverse Proxy

Create an Nginx configuration file:

```nginx
server {
    listen 80;
    server_name corefire.co.uk www.corefire.co.uk;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name corefire.co.uk www.corefire.co.uk;

    ssl_certificate /etc/ssl/certs/corefire.crt;
    ssl_certificate_key /etc/ssl/private/corefire.key;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the configuration and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/corefire /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Method 2: Docker Deployment

#### Step 1: Create Dockerfile

```dockerfile
FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Expose port
EXPOSE 5000

# Start application
CMD ["node", "dist/index.js"]
```

#### Step 2: Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - AWS_REGION=${AWS_REGION}
      - AWS_S3_BUCKET=${AWS_S3_BUCKET}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASS=${SMTP_PASS}
      - OWNER_OPEN_ID=${OWNER_OPEN_ID}
    restart: unless-stopped
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=core_fire_portal
      - MYSQL_USER=corefire
      - MYSQL_PASSWORD=${MYSQL_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  mysql_data:
```

#### Step 3: Deploy with Docker Compose

```bash
docker-compose up -d
```

### Method 3: Platform-as-a-Service (Heroku, Railway, etc.)

Most PaaS providers support Node.js applications. Generally:

1. Connect your GitHub repository
2. Set environment variables in the platform dashboard
3. Configure build command: `pnpm build`
4. Configure start command: `pnpm start`
5. Deploy

## Post-Deployment Checklist

After deployment, verify:

- [ ] Application is accessible via HTTPS
- [ ] Database connection is working
- [ ] S3 file uploads are functioning
- [ ] Email sending is operational
- [ ] Admin login works correctly
- [ ] Agreement submission and PDF generation work
- [ ] All environment variables are set correctly
- [ ] SSL certificate is valid and not expired
- [ ] Firewall rules are configured properly
- [ ] Monitoring and logging are set up
- [ ] Backups are configured

## Monitoring and Maintenance

### Application Monitoring

Monitor your application using tools like:

- **PM2 Monitoring**: `pm2 monit`
- **Application Logs**: `pm2 logs core-fire-portal`
- **Error Tracking**: Sentry, Rollbar, or similar
- **Uptime Monitoring**: UptimeRobot, Pingdom, or similar

### Database Backups

Set up automated database backups:

```bash
# Example backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u corefire -p core_fire_portal > backup_$DATE.sql
# Upload to S3 or backup storage
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/
```

Schedule this script with cron:

```bash
0 2 * * * /path/to/backup-script.sh
```

### Updates and Upgrades

To update the application:

```bash
# Pull latest changes
git pull origin main

# Install dependencies
pnpm install

# Build application
pnpm build

# Run migrations if needed
pnpm db:push

# Restart application
pm2 restart core-fire-portal
```

## Troubleshooting

### Application Won't Start

Check logs for errors:

```bash
pm2 logs core-fire-portal --lines 100
```

Common issues:
- Database connection failed: Verify `DATABASE_URL`
- Port already in use: Change `PORT` environment variable
- Missing dependencies: Run `pnpm install`

### Database Connection Issues

Test database connectivity:

```bash
mysql -h db-host -u corefire -p core_fire_portal
```

Verify firewall rules allow connections from your application server.

### S3 Upload Failures

Check AWS credentials and bucket permissions. Test with AWS CLI:

```bash
aws s3 ls s3://core-fire-portal-production
```

### Email Not Sending

Verify SMTP credentials and test connection:

```bash
telnet smtp.example.com 587
```

Check spam folders and email server logs.

## Security Considerations

- Keep all dependencies up to date
- Regularly rotate AWS credentials
- Monitor access logs for suspicious activity
- Enable database SSL connections
- Use strong passwords for all services
- Implement rate limiting at the reverse proxy level
- Set up automated security scanning

## Rollback Procedure

If deployment fails:

```bash
# Revert to previous version
git checkout previous-commit-hash

# Rebuild
pnpm install
pnpm build

# Restart
pm2 restart core-fire-portal
```

## Support

For deployment issues or questions, please open an issue on GitHub or contact the development team.
