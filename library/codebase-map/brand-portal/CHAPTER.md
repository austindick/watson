---
type: chapter
title: Brand Portal
last_updated: "2026-04-10"
---

# Brand Portal

Seller dashboard surfaces from `@repo/packages/brand-portal/brand-portal/src/maker/`.

<!-- Seed entries below. Run Librarian generate mode from faire/frontend to populate with real data. -->

## My Shop

| Name | Route | Description | File Path | Last Verified |
|------|-------|-------------|-----------|---------------|
| Shop Overview | /maker/shop | Seller's shop home page with summary stats and recent activity | @repo/packages/brand-portal/brand-portal/src/maker/my-shop/ShopOverview.tsx | 2026-04-10 |
| Shop Settings | /maker/shop/settings | Edit shop profile, policies, shipping options, and preferences | @repo/packages/brand-portal/brand-portal/src/maker/my-shop/ShopSettings.tsx | 2026-04-10 |
| Shop Preview | /maker/shop/preview | Preview the public-facing shop page as a retailer would see it | @repo/packages/brand-portal/brand-portal/src/maker/my-shop/ShopPreview.tsx | 2026-04-10 |

## Orders

| Name | Route | Description | File Path | Last Verified |
|------|-------|-------------|-----------|---------------|
| Order List | /maker/orders | All orders with filters, sorting, and bulk action controls | @repo/packages/brand-portal/brand-portal/src/maker/orders/OrderList.tsx | 2026-04-10 |
| Order Detail | /maker/orders/:id | Single order detail with line items, fulfillment status, and actions | @repo/packages/brand-portal/brand-portal/src/maker/orders/OrderDetail.tsx | 2026-04-10 |

## Catalog

| Name | Route | Description | File Path | Last Verified |
|------|-------|-------------|-----------|---------------|
| Product List | /maker/products | Full product catalog with inventory status and publish controls | @repo/packages/brand-portal/brand-portal/src/maker/catalog/ProductList.tsx | 2026-04-10 |
| Product Detail | /maker/products/:id | Edit a product's title, description, images, pricing, and variants | @repo/packages/brand-portal/brand-portal/src/maker/catalog/ProductDetail.tsx | 2026-04-10 |
| New Product | /maker/products/new | Create a new product and add it to the catalog | @repo/packages/brand-portal/brand-portal/src/maker/catalog/NewProduct.tsx | 2026-04-10 |
