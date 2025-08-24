# 🎉 Event Management System

A comprehensive full-stack web application for managing events, vendors, and attendance with QR code payment integration.

## ✨ Features

### 🎯 **For Event Organizers:**
- **Event Creation & Management**: Create, edit, and manage events with detailed information
- **Attendance Tracking**: Real-time attendance monitoring with capacity limits
- **QR Code Payments**: Generate QR codes for easy payment processing
- **Vendor Directory**: Browse and connect with service vendors
- **Analytics Dashboard**: View statistics and recent events
- **Event Categories**: Support for Wedding, Corporate, Birthday, Conference, and more

### 🔧 **For Service Vendors:**
- **Profile Management**: Create and manage vendor profiles
- **Service Management**: Add, edit, and remove services with pricing
- **Availability Control**: Update availability status (Available/Busy/Unavailable)
- **Event Registration**: Browse and register for events
- **Rating System**: Track ratings and reviews

### 🎫 **Event Attendance Features:**
- **One-Click Registration**: Easy event registration for attendees
- **Capacity Management**: Automatic capacity checking and limits
- **Payment Integration**: QR code-based payment system
- **Attendance Lists**: View detailed attendee information
- **Real-time Updates**: Live attendance count updates

## 🚀 Tech Stack

### Frontend:
- **React.js** - User interface framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **CSS3** - Modern styling with responsive design

### Backend:
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Database:
- **In-Memory Storage** - For demo purposes (easily replaceable with MongoDB)

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd event-management-system
```

### 2. Install Backend Dependencies
```bash
cd server
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../client
npm install
```

### 4. Environment Setup
Create a `.env` file in the `server` directory:
```env
MONGODB_URI=mongodb://localhost:27017/event-management
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
NODE_ENV=development
```

### 5. Start the Application

#### Start Backend Server:
```bash
cd server
npm run dev
```
Server will run on: `http://localhost:5000`

#### Start Frontend Application:
```bash
cd client
npm start
```
Frontend will run on: `http://localhost:3000`

## 🎮 How to Use

### Creating an Event (Organizer):
1. Register/Login as an "Event Organizer"
2. Navigate to Events page
3. Click "Create New Event"
4. Fill in event details:
   - Title and Description
   - Category (Wedding, Corporate, Birthday, etc.)
   - Date & Time
   - Location
   - Capacity
   - Price
5. Click "Create Event"

### Attending an Event (Vendor/Attendee):
1. Register/Login as a "Service Vendor" or attendee
2. Go to Events page
3. Browse available events
4. Click "Attend Event" on desired event
5. Complete payment via QR code
6. Receive confirmation

### Managing Vendor Profile:
1. Login as a "Service Vendor"
2. Go to Vendors page
3. Create/Edit profile with company details
4. Add services with pricing
5. Update availability status
6. Browse and register for events

## 🔐 Authentication

The system uses JWT-based authentication with role-based access control:

- **Event Organizers**: Can create events, manage attendance, view vendor directory
- **Service Vendors**: Can manage profiles, add services, register for events

## 💳 Payment System

- **QR Code Generation**: Automatic QR code generation for each event registration
- **Payment Data**: Includes event ID, amount, timestamp, and user information
- **Mobile Payment**: Compatible with mobile payment apps

## 📊 API Endpoints

### Authentication:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Events:
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event (Organizer only)
- `GET /api/events/:id` - Get event details
- `POST /api/events/:id/attend` - Register for event
- `GET /api/events/:id/attendees` - Get event attendees

### Vendors:
- `GET /api/vendors` - Get all vendors
- `POST /api/vendors/profile` - Create/update vendor profile
- `GET /api/vendors/profile/me` - Get current vendor profile
- `POST /api/vendors/services` - Add service
- `DELETE /api/vendors/services/:id` - Remove service
- `PUT /api/vendors/availability` - Update availability

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern Interface**: Clean, intuitive design with smooth animations
- **Real-time Updates**: Live data updates without page refresh
- **Loading States**: Proper loading indicators for better UX
- **Error Handling**: User-friendly error messages
- **Success Feedback**: Confirmation messages for actions

## 🔧 Customization

### Adding New Event Categories:
1. Update the category options in `client/src/pages/Events.js`
2. Add corresponding CSS styles in `client/src/pages/Events.css`

### Modifying Payment System:
1. Update QR code generation in `client/src/pages/Events.js`
2. Integrate with your preferred payment gateway

### Database Integration:
1. Replace in-memory storage with MongoDB/PostgreSQL
2. Update server models and database connections

## 🚀 Deployment

### Backend Deployment:
1. Set up environment variables
2. Deploy to Heroku, Vercel, or AWS
3. Configure CORS for your domain

### Frontend Deployment:
1. Build the application: `npm run build`
2. Deploy to Netlify, Vercel, or AWS S3
3. Update API endpoints to production URLs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

## 🎯 Future Enhancements

- **Real-time Chat**: Communication between organizers and vendors
- **Advanced Analytics**: Detailed event performance metrics
- **Email Notifications**: Automated email reminders and updates
- **Mobile App**: Native mobile application
- **Multi-language Support**: Internationalization
- **Advanced Payment**: Stripe/PayPal integration
- **File Upload**: Event images and documents
- **Calendar Integration**: Google Calendar, Outlook sync

---

**Built with ❤️ using React, Node.js, and Express**
