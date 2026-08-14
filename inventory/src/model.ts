import mongoose, { Schema, Document } from 'mongoose'

export interface IItem extends Document {
  name: string
  sku: string
  price: number
  stock: number
  category: string
}

const itemSchema = new Schema<IItem>(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, 'sku is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'price is required'],
      min: [0, 'price cannot be negative'],
    },
    stock: {
      type: Number,
      required: [true, 'stock is required'],
      min: [0, 'stock cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'category is required'],
      trim: true,
    },
  },
  { timestamps: true }
)

export const Item = mongoose.model<IItem>('Item', itemSchema)
