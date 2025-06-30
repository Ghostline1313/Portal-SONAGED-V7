# Structure de la Base de Données SONAGED

## Vue d'ensemble

La base de données SONAGED est conçue pour gérer efficacement les données liées à la gestion des déchets urbains. Elle utilise PostgreSQL via Supabase et intègre des fonctionnalités géospatiales.

## Tables Détaillées

### Gestion des Utilisateurs

```sql
-- users
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(50),
    email VARCHAR(255),
    role VARCHAR(20),
    -- Autres champs...
);
```

Stocke les informations des utilisateurs et leurs rôles dans le système.

### Hiérarchie Géographique

```sql
-- regions, departments, communes
CREATE TABLE regions (...);
CREATE TABLE departments (...);
CREATE TABLE communes (...);
```

Structure hiérarchique pour l'organisation territoriale.

### Points de Collecte

```sql
-- collection_points
CREATE TABLE collection_points (
    id UUID PRIMARY KEY,
    type VARCHAR(50),
    capacity_kg DECIMAL(10,2),
    -- Coordonnées et autres champs...
);
```

Gestion des points de collecte avec leur localisation et caractéristiques.

### Circuits de Balayage

```sql
-- sweeping_routes
CREATE TABLE sweeping_routes (
    id UUID PRIMARY KEY,
    name VARCHAR(200),
    shift VARCHAR(20),
    -- Géométrie et autres champs...
);
```

Définition des circuits de nettoyage urbain.

### Mobilier Urbain

```sql
-- urban_furniture
CREATE TABLE urban_furniture (
    id UUID PRIMARY KEY,
    type VARCHAR(50),
    status VARCHAR(50),
    -- Localisation et autres champs...
);
```

Suivi du mobilier urbain lié à la gestion des déchets.

## Relations et Contraintes

### Clés Étrangères

- `departments.region_id → regions.id`
- `communes.department_id → departments.id`
- `collection_points.commune_id → communes.id`
- etc.

### Contraintes de Validation

```sql
-- Exemples de contraintes
CHECK (role IN ('admin', 'geomatician', 'viewer'))
CHECK (status IN ('active', 'inactive', 'maintenance'))
```

## Indexation

```sql
-- Exemples d'index
CREATE INDEX idx_collection_points_commune ON collection_points(commune_id);
CREATE INDEX idx_urban_furniture_type ON urban_furniture(type);
```

Optimisation des performances pour les requêtes fréquentes.

## Triggers et Fonctions

```sql
-- Mise à jour automatique des timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
```

Automatisation de certaines opérations de maintenance.

## Sécurité

### Politiques RLS (Row Level Security)

```sql
-- Exemple de politique
CREATE POLICY "Users can only view their own data"
ON users
FOR SELECT
USING (auth.uid() = id);
```

Contrôle d'accès granulaire aux données.

## Maintenance

### Sauvegardes

- Sauvegardes quotidiennes automatisées
- Rétention des données selon la politique définie
- Procédures de restauration documentées

### Performance

- Monitoring des requêtes
- Optimisation des index
- Nettoyage périodique des données obsolètes