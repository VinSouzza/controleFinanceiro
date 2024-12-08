import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Select, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const TransactionPage = () => {
  const [transactionType, setTransactionType] = useState('receita');
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [balance, setBalance] = useState(0); // Estado para o saldo total
  const [transactions, setTransactions] = useState([]); // Estado para armazenar transações
  const navigate = useNavigate();

  // Instanciando Firebase
  const auth = getAuth();
  const db = getFirestore();

  // Verificar se o usuário está logado, caso contrário, redirecionar para o login
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login'); // Redirecionar para a página de login se o usuário não estiver logado
    }
    if (user) {
      fetchBalance(user.uid); // Chama a função para buscar o saldo ao carregar a página
      fetchTransactions(user.uid); // Chama a função para buscar as transações ao carregar a página
    }
  }, [auth.currentUser, navigate]);

  // Função para buscar e calcular o saldo total
  const fetchBalance = async (uid) => {
    try {
      const transactionsCollection = collection(db, 'transactions');
      const q = query(transactionsCollection, where('user.uid', '==', uid));
      const querySnapshot = await getDocs(q);

      let totalBalance = 0;
      querySnapshot.forEach((doc) => {
        const transaction = doc.data();
        if (transaction.tipo === 'receita') {
          totalBalance += transaction.valor; // Soma as receitas
        } else if (transaction.tipo === 'gasto') {
          totalBalance -= transaction.valor; // Subtrai os gastos
        }
      });

      setBalance(totalBalance); // Atualiza o saldo no estado
    } catch (err) {
      console.error('Erro ao buscar transações:', err);
    }
  };

  // Função para buscar as transações do usuário
  const fetchTransactions = async (uid) => {
    try {
      const transactionsCollection = collection(db, 'transactions');
      const q = query(transactionsCollection, where('user.uid', '==', uid));
      const querySnapshot = await getDocs(q);

      const userTransactions = [];
      querySnapshot.forEach((doc) => {
        userTransactions.push({ id: doc.id, ...doc.data() });
      });

      setTransactions(userTransactions); // Armazena as transações no estado
    } catch (err) {
      console.error('Erro ao buscar transações:', err);
    }
  };

  // Função para adicionar transação
  const addTransaction = async () => {
    if (!value || !date || !description) {
      setError('Por favor, preencha todos os campos!');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Adicionando transação no Firestore
      const transactionsCollection = collection(db, 'transactions');
      await addDoc(transactionsCollection, {
        tipo: transactionType,
        valor: parseFloat(value),
        data: date,
        descricao: description,
        user: { uid: user.uid },
      });

      // Atualizar o saldo após adicionar a transação
      fetchBalance(user.uid); // Recalcula o saldo após adicionar a transação
      fetchTransactions(user.uid); // Atualiza a lista de transações

      // Limpar campos após enviar
      setValue('');
      setDate('');
      setDescription('');
      setError('');
      alert('Transação adicionada com sucesso!');
    } catch (err) {
      setError('Erro ao adicionar transação: ' + err.message);
    }
  };

  // Função para excluir transação
  const deleteTransaction = async (id) => {
    try {
      const transactionDoc = doc(db, 'transactions', id);
      await deleteDoc(transactionDoc);

      // Atualiza o saldo e o histórico de transações após exclusão
      const user = auth.currentUser;
      if (user) {
        fetchBalance(user.uid);
        fetchTransactions(user.uid);
      }

      alert('Transação excluída com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir transação:', err);
      alert('Erro ao excluir transação');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        Adicionar Transação
      </Typography>
      {error && <Typography color="error" variant="body2" align="center">{error}</Typography>}

      <FormControl fullWidth margin="normal">
        <InputLabel>Tipo de Transação</InputLabel>
        <Select
          value={transactionType}
          onChange={(e) => setTransactionType(e.target.value)}
          label="Tipo de Transação"
        >
          <MenuItem value="receita">Receita</MenuItem>
          <MenuItem value="gasto">Gasto</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Valor"
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        margin="normal"
      />

      <TextField
        fullWidth
        label="Data"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        fullWidth
        label="Descrição"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        margin="normal"
      />

      <Button
        variant="contained"
        onClick={addTransaction}
        fullWidth
        style={{ marginTop: '20px', backgroundColor:"#333" }}
      >
        Adicionar Transação
      </Button>

      <Typography variant="h5" gutterBottom style={{ marginTop: '40px' }}>
        Saldo Total: R${balance.toFixed(2)}
      </Typography>

      <Typography variant="h5" gutterBottom>
        Histórico de Transações
      </Typography>

      <List>
        {transactions.map((transaction) => (
          <ListItem key={transaction.id} divider>
            <ListItemText
              primary={`${transaction.data} - ${transaction.descricao}`}
              secondary={`R$${transaction.valor.toFixed(2)} - ${transaction.tipo}`}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => deleteTransaction(transaction.id)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default TransactionPage;
