const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());

const path = require('path');

const filePath = path.join(__dirname, 'todos.json');

function checkFileExists(filePath) {
    try {
        fs.accessSync(filePath, fs.constants.F_OK);
        return true;
    } catch (err) {
        return false;
    }
}

function createFileIfNotExists(filePath, initialData = []) {
    if (!checkFileExists(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
        console.log(`File created at ${filePath}`);
    } else {
        console.log(`File already exists at ${filePath}`);
    }
}

createFileIfNotExists(filePath, []);

app.get('/api/todos', (req, res) => {
  fs.readFile('todos.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json(JSON.parse(data));
  });
});

app.post('/api/todos', (req, res) => {
  const newTodo = req.body;
  fs.readFile('todos.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    const todos = JSON.parse(data);
    todos.push(newTodo);
    fs.writeFile('todos.json', JSON.stringify(todos, null, 2), err => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }
      res.json(newTodo);
    });
  });
});

app.put('/api/todos/:id', (req, res) => {
    const id = req.params.id;
    const updatedTodo = req.body;
    fs.readFile('todos.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }
      let todos = JSON.parse(data);
      const index = todos.findIndex(todo => todo.id === parseInt(id));
      if (index !== -1) {
        todos[index] = updatedTodo;
        fs.writeFile('todos.json', JSON.stringify(todos, null, 2), err => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
            return;
          }
          res.json(updatedTodo);
        });
      } else {
        res.status(404).json({ error: 'Todo not found' });
      }
    });
  });
  
app.delete('/api/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    console.log(id);
    fs.readFile('todos.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }
      let todos = JSON.parse(data);
      const filteredTodos = todos.filter(todo => todo.id !== id);
      fs.writeFile('todos.json', JSON.stringify(filteredTodos, null, 2), err => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }
        res.json({ message: 'Todo deleted successfully' });
      });
    });
  });
  

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});