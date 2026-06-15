import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, X } from "lucide-react";

interface QRScannerProps {
  onScan: (data: any) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState<string>("");
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    if (!isScanning) return;

    try {
      const scanner = new Html5QrcodeScanner(
        "qr-scanner-container",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      scannerRef.current = scanner;

      scanner.render(
        (decodedText) => {
          try {
            const data = JSON.parse(decodedText);
            onScan(data);
            scanner.clear();
          } catch (err) {
            setError("Invalid QR code data. Please try again.");
          }
        },
        (errorMessage) => {
          // Ignore scanning errors
        }
      );

      return () => {
        if (scannerRef.current) {
          scannerRef.current.clear().catch(() => {});
        }
      };
    } catch (err) {
      setError("Failed to initialize camera. Please check permissions.");
      setIsScanning(false);
    }
  }, [isScanning, onScan]);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Scan QR Code</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div
          id="qr-scanner-container"
          className="w-full rounded-lg overflow-hidden bg-gray-100"
          style={{ minHeight: "300px" }}
        />

        <p className="text-center text-sm text-gray-600 mt-4">
          Point your camera at the QR code to scan
        </p>

        <Button
          onClick={onClose}
          variant="outline"
          className="w-full mt-4"
        >
          Close Scanner
        </Button>
      </CardContent>
    </Card>
  );
}
