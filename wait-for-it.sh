#!/bin/sh
# Espera o banco de dados estar pronto antes de iniciar a aplicação

echo "Waiting for database $DATABASE_HOST:$DATABASE_PORT"

while ! nc -z $DATABASE_HOST $DATABASE_PORT; do
  sleep 1
done

echo "Database ready $DATABASE_HOST:$DATABASE_PORT"
exec "$@"