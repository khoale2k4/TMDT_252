#!/bin/bash
set -e

# Store commit hashes
COMMIT_ADMIN_DASH="ce12dac"
COMMIT_REPORT="a461367"
COMMIT_PHASE1="398b379"
COMMIT_PHASE2="fc59c14"
COMMIT_PHASE3="cf6d808"
COMMIT_PHASE4="f766683"
COMMIT_PHASE5="4e2a9c4"
COMMIT_CHORE="e8e2004"
COMMIT_NGINX="7f11386"

# 1. Reset main
git checkout main
git reset --hard 2b24e0b60c13b4a6a0009e851a37597144d6a3c3
git push origin main --force

# 2. Phase 1
git checkout -b feature/phase-1-core main
git cherry-pick $COMMIT_ADMIN_DASH
git cherry-pick $COMMIT_REPORT
git cherry-pick $COMMIT_PHASE1
git push origin feature/phase-1-core -f
git checkout main
git merge --no-ff feature/phase-1-core -m "Merge pull request #1 from feature/phase-1-core"

# 3. Phase 2
git checkout -b feature/phase-2-activity main
git cherry-pick $COMMIT_PHASE2
git push origin feature/phase-2-activity -f
git checkout main
git merge --no-ff feature/phase-2-activity -m "Merge pull request #2 from feature/phase-2-activity"

# 4. Phase 3
git checkout -b feature/phase-3-matchmaking main
git cherry-pick $COMMIT_PHASE3
git push origin feature/phase-3-matchmaking -f
git checkout main
git merge --no-ff feature/phase-3-matchmaking -m "Merge pull request #3 from feature/phase-3-matchmaking"

# 5. Phase 4
git checkout -b feature/phase-4-recurring main
git cherry-pick $COMMIT_PHASE4
git push origin feature/phase-4-recurring -f
git checkout main
git merge --no-ff feature/phase-4-recurring -m "Merge pull request #4 from feature/phase-4-recurring"

# 6. Phase 5 (Non-functional)
git checkout -b chore/phase-5-testing main
git cherry-pick $COMMIT_PHASE5
git cherry-pick $COMMIT_CHORE
git cherry-pick $COMMIT_NGINX
git push origin chore/phase-5-testing -f
git checkout main
git merge --no-ff chore/phase-5-testing -m "Merge pull request #5 from chore/phase-5-testing"

# 7. Push final main
git push origin main
