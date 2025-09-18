-- Seed data for testing the POC
-- Creates sample assets, sessions, and initial readings

-- Insert sample assets
INSERT INTO public.assets (id, name, description, location) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Temperature Sensor A1', 'Main warehouse temperature monitoring', 'Warehouse Section A'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Pressure Monitor B2', 'Production line pressure sensor', 'Production Floor B'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Humidity Tracker C3', 'Storage room humidity control', 'Storage Room C')
ON CONFLICT (id) DO NOTHING;

-- Insert sample sessions
INSERT INTO public.sessions (id, asset_id, name, start_time, status) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Morning Temperature Check', NOW() - INTERVAL '2 hours', 'active'),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Pressure Monitoring Session', NOW() - INTERVAL '1 hour', 'active'),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Humidity Control Test', NOW() - INTERVAL '30 minutes', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert sample readings with float values
INSERT INTO public.readings (session_id, sensor_type, value, unit, timestamp) VALUES
  -- Temperature readings
  ('660e8400-e29b-41d4-a716-446655440001', 'temperature', 22.5, '°C', NOW() - INTERVAL '2 hours'),
  ('660e8400-e29b-41d4-a716-446655440001', 'temperature', 23.1, '°C', NOW() - INTERVAL '1 hour 45 minutes'),
  ('660e8400-e29b-41d4-a716-446655440001', 'temperature', 22.8, '°C', NOW() - INTERVAL '1 hour 30 minutes'),
  
  -- Pressure readings
  ('660e8400-e29b-41d4-a716-446655440002', 'pressure', 101.3, 'kPa', NOW() - INTERVAL '1 hour'),
  ('660e8400-e29b-41d4-a716-446655440002', 'pressure', 102.1, 'kPa', NOW() - INTERVAL '45 minutes'),
  ('660e8400-e29b-41d4-a716-446655440002', 'pressure', 101.8, 'kPa', NOW() - INTERVAL '30 minutes'),
  
  -- Humidity readings
  ('660e8400-e29b-41d4-a716-446655440003', 'humidity', 45.2, '%', NOW() - INTERVAL '30 minutes'),
  ('660e8400-e29b-41d4-a716-446655440003', 'humidity', 46.1, '%', NOW() - INTERVAL '15 minutes'),
  ('660e8400-e29b-41d4-a716-446655440003', 'humidity', 45.8, '%', NOW() - INTERVAL '5 minutes')
ON CONFLICT DO NOTHING;
