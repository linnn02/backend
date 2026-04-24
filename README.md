# Scientific Data Harvester

Backend service for collecting and analyzing scientific publication metadata.

## Run

```bash
docker compose up --build


## 🚀 Local Setup (Updated)

1. Install Docker Desktop
2. Run:
   docker compose up -d
3. Init DB:
   docker exec scholar_app npx prisma db push

Access:
- Frontend: http://localhost
- Backend: http://localhost:3000
