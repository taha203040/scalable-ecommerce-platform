import express from 'express'
import connectDB from './src/config/db'
import orderRoutes from './src/routes/orders'

const app = express()

// Connect to MongoDB
connectDB()

// Middleware
app.use(express.json())
// app.use(express.urlencoded({ extended: true }))
// app.use((req, res, next) => {
//   if (!req.headers['x-gateway-source']) {
//     return res.status(403).json({ error: 'Direct access not allowed' })
//   }
//   next()
// })
// Routes

// Order routes
app.use('/api/orders', orderRoutes)
app.get('/', (req, res) => {
    // res.send('Server is running')
  res.json({ msg: "hello world" })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})

