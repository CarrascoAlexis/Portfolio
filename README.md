# Portfolio

A full-stack portfolio application with real-time chat functionality, featuring a CS:GO Print Stream inspired design aesthetic.

[Version française](#version-française)

## Features

- **Modern Frontend**: React 19 with TypeScript and Vite
- **Real-time Communication**: Socket.IO for instant messaging
- **Backend API**: Express.js with MVC architecture
- **Data Storage**: Redis with in-memory fallback
- **Responsive Design**: Mobile-first approach with CS:GO Print Stream aesthetic
- **Containerized**: Full Docker Compose setup for easy deployment

## Tech Stack

### Frontend
- React 19.2.0
- TypeScript 5.9.3
- Vite 7.2.4
- React Router DOM 6.28.0

### Backend
- Node.js 18
- Express.js
- Socket.IO 4.8.1
- ioredis 5.4.2

### Infrastructure
- Docker & Docker Compose
- Redis 7
- Nginx (production)

## Getting Started

### Prerequisites
- Node.js 18+ (for backend) and Node.js 20+ (for frontend)
- Docker and Docker Compose (for containerized deployment)
- Redis (optional, uses in-memory storage if unavailable)

### Local Development

#### Backend
```bash
cd back
npm install
npm run dev
```

The backend server will start on `http://localhost:4000`

#### Frontend
```bash
cd front
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

### Docker Deployment

Run all services with Docker Compose:

```bash
docker-compose up --build
```

Services:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:4000
- **Redis**: localhost:6379

## Project Structure

```
Portfolio/
├── back/                 # Backend Express.js application
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── models/       # Data models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic & storage
│   │   ├── app.js        # Express app configuration
│   │   ├── index.js      # Server entry point
│   │   └── socket.js     # Socket.IO configuration
│   ├── Dockerfile
│   └── package.json
│
├── front/                # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── App.tsx       # Main app component
│   │   └── index.css     # Global styles
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
└── docker-compose.yml    # Multi-container orchestration
```

## Design

The application features a unique design inspired by the CS:GO Print Stream weapon skin:
- **Color Palette**: Cream and beige backgrounds (#e8e3d6, #ddd8cb, #f2ede0)
- **Accents**: Black technical elements and geometric shapes (#1a1a1a)
- **Typography**: Monospace font stack for technical feel
- **Layout**: Clean, minimal with strategic use of borders and shapes

## API Endpoints

### REST API
- `GET /api/projects` - Retrieve all projects
- `GET /api/games/:id` - Get specific game data
- `POST /api/games` - Create new game

### WebSocket Events
- `join` - Join a chat room
- `message` - Send/receive messages

## Environment Variables

### Backend (.env)
```
PORT=4000
REDIS_URL=redis://redis:6379
```

### Frontend
```
VITE_API_URL=http://localhost:4000
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

# Version Française

Une application portfolio full-stack avec fonctionnalité de chat en temps réel, arborant une esthétique inspirée du skin Print Stream de CS:GO.

## Fonctionnalités

- **Frontend Moderne**: React 19 avec TypeScript et Vite
- **Communication Temps Réel**: Socket.IO pour la messagerie instantanée
- **API Backend**: Express.js avec architecture MVC
- **Stockage de Données**: Redis avec fallback en mémoire
- **Design Responsive**: Approche mobile-first avec esthétique CS:GO Print Stream
- **Conteneurisé**: Configuration Docker Compose complète pour un déploiement facile

## Stack Technique

### Frontend
- React 19.2.0
- TypeScript 5.9.3
- Vite 7.2.4
- React Router DOM 6.28.0

### Backend
- Node.js 18
- Express.js
- Socket.IO 4.8.1
- ioredis 5.4.2

### Infrastructure
- Docker & Docker Compose
- Redis 7
- Nginx (production)

## Démarrage

### Prérequis
- Node.js 18+ (pour le backend) et Node.js 20+ (pour le frontend)
- Docker et Docker Compose (pour le déploiement conteneurisé)
- Redis (optionnel, utilise le stockage en mémoire si indisponible)

### Développement Local

#### Backend
```bash
cd back
npm install
npm run dev
```

Le serveur backend démarre sur `http://localhost:4000`

#### Frontend
```bash
cd front
npm install
npm run dev
```

Le frontend démarre sur `http://localhost:5173`

### Déploiement Docker

Lancer tous les services avec Docker Compose :

```bash
docker-compose up --build
```

Services :
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:4000
- **Redis**: localhost:6379

## Structure du Projet

```
Portfolio/
├── back/                 # Application backend Express.js
│   ├── src/
│   │   ├── controllers/  # Gestionnaires de requêtes
│   │   ├── models/       # Modèles de données
│   │   ├── routes/       # Routes API
│   │   ├── services/     # Logique métier & stockage
│   │   ├── app.js        # Configuration Express
│   │   ├── index.js      # Point d'entrée du serveur
│   │   └── socket.js     # Configuration Socket.IO
│   ├── Dockerfile
│   └── package.json
│
├── front/                # Application frontend React
│   ├── src/
│   │   ├── components/   # Composants UI réutilisables
│   │   ├── pages/        # Composants de pages
│   │   ├── App.tsx       # Composant principal
│   │   └── index.css     # Styles globaux
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
└── docker-compose.yml    # Orchestration multi-conteneurs
```

## Design

L'application présente un design unique inspiré du skin d'arme Print Stream de CS:GO :
- **Palette de Couleurs**: Fonds crème et beige (#e8e3d6, #ddd8cb, #f2ede0)
- **Accents**: Éléments techniques et formes géométriques noirs (#1a1a1a)
- **Typographie**: Police monospace pour un aspect technique
- **Mise en Page**: Épurée et minimaliste avec usage stratégique des bordures et formes

## Points de Terminaison API

### API REST
- `GET /api/projects` - Récupérer tous les projets
- `GET /api/games/:id` - Obtenir les données d'un jeu spécifique
- `POST /api/games` - Créer un nouveau jeu

### Événements WebSocket
- `join` - Rejoindre un salon de discussion
- `message` - Envoyer/recevoir des messages

## Variables d'Environnement

### Backend (.env)
```
PORT=4000
REDIS_URL=redis://redis:6379
```

### Frontend
```
VITE_API_URL=http://localhost:4000
```

## Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.
