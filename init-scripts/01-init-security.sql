-- Database initialization script for security hardening
-- This runs automatically when the container is first created

-- 1. Create application user with limited privileges
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'enquete_app') THEN
        CREATE ROLE enquete_app WITH LOGIN PASSWORD 'enquete_secure_app_2026';
    END IF;
END
$$;

-- 2. Grant necessary privileges to application user
GRANT CONNECT ON DATABASE enquete_db TO enquete_app;
GRANT USAGE ON SCHEMA public TO enquete_app;
GRANT CREATE ON SCHEMA public TO enquete_app;

-- 3. Set up default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO enquete_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO enquete_app;

-- 4. Create admin user for database management (separate from app user)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'enquete_admin') THEN
        CREATE ROLE enquete_admin WITH LOGIN PASSWORD 'enquete_admin_secure_2026';
    END IF;
END
$$;

-- 5. Grant admin privileges
GRANT enquete_admin TO postgres;
GRANT ALL PRIVILEGES ON DATABASE enquete_db TO enquete_admin;
GRANT ALL PRIVILEGES ON SCHEMA public TO enquete_admin;

-- 6. Security: Remove public schema permissions
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO PUBLIC;

-- 7. Security: Configure connection limits
ALTER DATABASE enquete_db CONNECTION LIMIT 100;

-- 8. Security: Enable statement logging for audit
ALTER DATABASE enquete_db SET log_statement = 'mod';
ALTER DATABASE enquete_db SET log_duration = on;
ALTER DATABASE enquete_db SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';

-- 9. Security: Set reasonable timeouts
ALTER DATABASE enquete_db SET statement_timeout = '300s';
ALTER DATABASE enquete_db SET lock_timeout = '30s';
ALTER DATABASE enquete_db SET idle_in_transaction_session_timeout = '60s';

-- 10. Security: Configure SSL requirements (for production)
-- Note: Uncomment for production with SSL certificates
-- ALTER DATABASE enquete_db SET ssl = on;
-- ALTER DATABASE enquete_db SET ssl_min_protocol_version = 'TLSv1.2';

-- 11. Create extension for additional security features
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 12. Security: Create audit function
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (
        table_name,
        operation,
        user_name,
        old_data,
        new_data,
        timestamp
    ) VALUES (
        TG_TABLE_NAME,
        TG_OP,
        current_user,
        row_to_json(OLD),
        row_to_json(NEW),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Create audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(255) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    old_data JSONB,
    new_data JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Create index on audit log for performance
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit_log(table_name);

-- 15. Security: Grant audit log permissions
GRANT SELECT, INSERT ON audit_log TO enquete_app;
GRANT USAGE, SELECT ON SEQUENCE audit_log_id_seq TO enquete_app;

-- 16. Security: Create function to monitor failed login attempts
CREATE OR REPLACE FUNCTION log_failed_login()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO security_events (
        event_type,
        severity,
        description,
        ip_address,
        user_name,
        timestamp
    ) VALUES (
        'FAILED_LOGIN',
        'HIGH',
        'Failed login attempt detected',
        inet_client_addr(),
        current_user,
        NOW()
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 17. Create security events table
CREATE TABLE IF NOT EXISTS security_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    description TEXT,
    ip_address INET,
    user_name VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 18. Create indexes for security events
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON security_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);

-- 19. Security: Grant security events permissions
GRANT SELECT, INSERT ON security_events TO enquete_app;
GRANT USAGE, SELECT ON SEQUENCE security_events_id_seq TO enquete_app;

-- 20. Success message
DO $$
BEGIN
    RAISE NOTICE 'Database security initialization completed successfully';
    RAISE NOTICE 'Created users: enquete_app, enquete_admin';
    RAISE NOTICE 'Security features enabled: audit logging, connection limits, timeouts';
END
$$;