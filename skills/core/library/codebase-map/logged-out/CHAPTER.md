---
type: chapter
title: Logged Out
last_updated: "2026-04-10"
---

# Logged Out

Public marketplace surfaces from `@repo/packages/marketplace/`.

<!-- Seed entries below. Run Librarian generate mode from faire/frontend to populate with real data. -->

## Home

| Name | Route | Description | File Path | Last Verified |
|------|-------|-------------|-----------|---------------|
| Marketplace Home | / | Public landing page with featured brands, categories, and sign-up prompts | @repo/packages/marketplace/src/home/MarketplaceHome.tsx | 2026-04-10 |
| Brand Directory | /brands | Browsable list of all brands on Faire with filters and search | @repo/packages/marketplace/src/home/BrandDirectory.tsx | 2026-04-10 |

## Product

| Name | Route | Description | File Path | Last Verified |
|------|-------|-------------|-----------|---------------|
| Product Detail | /product/:id | Public product page with images, description, pricing, and sign-up CTA | @repo/packages/marketplace/src/product/ProductDetail.tsx | 2026-04-10 |
| Product Preview | /product/:id/preview | Quick-view product overlay shown from search results or category pages | @repo/packages/marketplace/src/product/ProductPreview.tsx | 2026-04-10 |

## Category

| Name | Route | Description | File Path | Last Verified |
|------|-------|-------------|-----------|---------------|
| Category Page | /category/:slug | Product listing for a Faire category with filters, sorting, and pagination | @repo/packages/marketplace/src/category/CategoryPage.tsx | 2026-04-10 |
| Subcategory Page | /category/:slug/:sub | Narrowed product listing within a subcategory | @repo/packages/marketplace/src/category/SubcategoryPage.tsx | 2026-04-10 |
