import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../features/authSlice";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  // Debug logging
  console.log('Layout - User state:', user);
  console.log('Layout - Loading state:', loading);

  useEffect(() => {
    // Check if user is authenticated but profile is not loaded
    if (!user && !loading) {
      console.log('Layout - Fetching profile...');
      dispatch(fetchProfile());
    } else {
      console.log('Layout - Not fetching profile:', { user: !!user, loading });
    }
  }, [dispatch, user, loading]);

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar />
      <main className="flex-1 bg-black">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
