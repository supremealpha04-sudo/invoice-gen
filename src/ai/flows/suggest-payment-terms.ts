'use server';
/**
 * @fileOverview An AI agent that suggests appropriate payment terms for invoices.
 *
 * - suggestPaymentTerms - A function that suggests payment terms based on invoice details.
 * - SuggestPaymentTermsInput - The input type for the suggestPaymentTerms function.
 * - SuggestPaymentTermsOutput - The return type for the suggestPaymentTerms function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestPaymentTermsInputSchema = z.object({
  invoiceTotal: z
    .number()
    .describe('The total value of the invoice, in monetary units.'),
  clientHistory: z
    .string()
    .describe(
      'A summary of the client\'s payment history (e.g., "new client", "pays on time", "frequently late").'
    ),
  businessPractices: z
    .string()
    .describe(
      'The user\'s standard business practices regarding payment terms (e.g., "typically Net 30 for established clients", "requires upfront payment for new clients").'
    ),
});
export type SuggestPaymentTermsInput = z.infer<
  typeof SuggestPaymentTermsInputSchema
>;

const SuggestPaymentTermsOutputSchema = z.object({
  suggestedTerms: z
    .array(z.string())
    .describe('An array of suggested professional payment terms (e.g., "Net 30", "Due on receipt").'),
  reasoning: z
    .string()
    .describe(
      'An explanation for the suggested payment terms, considering the invoice total, client history, and business practices.'
    ),
});
export type SuggestPaymentTermsOutput = z.infer<
  typeof SuggestPaymentTermsOutputSchema
>;

export async function suggestPaymentTerms(
  input: SuggestPaymentTermsInput
): Promise<SuggestPaymentTermsOutput> {
  return suggestPaymentTermsFlow(input);
}

const paymentTermsPrompt = ai.definePrompt({
  name: 'suggestPaymentTermsPrompt',
  input: { schema: SuggestPaymentTermsInputSchema },
  output: { schema: SuggestPaymentTermsOutputSchema },
  prompt: `You are an expert in business finance and invoicing, specialized in suggesting professional payment terms.

Based on the following information, suggest appropriate payment terms for an invoice.
Consider the invoice total, the client's payment history, and the standard business practices provided.

Invoice Total: {{{invoiceTotal}}}
Client History: {{{clientHistory}}}
Business Practices: {{{businessPractices}}}

Provide an array of 1-3 professional payment term suggestions and a brief reasoning for each suggestion.
Prioritize standard and clear terms like 'Net 30', 'Net 60', 'Due on receipt', 'Payment in advance', '7 days from invoice date', etc.`,
});

const suggestPaymentTermsFlow = ai.defineFlow(
  {
    name: 'suggestPaymentTermsFlow',
    inputSchema: SuggestPaymentTermsInputSchema,
    outputSchema: SuggestPaymentTermsOutputSchema,
  },
  async (input) => {
    const { output } = await paymentTermsPrompt(input);
    if (!output) {
      throw new Error('Failed to generate payment term suggestions.');
    }
    return output;
  }
);
