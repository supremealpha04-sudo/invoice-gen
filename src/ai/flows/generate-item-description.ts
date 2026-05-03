'use server';
/**
 * @fileOverview An AI agent that generates detailed and professional descriptions for invoice items or services.
 *
 * - generateItemDescription - A function that generates a detailed item description based on a brief input.
 * - GenerateItemDescriptionInput - The input type for the generateItemDescription function.
 * - GenerateItemDescriptionOutput - The return type for the generateItemDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateItemDescriptionInputSchema = z.object({
  briefDescription: z
    .string()
    .describe(
      'A brief input, keywords, or a short phrase describing the item or service.'
    ),
});
export type GenerateItemDescriptionInput = z.infer<
  typeof GenerateItemDescriptionInputSchema
>;

const GenerateItemDescriptionOutputSchema = z.object({
  detailedDescription: z
    .string()
    .describe(
      'A detailed and professional description for the item or service, suitable for an invoice line item.'
    ),
});
export type GenerateItemDescriptionOutput = z.infer<
  typeof GenerateItemDescriptionOutputSchema
>;

export async function generateItemDescription(
  input: GenerateItemDescriptionInput
): Promise<GenerateItemDescriptionOutput> {
  return generateItemDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateItemDescriptionPrompt',
  input: {schema: GenerateItemDescriptionInputSchema},
  output: {schema: GenerateItemDescriptionOutputSchema},
  prompt: `You are an expert copywriter specialized in creating clear, concise, and professional descriptions for invoice line items.

Generate a detailed and professional description for an item or service based on the following brief input. The description should be suitable for an invoice, clearly stating what the item or service entails.

Brief Input: {{{briefDescription}}}`,
});

const generateItemDescriptionFlow = ai.defineFlow(
  {
    name: 'generateItemDescriptionFlow',
    inputSchema: GenerateItemDescriptionInputSchema,
    outputSchema: GenerateItemDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
