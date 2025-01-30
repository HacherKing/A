import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Trash2, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface OfflineItem {
  code: string;
  timestamp: string;
  path?: string;
}

interface ScannedItem {
  id: number;
  code: string;
  timestamp: string;
  path?: string;
  timeSlot?: 'morning' | 'evening' | 'night';
}

interface GroupedItems {
  morning: ScannedItem[];
  evening: ScannedItem[];
  night: ScannedItem[];
}

interface ScannedItemsProps {
  onClear: () => void;
  offlineItems: OfflineItem[];
  isOnline: boolean;
}

function groupItemsByTimeSlot(items: (ScannedItem | OfflineItem)[]): GroupedItems {
  return items.reduce((acc: GroupedItems, item) => {
    const hour = new Date(item.timestamp).getHours();
    let slot: keyof GroupedItems;

    if (hour >= 8 && hour < 16) {
      slot = 'morning';
    } else if (hour >= 16 && hour < 24) {
      slot = 'evening';
    } else {
      slot = 'night';
    }

    acc[slot].push(item as ScannedItem);
    return acc;
  }, { morning: [], evening: [], night: [] });
}

export function ScannedItems({ onClear, offlineItems, isOnline }: ScannedItemsProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mappingFileInputRef = useRef<HTMLInputElement>(null);

  const groupedItems = groupItemsByTimeSlot(offlineItems);

  const timeSlotLabels = {
    morning: "8:00 صباحاً - 4:00 مساءً",
    evening: "4:00 مساءً - 12:00 منتصف الليل",
    night: "12:00 منتصف الليل - 8:00 صباحاً"
  };

  const handleExport = () => {
    const allItems = Object.values(groupedItems).flat();
    if (allItems.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(allItems);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t('items.title'));

    const date = new Date().toISOString().split('T')[0];
    const file = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const blob = new Blob([file], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = URL.createObjectURL(blob);
    const element = document.createElement('a');
    element.href = url;
    element.download = `scanned-items-${date}.xlsx`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
  };

  const handleMappingFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const mappings = XLSX.utils.sheet_to_json(worksheet);

        // Validate mapping file structure
        const isValid = mappings.every((item: any) => 
          item.code && typeof item.code === 'string' && 
          item.path && typeof item.path === 'string'
        );

        if (!isValid) {
          throw new Error('تنسيق الملف غير صحيح. يجب أن يحتوي على عمودين: code و path');
        }

        // Store mappings locally
        localStorage.setItem('mappingData', JSON.stringify(mappings));
        toast({
          title: 'تم تحميل ملف المسارات',
          description: `تم تحميل ${mappings.length} مسار بنجاح`,
        });
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      toast({
        title: 'خطأ في تحميل الملف',
        description: error instanceof Error ? error.message : 'تأكد من صحة تنسيق الملف',
        variant: 'destructive',
      });
    }

    if (mappingFileInputRef.current) {
      mappingFileInputRef.current.value = '';
    }
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
        <h2 className="text-xl font-semibold">{t('items.title')}</h2>
        <div className="flex flex-wrap gap-2 justify-center md:justify-end">
          <input
            type="file"
            ref={mappingFileInputRef}
            accept=".xlsx,.xls"
            onChange={handleMappingFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => mappingFileInputRef.current?.click()}
            className="min-w-[120px]"
          >
            <Upload className="h-4 w-4 mr-2" />
            تحميل ملف المسارات
          </Button>
          <Button
            variant="outline"
            onClick={onClear}
            disabled={!Object.values(groupedItems).some(group => group.length > 0)}
            className="min-w-[120px]"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t('items.clear')}
          </Button>
          <Button
            onClick={handleExport}
            disabled={!Object.values(groupedItems).some(group => group.length > 0)}
            className="min-w-[120px]"
          >
            <Download className="h-4 w-4 mr-2" />
            {t('items.export')}
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedItems).map(([timeSlot, items]) => (
          <div key={timeSlot}>
            <h3 className="text-lg font-semibold mb-4">
              {timeSlotLabels[timeSlot as keyof typeof timeSlotLabels]}
            </h3>
            <div className="overflow-x-auto">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('items.code')}</TableHead>
                      <TableHead>المسار</TableHead>
                      <TableHead>{t('items.time')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          {t('items.empty')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item: ScannedItem | OfflineItem) => (
                        <TableRow key={`${item.code}-${item.timestamp}`}>
                          <TableCell className="font-mono">{item.code}</TableCell>
                          <TableCell>{item.path || 'غير محدد'}</TableCell>
                          <TableCell>
                            {new Date(item.timestamp).toLocaleString(undefined, {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}