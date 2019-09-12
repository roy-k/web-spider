const path = require('path')
var express = require('express')

var app = express()

app.use(express.static(path.resolve(__dirname, './files')))

app.get('/', (req, res) => res.send('express server'))

app.listen(3098, () => console.log('app listening on port 3098!'))
