# local activity meetup platform - backend

this is the backend api for a location-based social activity platform where users can create and discover local events, apply to attend activities, and connect with others who share similar interests.

## technology stack

- node.js with express
- postgresql with postgis extension
- redis for caching and real-time operations
- jwt for authentication

## initial setup

### prerequisites

- node.js 18 or higher
- railway account connected to your github
- github repository for this project

### railway deployment

1. create a new project in railway.app
2. connect your github repository
3. add postgresql database service to your project
4. add redis service to your project
5. deploy your backend service from the github repository

### database initialization

after railway provisions your postgresql database, initialize the schema using the railway cli:

```bash
npm install -g @railway/cli
railway login
railway link
railway run psql $database_url -f init-db.sql
railway run psql $database_url -f interests-seed.sql
```

### environment variables

railway automatically provides these variables:
- database_url
- redis_url

you need to add these manually in railway dashboard:
- node_env=production
- jwt_secret=your_secure_random_string
- jwt_expiration=7d
- cors_origin=*

### local development

1. copy .env.example to .env
2. update .env with your local database credentials
3. install dependencies: `npm install`
4. run the server: `npm run dev`

### testing the deployment

once deployed, test your api endpoints:
- health check: https://your-railway-url.up.railway.app/health
- database test: https://your-railway-url.up.railway.app/api/test-db

## project structure

```
backend/
├── src/
│   ├── config/          # configuration files
│   ├── models/          # database models
│   ├── routes/          # api routes
│   ├── controllers/     # request handlers
│   ├── middleware/      # custom middleware
│   └── utils/           # utility functions
├── package.json
├── server.js
├── init-db.sql
└── interests-seed.sql
```

## next steps

- implement authentication routes (register, login, jwt verification)
- create user profile management endpoints
- build event creation and browsing apis
- implement qualification and application system
- add proximity-based matching algorithm
- develop alternative event suggestion logic
