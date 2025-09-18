# Entity Relationship Diagram

## Database Schema Overview

\`\`\`mermaid
erDiagram
    auth_users ||--|| user_profiles : "has profile"
    assets ||--o{ sessions : "has many"
    sessions ||--o{ readings : "has many"
    
    auth_users {
        uuid id PK
        string email
        timestamp created_at
        timestamp updated_at
    }
    
    user_profiles {
        uuid id PK,FK
        string email
        string role
        timestamp created_at
        timestamp updated_at
    }
    
    assets {
        uuid id PK
        string name
        string description
        string location
        timestamp created_at
        timestamp updated_at
    }
    
    sessions {
        uuid id PK
        uuid asset_id FK
        string name
        timestamp start_time
        timestamp end_time
        string status
        timestamp created_at
        timestamp updated_at
    }
    
    readings {
        uuid id PK
        uuid session_id FK
        string sensor_type
        float value
        string unit
        timestamp timestamp
        timestamp created_at
    }
\`\`\`

## Table Descriptions

### auth.users (Supabase Managed)
- **Purpose**: Core authentication table managed by Supabase
- **Key Fields**: id (UUID), email, authentication metadata
- **Relationships**: One-to-one with user_profiles

### user_profiles
- **Purpose**: Extends auth.users with application-specific data
- **Key Fields**: 
  - `id`: References auth.users(id)
  - `role`: Either 'viewer' or 'admin'
- **Relationships**: References auth.users, used in RLS policies

### assets
- **Purpose**: Represents physical assets being monitored
- **Key Fields**:
  - `name`: Human-readable asset identifier
  - `description`: Detailed asset information
  - `location`: Physical location of the asset
- **Relationships**: One-to-many with sessions

### sessions
- **Purpose**: Time-bounded monitoring periods for assets
- **Key Fields**:
  - `asset_id`: References the monitored asset
  - `start_time`: When monitoring began
  - `end_time`: When monitoring ended (null for active)
  - `status`: 'active', 'completed', or 'paused'
- **Relationships**: Many-to-one with assets, one-to-many with readings

### readings
- **Purpose**: Individual sensor measurements
- **Key Fields**:
  - `session_id`: References the monitoring session
  - `sensor_type`: Type of sensor (temperature, pressure, etc.)
  - `value`: Numeric reading value (float)
  - `unit`: Unit of measurement
  - `timestamp`: When the reading was taken
- **Relationships**: Many-to-one with sessions

## Indexes

### Performance Indexes
\`\`\`sql
-- Foreign key indexes for join performance
CREATE INDEX idx_sessions_asset_id ON sessions(asset_id);
CREATE INDEX idx_readings_session_id ON readings(session_id);

-- Time-based queries
CREATE INDEX idx_readings_timestamp ON readings(timestamp);
\`\`\`

## Row Level Security (RLS) Policies

### Security Model
- **Deny by Default**: All tables have RLS enabled with no default access
- **Role-Based Access**: Policies check user role via `get_user_role()` function
- **Authenticated Only**: All operations require valid `auth.uid()`

### Policy Examples
\`\`\`sql
-- Viewers can read all data
CREATE POLICY "Authenticated users can view assets"
  ON assets FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins can modify data
CREATE POLICY "Only admins can insert assets"
  ON assets FOR INSERT
  WITH CHECK (get_user_role() = 'admin');
\`\`\`

## Data Flow

1. **Asset Creation**: Admin creates assets with metadata
2. **Session Management**: Admin starts monitoring sessions for assets
3. **Reading Generation**: Sensors (or mock generator) create readings for active sessions
4. **Real-time Updates**: New readings trigger real-time notifications to connected clients
5. **Role-based Access**: UI adapts based on user role, RLS enforces data access

## Scalability Considerations

- **UUID Primary Keys**: Distributed-friendly, no collision risk
- **Proper Indexing**: Foreign keys and timestamp queries optimized
- **Normalized Design**: Minimal data duplication
- **Time-series Ready**: Readings table optimized for time-based queries
- **Horizontal Scaling**: Schema supports read replicas and partitioning
