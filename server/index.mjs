import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import Razorpay from 'razorpay';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1. MIDDLEWARE ---
app.use(express.json());
app.use(cors());

// --- 2. CONFIGURATION (Yahan apni Asli Details daalo) ---
const PORT = process.env.PORT || 5000;

// Admin Credentials
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "satyamverma1933@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Saty@mverm@3193";

// MongoDB Link (Atlas Online wala) - Replace with your actual credentials
// Format: mongodb+srv://username:password@cluster.mongodb.net/database_name
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://satyamverma1933_db_user:rawdMAXCf4RzmPak@cluster0.8d5amse.mongodb.net/?appName=Cluster0";
// Example: mongodb+srv://admin:password123@cluster0.abc123.mongodb.net/india_bazar?retryWrites=true&w=majority 

// Razorpay Keys (Razorpay Dashboard se lo)
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_RmPRD1kkOtZ8RO"; 
const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET || "9UeKB57zZuMVxqU0iVq0axX5"; 

// Email Settings (App Password wala)
const EMAIL_USER = process.env.EMAIL_USER || "satyamverma1933@gmail.com";
const EMAIL_PASS = process.env.EMAIL_PASS || "xxxx xxxx xxxx xxxx"; 

// Cloudinary Settings (Cloudinary Dashboard se lo)
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dpowbdhao';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '966189251759394';
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'Jzgd3xsWtLbF1jD1LPjg_oLEhpk';

cloudinary.config({ 
  cloud_name: CLOUDINARY_CLOUD_NAME, 
  api_key: CLOUDINARY_API_KEY, 
  api_secret: CLOUDINARY_API_SECRET
});

// --- 3. CONNECTIONS ---

// Connect Database with retry logic
let dbConnected = false;
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      w: 'majority'
    });
    console.log("✅ MongoDB Connected Successfully");
    dbConnected = true;
  } catch (err) {
    console.error("❌ DB Connection Error:", err.message);
    console.log("Retrying in 10 seconds...");
    setTimeout(connectDB, 10000);
  }
};

// Start trying to connect but don't block server startup
connectDB().catch(err => console.error("Initial DB connection attempt failed:", err.message));

// Setup Email Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: EMAIL_USER, pass: EMAIL_PASS }
});

// Setup Razorpay
const razorpay = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_SECRET });

// Setup Multer (Temporary Local Storage)
// Hum pehle image ko 'uploads' folder me layenge, fir Cloudinary bhejenge
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir); // Folder na ho to bana lo

const upload = multer({ dest: 'uploads/' });

// --- 4. MODELS (Database Structure) ---

const userSchema = new mongoose.Schema({
  name: String, 
  email: { type: String, unique: true }, 
  mobile: { type: String, unique: true },
  password: String, 
  isAdmin: { type: Boolean, default: false }
});
const User = mongoose.model('User', userSchema);

const productSchema = new mongoose.Schema({
  name: String, 
  description: String, 
  price: Number, 
  image: String, // Cloudinary ka URL yahan aayega
  category: String, 
  countInStock: Number, 
  sizes: String
});
const Product = mongoose.model('Product', productSchema);

const orderSchema = new mongoose.Schema({
  userId: String, 
  customerName: String, 
  email: String,
  customerEmail: String,
  customerPhone: String,
  customerAddress: String,
  city: String,
  pincode: String,
  items: [{
    productId: String,
    title: String,
    price: Number,
    quantity: Number,
    size: String
  }],
  amount: Number, 
  paymentMethod: String,
  paymentId: String, 
  status: { type: String, default: "Processing" },
  refundAmount: { type: Number, default: 0 },
  refundStatus: { type: String, default: "None" }, // None, Pending, Completed
  cancelledAt: Date
}, { timestamps: true });
const Order = mongoose.model('Order', orderSchema);

// --- 5. API ROUTES ---

// Health Check (Server Alive है check करने के लिए)
app.get('/', (req, res) => {
  res.json({ message: "✅ Server is running!", timestamp: new Date() });
});

// === A. AUTHENTICATION ===

