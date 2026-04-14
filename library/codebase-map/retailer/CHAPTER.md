---
type: chapter
title: Retailer
last_updated: "2026-04-10"
---

# Retailer

Buyer portal surfaces from `@repo/packages/retailer/`.

<!-- Seed entries below. Run Librarian generate mode from faire/frontend to populate with real data. -->

## Browse

| Name | Route | Description | File Path | Last Verified |
|------|-------|-------------|-----------|---------------|
| Browse Home | /browse | Retailer's main discovery page with curated brand and product sections | @repo/packages/retailer/src/browse/BrowseHome.tsx | 2026-04-10 |
| Brand Page | /brand/:id | Public brand profile showing the brand's story, products, and contact info | @repo/packages/retailer/src/browse/BrandPage.tsx | 2026-04-10 |
| Search Results | /search | Product and brand search results with filters and sorting | @repo/packages/retailer/src/browse/SearchResults.tsx | 2026-04-10 |

## Cart

| Name | Route | Description | File Path | Last Verified |
|------|-------|-------------|-----------|---------------|
| Cart | /cart | Retailer's shopping cart with line items, quantities, and checkout prompt | @repo/packages/retailer/src/cart/Cart.tsx | 2026-04-10 |
| Cart Review | /cart/review | Final cart review with shipping details and order summary before checkout | @repo/packages/retailer/src/cart/CartReview.tsx | 2026-04-10 |

## Orders

| Name | Route | Description | File Path | Last Verified |
|------|-------|-------------|-----------|---------------|
| Order List | /orders | All past and open orders with status filters and search | @repo/packages/retailer/src/orders/OrderList.tsx | 2026-04-10 |
| Order Detail | /orders/:id | Single order detail with line items, shipment tracking, and return options | @repo/packages/retailer/src/orders/OrderDetail.tsx | 2026-04-10 |
