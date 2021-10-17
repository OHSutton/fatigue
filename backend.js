const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const app = express()

app.use(cors())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

let sse = null


const send_sse = (type, data) => {
  if (sse) {
    const out = {
      "type": type,
      "data": data,
    }
    sse.write("data: " + JSON.stringify(out) + "\n\n")
  } else {
    console.log("SSE NULL!!!!!!!!!!!!!")
  }

}

app.get('/', (req, res) => res.send("hello!"))

// Init SSE connection
app.get('/stream', (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  })
  sse = res
})

app.post('/trivia', (req, res) => {
  const data = req.body
  send_sse("trivia", data)
  res.json(data)
})

app.post('/fatigue', (req, res) => {
  const data = req.body
  send_sse("fatigue", data)
  res.json(data)
})

// WIP
app.post('/photo', (req, res) => {
  console.log("===============PHOTO REQUEST ==================")
  console.log(req)
  const data = req.body
  console.log("===============PHOTO BODY ==================")
  console.log(data)
})


app.listen(3002)
console.log("Listening on 3002!")