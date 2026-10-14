'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Camera, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface CameraQrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (errorMessage: string) => void;
}

export default function CameraQrScanner({ onScanSuccess, onScanError }: CameraQrScannerProps) {
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'qr-reader-container';

  const startScanner = async () => {
    setCameraError(null);
    setScannedResult(null);

    try {
      const html5QrCode = new Html5Qrcode(containerId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          setScannedResult(decodedText);
          onScanSuccess(decodedText);
          // Stop after successful scan
          html5QrCode.stop().then(() => setScannerActive(false)).catch(() => {});
        },
        (errorMessage) => {
          if (onScanError) onScanError(errorMessage);
        }
      );
      setScannerActive(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Camera access permission denied or unavailable.';
      setCameraError(msg);
      setScannerActive(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerActive) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        // ignore
      }
      setScannerActive(false);
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerActive) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [scannerActive]);

  return (
    <div className="glass-card rounded-2xl p-6 text-center space-y-4">
      <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
        <Camera className="w-5 h-5" />
        <span>Scan Permanent Wall QR Code</span>
      </div>

      <p className="text-xs text-gray-400 max-w-sm mx-auto">
        Point your phone camera at the permanently printed QR code on the gym walls to verify your session.
      </p>

      {/* Reader Container */}
      <div className="relative max-w-sm mx-auto rounded-xl overflow-hidden bg-black/50 border border-white/10 min-h-[260px] flex items-center justify-center">
        <div id={containerId} className="w-full h-full" />

        {!scannerActive && !scannedResult && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-gray-400 space-y-3 bg-gray-950/80">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <button
              onClick={startScanner}
              className="py-2.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20"
            >
              Start Camera Scanner
            </button>
          </div>
        )}

        {scannedResult && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-emerald-950/90 text-emerald-200 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            <div className="font-bold text-sm">QR Code Recognized!</div>
            <div className="text-[11px] font-mono break-all text-gray-300">{scannedResult}</div>
          </div>
        )}
      </div>

      {scannerActive && (
        <button
          onClick={stopScanner}
          className="text-xs text-gray-400 hover:text-white underline pt-1"
        >
          Cancel Camera Scan
        </button>
      )}

      {cameraError && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-center gap-2 text-left">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{cameraError} (You can also tap the direct Check-In action above).</span>
        </div>
      )}
    </div>
  );
}
