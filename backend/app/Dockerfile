FROM node:20

WORKDIR /app

# 1) Copy package.json first to cache npm install layer
COPY package*.json ./

# 2) Copy prisma schema BEFORE npm install so postinstall (prisma generate) can find it
COPY prisma ./prisma

# 3) Install dependencies (postinstall runs prisma generate)
RUN npm install

# 4) Copy remaining source code
COPY . .

# 5) Create logs directory for Winston
RUN mkdir -p logs

EXPOSE 3000

# Run prisma migrate deploy at runtime (applies pending migrations to DB)
CMD ["sh", "-c", "npx prisma migrate deploy --schema ./prisma/schema.prisma; node src/index.js"]