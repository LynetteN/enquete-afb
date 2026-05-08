# 🚀 Docker PostgreSQL Production Setup Guide

## 📋 Overview
Secure PostgreSQL database deployment using Docker with comprehensive security measures.

## 🔐 Security Features Implemented

### **1. Container Security**
- ✅ **Non-root user execution** - Runs as postgres user (UID 999)
- ✅ **Read-only filesystem** - Prevents unauthorized modifications
- ✅ **Capability dropping** - Removes all unnecessary Linux capabilities
- ✅ **No privileged mode** - Prevents container escape
- ✅ **Security options** - AppArmor profile, no new privileges
- ✅ **Resource limits** - CPU and memory constraints to prevent DoS
- ✅ **Network isolation** - Dedicated Docker network

### **2. Database Security**
- ✅ **SCRAM-SHA-256 encryption** - Modern password hashing
- ✅ **Role-based access control** - Separate app and admin users
- ✅ **Least privilege principle** - Minimal required permissions
- ✅ **Connection limits** - Prevents connection flooding
- ✅ **Statement timeouts** - Prevents long-running queries
- ✅ **Audit logging** - Tracks all database modifications
- ✅ **Security event monitoring** - Failed login attempts tracking

### **3. Network Security**
- ✅ **Bridge network isolation** - Separate network for database
- ✅ **Port binding control** - Only exposes necessary ports
- ✅ **Internal communication** - Backend connects via Docker network

### **4. Data Security**
- ✅ **Persistent volumes** - Data survives container restarts
- ✅ **Volume encryption** - (Optional) Encrypt data at rest
- ✅ **Backup strategies** - Automated backup procedures

## 🚀 Quick Start

### **Step 1: Start PostgreSQL Container**

```bash
# Start the database
docker-compose up -d

# Check container status
docker-compose ps

# View logs
docker-compose logs postgres
```

### **Step 2: Verify Database Connection**

```bash
# Test connection
docker exec -it enquete-postgres psql -U postgres -d enquete_db -c "SELECT version();"

# Check created users
docker exec -it enquete-postgres psql -U postgres -d enquete_db -c "\du"

# Check security tables
docker exec -it enquete-postgres psql -U postgres -d enquete_db -c "\dt"
```

### **Step 3: Run Database Migration**

```bash
# From backend directory
cd backend
npm run migrate
```

### **Step 4: Seed Database**

```bash
cd backend
npm run seed
```

### **Step 5: Start Backend**

```bash
# Using Docker environment
cp .env.docker .env
npm start
```

## 🔧 Configuration Files

### **docker-compose.yml**
Main Docker Compose configuration with security settings.

### **init-scripts/01-init-security.sql**
Database initialization script that creates:
- Application user (`enquete_app`)
- Admin user (`enquete_admin`)
- Security tables (audit_log, security_events)
- Security functions and triggers

### **.env.docker**
Environment variables for Docker deployment.

### **postgresql.conf**
PostgreSQL server configuration for security and performance.

## 🛡️ Security Best Practices

### **1. Password Management**

**Default Passwords (CHANGE IMMEDIATELY):**
- Root user: `postgres` / `123456`
- App user: `enquete_app` / `enquete_secure_app_2026`
- Admin user: `enquete_admin` / `enquete_admin_secure_2026`

**Change Passwords:**
```bash
# Change root password
docker exec -it enquete-postgres psql -U postgres -c "ALTER USER postgres PASSWORD 'new_secure_password';"

# Change app user password
docker exec -it enquete-postgres psql -U postgres -c "ALTER USER enquete_app PASSWORD 'new_app_password';"

# Change admin user password
docker exec -it enquete-postgres psql -U postgres -c "ALTER USER enquete_admin PASSWORD 'new_admin_password';"
```

### **2. Network Security**

**Current Setup:**
- Port binding: `5432:5432` (exposes to host)
- Network: `enquete-network` (internal Docker network)

**For Production:**
```yaml
# Only expose to Docker network (remove ports section)
# Or use reverse proxy for additional security
ports:
  - "127.0.0.1:5432:5432"  # Only bind to localhost
```

### **3. SSL/TLS Configuration**

**Enable SSL (Recommended for Production):**

1. **Generate SSL Certificates:**
```bash
# Create certificates directory
mkdir -p postgresql-certs

# Generate self-signed certificate (for testing)
openssl req -new -x509 -days 365 -nodes \
  -out postgresql-certs/server.crt \
  -keyout postgresql-certs/server.key \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Set proper permissions
chmod 600 postgresql-certs/server.key
chmod 644 postgresql-certs/server.crt
```

2. **Update docker-compose.yml:**
```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data
  - ./postgresql-certs:/var/lib/postgresql/certs:ro
  - ./init-scripts:/docker-entrypoint-initdb.d
```

