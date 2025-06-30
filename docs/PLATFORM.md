# Geoportail SONAGED - Documentation Technique

## Architecture Globale

Le Geoportail SONAGED est une application web de gestion des déchets qui utilise les technologies suivantes :

- Frontend: React + TypeScript + Vite
- Styles: Tailwind CSS
- Cartographie: Leaflet
- Base de données: Supabase (PostgreSQL)
- Authentification: Supabase Auth

## Structure de la Base de Données

La base de données est organisée autour de plusieurs entités principales :

### Tables Principales

1. `users` - Gestion des utilisateurs
   - Rôles : admin, geomatician, viewer
   - Authentification et autorisations

2. `collection_points` - Points de collecte
   - Types : container, bin, center
   - Géolocalisation
   - Capacité et état de remplissage

3. `sweeping_routes` - Circuits de balayage
   - Planification des itinéraires
   - Gestion des équipes (matin/soir)
   - Géométrie des tracés

4. `urban_furniture` - Mobilier urbain
   - Types : PRN, BAC_RUE, POINT_PROPRE
   - Maintenance et état
   - Localisation

### Relations et Hiérarchie

```
regions
  └── departments
       └── communes
            ├── collection_points
            ├── sweeping_routes
            └── urban_furniture
```

## Composants Frontend

### Pages Principales

1. `Dashboard.tsx`
   - Vue d'ensemble des KPIs
   - Graphiques de suivi
   - Alertes récentes

2. `MapExplorer.tsx`
   - Carte interactive
   - Gestion des couches
   - Export de cartes

3. `DataCatalog.tsx`
   - Catalogue des données
   - Filtres et recherche
   - Téléchargement des données

### Composants Cartographiques

1. `MapView.tsx`
   - Affichage de la carte Leaflet
   - Gestion des marqueurs
   - Popups d'information

2. `LayerControl.tsx`
   - Contrôle des couches
   - Opacité et visibilité
   - Légende

3. `MapExport.tsx`
   - Configuration d'export
   - Mise en page
   - Options d'impression

## Fonctionnalités Clés

### Gestion des Déchets

- Suivi en temps réel des points de collecte
- Optimisation des circuits de balayage
- Maintenance du mobilier urbain
- Génération de rapports

### Cartographie

- Visualisation multicouche
- Export de cartes personnalisées
- Analyses spatiales
- Géolocalisation des équipements

### Données

- Import/Export de données
- Filtrage et recherche
- Historique des modifications
- Statistiques et analyses

## Sécurité et Permissions

### Rôles Utilisateurs

1. Admin
   - Accès complet
   - Gestion des utilisateurs
   - Configuration système

2. Géomaticien
   - Édition des données
   - Création de cartes
   - Analyses spatiales

3. Viewer
   - Consultation uniquement
   - Téléchargement des données
   - Visualisation des cartes

## Maintenance et Évolution

### Mises à jour

- Versioning des données
- Migration de la base
- Déploiement continu

### Monitoring

- Logs système
- Alertes et notifications
- Suivi des performances