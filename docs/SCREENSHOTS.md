# Screenshots and Demo

## Application Screenshots

### Landing Page
The main entry point with authentication options and role information.

### Login/Signup Flow
- Clean authentication forms
- Email confirmation process
- Error handling and validation

### Dashboard - Viewer Role
- Real-time readings display
- Asset and session overview
- Read-only interface
- Live connection indicator

### Dashboard - Admin Role
- All viewer features plus:
- Admin control panel
- Asset creation form
- Mock data generator
- Full CRUD capabilities

### Real-time Updates
- Live sensor readings
- Color-coded values based on thresholds
- Automatic updates without refresh
- Connection status indicators

## Demo Flow

### 1. Initial Setup
\`\`\`bash
# Clone and setup
git clone <repository>
cd asset-monitor-poc
npm install
npm run setup
\`\`\`

### 2. Database Configuration
- Run SQL scripts in Supabase dashboard
- Create initial admin user
- Verify RLS policies are active

### 3. Application Demo
1. **Start services**: `docker-compose up --build`
2. **Create accounts**: Sign up as viewer and admin
3. **Generate data**: Use admin controls to create assets
4. **Watch updates**: Observe real-time data flow
5. **Test permissions**: Verify role-based access

### 4. Live Updates Demo
- Start mock data generator
- Watch readings appear in real-time
- Observe color-coded value changes
- Test with multiple browser windows

## Performance Metrics

### Real-time Latency
- Database to UI: < 100ms typical
- WebSocket connection: Persistent
- Update frequency: Configurable (default 5s)

### Security Verification
- RLS policies block unauthorized access
- Role-based UI rendering
- Server-side permission validation
- Secure authentication flow

## Troubleshooting Screenshots

### Common Issues
1. **RLS Blocking**: Error messages for unauthorized operations
2. **Connection Issues**: Offline indicators and retry mechanisms
3. **Permission Denied**: Clear feedback for insufficient privileges
4. **Loading States**: Proper loading indicators throughout

### Debug Information
- Console logs for development
- Network tab showing WebSocket connections
- Database query logs in Supabase dashboard
- Error boundaries with helpful messages
