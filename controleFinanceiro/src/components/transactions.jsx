import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Grid,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const TransactionPage = () => {
  const [transactionType, setTransactionType] = useState("receita");
  const [value, setValue] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate("/login");
    }
    if (user) {
      fetchBalance(user.uid);
      fetchTransactions(user.uid);
    }
  }, [auth.currentUser, navigate]);

  const fetchBalance = async (uid) => {
    try {
      const transactionsCollection = collection(db, "transactions");
      const q = query(transactionsCollection, where("user.uid", "==", uid));
      const querySnapshot = await getDocs(q);

      let totalBalance = 0;
      querySnapshot.forEach((doc) => {
        const transaction = doc.data();
        if (transaction.tipo === "receita") {
          totalBalance += transaction.valor;
        } else if (transaction.tipo === "gasto") {
          totalBalance -= transaction.valor;
        }
      });

      setBalance(totalBalance);
    } catch (err) {
      console.error("Erro ao buscar transações:", err);
    }
  };

  const fetchTransactions = async (uid) => {
    try {
      const transactionsCollection = collection(db, "transactions");
      const q = query(transactionsCollection, where("user.uid", "==", uid));
      const querySnapshot = await getDocs(q);

      const userTransactions = [];
      querySnapshot.forEach((doc) => {
        userTransactions.push({ id: doc.id, ...doc.data() });
      });

      setTransactions(userTransactions);
    } catch (err) {
      console.error("Erro ao buscar transações:", err);
    }
  };

  const addTransaction = async () => {
    if (!value || !date || !description) {
      setError("Por favor, preencha todos os campos!");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const transactionsCollection = collection(db, "transactions");
      await addDoc(transactionsCollection, {
        tipo: transactionType,
        valor: parseFloat(value),
        data: date,
        descricao: description,
        user: { uid: user.uid },
      });

      fetchBalance(user.uid);
      fetchTransactions(user.uid);

      setValue("");
      setDate("");
      setDescription("");
      setError("");
      alert("Transação adicionada com sucesso!");
    } catch (err) {
      setError("Erro ao adicionar transação: " + err.message);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      const transactionDoc = doc(db, "transactions", id);
      await deleteDoc(transactionDoc);

      const user = auth.currentUser;
      if (user) {
        fetchBalance(user.uid);
        fetchTransactions(user.uid);
      }

      alert("Transação excluída com sucesso!");
    } catch (err) {
      console.error("Erro ao excluir transação:", err);
      alert("Erro ao excluir transação");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    navigate("/");
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
        backgroundColor: "#f9f9f9",
      }}
    >
      <Paper
        elevation={3}
        style={{
          padding: "20px",
          backgroundColor: "#fff",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <Button onClick={handleLogout} style={{ justifySelf: "start" }}>
            <FontAwesomeIcon icon={faArrowLeft} color="red" fontSize={30} />
          </Button>
          <Typography
            variant="h4"
            style={{ textAlign: "center", justifySelf: "center" }}
          >
            Gerenciador de Transações
          </Typography>
        </div>

        {error && (
          <Typography color="error" variant="body2" align="center">
            {error}
          </Typography>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ textAlign: "left" }}>
                Tipo de Transação
              </InputLabel>
              <Select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                label="Tipo de Transação"
                sx={{
                  textAlign: "left", // Alinha o texto dentro do Select
                  display: "flex",
                  justifyContent: "flex-start", // Alinha o conteúdo à esquerda
                }}
              >
                <MenuItem value="receita">Receita</MenuItem>
                <MenuItem value="gasto">Gasto</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Valor"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Data"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Descrição"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              margin="normal"
            />
          </Grid>
        </Grid>

        <Button
          variant="contained"
          onClick={addTransaction}
          fullWidth
          style={{
            marginTop: "20px",
            backgroundColor: "#1c3e87",
            color: "#fff",
          }}
        >
          Adicionar Transação
        </Button>

        <Typography
          variant="h5"
          gutterBottom
          style={{ marginTop: "40px", textAlign: "center", color: "#1c3e87" }}
        >
          Saldo Total: R${balance.toFixed(2)}
        </Typography>

        <Typography variant="h5" gutterBottom style={{ marginTop: "20px" }}>
          Histórico de Transações
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Descrição</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.descricao}</TableCell>
                  <TableCell
                    style={{
                      color: transaction.tipo === "receita" ? "green" : "red",
                    }}
                  >
                    R${transaction.valor.toFixed(2)}
                  </TableCell>
                  <TableCell>{transaction.data}</TableCell>
                  <TableCell>{transaction.tipo}</TableCell>
                  <TableCell>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => deleteTransaction(transaction.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
};

export default TransactionPage;
