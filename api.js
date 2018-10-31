const express = require('express');
const morgan = require('morgan');
const app = new express();
const morganBody = require('morgan-body');
const cors = require('cors');

// * Express standard config
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
morganBody(app, {
  timezone: 'Europe/Bucharest'
});
const port = 5000;


// ! Created a basic users array
let users = require('./users')
let appointments = require('./appointments')
let patients = require('./patients')

//TODO: a bit of validation
const validUser = (user, userProps) => {
  let out = {}

  userProps.forEach(prop => {
    if (user[prop] !== undefined)
      out[prop] = user[prop]
  });

  return checkValidUser(out, userProps) ? out : {}
}

const checkValidUser = (validUser, userProps) => {
  if (Object.keys(validUser).length === userProps.length)
    return true
  return false
}

const getUserByEmail = email => {
  return { ...users.find(user => user.email === email) }
}

const addUser = user => {
  if (getUserByEmail(user.email) !== undefined) {
    users.unshift(user)
    return true
  }
  else return false
}

const checkAuth = user => {
  let dbUser = getUserByEmail(user.email)
  return dbUser !== undefined && dbUser.password === user.password
}

//?  Now the Routing
app.get('/', (req, res) => res.send('Basic AF API'))

app.get('/users', (req, res) => res.send(users))

app.post('/users', (req, res) => {
  let user = validUser(req.body, ['name', 'email', 'password', 'avatar'])
  if (Object.keys(user).length !== 0) {
    if (addUser(user))
      res.send(user);
    else res.sendStatus(400);
  }
  else res.sendStatus(400);

})

app.get('/appointments', (req, res) => {
  res.send(appointments)
})

app.get('/patients', (req, res) => {
  res.send(patients)
})

app.post('/login', (req, res) => {

  if (req.body === undefined || !Object.keys(req.body).length > 0)
    return res.status(400).send({ error: 'BAD_DATA' });

  let user = validUser(req.body, ['email', 'password'])

  if (Object.keys(getUserByEmail(user.email)).length > 0)
    if (checkAuth(user)) {
      let out = getUserByEmail(user.email);
      delete out.password
      res.send(out)
    }
    else res.status(403).send({ error: 'BAD_PASSWORD' })
  else res.status(404).send({ error: 'BAD_EMAIL' })

})



app.listen(port, () => console.log(`Listening on port ${port}!`))