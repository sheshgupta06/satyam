import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Terms and Conditions</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using Skluxewear.in, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Use License</h2>
              <p className="text-muted-foreground">
                Permission is granted to temporarily download one copy of the materials on Skluxewear.in for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. User Account</h2>
              <p className="text-muted-foreground">
                You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Product Information</h2>
              <p className="text-muted-foreground">
                We strive to provide accurate product descriptions and pricing. However, we do not warrant that product descriptions, pricing, or other content is accurate, complete, reliable, current, or error-free.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Orders and Payments</h2>
              <p className="text-muted-foreground">
                All orders are subject to availability and confirmation of the order price. We reserve the right to refuse any order placed through the website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Returns and Refunds</h2>
              <p className="text-muted-foreground">
                Products can be returned within 7 days of delivery for a full refund, provided they are in original condition with tags attached. Shipping costs are non-refundable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Privacy Policy</h2>
              <p className="text-muted-foreground">
                Your privacy is important to us. We collect and use your personal information only to process your orders and improve your shopping experience.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                Skluxewear.in shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of or inability to use the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. Please review these terms periodically for changes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Contact Information</h2>
              <p className="text-muted-foreground">
                For questions about these Terms and Conditions, please contact us at Satyamverma1933@gmail.com
              </p>
            </section>

            <p className="text-sm text-muted-foreground mt-8 pt-8 border-t">
              Last updated: November 20, 2025
            </p>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
