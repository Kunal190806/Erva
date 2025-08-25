'use server';

/**
 * @fileOverview An AI agent to generate a summary of information about a predicted plant disease.
 *
 * - generateDiseaseInfo - A function that handles the generation of disease information.
 * - GenerateDiseaseInfoInput - The input type for the generateDiseaseInfo function.
 * - GenerateDiseaseInfoOutput - The return type for the generateDiseaseInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDiseaseInfoInputSchema = z.object({
  diseaseName: z.string().describe('The name of the plant disease.'),
});
export type GenerateDiseaseInfoInput = z.infer<typeof GenerateDiseaseInfoInputSchema>;

const GenerateDiseaseInfoOutputSchema = z.object({
  summary: z.string().describe('A summary of information about the disease, including symptoms and prevention tips.'),
});
export type GenerateDiseaseInfoOutput = z.infer<typeof GenerateDiseaseInfoOutputSchema>;

export async function generateDiseaseInfo(input: GenerateDiseaseInfoInput): Promise<GenerateDiseaseInfoOutput> {
  return generateDiseaseInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDiseaseInfoPrompt',
  input: {schema: GenerateDiseaseInfoInputSchema},
  output: {schema: GenerateDiseaseInfoOutputSchema},
  prompt: `You are an expert in plant diseases. Generate a concise summary of information about the following disease, including its symptoms and prevention tips.\n\nDisease Name: {{{diseaseName}}}`,
});

const generateDiseaseInfoFlow = ai.defineFlow(
  {
    name: 'generateDiseaseInfoFlow',
    inputSchema: GenerateDiseaseInfoInputSchema,
    outputSchema: GenerateDiseaseInfoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
