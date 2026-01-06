# eShop Inventory & Sales System

A comprehensive, enterprise-grade inventory, sales, and user management platform built with **Next.js 16**, **React 19**, **TypeScript**, and **MongoDB**. Designed for retail businesses with complex multi-tier pricing and complete role-based access control.

---

## 🎯 Main Key Features

### 🔐 **Authentication & Authorization**
- Email/Phone login with JWT tokens (7-day expiration)
- Password hashing with bcrypt
- HTTP-only secure cookies
- Role-based access control (Customer, Employee, Admin)
- Registration key system for staff signup
- Session persistence across browser sessions

### 📦 **Product Management**
- Full CRUD operations for products
- **3-Tier Pricing System:**
  - **Retail:** Single items with retail discount
  - **Wholesale:** 10+ items with wholesale discount
  - **Super Wholesale:** 50+ items with super wholesale discount
- Product metadata (barcode, UOM, MRP, model name, brand)
- Stock threshold alerts
- Product categories and search
- Multiple product images support
- Inventory value calculation

### 🛒 **Shopping & Cart**
- Shopping cart with quantity management
- Real-time stock validation
- Automatic discount application based on quantity
- Cart persistence
- Product search and filtering
- Category browsing with advanced filtering

### 💰 **Sales & Transactions**
- **Online Sales:** Through cart and checkout
- **Direct Sales:** Phone-based customer sales
- Multi-item sales in single transaction
- Payment tracking (fully paid, partially paid, pending)
- Custom discount application
- Payment history with method and date

### 📋 **24-Hour Booking System**
- Reserve products for 24 hours
- Automatic expiration after 24 hours (TTL index)
- Booking status management (pending, confirmed, completed, cancelled)
- Items quantity and pricing tracking
- Customer booking history
- Expiry time countdown

### 👥 **User Management**
- Customer registration and profiles
- Employee and admin account management
- User role assignment and modification
- Profile editing (address, shop name, contact)
- User deletion capabilities
- Customer activity tracking
- Direct sales customer tracking

### 📊 **Dashboard & Analytics**
- Real-time inventory statistics
- Sales analytics with charts (Line, Bar, Pie charts)
- Revenue trend analysis (last 7 days)
- Payment status distribution (pie chart)
- Product tier analysis
- Customer count metrics
- Due amount tracking
- Low stock alerts
- Top-selling products visualization

### 💳 **Payment Management**
- Record payments with method selection
- Partial payment support
- Full payment tracking
- Payment history per sale
- Due amount calculation
- Multiple payment methods:
  - Cash
  - Card
  - UPI
  - Bank Transfer
  - Cheque

### 🎯 **Discounts & Pricing**
- Tiered discount management
- Automatic price calculation based on quantity
- Retail, wholesale, and super wholesale pricing
- Dynamic discount application
- Discount visualization in cart
- Price thresholds for each tier

### 📱 **Customer Features**
- Trending products section (by category)
- Product browsing by category
- Order history
- Booking management
- Profile management
- My bookings view
- Discount visibility

### 👨‍💼 **Employee Features**
- Product management dashboard
- Sales processing interface
- Booking management
- User management interface
- Discount visibility
- Inventory stats
- Sales history with payment tracking

### 🛡️ **Admin Features**
- Full user management (add, edit, remove)
- User role modification
- User deletion
- Complete system oversight
- All employee features
- System configuration

### 🔍 **Search & Filtering**
- Product search by name
- Category filtering
- Price sorting (low to high, high to low)
- Stock availability filters
- Advanced search across multiple fields
- Real-time search results

### 📈 **Trending Products**
- Category-wise trending products
- Sold quantity tracking
- Revenue metrics per product
- Top performers display
- Sales velocity analysis

### 🌐 **Responsive UI**
- Mobile-first design
- Tailwind CSS v4 styling
- Responsive navigation bar
- Mobile hamburger menu
- Tablet and desktop optimization
- Smooth animations and transitions

### ⚙️ **System Features**
- Demo mode fallback (works without MongoDB)
- Database connection pooling
- Pagination for large datasets
- Error handling and validation
- Request timeout management (15s)
- CORS headers configured
- Cache control policies
- Performance optimization

### 🔄 **Data Persistence**
- MongoDB with Mongoose ODM
- Auto-timestamps (createdAt, updatedAt)
- Data relationships (userId refs, productId refs)
- TTL indexes for auto-deletion
- Lean queries for performance
- Efficient database indexing

