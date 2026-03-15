const express = require("express");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "nikhil123";
const app = express();

app.use(express.json());
const users = [];
const todos = [];

function verifyToken(req, res, next) {
  try {
    const token = req.headers.token;
    if (!token) {
      return res.status(404).json({
        message: "Token not found, Please Login ",
      });
    }
    const decodedData = jwt.verify(token, JWT_SECRET);
    if (!decodedData) {
      res.status(401).json({
        message: "Unauthorized Access!",
      });
    }
    const username = decodedData.username;
    const findUser = users.find((u) => u.username === username);
    if (!findUser) {
      return res.status(404).json({
        message: "User not found",
      });
    } else {
      req.user = findUser;
      next();
    }
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
      Error: error,
    });
  }
}

app.post("/signup", (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
      return res.status(401).json({
        message: "Please enter username and password",
      });
    }
    users.push({
      username: username,
      password: password,
    });

    res.status(200).json({
      message: "You are successfully Signed up",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      Error: error,
    });
  }
});

app.post("/login", (req, res) => {
    try {
        const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
      return res.status(401).json({
        message: "Please enter username and password",
      });
    }
  const findUser = users.find(
    (u) => u.username === username && u.password === password,
  );

  if (!findUser) {
    return res.status(404).json({
      message: "User not found! Please signUp first.",
    });
  } else {
    const token = jwt.sign(
      {
        username: findUser.username,
      },
      JWT_SECRET,
    );
    res.status(201).json({
      message: "You are successfully loged in.",
      token: token,
    });
  }
    } catch (error) {
        res.status(500).json({
            message : "Internal sever error",
            Error : error
        })
    }
});

app.post("/createTodo", verifyToken, (req, res) => {
  const id = todos.length + 1;
  const newtodo = req.body.todo;
  if(!newtodo){
    res.status(404).json({
        message : "Enter a todo"
    })
  }
  todos.push({
    id: id,
    todo: newtodo,
    completed: false,
    username: req.user.username,
  });
  console.log(todos);
  res.status(201).json({
    message: "Added a new Todo",
  });
});

app.get("/todos", verifyToken, (req, res) => {
  try {
    const user = req.user.username;
    const userOnlyTodos = todos.filter((u) => u.username === user);
    if (userOnlyTodos.length === 0) {
      return res.status(404).json({
        message: "This users doesn't has any Todos",
      });
    } else {
      return res.status(200).json({
        message: "Here are your Todos :",
        userOnlyTodos,
      });
    }
  } catch (error) {
    res.status(404).json({
      message: "Can't access your todo",
      Error: error,
    });
  }
  console.log(todos);
});

app.put("/todos/:id", verifyToken, (req, res) => {
  try {
    const id = Number(req.params.id);
    const udatedTodo = req.body.todo;
    const completedUpdate = req.body.completed;

    const particularTodo = todos.find(
        (u) => u.id == id && u.username === req.user.username
    );
    if (particularTodo) {
      particularTodo.todo = udatedTodo;
      particularTodo.completed = completedUpdate;
    }
    res.status(201).json({
      message: "Updated Your Todo and your new to do is :",
      particularTodo,
    });
  } catch (error) {
    res.status.json({
      message: "Can't update the todo",
      Error: error,
    });
  }
  console.log(todos);
});

app.delete("/todos/:id", verifyToken, (req, res) => {
  const idToDelete = Number(req.params.id);
  const index = todos.findIndex(
    (n) => n.id == idToDelete && n.username === req.user.username
);
  if (index !== -1) {
    todos.splice(index, 1);
  } else {
    return res.status(404).json({
      message: "Todo not found",
    });
  }
  res.status(200).json({
    message: "Todo is deleted",
    todos,
  });
  console.log(todos);
});

app.patch("/todos/:id/completed", verifyToken, (req, res) => {
    const idToChange = parseInt(req.params.id);
    const findTodo = todos.find(t => t.id === idToChange);

    if(!findTodo){
        return res.status(404).json({
            message : "Todo is not available on given id"
        })
    }

    findTodo.completed = true;

    res.status(201).json({
        message : "Todo marked as completed",
        findTodo
    })
})

app.listen(3000, ()=> {
    console.log("Listing at port 3000");
});
