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
      navigate("/");
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
    <Grid container spacing={2} justifyContent="center" style={{ padding: '20px' }}>
      {/* Header and Logout */}
      <Grid item xs={12} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FontAwesomeIcon icon={faArrowLeft} size="lg" onClick={() => navigate("/home")} />
        <Typography variant="h4">Transações</Typography>
        <Button variant="contained" color="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </Grid>

      {/* Balance */}
      <Grid item xs={12} sm={6}>
        <Paper style={{ padding: '20px', textAlign: 'center' }}>
          <Typography variant="h5">Saldo: R${balance.toFixed(2)}</Typography>
        </Paper>
      </Grid>

      {/* Add Transaction Form */}
      <Grid item xs={12} sm={6}>
        <Paper style={{ padding: '20px' }}>
          <Typography variant="h6">Adicionar Transação</Typography>
          <form noValidate autoComplete="off">
            <FormControl fullWidth margin="normal">
              <Select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
              >
                <MenuItem value="receita">Receita</MenuItem>
                <MenuItem value="gasto">Gasto</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Valor"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              margin="normal"
              type="number"
            />

            <TextField
              fullWidth
              label="Data"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              margin="normal"
              type="date"
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="Descrição"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              margin="normal"
            />

            {error && <Typography color="error">{error}</Typography>}

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={addTransaction}
              style={{ marginTop: '10px' }}
            >
              Adicionar Transação
            </Button>
          </form>
        </Paper>
      </Grid>

      {/* Transaction Table */}
      <Grid item xs={12} sm={12}>
        <Paper style={{ padding: '20px' }}>
          <Typography variant="h6">Histórico de Transações</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Ação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.data}</TableCell>
                    <TableCell>{transaction.descricao}</TableCell>
                    <TableCell>{transaction.valor}</TableCell>
                    <TableCell>
                      <IconButton
                        color="secondary"
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
      </Grid>
    </Grid>
  );
};

export default TransactionPage;
