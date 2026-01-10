// src/pages/UserLogin.tsx

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const UserLogin = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoginError(""); // Reset error
    
    if (!identifier || !password) {
      toast.error("Please enter email/mobile and password");
      return;
    }

    // ✅ VALIDATION: Check if email or phone format is valid
    if (!isValidEmailOrPhone(identifier)) {
      toast.error("Please enter a valid email or 10-digit mobile number");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    try {
      const res = await fetch("https://satyam-production-066b.up.railway.app/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: identifier, password }),
      });

      const data = await res.json();

      if (res.ok) {
        sessionStorage.setItem("userInfo", JSON.stringify(data));
        if (data.isAdmin) {
            sessionStorage.setItem("sambhai-admin", "true");
            navigate("/admin");
        } else {
            navigate("/profile");
        }
        toast.success("Login Successful!");
        setLoginError("");
      } else {
        // ✅ WRONG CREDENTIALS ERROR
        const errorMsg = data.message || "Incorrect Email/Mobile or Password";
        setLoginError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error(error);
      const errorMsg = "Login failed. Please try again.";
      setLoginError(errorMsg);
      toast.error(errorMsg);
    }
  };

  // ✅ VALIDATE EMAIL OR PHONE
  const isValidEmailOrPhone = (value: string) => {
    // Check if it's a valid email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(value)) return true;

    // Check if it's a valid 10-digit phone
    const phoneRegex = /^[0-9]{10}$/;
    const cleanPhone = value.replace(/[^0-9]/g, '');
    return phoneRegex.test(cleanPhone);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md bg-gray-900 border-gray-800 text-white">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-green-500">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ✅ ERROR MESSAGE DISPLAY */}
              {loginError && (
                <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded text-sm">
                  {loginError}
                </div>
              )}

              <div>
                <Label className="text-gray-300">Email / Mobile (10 digits)</Label>
                <Input 
                  className="bg-black border-gray-700 text-white" 
                  placeholder="example@gmail.com or 9876543210"
                  value={identifier} 
                  onChange={(e) => setIdentifier(e.target.value)} 
                  required 
                />
                {identifier && !isValidEmailOrPhone(identifier) && <p className="text-red-500 text-xs mt-1">Invalid email or phone format</p>}
              </div>

              <div>
                <Label className="text-gray-300">Password (min 6 characters)</Label>
                <div className="relative">
                  <Input 
                    className="bg-black border-gray-700 text-white pr-10" 
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
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
                {password && password.length < 6 && <p className="text-red-500 text-xs mt-1">Password too short</p>}
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Login</Button>
            </form>
            
            <p className="text-center mt-4 text-sm text-gray-400">
              New here? <Link to="/signup" className="text-green-400 font-bold hover:underline">Create Account</Link>
            </p>
          
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default UserLogin;