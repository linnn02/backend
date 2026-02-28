FROM node:20

WORKDIR /app

# 1) Сначала копируем package.json, чтобы кешировался npm install
COPY package*.json ./

# 2) ВАЖНО: копируем prisma schema ДО npm install, чтобы postinstall prisma generate видел schema
COPY prisma ./prisma

# 3) Теперь устанавливаем зависимости (postinstall отработает нормально)
RUN npm install

# 4) Копируем остальной код
COPY . .

EXPOSE 3000
CMD ["npm", "start"]