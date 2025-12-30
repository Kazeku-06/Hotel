# 🚨 SECURITY CLEANUP GUIDE

## File .env ter-push ke GitHub - Action Required!

### STEP 1: Revoke All Exposed Credentials

#### Google OAuth (CRITICAL):
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Pergi ke **APIs & Services** > **Credentials**
3. **DELETE** OAuth 2.0 Client ID yang ter-expose
4. **CREATE NEW** OAuth 2.0 Client ID
5. Update redirect URI: `http://localhost:3000/auth/google/callback`
6. Copy Client ID dan Client Secret yang baru

#### Database & JWT:
1. Generate secret keys baru
2. Update database password jika diperlukan

### STEP 2: Remove .env from Git History

```bash
# Remove .env files from git history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch frontend-react/.env backend-flask/.env' \
  --prune-empty --tag-name-filter cat -- --all

# Alternative using git-filter-repo (recommended if available)
git filter-repo --path frontend-react/.env --invert-paths
git filter-repo --path backend-flask/.env --invert-paths

# Force push to remove from remote
git push origin --force --all
git push origin --force --tags
```

### STEP 3: Update Local Environment

```bash
# Frontend
cd frontend-react
cp .env.example .env
# Edit .env dengan credentials BARU

# Backend  
cd backend-flask
cp .env.example .env
# Edit .env dengan credentials BARU
```

### STEP 4: Verify .gitignore is Working

```bash
# Check git status - .env should NOT appear
git status

# Test adding .env - should be ignored
echo "test" >> frontend-react/.env
git status  # Should not show .env as modified

# Restore .env
git checkout frontend-react/.env
```

### STEP 5: Generate New Secrets

#### New JWT Secret:
```python
import secrets
print(secrets.token_hex(32))
```

#### New Flask Secret:
```python
import secrets
print(secrets.token_hex(32))
```

### STEP 6: Notify Team (if applicable)

- Inform team members about credential rotation
- Ask them to pull latest changes and update their .env files
- Verify no one else has copies of old credentials

### STEP 7: Monitor for Abuse

- Check Google Cloud Console for unusual API usage
- Monitor database for unauthorized access
- Set up alerts for suspicious activity

## Prevention for Future

1. **Always check git status before commit**
2. **Use pre-commit hooks to prevent .env commits**
3. **Regular security audits**
4. **Use separate credentials for dev/staging/prod**

## Pre-commit Hook Setup

Create `.git/hooks/pre-commit`:

```bash
#!/bin/sh
# Check for .env files
if git diff --cached --name-only | grep -E "\\.env$"; then
    echo "ERROR: .env file detected in commit!"
    echo "Please remove .env files from commit"
    exit 1
fi
```

```bash
chmod +x .git/hooks/pre-commit
```