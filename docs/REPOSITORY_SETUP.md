# Repository Setup Guide

## 1. NPM Token Setup (Obrigatório para Publicar)

### Configure NPM Authentication

1. Go to [npmjs.com](https://www.npmjs.com/) and sign in
2. Click on your profile → **Access Tokens**
3. **Generate New Token** → **Classic Token**
4. Select **"Automation"** type
5. Copy the token
6. Go to GitHub repository → **Settings** → **Secrets and variables** → **Actions**
7. Click **"New repository secret"**
8. Name: `NPM_TOKEN`
9. Value: Paste your npm token
10. Click **"Add secret"**

## 2. GitHub Actions Setup

### Workflow Automático de Publicação

O projeto está configurado com GitHub Actions para publicar automaticamente no npm quando uma tag é criada:

- **CI Workflow** (`.github/workflows/ci.yml`): Roda testes em cada push e PR
- **Publish Workflow** (`.github/workflows/publish.yml`): Publica no npm quando uma tag `v*` é criada

## 3. Fluxo de Release Simplificado

### Como fazer um novo release:

#### Usando scripts npm (Recomendado):

```bash
# Para patch release (1.0.x)
npm run release:patch

# Para minor release (1.x.0)
npm run release:minor

# Para major release (x.0.0)
npm run release:major
```

#### Manualmente:

```bash
# 1. Garanta que está na branch main e atualizada
git checkout main
git pull origin main

# 2. Faça suas alterações e commit
git add .
git commit -m "fix: descrição da correção"

# 3. Atualize a versão
npm version patch  # ou minor, ou major

# 4. Crie e push da tag
git push origin main
git push origin --tags
```

### O que acontece após criar a tag:

1. GitHub Actions detecta a nova tag `v*`
2. Workflow de CI roda os testes
3. Workflow de Publish:
   - Instala dependências
   - Roda testes
   - Faz build
   - Publica no npm automaticamente
4. Package fica disponível no npm

## 4. Branch Protection (Opcional)

### Para adicionar proteção à branch main:

1. Go to **Settings** → **Branches**
2. Click **Add rule**
3. Branch name pattern: `main`
4. Configure:
   - ✅ **Require a pull request before merging**
   - ✅ **Require status checks to pass before merging**
   - Adicione os checks: `test (18)`, `test (20)`, `test (22)`

## 5. Desenvolvimento com Pull Requests

### Workflow recomendado:

```bash
# 1. Criar feature branch
git checkout -b feat/nova-funcionalidade

# 2. Fazer alterações e commit
git add .
git commit -m "feat: adiciona nova funcionalidade"

# 3. Push da branch
git push -u origin feat/nova-funcionalidade

# 4. Criar PR no GitHub
# 5. Aguardar CI passar
# 6. Fazer merge
# 7. Deletar branch
```

## 6. Convenções de Commit

Use conventional commits para manter histórico organizado:

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação, sem mudança de lógica
- `refactor:` - Refatoração de código
- `test:` - Adição ou correção de testes
- `chore:` - Tarefas de manutenção

## Troubleshooting

### NPM publish falha?

**Checklist:**
1. Token NPM está configurado em Secrets? (`NPM_TOKEN`)
2. Token é do tipo "Automation"?
3. Package name está disponível no npm?
4. Version no package.json não foi publicada antes?

### CI falha?

1. Verifique os logs no GitHub Actions
2. Rode os testes localmente: `npm test`
3. Verifique linting: `npm run lint`
4. Verifique tipos: `npm run type-check`

### Tag não dispara publicação?

1. Certifique-se que a tag começa com `v` (ex: `v1.0.0`)
2. Verifique se o workflow está habilitado em Actions
3. Verifique se NPM_TOKEN está configurado