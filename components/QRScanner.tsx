import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, AlertCircle } from 'lucide-react';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const scannerRef = useRef<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // @ts-ignore
    const Html5QrcodeScanner = window.Html5QrcodeScanner;

    if (!Html5QrcodeScanner) {
      setError("Thư viện quét mã không tải được. Vui lòng tải lại trang.");
      return;
    }

    // Initialize Scanner
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText: string) => {
        // Success callback
        scanner.clear().then(() => {
            onScan(decodedText);
        }).catch((err: any) => {
            console.error("Failed to clear scanner", err);
            onScan(decodedText); // Still return text
        });
      },
      (errorMessage: string) => {
        // Parse error, usually ignored
      }
    );

    scannerRef.current = scanner;

    // Cleanup function
    return () => {
      if (scannerRef.current) {
        try {
            scannerRef.current.clear().catch(() => {});
        } catch (e) {
            // Ignore cleanup errors
        }
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
           <h3 className="font-bold text-gray-800 flex items-center gap-2">
             <Camera className="text-blue-600" size={20} />
             Quét mã sản phẩm
           </h3>
           <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
             <X size={24} className="text-gray-500" />
           </button>
        </div>
        
        <div className="p-6 flex flex-col items-center justify-center bg-gray-900">
           {error ? (
               <div className="text-red-400 flex flex-col items-center gap-2 text-center">
                   <AlertCircle size={32} />
                   <p>{error}</p>
               </div>
           ) : (
               <div id="reader" className="w-full bg-white rounded-lg overflow-hidden"></div>
           )}
           <p className="text-gray-400 text-sm mt-4 text-center">
             Hướng camera về phía mã QR trên sản phẩm để tự động thêm.
           </p>
        </div>
      </div>
    </div>
  );
};