import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showIcon, setShowIcon] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("nome", "==", username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Nome de usuário não encontrado.");
        return;
      }

      const userDoc = querySnapshot.docs[0].data();
      const userEmail = userDoc.email;

      await signInWithEmailAndPassword(auth, userEmail, password);

      navigate("/transactions");
    } catch (err) {
      console.error(err);
      setError("Erro ao fazer login. Verifique suas credenciais.");
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setShowIcon(value.length > 0); 
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
        <div style={{ position: "relative" }}>
          <input
            type={passwordVisible ? "text" : "password"}
            placeholder="Senha"
            value={password}
            onChange={handleInputChange}
            required
            style={{
              width: "100%",
              padding: "8px",
              margin: "10px 0",
              paddingRight: "30px",
            }}
          />
          {showIcon && (
            <FontAwesomeIcon
              icon={passwordVisible ? faEyeSlash : faEye}
              size="lg"
              onClick={togglePasswordVisibility}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#555",
              }}
            />
          )}
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
