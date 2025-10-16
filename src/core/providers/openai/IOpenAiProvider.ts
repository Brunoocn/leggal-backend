export interface IOpenAiProvider {
  generateCompletion(prompt: string, message: string): Promise<string>;
}
