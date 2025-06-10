# 🎮 Infinity Games

Une plateforme web complète pour découvrir, explorer et partager des jeux vidéo. Infinity Games aide les utilisateurs à trouver leur prochain jeu grâce à une interface intuitive, des recommandations personnalisées et une communauté active.

## 🌟 Fonctionnalités

- **Bibliothèque de jeux** : Parcourez une vaste collection de jeux via l'API RAWG.io
- **Système de tri avancé** : Filtrez par genre, plateforme, année, note
- **Jeux similaires** : Découvrez des jeux similaires à vos favoris
- **Jeux populaires** : Explorez les tendances du moment
- **Favoris** : Sauvegardez vos jeux préférés
- **Système de commentaires** : Partagez vos avis sur les jeux
- **Forum communautaire** : Discutez avec d'autres joueurs
- **Chatbot IA** : Obtenez des recommandations personnalisées

## 🛠️ Technologies

### Frontend
- **React** 18+ avec hooks
- **React Router** pour la navigation
- **Fetch** pour les appels API
- **CSS3** / **Styled Components**

### Backend
- **Symfony** 6.x
- **Doctrine ORM** pour la gestion de base de données
- **API Platform** pour les endpoints REST
- **JWT Authentication** pour la sécurité

### Base de données
- **MySQL** 8.0
- Hébergement **OVH**

### APIs externes
- **RAWG.io API** pour les données de jeux
- **OpenAI API** pour le chatbot (si applicable)

## 📋 Prérequis

- **Node.js** 16+ et npm
- **PHP** 8.1+
- **Symfony** 6.0+
- **Composer**
- **MySQL** 8.0+
- **Git**

## 🚀 Installation

### 1. Cloner le repository
```bash
git clone https://github.com/votre-username/infinity-games.git
cd infinity-games
```

### 2. Configuration Backend (Symfony)
```bash
cd backend
composer install
```

Créez le fichier `.env.local` :
```env
DATABASE_URL="mysql://username:password@127.0.0.1:3306/infinity_games"
RAWG_API_KEY=your_rawg_api_key
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
```

Générez les clés JWT :
```bash
php bin/console lexik:jwt:generate-keypair
```

Créez la base de données :
```bash
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
php bin/console doctrine:fixtures:load
```

Lancez le serveur :
```bash
symfony serve -d
```

### 3. Configuration Frontend (React)
```bash
cd frontend
npm install
```

Créez le fichier `.env` :
```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_RAWG_API_KEY=your_rawg_api_key
```

Lancez l'application :
```bash
npm start
```

## 📚 Structure du projet

```
infinity-games/
├── frontend/                 # Application React
│   ├── public/
│   ├── src/
│   │   ├── components/       # Composants réutilisables
│   │   ├── pages/           # Pages de l'application
│   │   ├── services/        # Services API
│   │   ├── hooks/           # Hooks personnalisés
│   │   └── utils/           # Utilitaires
│   └── package.json
├── backend/                  # API Symfony
│   ├── config/
│   ├── src/
│   │   ├── Controller/      # Contrôleurs API
│   │   ├── Entity/          # Entités Doctrine
│   │   ├── Repository/      # Repositories
│   │   └── Service/         # Services métier
│   ├── migrations/          # Migrations de base de données
│   └── composer.json
├── docker-compose.yml
└── README.md
```

## 🧪 Tests

### Backend (Symfony)
```bash
cd backend
php bin/phpunit
```

### Frontend (React)
```bash
cd frontend
npm test
npm run test:coverage
```

## 🚢 Déploiement

### Production
1. Construire le frontend :
```bash
cd frontend
npm run build
```

2. Configurer les variables d'environnement de production
3. Déployer sur votre serveur (OVH, AWS, etc.)

### Base de données
Assurez-vous de :
- Configurer les backups automatiques
- Utiliser des variables d'environnement sécurisées
- Activer SSL pour les connexions

## 🔐 Sécurité

- **JWT Authentication** pour l'authentification
- **Validation des données** côté backend
- **CORS** configuré pour les domaines autorisés

## 👥 Auteur

**Votre Nom** - damien.fasquelle.dev@gmail.com

## 🙏 Remerciements

- [RAWG.io](https://rawg.io/apidocs) pour l'API de jeux vidéo
- [Symfony](https://symfony.com/) pour le framework backend
- [React](https://reactjs.org/) pour le framework frontend
- La communauté open source

---

⭐ **N'hésitez pas à mettre une étoile si ce projet vous a plu !**
