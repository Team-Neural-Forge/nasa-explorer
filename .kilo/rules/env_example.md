# Environment Variable Rule

Whenever you add or change code that reads environment variables:

1) Create or update `.env.example` with every new or changed variable name
2) Use FULL_CAPS names for environmental variables
3) Leave values empty or as placeholders — never put real secrets in `.env.example`
4) Keep `.env` in `.gitignore` so real values are never committed
