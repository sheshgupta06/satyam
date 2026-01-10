import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Package, ShoppingBag, LogOut, Users, Trash2, MapPin, Phone, Box, Edit, X, ExternalLink } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("products");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Form Data
  const [formData, setFormData] = useState({ title: "", description: "", price: "", category: "Men", sizes: "", stock: "", image: "" });
  const [uploading, setUploading] = useState(false);
  
  // ✅ EDIT MODE STATE (Ye batayega ki hum update kar rahe hain ya naya add)
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionStorage.getItem("sambhai-admin")) navigate("/admin-login");
    fetchData();
  }, []);

  const fetchData = async (isManual = false) => {
    try {
        const [ordersRes, productsRes, usersRes] = await Promise.all([
            fetch("https://satyam-production-066b.up.railway.app/api/orders"),
            fetch("https://satyam-production-066b.up.railway.app/api/products"),
            fetch("https://satyam-production-066b.up.railway.app/api/users")
        ]);
        setOrders(await ordersRes.json());
        setProducts(await productsRes.json());
        setUsers(await usersRes.json());
        if (isManual) toast.success("✅ Data Refreshed!");
    } catch (error) { if (isManual) toast.error("Refresh Failed"); }
  };

  const uploadFileHandler = async (e: any) => {
    const file = e.target.files[0];
    if(!file) return;
    const fd = new FormData();
    fd.append("image", file);
    setUploading(true);
    try {
        const res = await fetch("https://satyam-production-066b.up.railway.app/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        setFormData({ ...formData, image: data.imagePath });
        toast.success("Image Uploaded");
    } catch(err) { toast.error("Upload Failed"); }
    setUploading(false);
  };

  // ✅ MAIN FUNCTION: ADD YA UPDATE (Dono yahan handle honge)
  const handleSubmitProduct = async (e: any) => {
    e.preventDefault();

    // Agar Editing ID hai, to UPDATE karo
    if (editingId) {
        try {
            console.log("🔄 Updating product:", { editingId, formData });
            
            // Transform title to name for backend
            const updateData = {
                name: formData.title,
                description: formData.description,
                price: Number(formData.price),
                category: formData.category,
                sizes: formData.sizes,
                countInStock: Number(formData.stock),
                image: formData.image
            };

            const res = await fetch(`https://satyam-production-066b.up.railway.app/api/products/${editingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updateData)
            });
            
            console.log("✅ Update Response:", res.status);
            
            if (res.ok) {
                toast.success("Product Updated Successfully! 🔄");
                setEditingId(null); // Edit mode band
                setFormData({ title: "", description: "", price: "", category: "Men", sizes: "", stock: "", image: "" });
                fetchData();
            } else {
                const error = await res.text();
                console.error("❌ Update failed:", error);
                toast.error("Update Failed: " + error);
            }
        } catch (error) { 
            console.error("Error:", error);
            toast.error("Server Error"); 
        }
    } 
    // Agar Editing ID nahi hai, to NEW ADD karo
    else {
        try {
            const res = await fetch("https://satyam-production-066b.up.railway.app/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if(res.ok) {
                toast.success("Product Added!");
                setFormData({ title: "", description: "", price: "", category: "Men", sizes: "", stock: "", image: "" });
                fetchData();
            }
        } catch (error) { toast.error("Server Error"); }
    }
  };

  // ✅ EDIT BUTTON CLICKED
  const handleEditClick = (product: any) => {
    setEditingId(product._id); // ID set karo
    setFormData({
        title: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        sizes: product.sizes,
        stock: product.countInStock,
        image: product.image
    });
    // Upar scroll karo taaki form dikhe
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.info("Editing Mode ON ✏️");
  };

  // ✅ CANCEL EDIT
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ title: "", description: "", price: "", category: "Men", sizes: "", stock: "", image: "" });
  };

  const handleDeleteProduct = async (id: string) => {
    if(confirm("Delete this product?")) {
        await fetch(`https://satyam-production-066b.up.railway.app/api/products/${id}`, { method: "DELETE" });
        toast.success("Deleted");
        fetchData();
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if(confirm("Delete this order?")) {
        try {
            await fetch(`https://satyam-production-066b.up.railway.app/api/orders/${id}`, { method: "DELETE" });
            toast.success("Order Deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete order");
        }
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`https://satyam-production-066b.up.railway.app/api/orders/${id}/status`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status })
    });
    toast.success(`Status: ${status}`);
    fetchData();
  };

    // Generate printable order slip and open print dialog (admin can Save as PDF)
    const downloadOrderPdf = (order: any) => {
        try {
            const itemsHtml = (order.items || []).map((it: any) => {
                const name = it.title || it.name || it.productName || it.product || '';
                return `<tr style="border-bottom:1px solid #ddd"><td style="padding:8px">${name}</td><td style="padding:8px;text-align:center">${it.size || ''}</td><td style="padding:8px;text-align:center">${it.quantity}</td><td style="padding:8px;text-align:right">₹${(it.price || 0) * (it.quantity || 1)}</td></tr>`;
            }).join('');

            const address = order.customerAddress || '';
            const phone = order.customerPhone || '';
            const html = `
                <html>
                    <head>
                        <title>Order-${order._id}</title>
                        <meta name="viewport" content="width=device-width, initial-scale=1" />
                        <style>body{font-family:Arial,Helvetica,sans-serif;padding:20px;color:#111;background:#fff}h1{color:#0f5132}table{width:100%;border-collapse:collapse}td,th{padding:8px} .muted{color:#666;font-size:0.9rem}</style>
                    </head>
                    <body>
                        <h1>Order Slip - #${order._id.slice(-8)}</h1>
                        <p class="muted">Name: ${order.customerName || ''} | Phone: ${phone}</p>
                        <p class="muted">Address: ${address}</p>
                        <p class="muted">Payment: ${order.paymentMethod || order.payment || 'N/A'} | Status: ${order.status || 'N/A'}</p>
                        <hr />
                        <h3>Items</h3>
                        <table>
                            <thead><tr style="text-align:left;background:#f6f6f6"><th style="padding:8px">Item</th><th style="padding:8px;text-align:center">Size</th><th style="padding:8px;text-align:center">Qty</th><th style="padding:8px;text-align:right">Total</th></tr></thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>
                        <hr />
                        <h3 style="text-align:right">Grand Total: ₹${order.amount}</h3>
                        <p style="font-size:0.85rem;color:#444">Generated on: ${new Date().toLocaleString()}</p>
                    </body>
                </html>
            `;

            const newWin = window.open('', '_blank', 'width=800,height=900');
            if (!newWin) { toast.error('Popup blocked - allow popups to download PDF'); return; }
            newWin.document.write(html);
            newWin.document.close();
            // Give browser a moment then trigger print
            setTimeout(() => {
                newWin.focus();
                newWin.print();
            }, 500);
        } catch (err) {
            console.error('PDF generation failed', err);
            toast.error('Failed to generate PDF');
        }
    };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />
            <div className="flex flex-1 container mx-auto px-4 py-8 gap-6">
                {/* Mobile admin menu (visible on small screens) - fixed compact bar */}
                <div className="fixed top-16 left-0 right-0 z-40 md:hidden bg-gray-900/95 border-b border-gray-800 py-2">
                  <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant={activeTab==="products"?"secondary":"ghost"} onClick={()=>setActiveTab("products")} title="Products">
                          <Package className="h-5 w-5"/>
                        </Button>
                        <Button size="icon" variant={activeTab==="orders"?"secondary":"ghost"} onClick={()=>setActiveTab("orders")} title="Orders">
                          <ShoppingBag className="h-5 w-5"/>
                        </Button>
                        <Button size="icon" variant={activeTab==="users"?"secondary":"ghost"} onClick={()=>setActiveTab("users")} title="Users">
                          <Users className="h-5 w-5"/>
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost" onClick={()=>fetchData(true)} title="Refresh">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12a9 9 0 1 0-2.5 6.1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </Button>
                        <Button size="icon" variant="destructive" onClick={()=>{sessionStorage.clear(); navigate("/admin-login")}} title="Logout">
                          <LogOut className="h-5 w-5"/>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-14 md:hidden" />
        
        {/* SIDEBAR */}
        <aside className="w-64 bg-gray-900 border border-gray-800 p-4 rounded-lg hidden md:block h-fit">
            <h2 className="font-bold mb-4 text-green-400 text-xl">Admin Panel</h2>
            <Button variant={activeTab==="products"?"secondary":"ghost"} onClick={()=>setActiveTab("products")} className="w-full justify-start mb-2 text-white hover:text-green-400"><Package className="mr-2 h-4 w-4"/> Products</Button>
            <Button variant={activeTab==="orders"?"secondary":"ghost"} onClick={()=>setActiveTab("orders")} className="w-full justify-start mb-2 text-white hover:text-green-400"><ShoppingBag className="mr-2 h-4 w-4"/> Orders</Button>
            <Button variant={activeTab==="users"?"secondary":"ghost"} onClick={()=>setActiveTab("users")} className="w-full justify-start mb-2 text-white hover:text-green-400"><Users className="mr-2 h-4 w-4"/> Users</Button>
            <Button variant={activeTab==="users"?"secondary":"ghost"} onClick={()=>fetchData(true)} className="w-full justify-start mb-2 text-white hover:text-green-400">🔄 Refresh Data</Button>
            <Button variant="destructive" onClick={()=>{sessionStorage.clear(); navigate("/admin-login")}} className="w-full justify-start mt-4"><LogOut className="mr-2 h-4 w-4"/> Logout</Button>
        </aside>

        <main className="flex-1 bg-gray-900 border border-gray-800 p-6 rounded-lg">
            
            {/* --- PRODUCTS TAB --- */}
            {activeTab === "products" && (
                <div>
                    {/* FORM HEADER (Add ya Edit) */}
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-green-400">
                            {editingId ? "✏️ Update Product" : "➕ Add New Product"}
                        </h2>
                        {editingId && (
                            <Button size="sm" variant="outline" onClick={handleCancelEdit} className="text-red-400 border-red-900 hover:bg-red-900/20">
                                <X className="w-4 h-4 mr-2"/> Cancel Edit
                            </Button>
                        )}
                    </div>

                    <form onSubmit={handleSubmitProduct} className="space-y-4 mb-8 border-b border-gray-700 pb-8">
                        <div className="bg-black border border-gray-700 p-3 rounded"><Input type="file" onChange={uploadFileHandler} className="bg-gray-900 text-white"/>{uploading && <p className="text-yellow-400 text-xs">Uploading...</p>}{formData.image && <img src={formData.image} className="h-16 mt-2 border border-green-500 rounded" alt="preview"/>}</div>
                        <Input className="bg-black border-gray-700 text-white" placeholder="Title" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} required/>
                        <Input className="bg-black border-gray-700 text-white" placeholder="Description" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} required/>
                        <div className="flex gap-2"><Input className="bg-black border-gray-700 text-white" type="number" placeholder="Price" value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value})} required/><Input className="bg-black border-gray-700 text-white" type="number" placeholder="Stock" value={formData.stock} onChange={e=>setFormData({...formData, stock: e.target.value})} required/></div>
                        <div className="flex gap-2">
                             <select className="flex h-10 w-full rounded-md border border-gray-700 bg-black px-3 py-2 text-sm text-white" value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})}><option value="Men">Men</option><option value="Women">Women</option><option value="Kids">Kids</option></select>
                             <Input className="bg-black border-gray-700 text-white" placeholder="Sizes" value={formData.sizes} onChange={e=>setFormData({...formData, sizes: e.target.value})} required/>
                        </div>
                        
                        {/* Button Text Change */}
                        <Button type="submit" className={`w-full text-white ${editingId ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}`} disabled={uploading}>
                            {editingId ? "Update Product" : "Add Product"}
                        </Button>
                    </form>

                    <h3 className="font-bold text-white mb-4">All Products</h3>
                    {products.map((p: any) => (
                        <div key={p._id} className="flex justify-between items-center bg-black border border-gray-700 p-3 rounded mb-2">
                            <div className="flex items-center gap-3">
                                <img src={p.image} className="h-12 w-12 object-cover rounded" alt={p.name} />
                                <div><p className="font-bold text-white">{p.name}</p><p className="text-xs text-gray-400">{p.category} | ₹{p.price}</p></div>
                            </div>
                            <div className="flex gap-2">
                                {/* ✅ EDIT BUTTON */}
                                <Button size="sm" variant="outline" className="text-blue-400 border-blue-900 hover:bg-blue-900/20" onClick={() => handleEditClick(p)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                {/* DELETE BUTTON */}
                                <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(p._id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- ORDERS TAB (Fixed Black Screen Issue) --- */}
            {activeTab === "orders" && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-green-400 mb-4">Orders</h2>
                    {orders.length === 0 ? <p className="text-gray-500">No orders yet.</p> : null}
                    {orders.map((order: any) => (
                        <div key={order._id} className="border border-gray-700 p-4 rounded bg-black flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-white text-lg">Order #{order._id.slice(-6)}</p>
                                    <p className="text-gray-300">{order.customerName}</p>
                                    {order.customerPhone && <p className="text-gray-400 text-sm flex items-center mt-1"><Phone className="w-3 h-3 mr-1"/> {order.customerPhone}</p>}
                                    {order.customerAddress && <p className="text-gray-400 text-sm flex items-center mt-1"><MapPin className="w-3 h-3 mr-1"/> {order.customerAddress}</p>}
                                    <p className="text-green-400 font-bold mt-2">Total: ₹{order.amount}</p>
                                    <p className={`text-sm mt-1 ${order.status === 'Delivered' ? 'text-green-500' : 'text-blue-400'}`}>Status: {order.status}</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="text-black bg-gray-200 hover:bg-white border-none" onClick={()=>updateStatus(order._id, "Shipped")}>Ship</Button>
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={()=>updateStatus(order._id, "Delivered")}>Deliver</Button>
                                    </div>
                                                                        <div className="flex flex-col gap-2">
                                                                            <Button size="sm" variant="destructive" onClick={() => handleDeleteOrder(order._id)}><Trash2 className="h-4 w-4 mr-2" /> Delete</Button>
                                                                            <Button size="sm" variant="outline" onClick={() => downloadOrderPdf(order)} className="text-white border border-gray-700 hover:bg-gray-800"><ExternalLink className="h-4 w-4 mr-2"/> Download PDF</Button>
                                                                        </div>
                                </div>
                            </div>

                            {/* Item List with Product Links */}
                            <div className="bg-gray-900 p-3 rounded border border-gray-800 mt-2">
                                <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase flex items-center gap-1"><Box className="w-3 h-3"/> Items to Pack:</h4>
                                {order.items && order.items.map((item: any, idx: number) => (
                                    <Link to={`/product/${item.productId || item.id}`} key={idx} className="flex items-center justify-between gap-3 mb-2 p-2 rounded hover:bg-gray-800 transition-all group cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <img src={item.image} className="h-10 w-10 rounded border border-gray-700 object-cover group-hover:border-green-500 transition-all" alt={item.name} />
                                            <div className="text-sm">
                                                <p className="text-white font-medium group-hover:text-green-400 transition-colors">{item.title || item.name}</p>
                                                <p className="text-gray-400 text-xs">Size: {item.size} | Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-green-400 transition-colors" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
                <div>
                    <h2 className="text-xl font-bold text-green-400 mb-4">Customers</h2>
                    {users.map((u: any) => (
                        <div key={u._id} className="border-b border-gray-800 p-2 text-gray-300">
                            {u.name} - {u.mobile}
                        </div>
                    ))}
                </div>
            )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;