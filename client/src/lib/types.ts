export interface ScannedItem {
  id: number;
  code: string;
  timestamp: string;
  timeSlot?: 'morning' | 'evening' | 'night';
}