### 🎨 **UI/UX Features**
- Loading states and spinners
- Error messages and alerts
- Success notifications
- Expandable details sections
- Color-coded status badges
- Empty state messages
- Smooth transitions and animations
- Toast notifications

### 📝 **Validation**
- Client-side form validation
- Server-side input validation
- Phone number validation (10 digits)
- Pincode validation (6 digits)
- Email format validation
- Quantity and price validation
- Stock availability checks
- Real-time error feedback

---

## 💻 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Frontend** | React 19 + TypeScript |
| **Database** | MongoDB + Mongoose |
| **Styling** | Tailwind CSS v4 |
| **Authentication** | JWT + bcrypt |
| **Charts** | Recharts |
| **QR Code** | qrcode.react |
| **Package Manager** | npm |


## 📁 Project Structure

```
eshop/
├── app/
│   ├── page.tsx                          # Landing page
│   ├── layout.tsx                        # Root layout
│   ├── globals.css                       # Global styles
│   ├── api/                              # API routes
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── register/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── me/route.ts
│   │   │   └── profile/route.ts
│   │   ├── products/route.ts
│   │   ├── sales/route.ts
│   │   ├── bookings/route.ts
│   │   ├── direct-sales/route.ts
│   │   ├── discounts/route.ts
│   │   ├── users/route.ts
│   │   └── trending/route.ts
│   ├── home/page.tsx                     # Customer home
│   ├── dashboard/page.tsx                # Employee/Admin dashboard
│   ├── products/page.tsx                 # Product management
│   ├── sales/page.tsx                    # Sales processing
│   ├── bookings/page.tsx                 # Booking management
│   ├── discounts/page.tsx                # Discount management
│   ├── category/page.tsx                 # Category browsing
│   ├── users/page.tsx                    # User management
│   ├── login/page.tsx                    # Login page
│   ├── register/page.tsx                 # Registration page
│   ├── profile/edit/page.tsx             # Edit profile
│   └── validate-name/page.tsx            # Name validation
├── components/
│   ├── Navbar.tsx                        # Navigation
│   ├── Footer.tsx                        # Footer
│   ├── CartManager.tsx                   # Shopping cart
│   ├── ProductBrowser.tsx                # Product browser
│   ├── ProductTable.tsx                  # Product table
│   ├── UserManagement.tsx                # User management
│   ├── BookingManagement.tsx             # Booking management
│   ├── SaleHistory.tsx                   # Sale history
│   ├── InventoryStats.tsx                # Inventory stats
│   ├── AddProductForm.tsx                # Add product form
│   ├── UserHeader.tsx                    # User header
│   └── withRoleAccess.tsx                # Role access HOC
├── lib/
│   ├── auth-context.tsx                  # Auth context
│   ├── db.ts                             # MongoDB connection
│   ├── api.ts                            # API helpers
│   ├── types.ts                          # TypeScript types
│   ├── products.ts                       # Default products
│   ├── userRecords.ts                    # User records
│   └── models/
│       ├── Product.ts                    # Product schema
│       ├── User.ts                       # User schema
│       ├── Sale.ts                       # Sale schema
│       ├── Booking.ts                    # Booking schema
│       └── DirectSale.ts                 # Direct sale schema
├── public/                               # Static files
├── scripts/                              # Utility scripts
├── package.json
├── tsconfig.json
├── next.config.ts
├── middleware.ts
├── .env.local                            # Environment variables
└── README.md                             # This file
```


## 📖 Usage Guide

### For Customers
1. **Register** - Create account with email/phone
2. **Browse Products** - View by category or search
3. **Add to Cart** - Select quantity and add items
4. **Checkout** - Complete purchase
5. **View Bookings** - See 24-hour reservations
6. **Track Orders** - View order history

### For Employees
1. **Login** - Use employee registration key
2. **Manage Products** - Add, edit, update inventory
3. **Process Sales** - Create sales with discounts
4. **Track Payments** - Record payments and due amounts
5. **Manage Bookings** - Update booking status
6. **View Dashboard** - Monitor analytics

### For Admins
1. **All Employee Features** - Full product/sales access
2. **Manage Users** - Add/remove/modify users
3. **System Overview** - Complete analytics dashboard
4. **User Roles** - Change user roles and permissions

---

## 🛡️ Security Features

- ✅ JWT authentication with 7-day expiration
- ✅ Bcrypt password hashing
- ✅ HTTP-only secure cookies (XSS protection)
- ✅ CORS headers configured
- ✅ Input validation (client & server)
- ✅ Role-based authorization
- ✅ Protected API endpoints
- ✅ Secure MongoDB connection

---