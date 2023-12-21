const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  products: {
    type:Array
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  shippingAddress: {
    Address: {
        type: String,
        required: true,
    },
    city:{
        type: String,
        required: true
    },
    House_no:{
        type: Number,
        required: true
    },
    postalCode:{
        type: Number,
        required: true
    },
    AlternateNumber:{
        type: Number,
        
    }
},

  status: {
    type: String,
    enum: ['pending', 'Shipped', 'Delivered'],
    default: 'pending',
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  PaymentMethod: {
    type: String,
    required: true,
  },
  couponCode:{
    type:String,
    default:''
  },
  fromWallet:{
    type:Number,
    default:0
  }
  
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
