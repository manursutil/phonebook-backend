require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()

app.use(cors())
app.use(express.json())

morgan.token('body', function (req) {
    return req.method === 'POST' ? JSON.stringify(req.body) : ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.use(express.static('dist'))

const Person = require('./models/person')

// app.get('/', (request, response) => {
//    response.send('<h1>Hello World</h1>')
// })

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info', async (request, response) => {
    const count = await Person.countDocuments()
    const date = new Date()
    response.send(`
        <p>Phonebook has info for ${count} people</p>
        <p>${date}</p>
    `)
})

app.get('/api/persons/:id', (request, response, next) => {
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

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
    .then(() => response.status(204).end())
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const {name, number} = request.body

    if (!name || !number) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const person = new Person ({
        name: name,
        number: number,
    })
    
    person.save().then(savedPerson => {
        response.json(savedPerson)
        console.log(`added ${person.name} number ${person.number} to phonebook`)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const {name, number} = request.body

    const updatedPerson = {
        name: name,
        number: number
    }

    Person.findByIdAndUpdate(
        request.params.id,
        updatedPerson,
        {new: true, runValidators: true, context: 'query'}
    )
    .then(updated => response.json(updated))
    .catch(error => next(error))
})

app.use((error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
