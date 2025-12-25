# Jain Sales Corporation - Complete Inventory Management System

A modern, fully functional Jain Sales Corporation dashboard with **complete user authentication** built with Next.js, React, TypeScript, MongoDB, and bcrypt. This application allows users to register, login, manage product inventory, track prices, and record sales with a secure, intuitive interface backed by MongoDB.

## 🆕 NEW: Complete Authentication System

Users can now **register**, **login**, and access a **protected dashboard** with secure session management. All passwords are hashed with bcrypt, and sessions persist for 7 days using JWT tokens in HTTP-only cookies.

## Features

- **📊 Dashboard Overview**: Real-time statistics showing total products, total quantity, inventory value, and low stock items
- **📦 Product Inventory Management**: View and manage all products with their quantity and pricing
- **➕ Add New Products**: Easily add new products with name, price, quantity, and custom emoji icons
- **🛒 Process Sales**: Sell products and automatically reduce inventory quantities
- **📝 Sales History**: Track all sales transactions with timestamps and amounts
- **💾 MongoDB Persistence**: All data is securely stored in MongoDB Atlas
- **🔄 Reset Function**: Option to reset all data to initial state
- **⚡ Real-time Sync**: Changes are immediately saved to the database

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose ODM
- **State Management**: React Hooks (useState, useCallback, useEffect)
- **API**: RESTful API with Next.js API routes
- **Authentication**: Environment-based connection string

## Prerequisites

- Node.js 18+
- npm (or yarn/pnpm/bun)
- MongoDB Atlas account (or local MongoDB instance)
- Valid MongoDB connection string

## Getting Started

### 1. Environment Setup

Create a `.env.local` file in the project root with your MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/?appName=your_app
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Important**: 
- Replace `<db_password>` with your actual MongoDB password in the connection string
- Never commit `.env.local` to version control
- The `MONGODB_URI` should be your complete MongoDB Atlas connection string

### 2. Installation

```bash
# Navigate to project directory
cd e:\project\eshop

# Install dependencies
npm install

# Run development server
npm run dev
```

### 3. Access the Dashboard

Open your browser and navigate to:
```
http://localhost:3000
```

## Database Schema

### Product Collection

```javascript
{
  _id: ObjectId,
  name: String (required),
  price: Number (required, min: 0),
  quantity: Number (required, min: 0),
  image: String (default: '📦'),
  createdAt: Date,
  updatedAt: Date
}
```

### Sale Collection

```javascript
{
  _id: ObjectId,
  productId: ObjectId (ref: Product),
  productName: String,
  quantity: Number (required, min: 1),
  totalAmount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Authentication System

Your application now includes a complete, secure authentication system:

### Features
- ✅ User registration with email validation
- ✅ Secure login with bcrypt password hashing
- ✅ JWT token authentication (7-day expiration)
- ✅ HTTP-only secure cookies (XSS protection)
- ✅ Protected dashboard (requires login)
- ✅ Session persistence across browser sessions

### Quick Start
1. Run `npm run dev`
2. Visit `http://localhost:3000` → redirects to login
3. Register a new account or login with demo@example.com / demo123
4. Access the protected dashboard

### Environment Variables (Authentication)
```env
JWT_SECRET=your-secret-key-change-in-production
```

### API Endpoints

#### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `GET /api/products/[id]` - Get product by ID
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product
- `DELETE /api/products` - Delete all products

#### Sales
- `GET /api/sales` - Get recent sales (last 10)
- `POST /api/sales` - Record a new sale
- `DELETE /api/sales` - Delete all sales

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Using Authentication in Components

