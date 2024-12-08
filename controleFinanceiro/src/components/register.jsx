import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { Link } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState(""); // Nome do usuário
  const [email, setEmail] = useState(""); // Email
  const [password, setPassword] = useState(""); // Senha
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Passo 1: Criar o usuário com Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;

      // Passo 2: Adicionar o usuário ao Firestore
      await setDoc(doc(db, "users", uid), {
        nome: name,
        email: email,
      });

      alert("Cadastro realizado com sucesso!");
      // Redirecionar ou limpar o formulário, se necessário
    } catch (err) {
      console.error(err);
      setError("Erro ao cadastrar. Verifique os dados e tente novamente.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", textAlign: "center" }}>
      <h2>Cadastro</h2>
      <form onSubmit={handleRegister}>
        <div>
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", margin: "10px 0" }}
          />
        </div>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          Cadastrar
        </button>
      </form>
      <p>
        Já tem uma conta? <Link to="/">Faça login aqui</Link>.
      </p>
    </div>
  );
};

export default Register;
