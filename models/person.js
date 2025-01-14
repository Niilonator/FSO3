const mongoose = require('mongoose')
mongoose.set('strictQuery',false)

const url = process.env.MONGODB_URL

console.log('connecting to',url)
mongoose.connect(url)
  .then(
    console.log('connected to MongoDB')
  )
  .catch((error) => {
    console.log('error connecting to MongoDB',error.message)
  })
const re = /\d{2}-\d{5}|\d{3}-\d{4}/
function validator(v){
  console.log('test: ',re.test(v))
  return re.test(v)
}
const custom = [validator,'invalid number']
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true
  },
  number: {
    type: String,
    validate: custom,
    required: true,
  },
})

personSchema.set('toJSON',{
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person',personSchema)