// Create Admin (One Time Link)
app.get('/setup-admin', async (req, res) => {
  try {
    if(await User.findOne({ email: ADMIN_EMAIL })) return res.send("Admin already exists.");
    await new User({ name: "Super Admin", email: ADMIN_EMAIL, mobile: "8922001933", password: ADMIN_PASSWORD, isAdmin: true }).save();
    res.send(`Admin Created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } catch(e) { res.send(e.message); }
});

// Register User
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;
    
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    if(await User.findOne({ mobile })) {
      return res.status(400).json({ message: "Mobile number already registered" });
    }
    
    if(await User.findOne({ email })) {
      return res.status(400).json({ message: "Email already registered" });
    }
    
    await new User({ name, email, mobile, password }).save();
    res.json({ message: "Registered Successfully" });
  } catch(e) { 
    console.error("Registration error:", e);
    res.status(500).json({ message: "Registration error" }); 
  }
});

// Login User/Admin
app.post('/api/login', async (req, res) => {
  const { email, password, identifier } = req.body;
  const loginIdentifier = email || identifier;
  
  try {
    if (!loginIdentifier || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    
    const user = await User.findOne({ $or: [{ email: loginIdentifier }, { mobile: loginIdentifier }] });
    
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    res.json({ _id: user._id, name: user.name, email: user.email, mobile: user.mobile, isAdmin: user.isAdmin });
  } catch(e) { 
    console.error("Login error:", e);
    res.status(500).json({ message: "Login error" }); 
  }
});

// Admin Login
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    
    // Check hardcoded admin credentials as fallback
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      return res.json({ 
        _id: "admin-001",
        name: "Super Admin", 
        email: ADMIN_EMAIL, 
        isAdmin: true 
      });
    }
    
    // Try database lookup
    try {
      const admin = await User.findOne({ email, isAdmin: true });
      
      if (!admin) {
        return res.status(401).json({ message: "Invalid admin email or password" });
      }
      
      if (admin.password !== password) {
        return res.status(401).json({ message: "Invalid admin email or password" });
      }
      
      res.json({ _id: admin._id, name: admin.name, email: admin.email, isAdmin: admin.isAdmin });
    } catch (dbErr) {
      // If DB fails, allow hardcoded admin
      console.warn("⚠️ DB lookup failed, using hardcoded admin");
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        return res.json({ 
          _id: "admin-001",
          name: "Super Admin", 
          email: ADMIN_EMAIL, 
          isAdmin: true 
        });
      }
      return res.status(401).json({ message: "Invalid admin email or password" });
    }
  } catch(e) { 
    console.error("Admin login error:", e);
    res.status(500).json({ message: "Admin login error" }); 
  }
});

// Get Users List (For Admin)
app.get('/api/users', async (req, res) => res.json(await User.find({})));


// === B. PRODUCT MANAGEMENT ===

// 1. Upload Image to Cloudinary
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("📤 Uploading to Cloudinary...", req.file.originalname);
    
    // Cloudinary par bhejo
    const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "skluxewear_products"
    });
    
    console.log("✅ Cloudinary upload success:", result.secure_url);
    
    // Local file delete kar do (Safayi)
    fs.unlinkSync(req.file.path);
    
    // Cloudinary ka link wapas bhejo
    res.json({ imagePath: result.secure_url });
  } catch (error) {
    console.error("❌ Upload Error:", error);
    // Local file cleanup in case of error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
    }
    res.status(500).json({ message: "Upload Failed", error: error.message });
  }
});

// 2. Add Product
app.post('/api/products', async (req, res) => {
  try {
    const product = new Product({
        name: req.body.title, 
        description: req.body.description, 
        price: Number(req.body.price),
        image: req.body.image, // Ye Cloudinary URL hoga
        category: req.body.category, 
        sizes: req.body.sizes, 
        countInStock: Number(req.body.stock)
    });
    await product.save();
    res.status(201).json(product);
  } catch(e) { res.status(500).json({message: "Error adding product"}); }
});

// 3. Get All Products
app.get('/api/products', async (req, res) => res.json(await Product.find({})));

// 4. Get Single Product
app.get('/api/products/:id', async (req, res) => res.json(await Product.findById(req.params.id)));

// 5. Delete Product
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch(e) { res.status(500).json({ message: "Error" }); }
});
 
// === UPDATE PRODUCT API (New) ===
app.put('/api/products/:id', async (req, res) => {
  try {
    console.log("📝 Updating product ID:", req.params.id, "Data:", req.body);
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name || req.body.title, // Accept both name and title
        description: req.body.description,
        price: Number(req.body.price),
        image: req.body.image,
        category: req.body.category,
        sizes: req.body.sizes,
        countInStock: Number(req.body.countInStock) || Number(req.body.stock)
      },
      { new: true }
    );
    
    console.log("✅ Product updated:", updatedProduct);
    res.json(updatedProduct);
  } catch (error) {
    console.error("❌ Update error:", error);
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
});

// === C. ORDERS & PAYMENT ===

// Create Razorpay Order
app.post('/api/payment/create', async (req, res) => { // <--- Yahan comma (,) hai, bracket nahi
  try {
    const order = await razorpay.orders.create({ amount: req.body.amount * 100, currency: "INR" });
    res.json(order);
  } catch(e) { res.status(500).send(e); }
});

// Place Order & Send Email
app.post('/api/orders/place', async (req, res) => {
  try {
    // Map customerEmail to email field for Order schema
    const orderData = {
      ...req.body,
      email: req.body.customerEmail || req.body.email // Map customerEmail to email
    };
    
    const newOrder = await new Order(orderData).save();
    
    console.log(`✅ Order created - ID: ${newOrder._id}, User: ${orderData.userId}, Email: ${orderData.email}`);
    
    // Send Email
    const mailOptions = {
      from: `"Skluxewear.in" <${EMAIL_USER}>`, 
      to: req.body.customerEmail,
      subject: `Order Confirmed - Skluxewear.in`,
      html: `
        <h2>Thank you for your order!</h2>
        <p>Order ID: ${newOrder._id}</p>
        <p>Amount: ₹${req.body.amount}</p>
        <p>Status: ${req.body.status}</p>
        <p>We will contact you soon to confirm delivery.</p>
      `
    };
    transporter.sendMail(mailOptions).catch(err => console.log("Email Failed", err));

    res.json({ _id: newOrder._id, message: "Order Placed Successfully" });
  } catch(e) { 
    console.error("Order placement error:", e);
    res.status(500).json({ message: "Error placing order", error: e.message }); 
  }
});

// Get All Orders
app.get('/api/orders', async (req, res) => res.json(await Order.find({}).sort({ createdAt: -1 })));

// Get User's Orders (by userId or email)
app.get('/api/orders/user/:identifier', async (req, res) => {
  try {
    let { identifier } = req.params;
    
    // Decode URL-encoded identifier
    identifier = decodeURIComponent(identifier);
    
    // Find orders by userId, email, or customerEmail
    const orders = await Order.find({
      $or: [
        { userId: identifier },
        { email: identifier },
        { customerEmail: identifier }
      ]
    }).sort({ createdAt: -1 });
    
    console.log(`📦 Found ${orders.length} orders for ${identifier}`);
    res.json(orders);
  } catch(e) {
    console.error("❌ Error fetching user orders:", e);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// Update Order Status
app.put('/api/orders/:id/status', async (req, res) => {
  await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
  res.json({ message: "Status Updated" });
});

// Cancel Order with Refund
app.put('/api/orders/:id/cancel', async (req, res) => {
  try {
    const { status, refundAmount, paymentMethod } = req.body;
    const order = await Order.findById(req.params.id);
    
    // Check if order is already shipped
    if (order.status === 'Shipped') {
      return res.status(400).json({ message: "Cannot cancel shipped orders" });
    }
    
    // Check if already cancelled
    if (order.status === 'Cancelled by User') {
      return res.status(400).json({ message: "Order is already cancelled" });
    }
    
    // Process refund based on payment method
    let refundStatus = "Pending";
    if (paymentMethod && paymentMethod.includes('UPI')) {
      // For online payments, initiate refund (would integrate with Razorpay refund API)
      refundStatus = "Pending"; // Will be marked as Completed after manual processing
    } else {
      // For COD, no refund needed
      refundStatus = "N/A";
    }
    
    // Update order with cancellation details
    await Order.findByIdAndUpdate(req.params.id, {
      status: status,
      refundAmount: refundAmount,
      refundStatus: refundStatus,
      cancelledAt: new Date()
    });
    
    // Send cancellation email to customer
    if (order.customerEmail) {
      await transporter.sendMail({
        from: EMAIL_USER,
        to: order.customerEmail,
        subject: `Order Cancelled - Refund Processing (Order ID: ${order._id})`,
        html: `
          <h2>Order Cancellation Confirmation</h2>
          <p>Hi ${order.customerName},</p>
          <p>Your order has been successfully cancelled.</p>
          <hr/>
          <h3>Order Details:</h3>
          <p><b>Order ID:</b> ${order._id}</p>
          <p><b>Amount:</b> ₹${refundAmount}</p>
          <p><b>Refund Status:</b> ${refundStatus}</p>
          <hr/>
          <h3>Refund Information:</h3>
          ${paymentMethod?.includes('UPI') 
            ? `<p>Your refund of <b>₹${refundAmount}</b> will be credited back to your original payment method within <b>3-5 business days</b>.</p>` 
            : `<p>As you paid via Cash on Delivery, no refund is applicable.</p>`
          }
          <p>If you have any questions, please contact our customer support.</p>
          <br/>
          <p>Thank you for shopping with us!</p>
        `
      }).catch(err => console.log("Email error:", err));
    }
    
    res.json({ 
      message: "Order cancelled successfully",
      refundStatus: refundStatus,
      refundAmount: refundAmount
    });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling order", error: error.message });
  }
});

// === DELETE ORDER API (New) ===
app.delete('/api/orders/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting order" });
  }
});

// --- START SERVER ---
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});