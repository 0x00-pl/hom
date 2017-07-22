const express = require('express'),
      fs = require('fs'),
      path = require('path'),
      contentTypes = require('./utils/content-types'),
      sysInfo = require('./utils/sys-info'),
      env = process.env

const router = express.Router()

router.use(function (req, res, next) {
    let url = req.path
    if (url == '/') {
        url += 'index.html'
    }
    next()
})

function info_api (req, res) {
    let url = req.path
    res.set({
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store'
    })
    res.end(JSON.stringify(sysInfo[url.slice(1)]()))
}

router.get('/gen', info_api)
router.get('/poll', info_api)

router.use(express.static(__dirname + '/static'))

module.exports = router


