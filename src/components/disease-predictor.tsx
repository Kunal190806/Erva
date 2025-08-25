"use client";

import { useState, useCallback, useMemo } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileImage, Loader, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import PredictionResultCard from "@/components/prediction-result-card";
import type { Prediction } from "@/components/prediction-result-card";

type Status = "idle" | "preview" | "loading" | "result" | "error";

const possibleResults: Prediction[] = [
  { disease: 'Healthy', confidence: 0.98, isHealthy: true },
  { disease: 'Powdery Mildew', confidence: 0.92 },
  { disease: 'Leaf Rust', confidence: 0.87 },
  { disease: 'Early Blight', confidence: 0.95 },
  { disease: 'Late Blight', confidence: 0.89 },
];

export default function DiseasePredictor() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };
  
  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragEvents = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setStatus("error");
      toast({
        title: "Invalid File",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setStatus("preview");
  };

  const handlePredict = () => {
    setStatus("loading");
    setTimeout(() => {
      const result = possibleResults[Math.floor(Math.random() * possibleResults.length)];
      setPrediction(result);
      setStatus("result");
    }, 2000); // Simulate network delay
  };

  const handleReset = () => {
    setImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPrediction(null);
    setStatus("idle");
  };
  
  const Uploader = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      key="uploader"
      className="w-full"
    >
      <label
        htmlFor="image-upload"
        onDrop={handleDrop}
        onDragEnter={handleDragEvents}
        onDragOver={handleDragEvents}
        onDragLeave={handleDragEvents}
        className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition-colors duration-300 ${isDragging ? 'border-primary' : 'border-border'}`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadCloud className={`w-10 h-10 mb-3 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
          <p className="mb-2 text-sm text-muted-foreground">
            <span className="font-semibold text-primary">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP</p>
        </div>
        <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
      </label>
    </motion.div>
  );

  const Previewer = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      key="previewer"
      className="w-full text-center"
    >
        <div className="relative w-full max-w-sm mx-auto mb-4 rounded-lg overflow-hidden shadow-lg border border-border">
            <img src={previewUrl!} alt="Image preview" className="w-full h-auto object-cover" />
            <Button variant="destructive" size="icon" className="absolute top-2 right-2 rounded-full h-8 w-8" onClick={handleReset}>
                <X size={16} />
                <span className="sr-only">Clear image</span>
            </Button>
        </div>
        {image && (
            <div className="flex items-center justify-center text-sm text-muted-foreground mb-4">
                <FileImage className="w-4 h-4 mr-2" />
                <span>{image.name}</span>
            </div>
        )}
        <Button onClick={handlePredict} size="lg" className="font-semibold">
            Analyze Leaf
        </Button>
    </motion.div>
  );

  const LoaderAnimation = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        key="loader"
        className="text-center p-8 flex flex-col items-center justify-center space-y-4"
    >
        <Loader className="w-12 h-12 text-primary animate-spin" />
        <p className="text-lg text-muted-foreground">Analyzing leaf...</p>
    </motion.div>
  );
  
  const Result = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      key="result"
      className="w-full"
    >
      {prediction && <PredictionResultCard prediction={prediction} previewUrl={previewUrl!} />}
      <div className="text-center mt-6">
        <Button onClick={handleReset} variant="outline">Analyze Another Leaf</Button>
      </div>
    </motion.div>
  );

  const currentView = useMemo(() => {
    switch (status) {
      case 'preview': return <Previewer />;
      case 'loading': return <LoaderAnimation />;
      case 'result': return <Result />;
      case 'idle':
      case 'error':
      default: return <Uploader />;
    }
  }, [status, previewUrl, prediction]);

  return (
    <div className="w-full bg-card rounded-xl shadow-md p-4 sm:p-8 min-h-[24rem] flex items-center justify-center">
      <AnimatePresence mode="wait">
        {currentView}
      </AnimatePresence>
    </div>
  );
}
