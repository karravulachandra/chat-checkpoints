
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { ArrowRight, CheckCircle2, Shield, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight animate-fadeIn">
            Chat with your Documents
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto animate-fadeIn">
            Upload your PDFs and interact with them through intelligent checkpoints. Get instant insights and answers from your documents.
          </p>
          <div className="mt-10 animate-scaleIn">
            <Link to="/register">
              <Button size="lg" className="px-8">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Powerful Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl border bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Simple, Transparent Pricing
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={plan.name}
                className="p-8 rounded-xl border bg-white hover:shadow-lg transition-all duration-300 animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <h3 className="text-2xl font-semibold mb-4">{plan.name}</h3>
                <p className="text-4xl font-bold mb-6">${plan.price}</p>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.recommended ? "default" : "outline"}
                  className="w-full"
                >
                  Get Started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Get in Touch</h2>
          <p className="text-gray-600 mb-8">
            Have questions? We're here to help. Contact our support team anytime.
          </p>
          <Button size="lg">Contact Support</Button>
        </div>
      </section>
    </div>
  );
};

const features = [
  {
    title: "PDF Processing",
    description: "Upload and process your PDFs instantly with our advanced processing engine.",
    icon: Zap,
  },
  {
    title: "Smart Checkpoints",
    description: "Create and customize checkpoints to extract exactly what you need from your documents.",
    icon: CheckCircle2,
  },
  {
    title: "Secure Storage",
    description: "Your documents are encrypted and stored securely with enterprise-grade security.",
    icon: Shield,
  },
];

const pricingPlans = [
  {
    name: "Basic",
    price: "0",
    features: [
      "5 PDF uploads per month",
      "Basic checkpoints",
      "24-hour support",
    ],
  },
  {
    name: "Pro",
    price: "29",
    recommended: true,
    features: [
      "Unlimited PDF uploads",
      "Advanced checkpoints",
      "Priority support",
      "Custom integrations",
    ],
  },
  {
    name: "Enterprise",
    price: "99",
    features: [
      "Everything in Pro",
      "Dedicated support",
      "Custom development",
      "SLA guarantee",
    ],
  },
];

export default Index;
