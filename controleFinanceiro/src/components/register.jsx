import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { Snackbar } from "@mui/material";
import MuiAlert from "@mui/material/Alert";

const Register = () => {
  const [name, setName] = useState(""); // Nome do usuário
  const [email, setEmail] = useState(""); // Email
  const [password, setPassword] = useState(""); // Senha
  const [showIcon, setShowIcon] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setOpen(true); // Exibe o Snackbar

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
      setOpen(true); // Exibe o Snackbar em caso de erro
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setShowIcon(value.length > 0);
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", textAlign: "center", position: "relative" }}>
      {/* Exibindo a Snackbar logo acima do título */}
      {error && (
        <Snackbar
          open={open}
          autoHideDuration={2000}
          onClose={handleClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }} // Posição no topo
          sx={{
            position: "absolute",
            top: "70px", // Ajuste a posição para ficar logo acima do título
            width: "100%",
            marginTop: "10px", // Espaçamento entre a Snackbar e o título
            zIndex: 9999, // Garante que fique acima de outros elementos
            "@media (max-width: 600px)": {
              top: "40px", // Ajuste para dispositivos móveis
            },
          }}
        >
          <MuiAlert onClose={handleClose} severity="error" sx={{ width: "100%", borderRadius: "8px", boxShadow: 2 }}>
            {error}
          </MuiAlert>
        </Snackbar>
      )}

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
