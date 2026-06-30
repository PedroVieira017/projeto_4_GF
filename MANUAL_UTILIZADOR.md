# Manual de Utilizador — Gestão de Formações

Este manual descreve as funcionalidades do módulo **Gestão de Formações** para os dois perfis do sistema: **Admin** e **Utilizador** (Aluno/Participante).

## 1. Objetivo do módulo
O módulo permite:
- Administrar tipos e ações de formação.
- Associar participantes a ações.
- Submeter formações externas com certificado.
- Validar ou rejeitar formações submetidas.

## 2. Acesso e navegação
Após autenticação, aceda ao módulo **Gestão de Formações** no menu lateral.

As opções visíveis dependem do perfil:
- Admin: Tipos de Formação, Ações de Formação, Participantes, Validação.
- Utilizador: As Minhas Formações.

## 3. Funcionalidades do Admin

### 3.1 Tipos de Formação
Caminho: `/gestao_formacoes/tipos_formacao`

Permite gerir a lista de tipos.

Principais ações:
1. Criar tipo:
- Clique em **Novo**.
- Preencha a **Designação**.
- Clique em **Guardar**.

2. Editar tipo:
- Na tabela, clique no ícone **Editar**.
- Atualize a designação.
- Clique em **Guardar**.

3. Eliminar tipo:
- Na tabela, clique no ícone **Eliminar**.
- Confirme a eliminação.

### 3.2 Ações de Formação
Caminho: `/gestao_formacoes/acoes_formacao`

Permite criar e manter ações de formação.

Campos principais:
- Designação (obrigatório)
- Tipo (obrigatório)
- Objetivos (obrigatório)
- Nº Horas (obrigatório)
- Empresa / Local
- Data de Início / Data de Fim
- Certificado automático:
  - Ativar/desativar geração automática.
  - Configurar textos, cores, fontes, tamanhos e posições.
  - Usar placeholders automáticos como nome do participante, ação, descrição, datas, horas e entidade.
  - Carregar uma imagem única para o rodapé com todos os logotipos pretendidos.
  - Pré-visualizar o certificado durante a configuração.

Principais ações:
1. Criar ação:
- Clique em **Novo**.
- Preencha os campos obrigatórios.
- Clique em **Guardar**.

2. Editar ação:
- Clique em **Editar** na linha da ação.
- Altere os dados.
- Clique em **Guardar**.

3. Eliminar ação:
- Clique em **Eliminar** na linha da ação.
- Confirme.

4. Ver participantes da ação:
- Clique no ícone **Ver participantes**.
- Na lista de participantes associados, o Admin pode abrir/descarregar o certificado pelo ícone **lupa** na coluna **Certificado**, quando disponível.

5. Associar participantes:
- Clique no ícone **Associar participantes**.

Notas sobre certificados automáticos:
- Quando uma ação tem certificado automático ativo, o certificado é gerado em PDF com a configuração definida pelo Admin.
- O texto do certificado pode ser adaptado para certificado de participação, certificado de formação, declaração de formação ou outra designação.
- Os dados da ação e do participante são preenchidos automaticamente através dos placeholders configurados.
- O certificado fica disponível em **As Minhas Formações** quando a participação do utilizador está validada.

### 3.3 Participantes
Caminho: `/gestao_formacoes/participantes`

Lista participantes ativos e o número de formações.

Ação disponível:
1. Ver formações de um participante:
- Clique em **Ver formações**.
- Abre a página: `/gestao_formacoes/participantes/{id}/formacoes`.

### 3.4 Associar participantes a uma ação
Caminho: `/gestao_formacoes/acoes_formacao/{id}/participantes`

Permite associar participantes a uma ação específica.

Como usar:
1. Marque os participantes na coluna de seleção.
2. (Opcional) Filtre por UO (escola).
3. Clique em **Guardar**.

Notas:
- Participantes já associados surgem pré-selecionados.
- A opção “ver apenas associados” pode abrir a página em modo consulta.

### 3.5 Validação de formações
Caminho: `/gestao_formacoes/validacao`

Apresenta formações submetidas pelos utilizadores.

Ações disponíveis:
1. Validar formação:
- Clique em **Validar**.
- Confirme a ação.

2. Rejeitar formação:
- Clique em **Rejeitar**.
- Confirme a ação.

3. Ver/Descarregar comprovativo:
- Clique no ícone **lupa** na coluna **Certificado**.
- Abre a pré-visualização e permite download.
- O download é direto e mantém o utilizador na mesma página.

## 4. Funcionalidades do Utilizador

### 4.1 As Minhas Formações
Caminho: `/gestao_formacoes/minhas_formacoes`

Mostra as formações do utilizador, com estado:
- Por validar / Pendente
- Validada
- Rejeitada

Ações disponíveis:
1. Adicionar formação externa:
- Clique em **Novo**.

2. Ver/Descarregar certificado:
- Clique no ícone **lupa** (quando disponível).
- O download é direto e mantém o utilizador na mesma página.
- Para ações com certificado automático, o PDF é gerado pelo sistema e apresentado no mesmo botão.

### 4.2 Adicionar formação externa
Caminho: `/gestao_formacoes/minhas_formacoes/adicionar_formacao`

Campos obrigatórios:
- Título da formação
- Entidade formadora
- Data de início
- Data de fim
- Certificado (PDF)

Passos:
1. Preencha os campos obrigatórios.
2. Anexe o certificado em PDF.
3. Clique em **Guardar**.

Importante:
- A formação fica com estado **“Por Validar”** até decisão do Admin.

## 5. Comportamentos comuns nas tabelas
As tabelas suportam normalmente:
- Ordenação por colunas.
- Paginação.
- Pesquisa.
- Exportação (PDF, CSV, Excel, Copiar), quando disponível.

## 6. Estados e significado
Estados mais comuns:
- Por validar / Pendente: aguarda validação do Admin.
- Validada: aceite.
- Rejeitada: recusada.

## 7. Dicas rápidas
- Se um botão não aparecer, pode ser limitação do perfil.
- Para anexos, use preferencialmente ficheiros PDF.
- Após guardar, aguarde a mensagem de sucesso.

## 8. Trabalho futuro / Notas
- A **entidade externa** deve ser escolhida a partir de um WebService (sem texto livre).
- Ao criar uma **ação de formação**, indicar se pertence à área de formação pedagógica.
- Na listagem de ações de formação, permitir **filtro** por área pedagógica.
- Na validação, permitir validar a ação **e** se é (ou não) de formação pedagógica.
