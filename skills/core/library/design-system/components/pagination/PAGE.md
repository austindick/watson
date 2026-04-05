---
type: page
title: Pagination Component
last_updated: "2026-03-31"
---

# Pagination Component

Pagination helps users see how many pages of content exist and jump to deeper pages.

**Import:** `import { Pagination } from "@faire/slate/components/pagination"`

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| currentPage | number | -- | Yes | Current active page (1-indexed, web) |
| totalPages | number | -- | Yes | Total number of pages (web) |
| pageAmount | number | 5 | No | Number of page buttons to show including ellipsis. Minimum 5 |
| getPageUrl | (page: number) => string | -- | No | URL generator for each page. If not provided, pages render as buttons (web) |
| onClick | (page: number) => void | -- | No | Page click callback (web) |
