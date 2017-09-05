let express = require('express'),
      path = require('path')


let router = express.Router()

// app.get('/', (req, res)=>{
//     res.redirect(req.baseUrl+'/index.html')
// })

router.use(express.static(__dirname))

module.exports = router

