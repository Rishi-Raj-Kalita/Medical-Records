const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const { v4 } = require('uuid');
// const mkdirp=require('mkdirp')
//const upload= require('../controllers/authControllers')

//uploading files with multer
const multer = require('multer')
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        //console.log("in multer")
       // const files=req.file
        //console.log("filessss",file)
        console.log("type",req.query)
        const userEmail = req.user.email
        const dir = `./public/uploads/${userEmail}`
        //console.log("dir",dir)
        if (!fs.existsSync(dir)) {
           // console.log("making files")
            fs.mkdirSync(dir, { recursive: true }, (err) => {
                if (err) console.error('New Directory Creation Error');
            })
        }
        cb(null, dir)
    },
    filename: (req, file, cb) => {
        // const userId = req.user._id
        cb(null, `File-${v4()}${path.extname(file.originalname)}`)
    },
})

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 6000000 },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb)
    },
})

function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif|pdf/
    const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
    )
    const mimetype = filetypes.test(file.mimetype)
    if (mimetype && extname) {
        return cb(null, true)
    } else {
        cb(null,false)
    }
}

//uploading finishes
const authController = require('../controllers/authControllers')
const { requireAuth, redirectIfLoggedIn } = require('../middleware/userAuth')
router.get('/verify/:id', authController.emailVerify_get)
router.get('/signup',redirectIfLoggedIn, authController.signup_get)
router.post('/signup', authController.signup_post)
router.get('/login', redirectIfLoggedIn, authController.login_get)
router.post('/login', authController.login_post)
router.get('/logout', requireAuth, authController.logout_get)
router.get('/profile', requireAuth, authController.profile_get)
router.post(
    '/profile/upload/:type',
    requireAuth,
    upload.array('upload'),
    authController.upload_post
)

router.get('/profile/disease',requireAuth,authController.disease_get)

module.exports = router