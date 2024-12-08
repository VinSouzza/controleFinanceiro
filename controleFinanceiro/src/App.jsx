import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/login"; 
import Register from "./components/register"; 
import Transactions from "./components/transactions"; 
import { getAuth } from "firebase/auth";
import { auth } from "./firebaseConfig";

const PrivateRoute = ({ element, ...rest }) => {
  const user = getAuth().currentUser;  // Verifica se há um usuário autenticado
  return user ? element : <Navigate to="/" />;  // Redireciona para login se não houver usuário
};

const App = () => {
  return (
    <Router>
      <div style={{ textAlign: "center" }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/transactions" element={<PrivateRoute element={<Transactions />} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
