import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Music2,
  Cpu,
  Radio,
  TrendingUp,
  Zap,
  ArrowRight,
} from "lucide-react";
import logoUrl from "@assets/ChatGPT_Image_Feb_7,_2026,_11_31_15_PM_1770526963729.png";

const features = [
  {
    icon: Cpu,
    title: "AI-Powered A&R",
    description:
      "Our intelligent scout analyzes trends and discovers breakthrough AI artists before anyone else.",
  },
  {
    icon: Music2,
    title: "Full Label Services",
    description:
      "From signing to distribution, marketing to streaming - everything an AI artist needs to succeed.",
  },
  {
    icon: Radio,
    title: "Live Streaming",
    description:
      "Virtual concerts and live DJ sets from AI artists, streamed directly to fans worldwide.",
  },
  {
    icon: TrendingUp,
    title: "Smart Marketing",
    description:
      "AI-driven promotional campaigns that find and engage the perfect audience for each artist.",
  },
  {
    icon: Zap,
    title: "Real-Time Analytics",
    description:
      "Track performance, engagement, and growth with advanced data visualization dashboards.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <img
              src={logoUrl}
              alt="DNA Records"
              className="w-9 h-9 rounded-md object-cover"
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wider">DNA</span>
              <span className="text-[9px] tracking-[0.3em] text-primary font-medium">
                RECORDS
              </span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
          </div>
          <a href="/api/login">
            <Button data-testid="button-login">
              Enter the Lab
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </a>
        </div>
      </nav>

      <section className="relative pt-24 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 dark:opacity-20"
          style={{ backgroundImage: "url(/images/hero-bg.png)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-primary/3 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-float-up">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-neon-pulse" />
                <span className="text-xs font-medium text-primary tracking-wider">
                  A DIVISION OF PROJECT DNA MUSIC
                </span>
              </div>

              <h1
                className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-float-up"
                style={{ animationDelay: "0.1s" }}
              >
                The Future of
                <br />
                <span className="text-primary neon-glow">AI Music</span>
                <br />
                Starts Here
              </h1>

              <p
                className="text-lg md:text-xl text-muted-foreground max-w-xl mb-8 animate-float-up"
                style={{ animationDelay: "0.2s" }}
              >
                The world's first AI-powered record label. We sign, produce, and
                promote virtual artists using cutting-edge agentic technology -
                with human oversight on every decision.
              </p>

              <div
                className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start animate-float-up"
                style={{ animationDelay: "0.3s" }}
              >
                <a href="/api/login">
                  <Button size="lg" data-testid="button-get-started">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </a>
                <a href="#features">
                  <Button size="lg" variant="outline">
                    Explore Features
                  </Button>
                </a>
              </div>

              <div
                className="flex items-center gap-6 mt-8 justify-center lg:justify-start text-sm text-muted-foreground animate-float-up"
                style={{ animationDelay: "0.4s" }}
              >
                <span className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Free to explore
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Human verified
                </span>
              </div>
            </div>

            <div
              className="flex-1 max-w-md lg:max-w-lg animate-float-up"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-primary/10 rounded-2xl blur-2xl" />
                <img
                  src={logoUrl}
                  alt="DNA Records"
                  className="relative w-full rounded-xl ring-1 ring-border/30"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powered by <span className="text-primary">Advanced AI</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every aspect of the label is enhanced by artificial intelligence,
              from discovering new talent to marketing releases worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <Card
                key={feature.title}
                className="p-6 hover-elevate group"
              >
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-20 border-t border-border/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Human Oversight. <span className="text-primary">AI Innovation.</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8">
            We believe in the power of AI to revolutionize the music industry,
            but every major decision passes through human verification. Our
            agentic technology handles the heavy lifting while our team ensures
            quality, ethics, and artistic integrity in everything we release.
          </p>
          <a href="/api/login">
            <Button size="lg" data-testid="button-join-label">
              Join the Label
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </a>
        </div>
      </section>

      <footer className="border-t border-border/30 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src={logoUrl}
              alt="DNA Records"
              className="w-6 h-6 rounded-sm object-cover"
            />
            <span className="text-sm text-muted-foreground">
              DNA Records - A Division of Project DNA Music
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
