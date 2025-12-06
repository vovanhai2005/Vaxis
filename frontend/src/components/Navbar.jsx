import { Link, NavLink } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import {Home, Calendar, Info, User, Users, LogOut, LogIn, UserPlus, Search,
   Boxes, List, Table2, Layers, Package, Syringe } from "lucide-react";

const Navbar = () => {
  const { authUser, logout } = useAuthStore();

  const linkClass =
    "flex items-center gap-4 p-4 rounded-lg text-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors";
  const activeLinkClass = "bg-teal-100 text-teal-700";

// Define menus based on roles
  const menus = {
    citizen: [
      { to: "/", label: "Home", icon: Home },
      { to: "/vaccination-info", label: "Vaccination Info", icon: Info },
      { to: "/booking", label: "Booking Form", icon: Calendar },
      { to: "/appointment", label: "My Appointments", icon: Calendar },
      { to: "/profile", label: "My Profile", icon: User },
    ],

    employee: [
      { to: "/", label: "Home", icon: Home },
      {
        to: "/employee/upcoming-appointments",
        label: "Upcoming Appointments",
        icon: Calendar,
      },
      { to: "/lookup-citizen", label: "Lookup Citizen", icon: Search },
      { to: "/vaccine-stock", label: "Vaccine Stock", icon: Boxes },
      { to: "/profile", label: "Profile", icon: User },
    ],

     manager:[
      { to: "/", label: "Home", icon: Home },
      { to: "/staff-management", label: "Staff", icon: Users },
      { to: "/Categories-management", label: "Categories", icon: Layers },
      { to: "/", label: "Inventory", icon: Package },
      { to: "/", label: "Statistics", icon: Syringe },
    ],

  };

  // Menu rendering logic
 if (!authUser) {
  return <Navigate to="/login" replace />;
}

if (!menus[authUser.role]) {
  return <Navigate to="/403" replace />;
}

const currentMenu = menus[authUser.role];


  return (
    <nav className="fixed left-0 top-0 h-full bg-white shadow-md py-6 px-4 w-64 flex flex-col z-50">
      {/* Logo */}
      <Link to="/" className="mb-10 flex items-center gap-3 px-2">
        <div className="bg-teal-500 rounded-lg p-2 flex items-center justify-center">
          <span className="text-white font-bold text-2xl">V</span>
        </div>
        <span className="text-2xl font-bold text-gray-800">VAXIS</span>
      </Link>

      {/* MENU */}
      <div className="flex flex-col gap-2 flex-grow">
        {currentMenu.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeLinkClass : ""}`
            }
          >
            <Icon className="h-6 w-6" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>

      {/* Logout */}
      {authUser && (
        <button
          onClick={logout}
          className={`${linkClass} w-full hover:bg-red-100 hover:text-red-600 mt-auto`}
        >
          <LogOut className="h-6 w-6" />
          <span>Logout</span>
        </button>
      )}
    </nav>
  );
};

export default Navbar;
