import express, { Request, Response, Router } from 'express';
import Order from '../models/order';

const checkrouter = Router();

// @route   GET /api/orders
// @desc    Get all orders (with optional userId filter)
// @access  Public (for now; add auth middleware later)
checkrouter.get('/', async (req: Request, res: Response) => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.userId) {
      filter.userId = req.query.userId as string;
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get a single order by ID
// @access  Public
checkrouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error fetching order' });
  }
});

// @route   POST /api/orders
// @desc    Create a new order
// @access  Public
checkrouter.post('/', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      items,
      shippingAddress,
      paymentMethod,
      taxPrice,
      shippingPrice,
    } = req.body;

    // Validate required fields
    if (!userId || !items || !shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create the order (pre-save hook will calculate total)
    const order = new Order({
      userId,
      items,
      shippingAddress,
      paymentMethod,
      taxPrice: taxPrice || 0,
      shippingPrice: shippingPrice || 0,
      isPaid: false,
      isDelivered: false,
      status: 'pending',
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error creating order' });
  }
});

// @route   PATCH /api/orders/:id/pay
// @desc    Mark order as paid
// @access  Public
checkrouter.patch('/:id/pay', async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };
    order.status = 'processing';

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ message: 'Server error updating payment' });
  }
});

// @route   PATCH /api/orders/:id/deliver
// @desc    Mark order as delivered
// @access  Public (should be admin only in production)
checkrouter.patch('/:id/deliver', async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.isDelivered = true;
    order.deliveredAt = new Date();
    order.status = 'delivered';

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating delivery:', error);
    res.status(500).json({ message: 'Server error updating delivery' });
  }
});

// @route   PATCH /api/orders/:id/cancel
// @desc    Cancel an order
// @access  Public
checkrouter.patch('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'delivered' || order.status === 'shipped') {
      return res.status(400).json({ message: 'Cannot cancel an order that has been shipped or delivered' });
    }

    order.status = 'cancelled';
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: 'Server error cancelling order' });
  }
});

// @route   DELETE /api/orders/:id
// @desc    Delete an order
// @access  Public (should be admin only in production)
checkrouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Server error deleting order' });
  }
});

export default checkrouter;