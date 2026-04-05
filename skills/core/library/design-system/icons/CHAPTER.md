---
type: chapter
title: Icons
last_updated: "2026-03-31"
---

# Icons

170 SVG icon components from `@faire/slate/icons/`. Each icon is a React component accepting the shared `SVGIconProps` interface.

**Import pattern:** `import { IconName } from "@faire/slate/icons/IconName"`

## Shared Props Interface (SVGIconProps)

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| titleAccess | string | -- | No | Accessible title for the SVG. Set empty string for decorative icons |
| height | string | -- | No | SVG height |
| width | string | -- | No | SVG width |
| color | string | -- | No | SVG color (inherited from CSS) |
| className | string | -- | No | CSS class name |
| component | React.ElementType | -- | No | Root node element type |
| margin | string | -- | No | SVG margin |

Plus all standard `React.SVGProps<SVGSVGElement>` (except `ref` and `direction`).

## Icon List

### Navigation

ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ArrowUpAndRight, ArrowAllDirections, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, DoubleChevronDown, DoubleChevronLeft, DoubleChevronRight, DoubleChevronUp, Expand, Minimize, VerticalExpand, Hamburger, Sidebar, NewTab, Home, Browse

### Actions

Add, Subtract, Close, Check, CheckOutline, CheckOutlineSolid, Edit, PenTool, Duplicate, Download, Upload, TrashCan, Save, SaveSolid, Send, Share, ShareHeart, Redo, Undo, Shuffle, Sort, Split, Columns, Grid, ExpandedLayout, SingleColumn, SquareLayout, BulkSelect, Pin, Lock, Clipboard, ClipboardCheck, CopyLink, Link, BrokenLink, Printer, QRCode, Filter, Funnel, Search, InterfaceSearch, ImageSearch, ZoomIn, ZoomOut, MagicWand, Twinkle, Settings

### Status & Feedback

Caution, CautionSolid, Exclamation, ExclamationSolid, Information, Notification, NotificationBell, NotificationBellChecked, Announcement, AnnouncementMuted, CircleFilled, HappyFace, SadFace, ThumbsUp, ThumbsDown, Heart, StarFilled, StarHalf, StarOutlined

### Communication

ChatBubble, Communication, Email, Phone, MobilePhone, CustomerSupport, Video

### Commerce

CartEmpty, CartItems, ShoppingBag, SaleTag, PriceTagDollar, PriceTagEuro, PriceTagPound, Dollar, Euro, Pound, CreditCard, PaymentPlan, CurrencyConverter, Finance, Orders, Returns, Shipping, ShipmentDelivered, ShipsFrom, Truck, Warehouse, Storefront, Market, EstimatedDeliveryDate

### Content & Media

Book, File, FileMultiple, Camera, ImageLandscape, TextFormattingJustified, TextFormattingStyle, BulletList, TaskList, Paperclip, Divider, BarGraph, Graph, Calculation

### People & Accounts

Account, AddUser, Group, BusinessCard, Crown, Relationships, Commitment

### Programs & Branding

Diamond, Exclusivity, Quality, Leaf, Sprout, ResponsibleConsumption, Lightbulb, Earn, Flag, Synchronized, SynchronizedWarning, PartyPopper

### Objects

AlarmClock, Clock, ClockSolid, RewindClock, Calendar, Computer, BrowserCheck, BrowserCode, BrowserRemove, Application, Globe, Location, Bottle, Bowl, Cheese, Glass, Mug, Utensils, ArchiveBox, Block, Button

### Visibility

EyeOpen, EyeClosed

### Social

Facebook, Instagram, Linkedin, Twitter, Youtube

### Layout

HorizontalEllipsis, VerticalEllipsis
