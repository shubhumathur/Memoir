FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm i || true
COPY . .
EXPOSE 4000
CMD ["npm","start"]






