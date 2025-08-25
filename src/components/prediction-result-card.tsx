"use client";

import { useState } from "react";
import Image from "next/image";
import { generateDiseaseInfo } from "@/ai/flows/generate-disease-info";
import type { GenerateDiseaseInfoOutput } from "@/ai/flows/generate-disease-info";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle, Leaf, Bot } from "lucide-react";

export type Prediction = {
  disease: string;
  confidence: number;
  isHealthy?: boolean;
};

type PredictionResultCardProps = {
  prediction: Prediction;
  previewUrl: string;
};

export default function PredictionResultCard({ prediction, previewUrl }: PredictionResultCardProps) {
  const [diseaseInfo, setDiseaseInfo] = useState<GenerateDiseaseInfoOutput | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confidencePercent = Math.round(prediction.confidence * 100);

  const fetchDiseaseInfo = async () => {
    if (diseaseInfo || prediction.isHealthy) return;
    
    setIsLoadingInfo(true);
    setError(null);
    try {
      const info = await generateDiseaseInfo({ diseaseName: prediction.disease });
      setDiseaseInfo(info);
    } catch (e) {
      setError("Could not fetch disease information. Please try again later.");
      console.error(e);
    } finally {
      setIsLoadingInfo(false);
    }
  };

  const getStatusIcon = () => {
    if (prediction.isHealthy) {
        return <CheckCircle className="w-6 h-6 text-green-600" />;
    }
    return <AlertCircle className="w-6 h-6 text-orange-500" />;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative w-full h-48">
            <Image
                src={previewUrl}
                alt="Uploaded leaf"
                layout="fill"
                objectFit="cover"
                className="opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
        </div>
        <div className="p-6">
            <CardTitle className="text-2xl font-headline flex items-center gap-3">
                {getStatusIcon()}
                <span>Prediction: {prediction.disease}</span>
            </CardTitle>
            <CardDescription className="mt-1">
                Our AI model has analyzed the provided image.
            </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-6 space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-muted-foreground">Confidence Score</span>
            <Badge variant={prediction.isHealthy ? "secondary" : "destructive"}>{confidencePercent}%</Badge>
          </div>
          <Progress value={confidencePercent} aria-label={`${confidencePercent}% confidence`} />
        </div>
      </CardContent>
      {!prediction.isHealthy && (
        <CardFooter className="p-0">
            <Accordion type="single" collapsible className="w-full" onValueChange={fetchDiseaseInfo}>
                <AccordionItem value="item-1" className="border-t">
                    <AccordionTrigger className="px-6 py-4 text-primary hover:no-underline">
                        <div className="flex items-center gap-2">
                            <Leaf className="w-4 h-4" />
                            <span>Learn more about {prediction.disease}</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 text-card-foreground/80">
                        {isLoadingInfo && (
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        )}
                        {error && <p className="text-destructive">{error}</p>}
                        {diseaseInfo && (
                            <div className="prose prose-sm max-w-none">
                                <p>{diseaseInfo.summary}</p>
                                <div className="text-xs text-muted-foreground mt-4 flex items-center gap-2">
                                    <Bot size={14}/>
                                    <span>AI-generated summary. Always consult with a plant health expert for critical cases.</span>
                                </div>
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </CardFooter>
      )}
    </Card>
  );
}
