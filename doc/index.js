const express = require('express'),
      path = require('path'),
      fs = require('fs')

let router = express.Router()

router.use((req,res,next)=>{
   console.log(req.originalUrl); // '/admin/new'
   console.log(req.baseUrl); // '/admin'
   console.log(req.path); // '/new'
   next()
})

router.get('/', (req,res)=>{
    res.sendFile(path.join(__dirname, 'index.html'))
})

router.get('/chapter_list.api', (req,res)=>{
    let files = fs.readdirSync(__dirname)
    let md_list = files.filter(name=>name.endsWidth('.md'), encode='utf8')
    res.end(JSON.stringify(md_list))
})

router.use(express.static(__dirname))

module.exports = router
