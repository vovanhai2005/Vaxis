import { Link, NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Home, Calendar, Info, User, LogOut, LogIn, UserPlus } from 'lucide-react';

const Navbar = () => {
  const { authUser, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  const linkClass = "flex items-center gap-4 p-4 rounded-lg text-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors";
  const activeLinkClass = "bg-teal-100 text-teal-700";

  return (
    <nav className="fixed left-0 top-0 h-full bg-white shadow-md py-6 px-4 w-64 flex flex-col z-50">
      {/* Logo at the top */}
      <Link to="/" className="mb-10 flex items-center gap-3 px-2">
        <div className="bg-teal-500 rounded-lg p-2 flex items-center justify-center">
          <span className="text-white font-bold text-2xl">V</span>
        </div>
        <span className="text-2xl font-bold text-gray-800">VAXIS</span>
      </Link>
      
      {/* Navigation Icons */}
      <div className="flex flex-col gap-2 flex-grow">
        {authUser ? (
          <>
            <NavLink 
              to="/" 
              className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`}
            >
              <Home className="h-6 w-6" />
              <span>Home</span>
            </NavLink>

            <NavLink
              to="/vaccination-info"
              className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`}
            >
              <Info className="h-6 w-6" />
              <span>Vaccination Info</span>
            </NavLink>

            <NavLink
              to="/booking"
              className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`}
            >
              <Calendar className="h-6 w-6" />
              <span>Booking Form</span>
            </NavLink>

            <NavLink
              to="/appointment"
              className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`}
            >
              <Calendar className="h-6 w-6" />
              <span>My Appointments</span>
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`}
            >
              <User className="h-6 w-6" />
              <span>My Profile</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink 
              to="/login" 
              className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`}
            >
              <LogIn className="h-6 w-6" />
              <span>Login</span>
            </NavLink>
            <NavLink 
              to="/signup" 
              className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`}
            >
              <UserPlus className="h-6 w-6" />
              <span>Sign Up</span>
            </NavLink>
          </>
        )}
      </div>
      
      {/* Auth at the bottom */}
      <div className="mt-auto">
        {authUser && (
          <button 
            onClick={handleLogout}
            className={`${linkClass} w-full hover:bg-red-100 hover:text-red-600`}
          >
            <LogOut className="h-6 w-6" />
            <span>Logout</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;