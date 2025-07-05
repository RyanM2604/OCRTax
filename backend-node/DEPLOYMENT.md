# OCRTax Backend Deployment Guide

This guide covers deployment options for the OCRTax Node.js backend across different environments and platforms.

## 🚀 Quick Start Options

### 1. Local Development

```bash
cd backend-node
./setup.sh
npm run dev
```

### 2. Docker Compose (Recommended for Development)

```bash
cd backend-node
docker-compose up -d
```

### 3. Production Docker

```bash
cd backend-node
docker build -t ocrtax-backend .
docker run -p 5000:5000 --env-file .env ocrtax-backend
```

## 📋 Prerequisites

### Required Services

- **MongoDB**: Local installation or MongoDB Atlas
- **AWS Account**: For S3 storage
- **OpenAI API**: For AI processing

### Environment Variables

Create a `.env` file with all required variables (see `env.example`).

## 🐳 Docker Deployment

### Development with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

### Production Docker

```bash
# Build image
docker build -t ocrtax-backend .

# Run container
docker run -d \
  --name ocrtax-backend \
  -p 5000:5000 \
  --env-file .env \
  -v $(pwd)/uploads:/app/uploads \
  ocrtax-backend

# View logs
docker logs -f ocrtax-backend

# Stop container
docker stop ocrtax-backend
```

## ☁️ Cloud Deployment

### AWS EC2 Deployment

1. **Launch EC2 Instance**:

   ```bash
   # Connect to your EC2 instance
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

2. **Install Dependencies**:

   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2
   sudo npm install -g pm2

   # Install Docker (optional)
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   ```

3. **Deploy Application**:

   ```bash
   # Clone repository
   git clone your-repo-url
   cd ocrtax/backend-node

   # Install dependencies
   npm install

   # Create environment file
   cp env.example .env
   # Edit .env with production values

   # Start with PM2
   pm2 start src/server.js --name ocrtax-backend
   pm2 startup
   pm2 save
   ```

4. **Configure Nginx** (Optional):

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

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

### AWS ECS Deployment

1. **Create ECR Repository**:

   ```bash
   aws ecr create-repository --repository-name ocrtax-backend
   ```

2. **Build and Push Image**:

   ```bash
   # Get login token
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account-id.dkr.ecr.us-east-1.amazonaws.com

   # Build and tag
   docker build -t ocrtax-backend .
   docker tag ocrtax-backend:latest your-account-id.dkr.ecr.us-east-1.amazonaws.com/ocrtax-backend:latest

   # Push to ECR
   docker push your-account-id.dkr.ecr.us-east-1.amazonaws.com/ocrtax-backend:latest
   ```

3. **Create ECS Task Definition**:
   ```json
   {
     "family": "ocrtax-backend",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "512",
     "memory": "1024",
     "executionRoleArn": "arn:aws:iam::your-account-id:role/ecsTaskExecutionRole",
     "containerDefinitions": [
       {
         "name": "ocrtax-backend",
         "image": "your-account-id.dkr.ecr.us-east-1.amazonaws.com/ocrtax-backend:latest",
         "portMappings": [
           {
             "containerPort": 5000,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "NODE_ENV",
             "value": "production"
           },
           {
             "name": "PORT",
             "value": "5000"
           }
         ],
         "secrets": [
           {
             "name": "JWT_SECRET",
             "valueFrom": "arn:aws:secretsmanager:us-east-1:your-account-id:secret:ocrtax/jwt-secret"
           },
           {
             "name": "OPENAI_API_KEY",
             "valueFrom": "arn:aws:secretsmanager:us-east-1:your-account-id:secret:ocrtax/openai-key"
           }
         ],
         "logConfiguration": {
           "logDriver": "awslogs",
           "options": {
             "awslogs-group": "/ecs/ocrtax-backend",
             "awslogs-region": "us-east-1",
             "awslogs-stream-prefix": "ecs"
           }
         }
       }
     ]
   }
   ```

### Heroku Deployment

1. **Install Heroku CLI**:

   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku

   # Ubuntu
   sudo snap install heroku --classic
   ```

2. **Deploy to Heroku**:

   ```bash
   # Login to Heroku
   heroku login

   # Create app
   heroku create your-ocrtax-app

   # Add MongoDB addon
   heroku addons:create mongolab:sandbox

   # Set environment variables
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-super-secret-jwt-key
   heroku config:set AWS_ACCESS_KEY_ID=your-aws-access-key
   heroku config:set AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   heroku config:set AWS_REGION=us-east-1
   heroku config:set AWS_S3_BUCKET=your-s3-bucket
   heroku config:set OPENAI_API_KEY=your-openai-api-key

   # Deploy
   git push heroku main
   ```

### Railway Deployment

1. **Connect Repository**:

   - Go to [Railway](https://railway.app/)
   - Connect your GitHub repository
   - Select the `backend-node` directory

2. **Configure Environment**:

   - Add all environment variables in Railway dashboard
   - Set `NODE_ENV=production`

3. **Deploy**:
   - Railway will automatically deploy on push to main branch
   - Get your deployment URL from the dashboard

## 🔧 Environment-Specific Configurations

### Development

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ocrtax
```

### Staging

```env
NODE_ENV=staging
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ocrtax-staging
```

### Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ocrtax-prod
```

## 🔒 Security Considerations

### Production Security Checklist

- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS for specific domains
- [ ] Set up rate limiting
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Configure AWS IAM with least privilege
- [ ] Set up monitoring and logging
- [ ] Regular security updates

### SSL/TLS Configuration

```bash
# Using Let's Encrypt with Nginx
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 📊 Monitoring and Logging

### PM2 Monitoring

```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs ocrtax-backend

# Restart application
pm2 restart ocrtax-backend
```

### Docker Monitoring

```bash
# View container stats
docker stats ocrtax-backend

# View logs
docker logs -f ocrtax-backend

# Health check
curl http://localhost:5000/health
```

### AWS CloudWatch

```json
{
  "log_group": "/aws/ecs/ocrtax-backend",
  "log_stream": "ecs/ocrtax-backend/container-name"
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build Docker image
        run: docker build -t ocrtax-backend .

      - name: Deploy to ECS
        run: |
          # Add your deployment commands here
```

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**:

   ```bash
   # Check MongoDB status
   sudo systemctl status mongod

   # Check connection string
   echo $MONGODB_URI
   ```

2. **AWS S3 Access Denied**:

   ```bash
   # Verify AWS credentials
   aws sts get-caller-identity

   # Test S3 access
   aws s3 ls s3://your-bucket-name
   ```

3. **OpenAI API Errors**:

   ```bash
   # Check API key
   curl -H "Authorization: Bearer $OPENAI_API_KEY" \
        https://api.openai.com/v1/models
   ```

4. **Port Already in Use**:

   ```bash
   # Find process using port
   lsof -i :5000

   # Kill process
   kill -9 <PID>
   ```

### Health Check Endpoints

- `GET /health` - Basic health check
- `GET /api/auth/profile` - Authentication test (requires token)

## 📞 Support

For deployment issues:

1. Check the logs: `docker logs ocrtax-backend` or `pm2 logs`
2. Verify environment variables
3. Test individual services (MongoDB, AWS, OpenAI)
4. Check network connectivity
5. Review security group/firewall settings
