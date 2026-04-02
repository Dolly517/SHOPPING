# ShopWave System Design Images

This file contains ready-to-render Mermaid diagrams for project documentation and report submission.

## 1. System Architecture Diagram

```mermaid
flowchart LR
  U[User Browser] --> FE[Frontend - React Vite]
  A[Admin Browser] --> FE
  FE --> API[Backend API - Express]

  API --> AUTH[Auth Module]
  API --> PROD[Product Module]
  API --> CART[Cart Module]
  API --> ORD[Order Module]
  API --> CUST[Customization Module]
  API --> STK[Sticker Module]
  API --> ADM[Admin Module]

  AUTH --> DB[(PostgreSQL/SQLite)]
  PROD --> DB
  CART --> DB
  ORD --> DB
  CUST --> DB
  STK --> DB
  ADM --> DB

  API --> STRIPE[Stripe API]
  API --> UP[/uploads static files/]
```

## 2. Customization Data Flow Diagram

```mermaid
flowchart TD
  U[User opens customizable product] --> FE[CustomizerPage]
  FE --> GP[/GET custom products config/]
  GP --> API[Customization Controller]
  API --> DB[(DB)]
  DB --> API
  API --> FE

  U --> EDIT[Add text/sticker/image on canvas]
  EDIT --> PREV[Generate preview image]
  PREV --> SAVE[/POST custom save/]
  SAVE --> API2[SaveDesign API]
  API2 --> DB

  U --> LOAD[Open My Saved Designs]
  LOAD --> LIST[/GET custom my-designs/]
  LIST --> API3[Design List API]
  API3 --> DB
  DB --> API3
  API3 --> FE

  U --> CART[Add customized item to cart]
  CART --> CAPI[/POST cart with customization payload/]
  CAPI --> DB
```

## 3. ER Diagram

```mermaid
erDiagram
  USERS ||--o{ ORDERS : places
  USERS ||--|| CARTS : owns
  USERS ||--o{ REVIEWS : writes
  USERS ||--o{ WISHLISTS : has
  USERS ||--o{ SAVED_DESIGNS : creates
  USERS ||--o{ STICKERS : uploads

  PRODUCTS ||--o{ REVIEWS : receives
  PRODUCTS ||--o{ WISHLISTS : appears_in
  PRODUCTS ||--o{ CART_ITEMS : appears_in
  PRODUCTS ||--o{ ORDER_ITEMS : appears_in
  PRODUCTS ||--o{ SAVED_DESIGNS : base_for
  PRODUCTS ||--|| CUSTOM_PRODUCTS : configurable_as

  CARTS ||--o{ CART_ITEMS : contains
  ORDERS ||--o{ ORDER_ITEMS : contains

  USERS {
    int id PK
    string name
    string email
    string role
  }
  PRODUCTS {
    int id PK
    string name
    decimal price
    boolean isCustomizable
    text customImages
  }
  CUSTOM_PRODUCTS {
    int id PK
    int baseProductId FK
    boolean supportsText
    boolean supportsImageUpload
    int maxImages
  }
  SAVED_DESIGNS {
    int id PK
    int userId FK
    int productId FK
    json designData
    string previewImage
  }
  STICKERS {
    int id PK
    string name
    string imageUrl
    string category
    int uploadedBy FK
  }
  CARTS {
    int id PK
    int userId FK
  }
  CART_ITEMS {
    int id PK
    int cartId FK
    int productId FK
    int quantity
    json customization
  }
  ORDERS {
    int id PK
    int userId FK
    decimal totalPrice
    string status
  }
  ORDER_ITEMS {
    int id PK
    int orderId FK
    int productId FK
    int quantity
    decimal price
    json customization
  }
  REVIEWS {
    int id PK
    int userId FK
    int productId FK
    int rating
  }
  WISHLISTS {
    int id PK
    int userId FK
    int productId FK
  }
```

## 4. How to Export as Images

1. Open this file in VS Code Markdown Preview.
2. Use Mermaid preview/export extension if installed.
3. Export each diagram as PNG/SVG for your report.
