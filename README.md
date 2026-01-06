# Vaxis - Vaccination Management System

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

A comprehensive web-based vaccination management system that streamlines the entire vaccination process from appointment booking to certificate generation. Built with modern web technologies to provide an efficient and user-friendly experience for citizens, healthcare employees, and administrators.

## 🌟 Features

### For Citizens
- **User Registration & Profile Management**: Complete registration with profile completion workflow
- **Appointment Booking**: Easy-to-use interface for scheduling vaccination appointments
- **Vaccination Records**: View complete vaccination history and download digital certificates
- **Real-time Notifications**: Stay updated with appointment status and reminders
- **AI Chatbot**: Get instant answers to vaccination-related questions
- **Email Search**: Lookup profiles using email or National ID

### For Employees
- **Citizen Lookup**: Search for citizen profiles by National ID or email
- **Appointment Management**: View and manage upcoming vaccination appointments
- **Vaccine Stock Management**: Monitor and manage vaccine inventory
- **Administration Records**: Record vaccination details including dose number, temperature, blood pressure, and adverse events

### For Managers
- **Dashboard Analytics**: Comprehensive vaccination statistics and trends
- **Staff Management**: Manage employee accounts and roles
- **Vaccine Categories**: Manage vaccine types and manufacturers
- **Vaccine Lot Management**: Track vaccine batches, expiration dates, and quantities
- **Announcements**: Broadcast important updates to users
- **Reports**: Generate detailed vaccination and inventory reports

## 🛠️ Tech Stack

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **html2canvas & jsPDF** - Certificate generation

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **PostgreSQL** - Database
- **Redis** - Caching layer
- **Socket.io** - WebSocket server
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - Image storage
- **Google Gemini AI** - AI chatbot integration

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)
- Redis (v6 or higher)
- npm or yarn

## 🚀 Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/vaxis.git
cd vaxis
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
REDIS_URL=your_redis_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GEMINI_API_KEY=your_google_gemini_api_key
NODE_ENV=development
```

### 3. Database Setup

Run the database migrations and seed data (if available):
```bash
# Add your database setup commands here
```

### 4. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000
```

## 🏃‍♂️ Running the Application

### Start Backend Server
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:5000`

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:5173`

### Start Redis (if not running as a service)
```bash
redis-server
```

## 📁 Project Structure

```
vaxis/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and Redis configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Authentication and other middleware
│   │   ├── lib/             # Utility functions (cache, cloudinary, socket, etc.)
│   │   └── server.js        # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   │   ├── Citizen/    # Citizen role pages
│   │   │   ├── Employee/   # Employee role pages
│   │   │   └── Manager/    # Manager role pages
│   │   ├── store/           # Zustand state management
│   │   ├── lib/             # Utilities (axios, socket)
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   └── package.json
│
└── README.md
```

## 🔐 User Roles

### Citizen
- Default role for new registrations
- Must complete profile with full name, National ID, date of birth, and phone number
- Can book appointments and view vaccination records
- Email cannot be changed after registration

### Employee
- Healthcare workers who administer vaccines
- Can lookup citizens and manage appointments
- Record vaccination details and generate bills

### Manager
- Full administrative access
- Manage staff, vaccines, and system-wide settings
- Access to analytics and reports

## 🔑 Key Features Implementation

### Profile Completion Workflow
New citizens are redirected to complete their profile before accessing the system. Required fields include:
- Full Name
- National ID
- Date of Birth
- Phone Number

### Email Search
Employees can search for citizens using either National ID or email address for flexible lookup.

### Vaccination Certificates
Citizens can download PDF certificates of their completed vaccinations, including:
- Personal information
- Vaccine details
- Administration date and location
- QR code (if implemented)

### Real-time Notifications
Socket.io integration provides real-time notifications for:
- Appointment confirmations
- Vaccination completion
- System announcements

### Caching Strategy
Redis caching improves performance for:
- User profiles (5-minute TTL)
- Frequently accessed data
- Cache invalidation on data updates

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📦 Building for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
# The build artifacts will be in the dist/ directory
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape this project
- Healthcare workers who provided insights into vaccination workflows
- Open-source community for the amazing tools and libraries
