const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI
console.log('connecting to', url)

mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch(error => {
        console.log('error connecting to MongoDB', error.message)
    })

const phoneNumberRegex = /^\d{2,3}-\d+$/

const personsSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: [3, 'Name must be at least 3 characters long'],
        required: [true, 'Name is required']
    },
    number: {
        type: String,
        minlength: [8, 'Phone number must be at least 8 characters long'],
        required: [true, 'Number is required'],
        validate: {
            validator: function(v) {
                return phoneNumberRegex.test(v)
            },
            message: props => `${props.value} is not a valid phone number! Format must be XX-XXXXXXX or XXX-XXXXXXX`
        }
    }
})

personsSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personsSchema)