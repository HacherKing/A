import { useTranslation } from 'react-i18next';
import { Scanner } from '@/components/scanner';
import { ScannedItems } from '@/components/scanned-items';
import { Button } from '@/components/ui/button';
import { Languages, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

interface OfflineItem {
  code: string;
  timestamp: string;
  path?: string;
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const [offlineItems, setOfflineItems] = useState<OfflineItem[]>([]);
  const [isDone, setIsDone] = useState(false);

  // Load items from localStorage on component mount
  useEffect(() => {
    const savedItems = localStorage.getItem('offlineItems');
    if (savedItems) {
      setOfflineItems(JSON.parse(savedItems));
    }
  }, []);

  const handleScan = async (code: string) => {
    const scanCount = offlineItems.filter(item => item.code === code).length;
    if (scanCount >= 1) {
      toast({
        title: 'تنبيه',
        description: 'تم تسجيل هذا الكود بالفعل',
        variant: 'destructive',
      });
      return;
    }

    const newItem = { 
      code, 
      timestamp: new Date().toISOString() 
    };
    const updatedItems = [...offlineItems, newItem];
    setOfflineItems(updatedItems);
    localStorage.setItem('offlineItems', JSON.stringify(updatedItems));
  };

  const handleDone = () => {
    setIsDone(true);
    toast({
      title: 'تم',
      description: 'تم الانتهاء من عملية المسح بنجاح',
      variant: 'default',
    });
  };

  const toggleLanguage = () => {
    const langs = ['ar', 'tr', 'fr'];
    const currentIndex = langs.indexOf(i18n.language);
    const nextIndex = (currentIndex + 1) % langs.length;
    i18n.changeLanguage(langs[nextIndex]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-zinc-100 to-zinc-200 py-8 px-4"
    >
      <div className="container mx-auto max-w-4xl space-y-8">
        {/* Language Toggle */}
        <div className="flex justify-end mb-4">
          <Button 
            variant="outline" 
            onClick={toggleLanguage}
            className="rounded-md hover:scale-105 transition-transform border-zinc-300 bg-white/80 backdrop-blur-sm shadow-lg"
          >
            <Languages className="h-4 w-4 mr-2" />
            {i18n.language.toUpperCase()}
          </Button>
        </div>

        {/* Header */}
        <motion.div 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-center space-y-6"
        >
          <motion.div 
            className="relative w-32 h-32 mx-auto"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.img 
              src="/SQ_COLOR_LOGO_ATOM_METAL_2022@10x.png" 
              alt="Atom Metal Logo" 
              className="w-full h-full object-contain"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            <div className="absolute inset-0 bg-gradient-radial from-white/20 to-transparent pointer-events-none" />
          </motion.div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-zinc-800 via-red-600 to-zinc-800 bg-clip-text text-transparent">
            ATOM METAL
          </h1>
          <h2 className="text-2xl font-semibold text-zinc-700">
            {t('app.title')}
          </h2>
          <p className="text-lg text-zinc-600 bg-white/50 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
            {t('app.subtitle')}
          </p>

          {/* Show storage status */}
          <div className="text-sm text-zinc-600">
            {offlineItems.length > 0 ? (
              <p>تم حفظ {offlineItems.length} عنصر في المتصفح</p>
            ) : (
              <p>لا توجد عناصر محفوظة</p>
            )}
          </div>
        </motion.div>

        {/* Done Button */}
        <motion.div 
          className="flex justify-end"
          whileHover={{ scale: 1.02 }}
        >
          <Button
            onClick={handleDone}
            className={`${
              isDone 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-gradient-to-r from-red-600 via-red-500 to-red-600'
            } text-white rounded-md px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm`}
            disabled={isDone}
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            {isDone ? 'تم الانتهاء' : 'تأكيد الانتهاء'}
          </Button>
        </motion.div>

        {/* Scanner */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-lg shadow-xl border border-zinc-200"
        >
          <Scanner onScan={handleScan} />
        </motion.div>

        {/* Scanned Items */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-lg shadow-xl border border-zinc-200"
        >
          <ScannedItems 
            onClear={() => {
              setOfflineItems([]);
              localStorage.removeItem('offlineItems');
            }} 
            offlineItems={offlineItems}
            isOnline={false}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}