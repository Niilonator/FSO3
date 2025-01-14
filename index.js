const express = require('express')
const morgan =require('morgan')
const cors = require('cors')
require('dotenv').config()

const app = express()
//console.log('env mongo url',process.env.MONGODB_URL)
app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
morgan.token('body',function (req) {return JSON.stringify(req.body)})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const Person = require('./models/person')

app.get('/info',(request,response) => {
  Person.find({}).then(persons => {
    response.writeHead(200, { 'Content-Type': 'text/plain' })
    response.end(`Phonebook has info for ${persons.length} people
${Date()}`)
  })
})

app.get('/api/persons', (request, response,next) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
    .catch(error => next(error))
})



app.get('/api/persons/:id', (request, response,next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})




app.delete('/api/persons/:id', (request, response,next) => {
  Person.findByIdAndDelete(request.params.id).then(
    response.status(204).end()
  )
    .catch(error => next(error))
})
app.post('/api/persons', (request, response,next) => {
  const body = request.body
  if (body.name ===undefined) {
    return response.status(400).json({
      error: 'name missing'
    })
  }
  if (body.number ===undefined) {
    return response.status(400).json({
      error: 'number missing'
    })
  }
  const person = new Person({
    name: body.name,
    number:body.number,
  })
  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
    .catch(error => next(error))
})

app.put('/api/persons/:id',(request,response,next) => {
  const body = request.body
  const person = new Person ({
    name: body.name,
    number: body.number,
  })
  if (
    person.validate('number').catch(error => {
      next(error)
    })
  ) {
    return
  }
  Person.findByIdAndUpdate(request.params.id,{ number: `${person.number}` },{ returnDocument:'after' } ).then(person => {
    response.json(person)
  })
    .catch(error => next(error))
})

const unknownEndpoint =(request,response) => {
  response.status(404).send({ error : 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  next(error)
  if (error.name === 'ValidationError') {
    console.log('boop')
    return response.status(400).send({ error: error.message })
  }
}

app.use(errorHandler)
const PORT = process.env.PORT
app.listen(PORT)
console.log(`Server running on port ${PORT}`)
