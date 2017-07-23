const express = require('express'),
      path = require('path')


let app = express.Router()

app.get('/', (req, res)=>{
    res.redirect(req.baseUrl+'/index.html')
})
app.use(express.static(__dirname))

module.exports = app