```typescript
import { useAuth } from '@/lib/auth-context';

export default function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) return <p>Please login</p>;

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Usage Guide

### Adding Products
1. Click the "+ Add New Product" button
2. Fill in the product details:
   - Product name
   - Price (in dollars)
   - Initial quantity
   - Optional emoji icon
3. Click "Add Product"

### Processing Sales
1. Find the product in the inventory table
2. Click the "Sell" button
3. Enter the quantity to sell
4. Click "Confirm Sale"
5. The quantity updates immediately and sale is recorded

### Viewing Statistics
The dashboard displays:
- **Total Products**: Number of unique products
- **Total Quantity**: Sum of all product quantities
- **Inventory Value**: Total dollar value of all inventory
- **Low Stock Items**: Products with quantity < 10

### Viewing Sales History
The "Recent Sales" section shows the 10 most recent sales with:
- Product name
- Quantity sold
- Total sale amount
- Transaction timestamp

### Resetting Data
Click the "Reset All" button in the header to:
- Delete all custom products
- Clear all sales records
- Reinitialize with default products
- This action cannot be undone

## Project Structure

```
eshop/
├── app/
│   ├── page.tsx                          # Main dashboard
│   ├── layout.tsx                        # Root layout
│   └── api/
│       ├── products/
│       │   ├── route.ts                  # Products CRUD
│       │   └── [id]/route.ts            # Single product operations
│       └── sales/
│           └── route.ts                  # Sales CRUD
├── components/
│   ├── ProductTable.tsx                  # Inventory table
│   ├── InventoryStats.tsx               # Statistics dashboard
│   ├── AddProductForm.tsx                # Add product form
│   └── SaleHistory.tsx                   # Sales display
├── lib/
│   ├── db.ts                             # MongoDB connection
│   ├── types.ts                          # TypeScript interfaces
│   ├── products.ts                       # Default products
│   ├── api.ts                            # API helper functions
│   └── models/
│       ├── Product.ts                    # Product schema
│       └── Sale.ts                       # Sale schema
├── public/                               # Static files
├── .env.local                            # Environment variables
├── .gitignore                            # Git ignore rules
├── package.json                          # Dependencies
└── README.md                             # This file
```

## Available Scripts

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Type check
npm run type-check
```

## Environment Variables

### Required
- `MONGODB_URI`: MongoDB connection string with credentials

### Optional
- `NEXT_PUBLIC_API_URL`: API base URL (default: http://localhost:3000)

## Error Handling

The application includes comprehensive error handling:
- Database connection failures show in the UI
- Failed API requests display error messages
- All data validations happen server-side
- Network errors are gracefully handled

## Security Considerations

- **MongoDB Credentials**: Stored securely in `.env.local` (never committed to git)
- **API Routes**: All database operations go through secure API endpoints
- **Input Validation**: Server-side validation for all inputs
- **CORS**: Can be configured in API routes if needed
- **Environment Variables**: Sensitive data separated from code

## Troubleshooting

### MongoDB Connection Issues
- Verify the connection string in `.env.local`
- Check MongoDB Atlas network whitelist includes your IP
- Ensure password doesn't contain special characters (or URL encode them)
- Try connecting to MongoDB Atlas from MongoDB Compass first

### Data Not Appearing
- Check browser console for error messages
- Verify MongoDB connection string is correct
- Check that collections exist in MongoDB Atlas
- Restart the development server

### API Errors
- Check that all required fields are provided
- Verify MongoDB document has proper structure
- Check server console for detailed error messages
- Ensure Mongoose connection is established

### Port Already in Use
```bash
# Windows - Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## Customization

### Changing Low Stock Threshold
Edit `lib/InventoryStats.tsx` and `components/ProductTable.tsx`:
```typescript
products.filter((p) => p.quantity < 10)  // Change 10 to desired threshold
```

### Adding New Product Fields
1. Update Product schema in `lib/models/Product.ts`
2. Update API route in `app/api/products/route.ts`
3. Update TypeScript interface in `lib/types.ts`
4. Update components to display new fields

### Customizing Styling
- Modify Tailwind classes directly in component files
- Update color scheme in `tailwind.config.ts`
- Add custom CSS in `app/globals.css`

## Performance Optimization

- Products are fetched on initial load
- Sales are fetched on initial load (limited to 10)
- Individual updates trigger targeted API calls
- Consider adding pagination for large datasets
- Consider adding search/filter functionality

## Future Enhancements

- Product editing capability
- Advanced filtering and search
- Export data as CSV/PDF
- User authentication
- Multi-warehouse support
- Analytics and reports
- Product categories
- Automatic low stock alerts
- Batch operations

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Create Vercel account and connect GitHub
3. Add environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `NEXT_PUBLIC_API_URL`
4. Deploy automatically on push

### Self-hosted Deployment

1. Build the project: `npm run build`
2. Start production server: `npm run start`
3. Set environment variables on your server
4. Configure reverse proxy (Nginx/Apache) if needed

## License

This project is open source and available for personal and commercial use.

## Support

For issues or questions:
- Check MongoDB Atlas documentation
- Review Next.js API documentation
- Check Mongoose documentation
- Review error messages in browser console and server logs
