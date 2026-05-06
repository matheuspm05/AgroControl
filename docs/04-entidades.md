# Entidades do Sistema

## Usuario
Representa o dono da conta no sistema.

Campos principais:
- Id
- Nome
- Email
- SenhaHash
- Contato
- DataCriacao

## Fazenda
Representa a fazenda cadastrada pelo usuário.

Campos principais:
- Id
- Nome
- DataCriacao
- TamanhoPropriedade
- Localizacao
- Descricao
- UsuarioId

## Animal
Representa um animal da fazenda.

Campos principais:
- Id
- Nome
- Idade
- Peso
- DataCadastro
- TipoLocalAtual
- LocalAtualId
- FazendaId

Subtipos:
- Boi
- Vaca
- Cavalo

## Pasto
Representa um pasto da fazenda.

Campos principais:
- Id
- Tamanho
- TipoVegetacao
- DataCadastro
- FazendaId

## Curral
Representa um curral da fazenda.

Campos principais:
- Id
- CapacidadeMaxima
- DataCadastro
- FazendaId

## Campeiro
Representa um funcionário da fazenda.

Campos principais:
- Id
- Nome
- TempoDeServico
- Salario
- FazendaId

## Remedio
Representa um remédio cadastrado.

Campos principais:
- Id
- Nome
- DosePadrao
- DataCadastro
- Descricao
- FazendaId

## AplicacaoRemedio
Representa um registro de aplicação de remédio em um animal.

Campos principais:
- Id
- DataAplicacao
- DoseAplicada
- Observacao
- AnimalId
- RemedioId

## MovimentacaoAnimal
Representa um registro de movimentação de um animal.

Campos principais:
- Id
- DataMovimentacao
- OrigemTipo
- OrigemId
- DestinoTipo
- DestinoId
- Observacao
- AnimalId
- FazendaId
