# Technical Decisions Document

## Overview
This document outlines the key technical decisions made during the development of the Asset Monitor POC, including rationale and alternatives considered.

## 1. Database Schema Design

### Decision: Three-Table Normalized Schema
**Chosen Approach**: Assets → Sessions → Readings hierarchy
- `assets`: Core entities being monitored
- `sessions`: Time-bounded monitoring periods
- `readings`: Individual sensor measurements with float values

**Rationale**:
- Clear separation of concerns
- Supports multiple concurrent monitoring sessions per asset
- Flexible sensor type support without schema changes
- Proper normalization reduces data redundancy
- Easy to query and aggregate data at different levels

**Alternative Considered**: Flat structure with all data in readings table
- **Rejected because**: Would lead to significant data duplication, harder to manage asset metadata, and poor query performance for asset-level operations

## 2. Real-time Implementation

### Decision: Supabase Real-time Subscriptions
**Chosen Approach**: PostgreSQL LISTEN/NOTIFY via Supabase real-time API
- Direct database-level change notifications
- WebSocket connection for low-latency updates
- Automatic reconnection handling
- Selective subscriptions by table/row

**Rationale**:
- Native integration with Supabase
- Minimal latency for data updates
- Scales automatically with Supabase infrastructure
- No additional infrastructure required
- Built-in connection management

**Alternative Considered**: Server-Sent Events (SSE) with polling
- **Rejected because**: Higher latency, more complex implementation, requires additional server infrastructure, and less efficient for multiple concurrent users

## 3. Row Level Security (RLS) Design

### Decision: Deny-by-Default with Role-Based Policies
**Chosen Approach**: 
- All tables have RLS enabled by default
- Explicit policies for each operation (SELECT, INSERT, UPDATE, DELETE)
- Role-based access through `get_user_role()` function
- Viewer role: read-only access
- Admin role: full CRUD access

**Rationale**:
- Security by default - no accidental data exposure
- Clear role separation matches business requirements
- Centralized role management through user_profiles table
- Leverages PostgreSQL's native security features
- Audit trail through auth.uid() tracking

**Alternative Considered**: Application-level permission checks
- **Rejected because**: More prone to security vulnerabilities, requires careful implementation in every API endpoint, harder to audit, and doesn't protect against direct database access

## 4. Authentication Strategy

### Decision: Supabase Auth with Email/Password
**Chosen Approach**:
- Built-in Supabase authentication
- Email confirmation required
- Server-side session validation
- Middleware-based route protection
- Automatic user profile creation via database triggers

**Rationale**:
- Proven security implementation
- Handles session management automatically
- Integrates seamlessly with RLS policies
- Reduces custom authentication code
- Built-in security features (rate limiting, etc.)

**Alternative Considered**: Custom JWT implementation
- **Rejected because**: Significantly more complex to implement securely, requires custom session management, higher maintenance overhead, and more potential security vulnerabilities

## 5. Technology Stack

### Decision: Next.js 14 with App Router
**Chosen Approach**:
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- shadcn/ui for component library

**Rationale**:
- Modern React patterns with Server Components
- Excellent TypeScript integration
- Built-in optimization features
- Strong ecosystem and community support
- Rapid development with pre-built components

**Alternative Considered**: Separate React frontend + Node.js API
- **Rejected because**: More complex deployment, additional infrastructure requirements, more boilerplate code, and unnecessary for this POC scope

## 6. Containerization Approach

### Decision: Multi-Service Docker Compose
**Chosen Approach**:
- Main Next.js application container
- Separate mock data generator service
- Docker Compose orchestration
- Production-ready Dockerfile with multi-stage builds

**Rationale**:
- Easy local development setup
- Simulates production environment
- Separates concerns between app and data generation
- Scalable architecture foundation
- Simple deployment process

**Alternative Considered**: Single container with background processes
- **Rejected because**: Harder to scale individual services, more complex process management, and less aligned with microservices best practices

## 7. Data Types and Validation

### Decision: Float Values for Sensor Readings
**Chosen Approach**:
- PostgreSQL FLOAT type for sensor values
- Client-side rounding to 1 decimal place
- Proper unit storage in separate column
- Timestamp precision to milliseconds

**Rationale**:
- Matches real-world sensor precision requirements
- Efficient storage and computation
- Flexible for different sensor types
- Standard approach for IoT applications

**Alternative Considered**: Integer values with scaling factors
- **Rejected because**: More complex to work with, potential precision loss, and unnecessary optimization for this POC scale

## Summary

These decisions prioritize security, maintainability, and rapid development while providing a solid foundation for future enhancements. The chosen architecture supports the core requirements of real-time updates, role-based access control, and secure data handling.
