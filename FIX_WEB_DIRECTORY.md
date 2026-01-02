# Fix: web still showing as file in git

## Current Issue
Even though you committed, `web` is still tracked as a file instead of a directory. The commit needs to be fixed.

## Solution

Run these commands:

```bash
cd /Users/davidv.onquit/2026Codes/videoeditor

# Step 1: Make sure web/.git is removed (if it exists)
rm -rf web/.git

# Step 2: Remove web from git tracking
git rm --cached web

# Step 3: Add web/ directory properly (with all its contents)
git add web/

# Step 4: Verify it's now a directory
git status
# Should show: web/package.json, web/src/, etc. (not just "web")

# Step 5: Amend the previous commit to fix it
git commit --amend -m "Initial commit: Correct repository structure with web/ subdirectory"

# Step 6: Update remote URL (replace YOUR_USERNAME with your actual GitHub username)
git remote set-url origin https://github.com/YOUR_USERNAME/videoeditor.git

# Step 7: Force push to fix GitHub
git push -f origin main
```

## Quick Fix (Copy-Paste)

```bash
cd /Users/davidv.onquit/2026Codes/videoeditor
rm -rf web/.git
git rm --cached web
git add web/
git status  # Verify web/ shows files inside
git commit --amend -m "Initial commit: Correct repository structure"
git remote set-url origin https://github.com/YOUR_USERNAME/videoeditor.git
git push -f origin main
```

## Verify After

After running, check:
```bash
git ls-files | grep "^web/"
```

Should show files like:
- `web/package.json`
- `web/src/app/page.tsx`
- etc.

NOT just:
- `web` (single file)

