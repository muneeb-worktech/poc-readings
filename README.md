# Asset Monitor POC

A real-time asset monitoring system built with Next.js, Supabase, and TypeScript. This POC demonstrates realtime data updates, role-based access control, and proper security implementation using Row Level Security (RLS).

## 🎯 Features

- **Real-time Updates**: Live sensor readings with Supabase realtime subscriptions
- **Role-Based Access Control**: Viewer (read-only) and Admin (full CRUD) roles
- **Secure by Default**: Deny-by-default RLS policies protect all data
- **Modern Stack**: Next.js 14, TypeScript, Tailwind CSS, Supabase
- **Docker Ready**: Complete containerization with docker-compose
- **Mock Data Generator**: Continuous realistic sensor data for testing

## 🏗️ Architecture

### Database Schema
- **Assets**: Physical assets being monitored
- **Sessions**: Monitoring sessions for assets
- **Readings**: Sensor readings with float values
- **User Profiles**: User roles and permissions

### Security Model
- **Deny-by-default RLS**: All tables protected by Row Level Security
- **Role-based permissions**: Viewers can only read, Admins have full access
- **Authenticated access**: All operations require valid user session

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account and project
- Docker (optional, for containerized deployment)

### Environment Setup

1. Clone the repository
2. Copy environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

3. Fill in your Supabase credentials in `.env.local`:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

### Database Setup

Run the SQL scripts in your Supabase dashboard in order:

1. `scripts/001_create_schema.sql` - Create tables and indexes
2. `scripts/002_create_user_roles.sql` - Setup user profiles and roles
3. `scripts/003_create_rls_policies.sql` - Configure security policies
4. `scripts/004_seed_data.sql` - Add sample data
5. `scripts/005_create_admin_user.sql` - Setup admin user function

### Development

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# (Optional) Start mock data generator
npm run mock-data
\`\`\`

### Docker Deployment

\`\`\`bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build
\`\`\`

## 👥 User Roles

### Viewer Role (Default)
- View all assets, sessions, and readings
- Real-time updates for new readings
- Read-only access to all data
- Cannot create, update, or delete any records

### Admin Role
- All viewer permissions
- Create new assets and sessions
- Generate mock sensor readings
- Full CRUD operations on all tables
- Access to admin control panel

### Promoting Users to Admin

After creating a user account, promote them to admin:

\`\`\`sql
SELECT public.promote_user_to_admin('user@example.com');
\`\`\`

## 📊 Real-time Features

The application uses Supabase's real-time capabilities to provide live updates:

- **Live Readings**: New sensor readings appear automatically
- **Visual Indicators**: Color-coded values based on sensor thresholds
- **Connection Status**: Real-time connection indicator
- **Automatic Refresh**: No manual refresh needed

## 🔧 Mock Data Generator

The mock data generator creates realistic sensor readings:

- **Multiple Sensor Types**: Temperature, pressure, humidity, vibration, flow rate
- **Realistic Values**: Proper ranges and units for each sensor type
- **Trend Simulation**: Gradual changes over time
- **Configurable Intervals**: Adjustable generation frequency

## 🛡️ Security Implementation

### Row Level Security (RLS)
All tables use RLS with deny-by-default policies:

\`\`\`sql
-- Example policy for assets table
CREATE POLICY "Authenticated users can view assets"
  ON public.assets FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can insert assets"
  ON public.assets FOR INSERT
  WITH CHECK (public.get_user_role() = 'admin');
\`\`\`

### Authentication Flow
1. User signs up (defaults to viewer role)
2. Email confirmation required
3. Session management via Supabase Auth
4. Role-based UI rendering
5. Server-side permission checks

## 📁 Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard-content.tsx
│   ├── realtime-readings.tsx
│   └── admin-controls.tsx
├── lib/                   # Utilities and types
│   ├── supabase/         # Supabase client setup
│   └── types.ts          # TypeScript definitions
├── scripts/               # Database scripts and utilities
│   ├── *.sql             # Database setup scripts
│   └── mock-data-generator.ts
├── docker-compose.yml     # Docker orchestration
└── Dockerfile            # Container definition
\`\`\`

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop and mobile
- **Dark/Light Mode**: Automatic theme switching
- **Real-time Indicators**: Visual feedback for live data
- **Role-based UI**: Different interfaces for viewers vs admins
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages

## 🧪 Testing the POC

1. **Start the application**: `docker-compose up --build`
2. **Create accounts**: Sign up as viewer and admin users
3. **Generate data**: Use admin controls to create assets and readings
4. **Watch real-time updates**: Observe live data flowing in
5. **Test permissions**: Verify viewers cannot modify data

## 📈 Performance Considerations

- **Efficient Queries**: Proper indexing on foreign keys and timestamps
- **Real-time Optimization**: Selective subscriptions to reduce bandwidth
- **Connection Pooling**: Supabase handles database connections
- **Caching**: Next.js static generation where appropriate

## 🔮 Future Enhancements

- **Data Visualization**: Charts and graphs for sensor trends
- **Alerting System**: Notifications for threshold breaches
- **Export Functionality**: CSV/PDF reports
- **Advanced Filtering**: Search and filter capabilities
- **Audit Logging**: Track all user actions
- **API Endpoints**: REST API for external integrations

## 🐛 Troubleshooting

### Common Issues

1. **RLS Blocking Operations**: Ensure user is authenticated and has proper role
2. **Real-time Not Working**: Check Supabase project settings and API keys
3. **Docker Build Fails**: Verify all environment variables are set
4. **Database Connection**: Confirm Supabase credentials are correct

### Debug Mode

Enable debug logging by adding to your environment:
\`\`\`env
NEXT_PUBLIC_DEBUG=true
\`\`\`

## 📄 License

This project is for demonstration purposes. See LICENSE file for details.
