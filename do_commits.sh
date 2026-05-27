#!/bin/bash
set -e

# 1. Auth & User
git checkout -b feature/auth-and-user main
git add courtmate-b2c-service/src/controllers/authController.ts \
        courtmate-b2c-service/src/routes/authRoutes.ts \
        courtmate-b2c-service/src/controllers/userController.ts \
        courtmate-b2c-service/src/routes/userRoutes.ts \
        courtmate-b2c-service/src/middlewares/authMiddleware.ts \
        courtmate-web/src/app/login/page.tsx
git commit -m "feat: auth and user profile"
git push origin feature/auth-and-user
git checkout main
git merge --no-ff feature/auth-and-user -m "Merge branch 'feature/auth-and-user' into main"

# 2. Admin Panel
git checkout -b feature/admin-panel main
git add courtmate-b2c-service/src/controllers/adminController.ts \
        courtmate-b2c-service/src/routes/adminRoutes.ts \
        courtmate-web/src/app/admin/layout.tsx \
        courtmate-web/src/app/admin/dashboard/page.tsx \
        courtmate-web/src/app/admin/venues/page.tsx \
        courtmate-web/src/components/admin/
git commit -m "feat: admin panel"
git push origin feature/admin-panel
git checkout main
git merge --no-ff feature/admin-panel -m "Merge branch 'feature/admin-panel' into main"

# 3. Matchmaking
git checkout -b feature/matchmaking main
git add courtmate-b2c-service/src/controllers/lobbyController.ts \
        courtmate-b2c-service/src/routes/lobbyRoutes.ts
git commit -m "feat: matchmaking system"
git push origin feature/matchmaking
git checkout main
git merge --no-ff feature/matchmaking -m "Merge branch 'feature/matchmaking' into main"

# 4. Checkout & History
git checkout -b feature/checkout-and-history main
git add courtmate-b2c-service/src/controllers/checkoutController.ts \
        courtmate-b2c-service/src/routes/checkoutRoutes.ts \
        courtmate-b2c-service/src/services/checkoutService.ts \
        courtmate-web/src/app/history/
git commit -m "feat: checkout and booking history"
git push origin feature/checkout-and-history
git checkout main
git merge --no-ff feature/checkout-and-history -m "Merge branch 'feature/checkout-and-history' into main"

# 5. Venue Search & UI
git checkout -b feature/venue-search-and-ui main
git add courtmate-b2c-service/src/repositories/venueRepository.ts \
        courtmate-web/src/app/search/page.tsx \
        courtmate-web/src/components/NavBar.tsx \
        courtmate-web/src/components/search/SearchVenueResults.tsx
git commit -m "feat: venue search and core ui updates"
git push origin feature/venue-search-and-ui
git checkout main
git merge --no-ff feature/venue-search-and-ui -m "Merge branch 'feature/venue-search-and-ui' into main"

# 6. Core Setup & Config
git checkout -b chore/core-setup main
git add -A
git commit -m "chore: core setup and configs"
git push origin chore/core-setup
git checkout main
git merge --no-ff chore/core-setup -m "Merge branch 'chore/core-setup' into main"

# Final push to main
git push origin main
