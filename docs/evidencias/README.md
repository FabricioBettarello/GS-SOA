# Evidências da aplicação

Coloquem aqui os prints e o que cada um mostra. Sugestão do que capturar:

1. `docker compose up` e `npx prisma migrate deploy` aplicando as **2 migrações**.
2. Tabelas criadas no banco (`npm run db:studio` ou pgAdmin/DBeaver).
3. Swagger em `http://localhost:3000/docs` com todos os endpoints.
4. `POST /leituras` com nível crítico no Swagger, mostrando o alerta criado.
5. Saída do `npm run simular` (água sobe, alerta abre, escala e encerra).
6. `npm test` com todos os testes passando.
