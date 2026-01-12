import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, History, Shield, Clock } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Receitas Digitais",
    description: "Gere receitas médicas de forma rápida e segura, com assinatura digital.",
  },
  {
    icon: History,
    title: "Histórico Completo",
    description: "Acesse todo o histórico de receitas e prescrições em um só lugar.",
  },
  {
    icon: Shield,
    title: "Segurança",
    description: "Dados protegidos com criptografia de ponta e conformidade com LGPD.",
  },
  {
    icon: Clock,
    title: "Disponível 24/7",
    description: "Acesse o portal a qualquer momento, de qualquer dispositivo.",
  },
];

export default function Index() {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Gestão Médica{" "}
              <span className="text-primary">Simplificada</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Plataforma completa para profissionais de saúde gerenciarem receitas, 
              prescrições e histórico de pacientes com segurança e eficiência.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/cadastro">
                <Button variant="hero" size="xl">
                  Começar Agora
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="xl">
                  Já tenho conta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Por que escolher o MedPortal?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ferramentas desenvolvidas para otimizar seu dia a dia na prática médica.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-xl bg-background border border-border hover:shadow-card transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center p-8 md:p-12 rounded-2xl gradient-primary shadow-elevated">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
              Pronto para transformar sua prática médica?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Junte-se a milhares de profissionais que já utilizam o MedPortal.
            </p>
            <Link to="/cadastro">
              <Button variant="secondary" size="xl" className="font-semibold">
                Criar conta gratuita
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
