import { Router, Request, Response } from 'express'
import { Item } from './model'

const router = Router()

// ── GET /items ──────────────────────────────────────────
router.get('/items', async (req: Request, res: Response) => {
  try {
    const filter: Record<string, any> = {}
    if (req.query.category) {
      filter.category = req.query.category
    }
    const items = await Item.find(filter).sort({ createdAt: -1 })
    res.json({ success: true, data: items })
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch items' },
    })
  }
})

// ── GET /items/:id ──────────────────────────────────────
router.get('/items/:id', async (req: Request, res: Response) => {
  try {
    const item = await Item.findById(req.params.id)
    if (!item) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Item not found' },
      })
      return
    }
    res.json({ success: true, data: item })
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch item' },
    })
  }
})

// ── POST /items ─────────────────────────────────────────
router.post('/items', async (req: Request, res: Response) => {
  // Admin check via Kong header
//  const role = req.headers['x-consumer-role'] as string | undefined
//  if (role !== 'admin') {
//    res.status(403).json({
//      success: false,
//      error: { code: 'FORBIDDEN', message: 'Admin access required' },
//    })
//    return
//  }
//
  const { name, sku, price, stock, category } = req.body

  if (!name || !sku || price === undefined || stock === undefined || !category) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'All fields are required: name, sku, price, stock, category' },
    })
    return
  }

  try {
    const item = await Item.create({ name, sku, price, stock, category })
    res.status(201).json({ success: true, data: item })
  } catch (err: any) {
    // Duplicate SKU (MongoDB error code 11000)
    if (err.code === 11000) {
      res.status(409).json({
        success: false,
        error: { code: 'DUPLICATE_SKU', message: 'An item with this SKU already exists' },
      })
      return
    }
    // Validation error
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e: any) => e.message).join(', ')
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: messages },
      })
      return
    }
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create item' },
    })
  }
})

// ── PATCH /items/:id/stock ──────────────────────────────
router.patch('/items/:id/stock', async (req: Request, res: Response) => {
  const { delta } = req.body

  if (delta === undefined || typeof delta !== 'number' || !Number.isInteger(delta)) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'delta must be an integer' },
    })
    return
  }

  try {
    // Check current stock first
    const current = await Item.findById(req.params.id)
    if (!current) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Item not found' },
      })
      return
    }

    if (current.stock + delta < 0) {
      res.status(409).json({
        success: false,
        error: { code: 'INSUFFICIENT_STOCK', message: `Resulting stock would be ${current.stock + delta}, minimum is 0` },
      })
      return
    }

    // Atomic $inc update
    const updated = await Item.findByIdAndUpdate(
      req.params.id,
      { $inc: { stock: delta } },
      { new: true }
    )

    res.json({ success: true, data: updated })
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update stock' },
    })
  }
})

// ── DELETE /items/:id ───────────────────────────────────
router.delete('/items/:id', async (req: Request, res: Response) => {
  // Admin check via Kong header
  const role = req.headers['x-consumer-role'] as string | undefined
  if (role !== 'admin') {
    res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Admin access required' },
    })
    return
  }

  try {
    const item = await Item.findByIdAndDelete(req.params.id)
    if (!item) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Item not found' },
      })
      return
    }
    res.json({ success: true, data: item })
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete item' },
    })
  }
})

export default router
