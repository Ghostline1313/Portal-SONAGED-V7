-- Users and Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'geomatician', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Geographic Regions
CREATE TABLE regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL
);

CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id UUID REFERENCES regions(id),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL
);

CREATE TABLE communes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID REFERENCES departments(id),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL
);

-- Collection Points
CREATE TABLE collection_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('container', 'bin', 'center')),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    commune_id UUID REFERENCES communes(id),
    capacity_kg DECIMAL(10, 2) NOT NULL,
    waste_type VARCHAR(50) NOT NULL CHECK (waste_type IN ('general', 'recyclable', 'organic', 'hazardous')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Collection History
CREATE TABLE collection_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_point_id UUID REFERENCES collection_points(id),
    collection_date TIMESTAMP WITH TIME ZONE NOT NULL,
    quantity_kg DECIMAL(10, 2) NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id),
    operator_id UUID REFERENCES users(id),
    notes TEXT
);

-- Sweeping Routes
CREATE TABLE sweeping_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) UNIQUE,
    commune_id UUID REFERENCES communes(id),
    shift VARCHAR(20) NOT NULL CHECK (shift IN ('matin', 'soir')),
    length_meters DECIMAL(10, 2) NOT NULL,
    estimated_duration_minutes INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Route Geometry (stores the GeoJSON of the route)
CREATE TABLE route_geometry (
    route_id UUID PRIMARY KEY REFERENCES sweeping_routes(id),
    geometry JSONB NOT NULL
);

-- Vehicles
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('truck', 'sweeper', 'utility')),
    capacity_kg DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'retired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Urban Furniture
CREATE TABLE urban_furniture (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('PRN', 'BAC_RUE', 'POINT_PROPRE')),
    name VARCHAR(200) NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    commune_id UUID REFERENCES communes(id),
    install_date DATE NOT NULL,
    last_maintenance_date DATE,
    capacity_kg DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'good' CHECK (status IN ('good', 'needs-maintenance', 'damaged')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance Records
CREATE TABLE maintenance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    furniture_id UUID REFERENCES urban_furniture(id),
    vehicle_id UUID REFERENCES vehicles(id),
    maintenance_date TIMESTAMP WITH TIME ZONE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('routine', 'repair', 'replacement')),
    description TEXT NOT NULL,
    cost DECIMAL(10, 2),
    technician_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Alerts and Notifications
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('fill_level', 'maintenance', 'vehicle', 'system')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX idx_collection_points_commune ON collection_points(commune_id);
CREATE INDEX idx_collection_points_type ON collection_points(type);
CREATE INDEX idx_collection_history_date ON collection_history(collection_date);
CREATE INDEX idx_sweeping_routes_commune ON sweeping_routes(commune_id);
CREATE INDEX idx_urban_furniture_commune ON urban_furniture(commune_id);
CREATE INDEX idx_urban_furniture_type ON urban_furniture(type);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_type ON alerts(type);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collection_points_updated_at
    BEFORE UPDATE ON collection_points
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sweeping_routes_updated_at
    BEFORE UPDATE ON sweeping_routes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_urban_furniture_updated_at
    BEFORE UPDATE ON urban_furniture
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();