const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const cors = require('cors');
const { json } = require('body-parser');
const { nanoid } = require('nanoid');
const jwt = require("jsonwebtoken")

require('dotenv').config();

const app = express();

app.use(cors());
app.use(json());


let users = [
	{
		id: nanoid(),
		email: 'saadeh@test.com',
		password: 123
	}

]


let todos = [
	{
		userId: users[0].id,
		id: nanoid(),
		title: 'Complete presentation for team meeting on Friday',
		completed: true,
		date: Date.now()
	},
	{
		userId: users[0].id,
		id: nanoid(),
		title: 'Schedule dentist appointment for next month',
		completed: false,
		date: Date.now()
	},
	{
		userId: users[0].id,
		id: nanoid(),
		title: 'Buy groceries for the week',
		completed: false,
		date: Date.now()
	},
	{
		userId: users[0].id,
		id: nanoid(),
		title: 'Call utility company to resolve billing issue',
		completed: false,
		date: Date.now()
	},
	{
		userId: users[0].id,
		id: nanoid(),
		title: 'Finish reading chapter 3 of "The Great Gatsby"',
		completed: false,
		date: Date.now()
	},
];

const deleteMsg = 'Successfully deleted the required todo item.'
const updateMsg = 'Successfully updated the required todo item.'

app.get('/users', (req, res) => res.status(200).send(users)) 

app.post('/user/login', (req, res) => {
	const {email, password} = req.body
	for (u of users) {
		if (u.email == email && u.password == password) {
			//generate jwt
			const accessToken = jwt.sign({email}, "secret_key")
			return res.status(200).send({id: u.id, email: email, password: password, accessToken})
		}
	}
	return res.status(400).send("user not found")
})

app.post('/user/signup', (req, res) => {
	const {email, password} = req.body
	for (u of users) {
		if (u.email === email) {
			throw new Error('BROKEN, user already signed up')
		}
	}
	const accessToken = jwt.sign({email}, "secret_key")
	const id = nanoid()
	users.push({id: id, email: email, password: password})
	return res.status(200).send({id: id, email: email, password: password, accessToken})
}) 

const verify = (req, res, next) => {
	const authHeader = req.headers.authorization
	if (authHeader) {
		const token = authHeader.split(" ")[1]
		jwt.verify(token, "secret_key", (err, payload) => {
			if (err) {
				return res.status(403).json("invalid token")
			}
			req.payload = payload
			next()
		})
	} else {
		res.status(401).json("you are not authenticated!")
	}
}

app.get('/todo/:userId', verify, (req, res) => {
	const userId = req.params['userId']
	const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const totalItems = todos.filter(t => t.userId === userId).length
  const totalPages = Math.ceil(totalItems / limit);

  // Get the todos for the requested page
  const paginatedTodos = todos.filter(t => t.userId === userId).slice(startIndex, endIndex);

  // Prepare the response
  const response = {
    code: 200,
    message: 'Found the requested todos from the selected page',
    data: {
      page,
      limit,
      totalPages,
      todos: paginatedTodos
    }
  };

  // Return the response
  res.status(200).json(response);
})


app.post('/todo/create', verify, (req, res) => {
	const todo = { title: req.body.title, id: nanoid(), completed: false, userId: req.body.userId, date: Date.now() };
	todos.push(todo);
	return res.status(200).send({code:"200", message: todo.title, data: todo});
});

app.put('/todo/:id', verify, (req, res) => {
	const id = req.params.id;
	const index = todos.findIndex((todo) => todo.id == id);
	const completed = Boolean(req.body.completed);
	if (index > -1) {
		todos[index].completed = completed;
	}
	return res.status(200).send({code:"200", message: updateMsg, todo: todos[index] });
});

app.delete('/todo/:id', verify, (req, res) => {
	const id = req.params.id;
	const index = todos.findIndex((todo) => todo.id == id);
	if (index > -1) {
		todos.splice(index, 1);
	}

	return res.status(200).send({code:"200", message: deleteMsg, todos: todos});
});

const PORT = 3080;

app.listen(PORT, console.log(`Server running on port ${PORT}`.green.bold));