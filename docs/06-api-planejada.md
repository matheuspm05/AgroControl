# API Planejada

## Auth
- POST /auth/register
- POST /auth/login

## Fazenda
- GET /fazenda
- POST /fazenda
- PUT /fazenda

## Animais
- GET /animais
- GET /animais/{id}
- POST /animais
- PUT /animais/{id}
- DELETE /animais/{id}

## Pastos
- GET /pastos
- GET /pastos/{id}
- POST /pastos
- PUT /pastos/{id}
- DELETE /pastos/{id}

## Currais
- GET /currais
- GET /currais/{id}
- POST /currais
- PUT /currais/{id}
- DELETE /currais/{id}

## Remédios
- GET /remedios
- GET /remedios/{id}
- POST /remedios
- PUT /remedios/{id}
- DELETE /remedios/{id}

## Campeiros
- GET /campeiros
- GET /campeiros/{id}
- POST /campeiros
- PUT /campeiros/{id}
- DELETE /campeiros/{id}

## Aplicações de remédio
- POST /animais/{id}/aplicar-remedio
- GET /animais/{id}/aplicacoes-remedio

## Movimentações
- POST /animais/{id}/movimentar
- GET /animais/{id}/movimentacoes

## Relatórios
- GET /relatorios/resumo
- GET /relatorios/animais-por-local
- GET /relatorios/historico-remedios
