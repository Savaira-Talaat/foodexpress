# FoodExpress API

API RESTful pour la gestion de commandes de nourriture en ligne. Développée avec Node.js, Express et MongoDB.

##  Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Technologies utilisées](#technologies-utilisées)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Lancement](#lancement)
- [Tests](#tests)
- [Documentation API](#documentation-api)
- [Endpoints principaux](#endpoints-principaux)
- [Authentification](#authentification)

##  Fonctionnalités

- Authentification JWT (JSON Web Token)
- Gestion des utilisateurs (inscription, connexion, CRUD)
- Gestion des restaurants (CRUD, recherche, pagination)
- Gestion des menus (CRUD, tri, pagination)
- Autorisation basée sur les rôles (utilisateur/admin)
- Pagination pour les listes
- Recherche par nom et adresse

## Technologies utilisées

- **Node.js** - Environnement d'exécution JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **JWT** - Authentification par token
- **bcrypt** - Hachage des mots de passe
- **Jest** - Framework de tests
- **Supertest** - Tests d'API
- **Swagger** - Documentation API

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [npm](https://www.npmjs.com/)

## Installation

1. **Cloner le repository**

```
git clone https://github.com/Savaira-Talaat/foodexpress.git
cd foodexpress
```

2. **Installer les dépendances**

```bash
npm install
```

## Configuration

1. **Vérifier la configuration**

La configuration est définie directement dans le code source. Les valeurs par défaut sont :
- **Port** : 3000
- **MongoDB URI** : `mongodb://localhost:27017/foodexpress`
- **JWT Secret** : Défini dans `src/middlewares/authentication.js`

2. Démarrer MongoDB


## Lancement


```bash
npm run start
```

Le serveur sera accessible sur `http://localhost:3000`

## Tests

```bash
# Lancer tous les tests
npm test

# Lancer un fichier de test spécifique
npm test users.test.js

## Documentation API

La documentation complète de l'API est disponible via Swagger UI :

```
http://localhost:3000/api-docs
```

### Tester l'API avec Swagger

1. Ouvrez `http://localhost:3000/api-docs`
2. Créez un compte ou connectez-vous via `/authentication/register` ou `/authentication/login`
3. Copiez le token JWT retourné
4. Cliquez sur le bouton **"Authorize"** en haut à droite
5. Entrez : `Bearer votre-token-ici`
6. Testez les endpoints directement depuis l'interface

## Endpoints principaux

### Authentication
- `POST /authentication/register` - Créer un compte
- `POST /authentication/login` - Se connecter

### Users
- `GET /users` - Lister les utilisateurs (admin)
- `GET /users/:id` - Obtenir un utilisateur (admin)
- `PUT /users/:id` - Modifier un utilisateur (user/admin)
- `DELETE /users/:id` - Supprimer un utilisateur (user/admin)

### Restaurants
- `GET /restaurants` - Lister les restaurants (public)
- `GET /restaurants/:id` - Obtenir un restaurant (public)
- `GET /restaurants/by-name/:name` - Rechercher par nom (public)
- `GET /restaurants/by-address/:address` - Rechercher par adresse (public)
- `POST /restaurants/create-restaurant` - Créer un restaurant (admin)
- `PUT /restaurants/modify-restaurant/:id` - Modifier un restaurant (admin)
- `DELETE /restaurants/delete-restaurant/:id` - Supprimer un restaurant (admin)

### Menus
- `GET /menus` - Lister les menus (public)
- `GET /menus/:id` - Obtenir un menu (public)
- `POST /menus` - Créer un menu (admin)
- `PUT /menus/:id` - Modifier un menu (admin)
- `DELETE /menus/:id` - Supprimer un menu (admin)

## Authentification

### Créer un compte

```bash
curl -X POST http://localhost:3000/authentication/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "password123"
  }'
```

### Se connecter

```bash
curl -X POST http://localhost:3000/authentication/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Utiliser le token

```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer votre-token-jwt"
```

## Pagination

Les endpoints de liste supportent la pagination :

```bash
# Restaurants - Page 1 (défaut : 10 par page)
GET /restaurants?page=1

# Menus - Page 2 avec 20 résultats
GET /menus?page=2&limit=20
```

## Tri et recherche

```bash
# Trier les restaurants par nom
GET /restaurants?sortBy=name&order=asc

# Trier les menus par prix décroissant
GET /menus?sortBy=price&order=desc

# Rechercher un restaurant par nom
GET /restaurants/by-name/Le%20Gourmet
```

## Rôles utilisateur

### User (utilisateur)
- Peut créer un compte
- Peut modifier/supprimer son propre compte
- Peut consulter les restaurants et menus

### Admin (administrateur)
- Toutes les permissions utilisateur
- Peut gérer tous les utilisateurs
- Peut créer/modifier/supprimer des restaurants
- Peut créer/modifier/supprimer des menus

## Structure du projet

```
foodexpress/
├── src/
│   ├── routes/
│   │   ├── authentication.js
│   │   ├── menus.js
│   │   ├── my-account.js
│   │   ├── restaurants.js
│   │   └── menus.js
│   ├── middlewares/
│   │   └── authentication.js
│   ├── test-router/
│   │   ├── menus.test.js
│   │   ├── restaurants.test.js
│   │   └── users.test.js
│   ├── index.js
│   ├── mongo.js
│   ├── server.js
│   └── swagger.yaml
├── .gitignore
├── package-lock.json
├── package.json
└── README.md
```
