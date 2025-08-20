# Repository Setup Guide - Plano Gratuito

## 1. GitHub Actions Permissions (FAZER PRIMEIRO! 🚨)

### Enable GitHub Actions to Create PRs

**Sem isso, Release Please não funcionará!**

1. Go to **Settings** → **Actions** → **General**
2. Scroll to **Workflow permissions**
3. Select: **Read and write permissions**
4. ✅ **Allow GitHub Actions to create and approve pull requests**
5. Click **Save**

## 2. Branch Protection Rules (Opcional para Repositório Pessoal)

### Configure Main Branch Protection

Para repositório pessoal com plano gratuito, recomendo configuração simplificada:

1. Go to **Settings** → **Branches**
2. Click **Add rule**
3. Branch name pattern: `main`
4. Configure:

#### Configuração Recomendada para Repositório Pessoal:

- ✅ **Require a pull request before merging**
  - ❌ **NÃO marque** "Require approvals" (você não conseguirá aprovar seus próprios PRs)
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  
- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - Após o primeiro CI rodar, adicione os checks:
    - `test (18)`
    - `test (20)` 
    - `test (22)`

- ✅ **Require conversation resolution before merging**
- ❌ **NÃO marque** "Include administrators" (você poderá fazer merge direto se necessário)

## 3. Repository Settings

### General Settings

1. Go to **Settings** → **General**
2. Under **Pull Requests**:
   - ✅ Allow merge commits
   - ✅ Allow squash merging
   - ❌ Allow auto-merge (não disponível no plano gratuito)

## 4. NPM Token Setup (Obrigatório para Publicar)

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

## 5. Configuração Simplificada para Plano Gratuito

### Resumo das Limitações e Soluções:

| Recurso | Plano Gratuito | Solução |
|---------|---------------|----------|
| Branch Protection | ✅ Disponível | Não exigir aprovações |
| GitHub Actions | ✅ Disponível | Configurar permissões corretas |
| Auto-merge | ❌ Não disponível | Fazer merge manual |
| Bypass rules | ❌ Não disponível | Não necessário com permissões corretas |
| Release Please | ✅ Funciona | Apenas configurar permissões |

## 6. Workflow para Repositório Pessoal

### Como trabalhar sozinho com PRs:

1. **Criar feature branch:**
```bash
git checkout -b feat/nova-funcionalidade
git push -u origin feat/nova-funcionalidade
```

2. **Criar PR no GitHub:**
   - Vá para o repositório no GitHub
   - Clique em "Compare & pull request"
   - Escreva descrição
   - Clique em "Create pull request"

3. **CI roda automaticamente:**
   - Aguarde os testes passarem
   - Verifique os logs se houver erro

4. **Fazer merge (sem aprovação necessária):**
   - Clique em "Merge pull request"
   - Confirme o merge

5. **Release Please cria PR automaticamente:**
   - Aguarde alguns minutos
   - Um PR chamado "chore(main): release X.X.X" aparecerá
   - Revise o CHANGELOG gerado
   - Faça merge deste PR

6. **Publicação automática no npm:**
   - Após merge do PR de release
   - Package é publicado automaticamente
   - GitHub release é criado

## 7. Configuração Inicial

### Primeira vez configurando:

```bash
# 1. Push das configurações
git add .
git commit -m "chore: configure repository for automated releases"
git push origin main

# 2. Vá para GitHub e configure:
#    - Settings → Actions → General → Workflow permissions
#    - Marque as duas opções mencionadas
#    - Salve

# 3. Aguarde o Release Please criar o primeiro PR
#    (pode demorar alguns minutos)

# 4. Se não criar automaticamente, force com um tag:
git tag -a v0.1.0 -m "Initial release"
git push origin v0.1.0
```

## Troubleshooting para Plano Gratuito

### Release Please não cria PRs?

**Solução passo a passo:**
1. Settings → Actions → General
2. Workflow permissions → Read and write permissions
3. ✅ Allow GitHub Actions to create and approve pull requests
4. Save
5. Re-run workflow no Actions tab

### Não consigo aprovar meu próprio PR?

**Soluções:**
- Remova requirement de aprovação em branch protection
- OU adicione um colaborador (pode ser um amigo)
- OU faça merge direto se você for admin

### NPM publish falha?

**Checklist:**
1. Token NPM está em Secrets? (`NPM_TOKEN`)
2. Token é do tipo "Automation"?
3. Package name está disponível no npm?
4. Version no package.json está correta?
