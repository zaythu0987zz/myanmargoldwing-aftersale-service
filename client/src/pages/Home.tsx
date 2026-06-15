import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRCodeSVG as QRCode } from "qrcode.react";
import { Trash2, Plus, AlertCircle, QrCode, History } from "lucide-react";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { QRScanner } from "@/components/QRScanner";
import { useLocation } from "wouter";

interface Part {
  id: string;
  name: string;
  qty: number;
  cost: number;
}

interface ServiceRecord {
  date: string;
  brand: string;
  model: string;
  serialNo: string;
  useInPlace: string;
  purchaseLocation: string;
  customerName: string;
  phone: string;
  address: string;
  inTime: string;
  outTime: string;
  checklist: {
    coffee: boolean;
    water: boolean;
    descaling: boolean;
    milkClean: boolean;
  };
  technicalIssues: string;
  parts: Part[];
  repairedBy: string;
  serviceCharges: number;
}

export default function Home() {
  const [, setLocation] = useLocation();

  const defaultRecord: ServiceRecord = {
    date: new Date().toISOString().split("T")[0],
    brand: "DeLonghi",
    model: "",
    serialNo: "",
    useInPlace: "",
    purchaseLocation: "myanmar",
    customerName: "",
    phone: "",
    address: "",
    inTime: "10:00 AM",
    outTime: "04:00 PM",
    checklist: {
      coffee: false,
      water: false,
      descaling: false,
      milkClean: false,
    },
    technicalIssues: "",
    parts: [
      { id: "1", name: "", qty: 0, cost: 0 },
      { id: "2", name: "", qty: 0, cost: 0 },
    ],
    repairedBy: "",
    serviceCharges: 0,
  };

  const [record, setRecord] = useLocalStorage<ServiceRecord>("goldwing_service_record", defaultRecord);
  const [history, setHistory] = useLocalStorage<ServiceRecord[]>("goldwing_service_history", []);
  const { errors, validateServiceRecord } = useFormValidation();

  const [showQR, setShowQR] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // Ensure QR code canvas is properly mounted before rendering
  useEffect(() => {
    if (showQR && qrRef.current) {
      // Force a small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        // Canvas will be rendered by QRCodeSVG, no additional action needed
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showQR]);

  const handleInputChange = (field: string, value: any) => {
    setRecord((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChecklistChange = (field: string, checked: boolean) => {
    setRecord((prev) => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [field]: checked,
      },
    }));
  };

  const handlePartChange = (id: string, field: string, value: any) => {
    setRecord((prev) => ({
      ...prev,
      parts: prev.parts.map((part) =>
        part.id === id
          ? {
              ...part,
              [field]: field === "name" ? value : Number(value) || 0,
            }
          : part
      ),
    }));
  };

  const addPart = () => {
    const newId = String(Math.max(...record.parts.map((p) => Number(p.id)), 0) + 1);
    setRecord((prev) => ({
      ...prev,
      parts: [...prev.parts, { id: newId, name: "", qty: 0, cost: 0 }],
    }));
  };

  const removePart = (id: string) => {
    if (record.parts.length > 1) {
      setRecord((prev) => ({
        ...prev,
        parts: prev.parts.filter((part) => part.id !== id),
      }));
    }
  };

  const calculateTotalCost = () => {
    const partsCost = record.parts.reduce((sum, part) => sum + (part.qty * part.cost || 0), 0);
    return partsCost + (record.serviceCharges || 0);
  };

  const handleGenerateQR = () => {
    if (validateServiceRecord(record)) {
      // Save to history
      const newRecord = {
        ...record,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      };
      setHistory([...history, newRecord]);
      setShowQR(true);
    }
  };

  const handleQRScanned = (data: any) => {
    setRecord(data);
    setShowScanner(false);
  };

  // Revalidate on any form change to provide live feedback
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      validateServiceRecord(record);
    }
  }, [record]);

  const generateQRData = () => {
    return JSON.stringify({
      date: record.date,
      brand: record.brand,
      model: record.model,
      serialNo: record.serialNo,
      useInPlace: record.useInPlace,
      purchaseLocation: record.purchaseLocation,
      customerName: record.customerName,
      phone: record.phone,
      address: record.address,
      inTime: record.inTime,
      outTime: record.outTime,
      checklist: record.checklist,
      technicalIssues: record.technicalIssues,
      parts: record.parts.map(p => ({
        name: p.name,
        qty: p.qty,
        cost: p.cost,
        subtotal: p.qty * p.cost
      })),
      repairedBy: record.repairedBy,
      serviceCharges: record.serviceCharges,
      totalAmount: calculateTotalCost(),
      timestamp: new Date().toISOString(),
    });
  };

  const downloadQR = () => {
    // QRCodeSVG renders as SVG, so we need to convert it to canvas for download
    const svg = qrRef.current?.querySelector("svg");
    if (svg) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `QR-${record.date}-${record.customerName || "record"}.png`;
        link.click();
      };
      
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="/manus-storage/IMG_4147_3c70ef44.PNG"
              alt="Goldwing Logo"
              className="h-24 w-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">GOLDWING</h1>
          <p className="text-gray-600 text-sm">PRODUCTS INFORMATION & AFTER SALES SERVICE</p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 mb-8 justify-center flex-wrap">
          <Button
            onClick={() => setShowScanner(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <QrCode size={18} />
            Scan QR Code
          </Button>
          <Button
            onClick={() => setLocation("/history")}
            variant="outline"
            className="gap-2"
          >
            <History size={18} />
            View History
          </Button>
        </div>

        {/* Form Sections */}
        <div className="space-y-6">
          {/* 1. Product Information */}
          <Card className="border-l-4 border-l-orange-500 shadow-md">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
              <CardTitle className="text-orange-700">1. Product Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={record.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <select
                    id="brand"
                    value={record.brand}
                    onChange={(e) => handleInputChange("brand", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option>DeLonghi</option>
                    <option>Kenwood</option>
                    <option>Braun</option>
                    <option>NutriBullet</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    placeholder="Model"
                    value={record.model}
                    onChange={(e) => handleInputChange("model", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="serialNo">Serial No</Label>
                  <Input
                    id="serialNo"
                    placeholder="Serial Number"
                    value={record.serialNo}
                    onChange={(e) => handleInputChange("serialNo", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="useInPlace">Use In Place</Label>
                  <Input
                    id="useInPlace"
                    placeholder="Location"
                    value={record.useInPlace}
                    onChange={(e) => handleInputChange("useInPlace", e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label>Purchase of Place</Label>
                <RadioGroup value={record.purchaseLocation} onValueChange={(value) => handleInputChange("purchaseLocation", value)}>
                  <div className="flex items-center space-x-2 mt-2">
                    <RadioGroupItem value="myanmar" id="myanmar" />
                    <Label htmlFor="myanmar" className="font-normal cursor-pointer">
                      Myanmar
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="overseas" id="overseas" />
                    <Label htmlFor="overseas" className="font-normal cursor-pointer">
                      Overseas
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* 2. Customer Information */}
          <Card className="border-l-4 border-l-orange-500 shadow-md">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
              <CardTitle className="text-orange-700">2. Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    placeholder="Customer name"
                    value={record.customerName}
                    onChange={(e) => handleInputChange("customerName", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="Phone number"
                    value={record.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="Address"
                    value={record.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Machine Issues & Checklist */}
          <Card className="border-l-4 border-l-orange-500 shadow-md">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
              <CardTitle className="text-orange-700">3. Machine Issues & Checklist</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="inTime">IN Time</Label>
                  <Input
                    id="inTime"
                    placeholder="IN: 10:00 AM"
                    value={record.inTime}
                    onChange={(e) => handleInputChange("inTime", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="outTime">OUT Time</Label>
                  <Input
                    id="outTime"
                    placeholder="OUT: 04:00 PM"
                    value={record.outTime}
                    onChange={(e) => handleInputChange("outTime", e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-4">
                <Label className="block mb-3">Machines Checklist</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="coffee"
                      checked={record.checklist.coffee}
                      onCheckedChange={(checked) => handleChecklistChange("coffee", checked as boolean)}
                    />
                    <Label htmlFor="coffee" className="font-normal cursor-pointer">
                      Coffee
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="water"
                      checked={record.checklist.water}
                      onCheckedChange={(checked) => handleChecklistChange("water", checked as boolean)}
                    />
                    <Label htmlFor="water" className="font-normal cursor-pointer">
                      Water
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="descaling"
                      checked={record.checklist.descaling}
                      onCheckedChange={(checked) => handleChecklistChange("descaling", checked as boolean)}
                    />
                    <Label htmlFor="descaling" className="font-normal cursor-pointer">
                      Descaling
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="milkClean"
                      checked={record.checklist.milkClean}
                      onCheckedChange={(checked) => handleChecklistChange("milkClean", checked as boolean)}
                    />
                    <Label htmlFor="milkClean" className="font-normal cursor-pointer">
                      Milk Clean
                    </Label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="technicalIssues">Technical Issues Description</Label>
                <Textarea
                  id="technicalIssues"
                  placeholder="Technical issues details..."
                  value={record.technicalIssues}
                  onChange={(e) => handleInputChange("technicalIssues", e.target.value)}
                  className="min-h-24"
                />
              </div>
            </CardContent>
          </Card>

          {/* 4. Parts & Costs */}
          <Card className="border-l-4 border-l-orange-500 shadow-md">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
              <CardTitle className="text-orange-700">4. Parts & Costs</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto mb-4">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="w-12">No</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-20">Qty</TableHead>
                      <TableHead className="w-32">Cost (MMK)</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {record.parts.map((part, index) => (
                      <TableRow key={part.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <Input
                            placeholder="Part name"
                            value={part.name}
                            onChange={(e) => handlePartChange(part.id, "name", e.target.value)}
                            className="text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={part.qty}
                            onChange={(e) => handlePartChange(part.id, "qty", e.target.value)}
                            className="text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={part.cost}
                            onChange={(e) => handlePartChange(part.id, "cost", e.target.value)}
                            className="text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => removePart(part.id)}
                            disabled={record.parts.length === 1}
                            className="text-red-500 hover:text-red-700 disabled:text-gray-300"
                          >
                            <Trash2 size={16} />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Button onClick={addPart} variant="outline" className="mb-4 w-full">
                <Plus size={16} className="mr-2" />
                Add Part
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="repairedBy">Repaired By / Sign</Label>
                  <Input
                    id="repairedBy"
                    placeholder="Technician name"
                    value={record.repairedBy}
                    onChange={(e) => handleInputChange("repairedBy", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="serviceCharges">Service Charges</Label>
                  <Input
                    id="serviceCharges"
                    type="number"
                    min="0"
                    value={record.serviceCharges}
                    onChange={(e) => handleInputChange("serviceCharges", Number(e.target.value) || 0)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Amount */}
          <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
            <CardHeader>
              <CardTitle className="text-orange-700">Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {calculateTotalCost().toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
              <p className="text-gray-600">MMK</p>
            </CardContent>
          </Card>

          {/* Validation Errors */}
          {Object.keys(errors).length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <div className="text-sm text-red-700">
                    <p className="font-semibold mb-2">Please fix the following errors:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {Object.entries(errors).map(([key, error]) => (
                        <li key={key}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* QR Code Button */}
          <Button
            onClick={handleGenerateQR}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white text-lg py-6 rounded-lg font-semibold"
          >
            QR Generate QR Code
          </Button>
          {Object.keys(errors).length > 0 && (
            <p className="text-center text-sm text-red-600 mt-2">Please fix the errors above to generate QR code</p>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Made with Manus</p>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <Dialog open={showScanner} onOpenChange={setShowScanner}>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <QRScanner
              onScan={handleQRScanned}
              onClose={() => setShowScanner(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Service Record QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div ref={qrRef} className="bg-white p-4 rounded-lg flex items-center justify-center">
              {showQR && <QRCode value={generateQRData()} size={256} level="H" includeMargin={true} />}
            </div>
            <div className="text-center text-sm text-gray-600">
              <p>
                <strong>Customer:</strong> {record.customerName || "N/A"}
              </p>
              <p>
                <strong>Date:</strong> {record.date}
              </p>
              <p>
                <strong>Total:</strong> {calculateTotalCost().toLocaleString()} MMK
              </p>
            </div>
            <div className="flex gap-2 w-full">
              <Button onClick={downloadQR} className="flex-1 bg-orange-600 hover:bg-orange-700">
                Download QR Code
              </Button>
              <Button onClick={() => setShowQR(false)} variant="outline" className="flex-1">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
