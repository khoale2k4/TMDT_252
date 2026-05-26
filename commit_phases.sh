#!/bin/bash

# Phase 1: Foundation & Core Usecases (1, 2, 3, 4, 5, 6)
git add courtmate-b2b-service/src/main/java/vn/sportscourt/courtmate/b2b/controller/PricingRulesController.java \
        courtmate-b2b-service/src/main/java/vn/sportscourt/courtmate/b2b/entity/Venue.java \
        courtmate-b2b-service/src/main/java/vn/sportscourt/courtmate/b2b/service/impl/BookingServiceImpl.java \
        courtmate-b2b-service/src/main/java/vn/sportscourt/courtmate/b2b/controller/EventController.java \
        courtmate-b2b-service/src/main/java/vn/sportscourt/courtmate/b2b/service/SseService.java \
        courtmate-b2b-service/src/main/java/vn/sportscourt/courtmate/b2b/service/impl/SseServiceImpl.java \
        courtmate-b2c-service/src/controllers/venueController.ts \
        courtmate-b2c-service/src/repositories/venueRepository.ts \
        courtmate-b2c-service/src/services/venueService.ts \
        courtmate-web/src/app/admin/calendar/page.tsx \
        courtmate-web/src/app/admin/dashboard/page.tsx \
        courtmate-web/src/app/admin/invoices/page.tsx \
        courtmate-web/src/app/checkout/page.tsx \
        courtmate-web/src/app/search/page.tsx \
        courtmate-web/src/components/search/SearchMapBackground.tsx \
        courtmate-web/src/hooks/useAdminSSE.ts \
        courtmate-web/src/services/apiEndpoints.ts \
        .gitignore docker-compose.yml init_db.sql nginx.conf \
        courtmate-b2b-service/Dockerfile courtmate-b2c-service/Dockerfile courtmate-web/Dockerfile

git commit -m "feat(phase-1): core workflows (Dashboard, Calendar, Search, Payment, AI Pricing)"

# Phase 2: Player Activity Tracker (Luồng 7)
git add courtmate-b2c-service/src/controllers/userController.ts \
        courtmate-b2c-service/src/routes/userRoutes.ts \
        courtmate-b2c-service/prisma/schema.prisma \
        courtmate-web/src/app/profile/ \
        courtmate-web/package.json courtmate-web/package-lock.json

git commit -m "feat(phase-2): player activity tracker and profile stats"

# Phase 3: Matchmaking System (Luồng 8)
git add courtmate-b2c-service/src/controllers/lobbyController.ts \
        courtmate-b2c-service/src/routes/lobbyRoutes.ts \
        courtmate-b2c-service/src/routes/index.ts \
        courtmate-web/src/app/matchmaking/

git commit -m "feat(phase-3): matchmaking system with split pricing"

# Phase 4: Recurring Booking (Luồng 9)
git add courtmate-b2c-service/src/controllers/checkoutController.ts \
        courtmate-b2c-service/src/routes/checkoutRoutes.ts \
        courtmate-b2c-service/src/services/checkoutService.ts \
        courtmate-web/src/app/recurring-booking/

git commit -m "feat(phase-4): recurring bulk booking conflict resolution"

# Phase 5: Non-functional & Testing
git add courtmate-b2c-service/load_test.js \
        courtmate-b2c-service/src/config/apiClient.ts \
        courtmate-b2c-service/package.json courtmate-b2c-service/package-lock.json \
        courtmate-b2b-service/pom.xml \
        courtmate-b2b-service/src/main/resources/application.yml \
        courtmate-b2b-service/src/main/java/vn/sportscourt/courtmate/b2b/service/MisaService.java \
        courtmate-b2b-service/src/main/java/vn/sportscourt/courtmate/b2b/service/impl/PaymentServiceImpl.java

git commit -m "chore(phase-5): resilience4j circuit breaker, axios-retry, and k6 load tests"

# Add any remaining files
git add -A
git commit -m "chore: cleanup and untracked files"

