# Instruções para Resetar o Projeto para v0.1.0

## 1. Despublicar do NPM (FAZER PRIMEIRO!)

### Opção A: Despublicar completamente (Recomendado para reset total)

```bash
# Despublique todas as versões (dentro de 72 horas da publicação)
npm unpublish barrel-craft --force

# Se passou de 72 horas, você precisará:
# 1. Entrar em contato com npm support
# 2. Ou deprecar as versões antigas
```

### Opção B: Deprecar versões antigas (se não puder despublicar)

```bash
npm deprecate barrel-craft@">=1.0.0" "Package reset - use version 0.1.0 or higher"
```

## 2. Limpar Tags do Git Local e Remoto

```bash
# Listar todas as tags
git tag -l

# Deletar tags locais
git tag -d v1.0.0
git tag -d v1.0.1
git tag -d v1.0.2
git tag -d v1.0.3

# Deletar tags remotas
git push origin --delete v1.0.0
git push origin --delete v1.0.1
git push origin --delete v1.0.2
git push origin --delete v1.0.3
```

## 3. Limpar Releases do GitHub

```bash
# Usando GitHub CLI
gh release delete v1.0.0 --yes
gh release delete v1.0.1 --yes
gh release delete v1.0.2 --yes
gh release delete v1.0.3 --yes

# Ou manualmente:
# 1. Vá para https://github.com/marcioaltoe/barrel-craft/releases
# 2. Delete cada release manualmente
```

## 4. Resetar package.json para 0.1.0

```bash
# Editar package.json manualmente
# Mudar "version": "1.0.3" para "version": "0.1.0"

# Ou usar npm version
npm version 0.1.0 --no-git-tag-version --allow-same-version
```

## 5. Commit e Publicar v0.1.0

```bash
# Commit das mudanças
git add .
git commit -m "chore: reset project to v0.1.0"
git push origin main

# Criar release 0.1.0
npm run release:patch
# Ou manualmente:
git tag v0.1.0
git push origin v0.1.0

# Isso vai acionar o GitHub Actions para publicar no npm
```

## Script Automático para Limpeza

Salve isso como `reset-project.sh`:

```bash
#!/bin/bash

echo "🧹 Limpando tags locais..."
git tag -d v1.0.0 v1.0.1 v1.0.2 v1.0.3 2>/dev/null

echo "🧹 Limpando tags remotas..."
git push origin --delete v1.0.0 v1.0.1 v1.0.2 v1.0.3 2>/dev/null

echo "🧹 Deletando releases do GitHub..."
gh release delete v1.0.0 --yes 2>/dev/null
gh release delete v1.0.1 --yes 2>/dev/null
gh release delete v1.0.2 --yes 2>/dev/null
gh release delete v1.0.3 --yes 2>/dev/null

echo "📝 Atualizando package.json para 0.1.0..."
npm version 0.1.0 --no-git-tag-version --allow-same-version

echo "✅ Limpeza concluída!"
echo ""
echo "Próximos passos:"
echo "1. Execute: npm unpublish barrel-craft --force"
echo "2. Commit: git add . && git commit -m 'chore: reset to v0.1.0'"
echo "3. Push: git push origin main"
echo "4. Release: git tag v0.1.0 && git push origin v0.1.0"
```

## ⚠️ IMPORTANTE

- Você só pode despublicar do npm dentro de **72 horas** após a publicação
- Após despublicar, você precisa esperar **24 horas** para republicar o mesmo nome de pacote
- Considere se realmente precisa resetar, ou se pode simplesmente continuar com versões futuras

## Alternativa: Criar novo pacote

Se não conseguir despublicar, considere:
1. Criar um novo pacote com nome diferente (ex: `@marcioaltoe/barrel-craft`)
2. Deprecar o pacote antigo apontando para o novo
3. Começar fresh com o novo pacote