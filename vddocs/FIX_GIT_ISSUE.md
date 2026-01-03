# Fix Git Issue: web showing as file instead of directory

## The Problem
Git is showing `web` as a file instead of a directory. This usually happens when:
- `web` has its own `.git` directory (making it a submodule)
- Git is confused about the structure

## Solution

Run these commands **in your terminal** (not through me, since git writes are blocked):

```bash
cd /Users/davidv.onquit/2026Codes/videoeditor

# Step 1: Check if web has its own git repo
ls -la web/.git 2>/dev/null && echo "web has git repo" || echo "web has no git repo"

# Step 2A: If web has its own .git directory, remove it
# (This will make web a regular directory, not a submodule)
rm -rf web/.git

# Step 2B: If web/.gitignore exists, we might want to keep it
# (It's fine to remove .git, but keep .gitignore if it exists)

# Step 3: Unstage the incorrectly staged 'web' file
git reset HEAD web

# Step 4: Stage everything correctly (including web/ contents)
git add .

# Step 5: Check status - should now show web/ as directory with files inside
git status

# Step 6: Commit
git commit -m "Initial commit: Correct repository structure with web/ subdirectory"

# Step 7: Add remote (replace with your GitHub URL)
git remote add origin https://github.com/YOUR_USERNAME/videoeditor.git

# Step 8: Force push to fix GitHub structure
git push -f origin main
```

## Quick Fix (Copy-Paste Ready)

```bash
cd /Users/davidv.onquit/2026Codes/videoeditor
rm -rf web/.git 2>/dev/null
git reset HEAD web
git add .
git status  # Verify web/ shows as directory
git commit -m "Initial commit: Correct repository structure"
git remote add origin https://github.com/YOUR_USERNAME/videoeditor.git
git push -f origin main
```

## After Running

1. Verify `git status` shows `web/` as a directory with files inside (not as a single file)
2. The commit should include all files from `web/` properly nested
3. GitHub will have the correct structure after force push

## If web/.git doesn't exist

If `web` doesn't have its own `.git`, the issue might be different. Try:

```bash
cd /Users/davidv.onquit/2026Codes/videoeditor
git reset HEAD web
git add web/
git status  # Should now show web/ contents
```

