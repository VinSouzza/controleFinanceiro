import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { Link, useNavigate } from "react-router-dom";  // Importando o useNavigate

const Login = () => {
  const [username, setUsername] = useState(""); // Para o nome de usuário
  const [password, setPassword] = useState(""); // Para a senha
  const [error, setError] = useState("");
  const navigate = useNavigate();  // Usando o useNavigate para redirecionar

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Passo 1: Buscar o usuário pelo nome no Firestore
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("nome", "==", username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Nome de usuário não encontrado.");
        return;
      }

      // Extrair o e-mail do Firestore (assumimos que só há um documento correspondente)
      const userDoc = querySnapshot.docs[0].data();
      const userEmail = userDoc.email;

      // Passo 2: Autenticar o usuário com e-mail e senha no Firebase Auth
      await signInWithEmailAndPassword(auth, userEmail, password);

      // Redirecionar para a página de transações após o login
      navigate("/transactions");
    } catch (err) {
      console.error(err);
      setError("Erro ao fazer login. Verifique suas credenciais.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", textAlign: "center" }}>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <div>
          <input
            type="text"
            placeholder="Nome de Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", margin: "10px 0" }}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", margin: "10px 0" }}
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" style={{ padding: "10px 20px" }}>
          Login
        </button>
      </form>
      <p>
        Não tem uma conta? <Link to="/register">Cadastre-se aqui</Link>.
      </p>
    </div>
  );
};

export default Login;
