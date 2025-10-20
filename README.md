## 🧪 Tecnologias

Esse projeto foi desenvolvido com as seguintes tecnologias:

- [Node](https://nodejs.org/en/)
- [Nestjs](https://nestjs.com)
- [TypeORM](https://typeorm.io/)
- [Vitest](https://vitest.dev/)

## 🚀 Como executar

Clone o projeto e acesse a pasta do mesmo.

```bash
$ git clone https://github.com/Brunoocn/leggal-case-backend.git
$ cd leggal-case-backend.git
```

Para iniciá-lo, siga os passos abaixo:

```bash
# Copiar arquivo de configuração
$ cp .env.sample .env

# Editar o .env e configurar suas variáveis (JWT_SECRET, OPENAI_API_KEY, etc)

# Subir a aplicação com o Docker
$ docker-compose up -d
```

O server irá subir na porta http://localhost:3005.

Para acessar a documentação da api, basta acessar http://localhost:3005/api/docs.

**Nota:** Ao rodar com Docker, o `PG_DATABASE_HOST` será automaticamente configurado como `db` pelo docker-compose. Para desenvolvimento local sem Docker, use `localhost`.
