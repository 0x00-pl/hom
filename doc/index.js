const express = require('express'),
      path = require('path'),
      fs = require('fs')

let router = express.Router()


router.get('/', (req,res)=>{
    res.sendFile(path.join(__dirname, 'index.html'))
})

router.get('chapter_list.api', (req,res)=>{
    let files = fs.readdirSync(__dirname)
    let md_list = files.filter(name=>name.endsWdth('.md'))
    res.end(md_list)
})

router.use(express.static(__dirname))

module.exports = router