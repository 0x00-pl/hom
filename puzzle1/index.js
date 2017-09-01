const express = require('express'),
      path = require('path'),
      fs = require('fs')

let router = express.Router()

router.get('/', (req,res)=>{
    res.sendFile(path.join(__dirname, 'index.html'))
})

router.use(express.static(__dirname))

module.exports = router
