import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../features/authSlice";
import {
  MessageCircleQuestion,
  Activity,
  Search,
  Home,
  LogOut,
  LogIn,
} from "lucide-react";
import { toast } from 'react-hot-toast'
const baseLink =
  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-neutral-900 border border-transparent";
const activeLink = "bg-neutral-950 text-white border-neutral-800";

const DocIcon = () => (
  <svg
    className="w-5 h-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
    <path d="M14 3v6h6" />
  </svg>
);



const Sidebar = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

 
  
  const navigate = useNavigate()
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully")
      navigate('/login')
    } catch (_) {}
  };

  return (
    <aside className="w-60 bg-black h-[100vh] text-gray-200 p-4 border-r border-neutral-900 sticky top-0 flex flex-col">
      <div>
        <div className="text-lg font-semibold mb-4">Knowledge Hub</div>
        <nav className="flex flex-col gap-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : ""}`
            }
          >
            <Home />
            <span>Home</span>
          </NavLink>
          <NavLink
            to="/create"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : ""}`
            }
          >
            <DocIcon />
            <span>Create Document</span>
          </NavLink>
          <NavLink
            to="/semantic-search"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : ""}`
            }
          >
            <Search />
            <span>Semantic Search</span>
          </NavLink>
          <NavLink
            to="/activities"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : ""}`
            }
          >
            <Activity />
            <span>Activity Log</span>
          </NavLink>
          <NavLink
            to="/answer"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : ""}`
            }
          >
            <MessageCircleQuestion />
            <span>Team Q&A</span>
          </NavLink>
        </nav>
      </div>
      <div className="mt-auto pt-4">
        <div className="rounded-xl border border-neutral-900 bg-neutral-950 p-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-neutral-900 flex items-center justify-center text-sm">
              {(user?.name || "U")?.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">
                {user?.name || "Guest"}
              </div>
              <div className="text-xs text-neutral-400 truncate">
                {user?.email || "Not signed in"}
              </div>
            </div>
            {user ? (
              <button
                onClick={handleLogout}
                title="Logout"
                className="ml-auto inline-flex items-center justify-center h-8 w-8 rounded-md bg-neutral-900 border border-neutral-800 hover:border-neutral-700"
              >
                <LogOut />
              </button>
            ) : (
              <Link
                to="/login"
                title="Login"
                className="ml-auto inline-flex items-center gap-2 h-8 px-3 rounded-md bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs"
              >
                <LogIn />
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
