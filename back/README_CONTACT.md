# Configuration du formulaire de contact

## Configuration de l'envoi d'email

Pour activer l'envoi d'emails depuis le formulaire de contact, vous devez configurer les variables d'environnement suivantes dans votre fichier `config.json` :

```json
{
  "EMAIL_SERVICE": "gmail",
  "EMAIL_USER": "votre-email@gmail.com",
  "EMAIL_PASSWORD": "votre-mot-de-passe-app",
  "CONTACT_EMAIL": "email-destination@example.com"
}
```

### Configuration Gmail (recommandé)

1. **Activer la validation en deux étapes** sur votre compte Google
2. **Générer un mot de passe d'application** :
   - Allez sur https://myaccount.google.com/security
   - Cliquez sur "Validation en deux étapes"
   - Faites défiler vers le bas et cliquez sur "Mots de passe des applications"
   - Sélectionnez "Autre" et donnez un nom (ex: "Portfolio Contact")
   - Copiez le mot de passe généré (16 caractères)
3. **Utilisez ce mot de passe** dans `EMAIL_PASSWORD`

### Autres services email

Vous pouvez utiliser d'autres services email en modifiant `EMAIL_SERVICE` :

- `gmail` (par défaut)
- `outlook` / `hotmail`
- `yahoo`
- `sendgrid`
- etc.

Pour une configuration SMTP personnalisée, modifiez `back/src/controllers/contactController.js`.

## Variables d'environnement

### Fichier config.json (local)

```json
{
  "GITHUB_USERNAME": "CarrascoAlexis",
  "EMAIL_SERVICE": "gmail",
  "EMAIL_USER": "your-email@gmail.com",
  "EMAIL_PASSWORD": "your-app-password",
  "CONTACT_EMAIL": "destination@example.com"
}
```

### Variables d'environnement système (production)

```bash
export EMAIL_SERVICE=gmail
export EMAIL_USER=your-email@gmail.com
export EMAIL_PASSWORD=your-app-password
export CONTACT_EMAIL=destination@example.com
```

## Fonctionnalités

- ✅ Sauvegarde automatique des messages dans la base de données SQLite
- ✅ Envoi d'email à l'adresse configurée (si la config email est présente)
- ✅ Validation côté frontend et backend
- ✅ Messages d'erreur explicites
- ✅ Interface utilisateur moderne et responsive
- ✅ Stockage persistant des messages de contact

## Endpoints API

### POST /api/contact

Envoie un message de contact.

**Body:**
```json
{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "subject": "Demande de collaboration",
  "message": "Bonjour, je souhaiterais discuter d'un projet..."
}
```

**Réponse (succès):**
```json
{
  "ok": true,
  "message": "Message envoyé avec succès"
}
```

### GET /api/contact

Liste tous les messages de contact (admin).

**Réponse:**
```json
{
  "ok": true,
  "contacts": [
    {
      "id": "uuid",
      "name": "Jean Dupont",
      "email": "jean@example.com",
      "subject": "Demande de collaboration",
      "message": "...",
      "timestamp": "2025-12-03T10:30:00.000Z"
    }
  ]
}
```

## Base de données

Les messages sont stockés dans la table `contact_messages` de la base SQLite (`back/data/portfolio.db`) :

- `id` : Identifiant unique
- `name` : Nom de l'expéditeur
- `email` : Email de l'expéditeur
- `subject` : Sujet du message
- `message` : Contenu du message
- `timestamp` : Date et heure d'envoi

## Sécurité

- Validation des emails côté backend
- Protection contre les champs vides
- Limitation à 500 messages stockés (peut être ajusté)
- Pas d'exposition des credentials dans le code