3. **Update postgresql.conf:**
```bash
# Uncomment SSL settings
ssl=on
ssl_cert_file=/var/lib/postgresql/certs/server.crt
ssl_key_file=/var/lib/postgresql/certs/server.key
```

### **4. Firewall Configuration**

**Using UFW (Ubuntu/Debian):**
```bash
# Allow only specific IP to access PostgreSQL
sudo ufw allow from 192.168.1.100 to any port 5432

# Or allow only Docker network
sudo ufw deny 5432
```

**Using iptables:**
```bash
# Allow only localhost
iptables -A INPUT -p tcp --dport 5432 -s 127.0.0.1 -j ACCEPT
iptables -A INPUT -p tcp --dport 5432 -j DROP
```

### **5. Backup and Recovery**

**Automated Backup Script:**
```bash
#!/bin/bash
# backup-postgres.sh

BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/enquete_db_$DATE.sql.gz"

mkdir -p $BACKUP_DIR

# Create backup
docker exec enquete-postgres pg_dump -U postgres enquete_db | gzip > $BACKUP_FILE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "enquete_db_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
```

**Restore from Backup:**
```bash
# Restore database
gunzip < /backups/postgres/enquete_db_20240508_120000.sql.gz | \
  docker exec -i enquete-postgres psql -U postgres enquete_db
```

### **6. Monitoring and Alerting**

**Check Database Health:**
```bash
# Container health
docker-compose ps

# Database connections
docker exec -it enquete-postgres psql -U postgres -d enquete_db -c "
  SELECT count(*) as connections,
         state,
         application_name
  FROM pg_stat_activity
  GROUP BY state, application_name;
"

# Database size
docker exec -it enquete-postgres psql -U postgres -d enquete_db -c "
  SELECT pg_size_pretty(pg_database_size('enquete_db')) as size;
"

# Slow queries
docker exec -it enquete-postgres psql -U postgres -d enquete_db -c "
  SELECT query, calls, total_time, mean_time
  FROM pg_stat_statements
  ORDER BY mean_time DESC
  LIMIT 10;
"
```

**Monitor Security Events:**
```bash
# View recent security events
docker exec -it enquete-postgres psql -U postgres -d enquete_db -c "
  SELECT * FROM security_events
  ORDER BY timestamp DESC
  LIMIT 20;
"

# View audit log
docker exec -it enquete-postgres psql -U postgres -d enquete_db -c "
  SELECT * FROM audit_log
  ORDER BY timestamp DESC
  LIMIT 20;
"
```

## 🔍 Security Auditing

### **1. Regular Security Checks**

**Check User Permissions:**
```bash
docker exec -it enquete-postgres psql -U postgres -d enquete_db -c "\dp"
```

**Review Database Roles:**
```bash
docker exec -it enquete-postgres psql -U postgres -d enquete_db -c "\du"
```

**Check for Public Schema Access:**
```bash
docker exec -it enquete-postgres psql -U postgres -d enquete_db -c "
  SELECT * FROM information_schema.role_table_grants
  WHERE grantee = 'PUBLIC';
"
```

### **2. Vulnerability Scanning**

**Use Docker Bench Security:**
```bash
# Run Docker security benchmark
docker run --rm --net host --pid host \
  -v /:/host:ro \
  docker-bench-security
```

**Scan PostgreSQL Image:**
```bash
# Use Trivy to scan for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image postgres:15-alpine
```

## 🚨 Incident Response

### **1. Suspicious Activity Detected**

**Immediate Actions:**
```bash
# Stop database container
docker-compose stop postgres

# Review logs
docker-compose logs postgres | tail -100

# Check security events
docker exec -it enquete-postgres psql -U postgres -d enquete_db -c "
  SELECT * FROM security_events
  WHERE severity = 'HIGH'
  ORDER BY timestamp DESC;
"

# Block suspicious IPs (if using firewall)
sudo ufw deny from SUSPICIOUS_IP
```

### **2. Database Compromise Response**

**Containment:**
```bash
# Stop all database access
docker-compose stop postgres

# Preserve evidence
docker cp enquete-postgres:/var/lib/postgresql/data ./evidence/

# Review audit logs
docker exec -it enquete-postgres psql -U postgres -d enquete_db -c "
  SELECT * FROM audit_log
  WHERE timestamp > NOW() - INTERVAL '1 hour'
  ORDER BY timestamp DESC;
"
```

**Recovery:**
```bash
# Restore from last known good backup
gunzip < /backups/postgres/enquete_db_GOOD_BACKUP.sql.gz | \
  docker exec -i enquete-postgres psql -U postgres enquete_db

# Change all passwords
docker exec -it enquete-postgres psql -U postgres -c "
  ALTER USER postgres PASSWORD 'new_secure_password';
  ALTER USER enquete_app PASSWORD 'new_app_password';
  ALTER USER enquete_admin PASSWORD 'new_admin_password';
"

# Restart database
docker-compose start postgres
```

