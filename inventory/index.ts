import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import router from './src/routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT

app.use(express.json())

app.use('/', router)

app.get('/', (_req, res) => {
  res.json({ success: true, data: { service: 'inventory', status: 'running' } })
})

async function start() {
  try {
    await mongoose.connect('mongodb://localhost:27017/inventory')
    console.log('[db] connected to mongodb')

    app.listen(PORT, () => {
      console.log(`[server] inventory-service running on port ${PORT}`)
    })
  } catch (err) {
    console.error('[db] connection failed', err)
    process.exit(1)
  }
}

start()
