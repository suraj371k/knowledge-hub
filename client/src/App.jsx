import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateDocument from "./pages/CreateDocument";
import Layout from "./components/Layout";
import SemanticSearch from "./pages/SemanticSearch";
import ActivityLog from "./pages/ActivityLog";
import QuestionAnswerBox from "./pages/Team";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/create" element={<CreateDocument />} />
          <Route path="/semantic-search" element={<SemanticSearch />} />
          <Route path="/activities" element={<ActivityLog />} />
          <Route path="/answer" element={<QuestionAnswerBox />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
};

export default App;