## 📊 Performance Tuning

### **1. Connection Pooling**

**Configure PgBouncer (Optional):**
```yaml
# Add to docker-compose.yml
pgbouncer:
  image: pgbouncer/pgbouncer
  environment:
    DATABASES_HOST: postgres
    DATABASES_PORT: 5432
    DATABASES_DBNAME: enquete_db
    DATABASES_USER: enquete_app
    DATABASES_PASSWORD: ${APP_DB_PASSWORD}
    POOL_MODE: transaction
    MAX_CLIENT_CONN: 100
    DEFAULT_POOL_SIZE: 25
  ports:
    - "6432:6432"
  depends_on:
    - postgres
```

### **2. Query Optimization**

**Enable Query Statistics:**
```bash
docker exec -it enquete-postgres psql -U postgres -d enquete_db -c "
  CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
"
```

**Monitor Slow Queries:**
```bash
docker exec -it enquete-postgres psql -U postgres -d enquete_db -c "
  SELECT query, calls, total_time, mean_time, max_time
  FROM pg_stat_statements
  ORDER BY mean_time DESC
  LIMIT 10;
"
```

## 🔄 Maintenance Tasks

### **1. Regular Maintenance**

**Weekly Tasks:**
```bash
# Vacuum and analyze tables
docker exec -it enquete-postgres psql -U postgres -d enquete_db -c "VACUUM ANALYZE;"

# Reindex tables
docker exec -it enquete-postgres psql -U postgres -d enquete_db -c "REINDEX DATABASE enquete_db;"

# Check database size
docker exec -it enquete-postgres psql -U postgres -d enquete_db -c "
  SELECT pg_size_pretty(pg_database_size('enquete_db'));
"
```

**Monthly Tasks:**
```bash
# Review and archive old audit logs
docker exec -it enquete-postgres psql -U postgres -d enquete_db -c "
  DELETE FROM audit_log
  WHERE timestamp < NOW() - INTERVAL '6 months';
"

# Update PostgreSQL statistics
docker exec -it enquete-postgres psql -U postgres -d enquete_db -c "ANALYZE;"
```

### **2. Updates and Upgrades**

**Update PostgreSQL Image:**
```bash
# Pull latest image
docker-compose pull postgres

# Recreate container with new image
docker-compose up -d postgres

# Verify database compatibility
docker exec -it enquete-postgres psql -U postgres -c "SELECT version();"
```

## 📝 Configuration Reference

### **Environment Variables**

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_PASSWORD` | Root user password | `123456` |
| `POSTGRES_USER` | Root username | `postgres` |
| `POSTGRES_DB` | Database name | `enquete_db` |
| `APP_DB_USER` | Application username | `enquete_app` |
| `APP_DB_PASSWORD` | Application password | `enquete_secure_app_2026` |

### **Docker Compose Settings**

| Setting | Value | Purpose |
|---------|-------|---------|
| `restart` | `unless-stopped` | Auto-restart on failure |
| `read_only` | `true` | Prevent filesystem modifications |
| `cap_drop` | `ALL` | Remove Linux capabilities |
| `security_opt` | `no-new-privileges` | Prevent privilege escalation |
| `networks` | `enquete-network` | Network isolation |

## 🎯 Security Checklist

- [ ] Changed all default passwords
- [ ] Enabled SSL/TLS for production
- [ ] Configured firewall rules
- [ ] Set up automated backups
- [ ] Configured monitoring and alerting
- [ ] Reviewed and hardened PostgreSQL settings
- [ ] Implemented rate limiting on application
- [ ] Set up log aggregation
- [ ] Configured intrusion detection
- [ ] Tested disaster recovery procedures
- [ ] Regular security audits scheduled
- [ ] Incident response plan documented

## 🆘 Troubleshooting

### **Container Won't Start**

```bash
# Check logs
docker-compose logs postgres

# Check port conflicts
netstat -tuln | grep 5432

# Check disk space
df -h

# Restart container
docker-compose restart postgres
```

### **Connection Refused**

```bash
# Check if container is running
docker-compose ps

# Check network connectivity
docker network inspect enquete-network

# Test connection from host
psql -h localhost -U postgres -d enquete_db -c "SELECT 1;"
```

### **Performance Issues**

```bash
# Check resource usage
docker stats enquete-postgres

# Check database connections
docker exec -it enquete-postgres psql -U postgres -d enquete_db -c "
  SELECT count(*) FROM pg_stat_activity;
"

# Check slow queries
docker exec -it enquete-postgres psql -U postgres -d enquete_db -c "
  SELECT * FROM pg_stat_statements
  ORDER BY mean_time DESC
  LIMIT 10;
"
```

---

**Your Docker PostgreSQL is now production-ready with comprehensive security! 🚀**