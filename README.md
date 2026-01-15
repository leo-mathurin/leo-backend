# leo-backend

Backend API pour générer un briefing matinal personnalisé avec Google Calendar et Todoist.

## Fonctionnalités

- **Skill Alexa** : Briefing vocal matinal en français
- **API REST** : Endpoints pour récupérer le briefing depuis n'importe quelle application

## Endpoints API

### `GET /briefing/text`

Retourne uniquement le texte du briefing (format texte brut).

**Réponse :**
```
Bonjour Léo, aujourd'hui c'est lundi 15 janvier...
```

## Auth (API Key)

Toutes les routes peuvent être protégées par une clé API via:

- **Header** `x-api-key: <API_KEY>`

## Développement

```bash
# Installer les dépendances
bun install

# Lancer en développement
bun run dev

# Build
bun run build

# Lancer en production
bun run start
```
