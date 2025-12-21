import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "", email: "", mobile: "", password: ""
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // ✅ VALIDATION CHECKS
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!formData.email || !isValidEmail(formData.email)) {
      toast.error("Please enter a valid email (example@gmail.com)");
      return;
    }

    if (!formData.mobile || !isValidPhone(formData.mobile)) {
      toast.error("Mobile must be 10 digits (9876543210)");
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Account Created! Please Login.");
        navigate("/user-login"); 
      } else {
        toast.error(data.message || "Registration Failed");
      }
    } catch (error) {
      toast.error("Server Error");
    }
  };

  // ✅ EMAIL VALIDATION
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // ✅ PHONE VALIDATION (10 DIGITS)
  const isValidPhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/[^0-9]/g, ''));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-8 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Create Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
                {formData.name && !formData.name.trim() && <p className="text-red-500 text-xs mt-1">Name cannot be empty</p>}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="example@gmail.com" value={formData.email} onChange={handleChange} />
                {formData.email && !isValidEmail(formData.email) && <p className="text-red-500 text-xs mt-1">Invalid email format</p>}
              </div>
              <div>
                <Label htmlFor="mobile">Mobile Number (10 digits)</Label>
                <Input id="mobile" type="tel" placeholder="9876543210" value={formData.mobile} onChange={handleChange} maxLength={10} required />
                {formData.mobile && !isValidPhone(formData.mobile) && <p className="text-red-500 text-xs mt-1">Must be 10 digits</p>}
              </div>
              <div>
                <Label htmlFor="password">Password (min 6 characters)</Label>
                <Input id="password" type="password" placeholder="Enter password" value={formData.password} onChange={handleChange} required />
                {formData.password && formData.password.length < 6 && <p className="text-red-500 text-xs mt-1">Password too short (min 6)</p>}
              </div>
              <Button type="submit" className="w-full">Sign Up</Button>
            </form>
            <p className="text-center mt-4 text-sm">Already have an account? <Link to="/user-login" className="text-primary font-bold">Login</Link></p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default SignUp;