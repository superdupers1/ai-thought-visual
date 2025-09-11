
export interface AIConcept {
  emotion: string | null;
  elements: string[];
  setting: string | null;
  time_of_day: string | null;
  mood: string | null;
  temperature: string | null;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  userInput: string;
  uploadedImageName: string | null;
  aiConcept: AIConcept;
  generatedImage: string; // base64 data URL
  reconstructedText: string;
}
