const express = require('express')
const UserModel = require('../models/user.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const router = express.Router()

router.post('/signup', async (req, res) => {
    const { email, name, password, confirmPassword } = req.body
    if (!email || !name || !password || !confirmPassword) return res.status(400).json({ error: 'All fields are required' })
    if (password !== confirmPassword) return res.status(400).json({ error: 'Password and confirm password do not match' })
    const existingUser = await UserModel.findOne({ email: email.toLowerCase() })
    if (existingUser !== null) return res.status(400).json({ error: 'Email already exists' })
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
    const newUesr = new UserModel({ name, email: email.toLowerCase(), password: hash, })
    const frontendUser = { name, email: email.toLowerCase() }
    try {
        const savedUser = await newUesr.save()
        frontendUser._id = savedUser._id
        res.status(201).json({ data: frontendUser, alert: "Signup Successful" })
    } catch (e) {
        res.status(501).json({ error: e.message })
    }
})

router.post('/signin', async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Please provide email and password' })
    const existingUser = await UserModel.findOne({ email: email.toLowerCase() })
    if (existingUser === null) return res.status(400).json({ error: 'User not found' })
    const result = bcrypt.compareSync(password, existingUser.password)
    if (result) {
        const payload = { _id: existingUser._id, name: existingUser.name, email: email.toLowerCase() }
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION_TIME })
        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION_TIME })
        return res.status(200).json({ data: { refreshToken, accessToken, payload } })
    }
    else return res.status(400).json({ error: 'Wrong Password' })
})

router.post('/token', async (req, res) => {
    const refreshToken = req.body.refreshToken
    try {
        const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
        delete payload.exp
        delete payload.iat
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION_TIME })
        return res.status(200).json({ data: accessToken })
    } catch (error) {
        res.status(401).json({ error: "Invalid refresh token Provided" })
    }
})


module.exports = router