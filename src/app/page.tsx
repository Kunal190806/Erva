import DiseasePredictor from "@/components/disease-predictor";
import { Leaf } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-primary text-primary-foreground rounded-full w-16 h-16 mb-4">
            <Leaf size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Erva</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Your AI-powered assistant for plant health.
          </p>
        </div>
        <DiseasePredictor />
      </div>
      <footer className="text-center p-4 text-muted-foreground mt-8 text-sm">
        © {new Date().getFullYear()} Erva. All Rights Reserved.
      </footer>
    </main>
  );
}
