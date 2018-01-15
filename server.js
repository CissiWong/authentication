import mongoose from "mongoose"
import express from "express"
import bodyParser from "body-parser"
import uuid from "uuid/v4"
import bcrypt from "bcrypt-nodejs"

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const mongoServer = "mongodb://localhost/myNewDb"
mongoose.connect(mongoServer, { useMongoClient: true })
mongoose.Promise = Promise

mongoose.connection.on("error", err => {
  console.error("connection error:", err)
})

mongoose.connection.once("open", () => {
  console.log("Connected to mongodb")
})

const User = mongoose.model("User", {
  name: {
    type: String,
    unique: true
  },
  password: String,
  accessToken: {
    type: String,
    default: () => uuid()
  }
})
//
// const firstUser = new User({ name: "Bob", password: bcrypt.hashSync("foobar") })
// firstUser.save().then(() => console.log("Created Bob"))
//
// const secondUser = new User({ name: "Sue", password: bcrypt.hashSync("password1") })
// secondUser.save().then(() => console.log("Created Sue"))

const findUser = (req, res, next) => {
  User.findById(req.params.id).then(user => {
    // res.json(user)
    if (user.accessToken === req.headers.token) {
      req.user = user
      next()
    } else {
      res.status(401).send("unauthenticated")
    }
  })
}
// mounting middleware //
app.use("/users/:id", findUser)

app.get("/users/:id", (req, res) => {
  res.json(req.user)
})

app.use("/hello/:id", findUser)

app.get("/hello/:id", (req, res) => {
  res.json({ hello: req.user.name })
})

app.listen(8080, () => console.log("Example app listening on port 8080!"))
