import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Quagga from '@ericblade/quagga2';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { CameraIcon, Keyboard, Send } from 'lucide-react';

interface ScannerProps {
  onScan: (code: string) => void;
}

export function Scanner({ onScan }: ScannerProps) {
  const { t } = useTranslation();
  const [isScanning, setIsScanning] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const scannerRef = useRef<HTMLDivElement>(null);
  const [constraints, setConstraints] = useState({
    facingMode: "environment",
    width: { min: 640 },
    height: { min: 480 },
  });

  useEffect(() => {
    const audio = new Audio('data:audio/wav;base64,UklGRl4BAABXQVZFZm10IBAAAAABAAEAgD4AAIA+AAABAAgAZGF0YToBAACAgICAgICAgICAgICAgICAgICAgICAgIC/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v4CAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIA==');
    audio.load();
  }, []);

  const startScanner = () => {
    if (scannerRef.current) {
      Quagga.init(
        {
          inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: scannerRef.current,
            constraints: {
              ...constraints,
              aspectRatio: { min: 1, max: 2 }
            },
          },
          decoder: {
            readers: [
              'ean_reader',
              'ean_8_reader',
              'code_128_reader',
              'code_39_reader',
              'upc_reader',
              'upc_e_reader'
            ],
            debug: {
              drawBoundingBox: true,
              showPattern: true,
            },
            multiple: false
          },
          locator: {
            patchSize: "medium",
            halfSample: true
          },
          numOfWorkers: 4,
          frequency: 10,
          locate: true
        },
        (err) => {
          if (err) {
            toast({
              title: 'خطأ في الكاميرا',
              description: 'تأكد من السماح باستخدام الكاميرا',
              variant: 'destructive',
            });
            return;
          }
          Quagga.start();
          setIsScanning(true);
        }
      );

      let lastScannedCode = '';
      let lastScannedTime = 0;

      Quagga.onDetected((result) => {
        if (result.codeResult.code) {
          const now = Date.now();
          if (result.codeResult.code !== lastScannedCode || now - lastScannedTime > 2000) {
            lastScannedCode = result.codeResult.code;
            lastScannedTime = now;

            const beep = new Audio('data:audio/wav;base64,UklGRl4BAABXQVZFZm10IBAAAAABAAEAgD4AAIA+AAABAAgAZGF0YToBAACAgICAgICAgICAgICAgICAgICAgICAgIC/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v4CAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIA==');
            beep.play().catch(() => {
              // Silent catch - some browsers require user interaction first
            });

            onScan(result.codeResult.code);
          }
        }
      });
    }
  };

  const stopScanner = () => {
    Quagga.stop();
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      Quagga.stop();
    };
  }, []);

  const toggleScanner = () => {
    if (isVisible && isScanning) {
      stopScanner();
    }
    setIsVisible(!isVisible);
    setShowManualInput(false);
  };

  const toggleManualInput = () => {
    if (isVisible && isScanning) {
      stopScanner();
      setIsVisible(false);
    }
    setShowManualInput(!showManualInput);
    setManualCode('');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode('');
    }
  };

  useEffect(() => {
    if (isVisible && !isScanning) {
      startScanner();
    }
  }, [isVisible]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden bg-white/50 backdrop-blur-sm border-primary/10">
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-blue-600">
              {t('scanner.title')}
            </h2>
            <div className="flex gap-2">
              <Button
                onClick={toggleManualInput}
                variant={showManualInput ? "destructive" : "default"}
                className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                size="lg"
              >
                <Keyboard className="h-5 w-5 mr-2" />
                {showManualInput ? "إغلاق" : "إدخال يدوي"}
              </Button>
              <Button
                onClick={toggleScanner}
                variant={isVisible ? "destructive" : "default"}
                className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                size="lg"
              >
                <CameraIcon className="h-5 w-5 mr-2" />
                {isVisible ? t('scanner.stop') : t('scanner.start')}
              </Button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {showManualInput && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="flex gap-2"
                onSubmit={handleManualSubmit}
              >
                <Input
                  type="text"
                  placeholder="أدخل الكود يدوياً"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon" className="rounded-full">
                  <Send className="h-4 w-4" />
                </Button>
              </motion.form>
            )}

            {isVisible && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="w-full"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-xl bg-black">
                  <div
                    ref={scannerRef}
                    className="aspect-[4/3] w-full max-w-3xl mx-auto"
                  />
                  <motion.div
                    className="absolute inset-0 border-4 border-blue-500/50 pointer-events-none"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                </div>
                <p className="mt-4 text-center text-sm text-gray-600">
                  وجّه الكاميرا نحو الباركود للمسح التلقائي
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}