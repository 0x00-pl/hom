let express = require('express')
let path = require('path')

let router = express.Router()

router.use(express.static(__dirname))

module.exports = router
