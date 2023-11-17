import React from "react";
import "./App.css";
import Dashboard from "./components/Dashboard3";
import PrintTable from "./components/PrintTable";
import Login from "./components/Login";
import Page2 from "./components/E2";
import { Route, Routes, useLocation } from "react-router-dom";
function App() {
  return (
    <div className="App">
       {/* <PrintTable/> */}
       <Routes >
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />}/>
       </Routes>
       {/* <Page2/> */}
    </div>
  );
}

export default App;
