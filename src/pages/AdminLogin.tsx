import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(""); // Reset error
    
    if (!email.trim() || !password.trim()) {
      toast.error("Email and password are required");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      console.log("🔐 Admin Login Attempt with:", { email, password });

      const response = await fetch("https://satyam-production-066b.up.railway.app/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email.trim(), 
          password: password.trim() 
        }),
      });

      const data = await response.json();
      console.log("📦 API Response:", { status: response.status, data });

      if (!response.ok) {
        const errorMsg = data.message || "Incorrect Email or Password";
        setLoginError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      if (data.isAdmin === true || data?.isAdmin) {
        // Successful admin login
        sessionStorage.setItem("sambhai-admin", "true");
        sessionStorage.setItem("adminData", JSON.stringify(data));
        sessionStorage.setItem("userInfo", JSON.stringify(data)); // Also set userInfo for profile
        toast.success("✅ Admin Login Successful!");
        console.log("✅ Redirecting to /admin");
        setLoginError("");
        setTimeout(() => {
          setLoading(false);
          navigate("/admin");
        }, 300);
      } else {
        const errorMsg = "❌ Not an admin account";
        setLoginError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
      }
    } catch (error) {
      console.error("💥 Login Error:", error);
      const errorMsg = "Connection error. Please try again.";
      setLoginError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-green-500">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ✅ ERROR MESSAGE DISPLAY */}
              {loginError && (
                <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded text-sm">
                  {loginError}
                </div>
              )}

              <div className="bg-green-900/30 border border-green-700 rounded p-3 mb-4 text-sm text-green-300">
                <p className="font-bold">📝 Default Credentials:</p>
                <p>Email: <span className="font-mono">admin@gmail.com</span></p>
                <p>Password: <span className="font-mono">admin123</span></p>
              </div>

              <div>
                <Label className="text-gray-300">Email Address</Label>
                <Input
                  type="email"
                  placeholder="admin@gmail.com"
                  className="bg-black border-gray-700 text-white mt-1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label className="text-gray-300">Password</Label>
                <div className="relative mt-1">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    className="bg-black border-gray-700 text-white pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {/* ✅ SHOW/HIDE PASSWORD TOGGLE */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
                disabled={loading}
              >
                {loading ? "Checking..." : "Login Now"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default AdminLogin;