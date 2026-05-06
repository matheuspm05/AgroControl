#!/bin/zsh

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

# JWT para ambiente local/dev
# Se Jwt__Key não estiver configurada no ambiente, usa uma chave local apenas para desenvolvimento.
if [ -z "$Jwt__Key" ]; then
  export Jwt__Key="agrocontrol-dev-jwt-key-2026-32chars"
fi

# Verifica se a connection string do PostgreSQL existe
# A senha do banco NÃO deve ficar neste arquivo.
if [ -z "$ConnectionStrings__DefaultConnection" ]; then
  echo "ERRO: ConnectionStrings__DefaultConnection não configurada."
  echo ""
  echo "Configure no ~/.zshrc assim:"
  echo 'export ConnectionStrings__DefaultConnection="Host=localhost;Port=5432;Database=agrocontrol_dev;Username=agro_userdb;Password=SUA_SENHA_LOCAL"'
  echo ""
  echo "Depois rode:"
  echo "source ~/.zshrc"
  exit 1
fi

# Abrir terminal para rodar o backend
gnome-terminal -- zsh -c "
export Jwt__Key=\"$Jwt__Key\" && \
export ConnectionStrings__DefaultConnection=\"$ConnectionStrings__DefaultConnection\" && \
cd \"$ROOT_DIR/backend/ApiAgro\" && \
dotnet run --launch-profile Dev; \
exec zsh
"

# Abrir terminal para rodar o frontend
gnome-terminal -- zsh -c "
cd \"$ROOT_DIR/frontend/FrontEndAgro\" && \
if [ ! -d node_modules ]; then npm install; fi && \
npm run dev; \
exec zsh
"