import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Eye, Edit2, ArrowLeft } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface ServiceRecord {
  id?: string;
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
  parts: Array<{
    id: string;
    name: string;
    qty: number;
    cost: number;
  }>;
  repairedBy: string;
  serviceCharges: number;
  timestamp?: string;
}

interface ServiceHistoryProps {
  onBack: () => void;
  onEdit: (record: ServiceRecord) => void;
}

export default function ServiceHistory({ onBack, onEdit }: ServiceHistoryProps) {
  const [records, setRecords] = useLocalStorage<ServiceRecord[]>("goldwing_service_history", []);
  const [filteredRecords, setFilteredRecords] = useState<ServiceRecord[]>(records);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<ServiceRecord | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const filtered = records.filter(
      (record) =>
        record.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.phone.includes(searchTerm) ||
        record.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecords(filtered);
  }, [searchTerm, records]);

  const handleDelete = (index: number) => {
    if (window.confirm("Are you sure you want to delete this service record?")) {
      const newRecords = records.filter((_, i) => i !== index);
      setRecords(newRecords);
    }
  };

  const handleEdit = (record: ServiceRecord) => {
    onEdit(record);
  };

  const calculateTotal = (record: ServiceRecord) => {
    const partsCost = record.parts.reduce((sum, part) => sum + (part.qty * part.cost || 0), 0);
    return partsCost + (record.serviceCharges || 0);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <ArrowLeft size={18} />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Service History</h1>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Label htmlFor="search" className="text-base font-semibold mb-2 block">
              Search Records
            </Label>
            <Input
              id="search"
              placeholder="Search by customer name, phone, or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Records Table */}
        {filteredRecords.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>
                {filteredRecords.length} Record{filteredRecords.length !== 1 ? "s" : ""} Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Brand / Model</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {formatDate(record.date)}
                        </TableCell>
                        <TableCell>{record.customerName}</TableCell>
                        <TableCell>{record.phone}</TableCell>
                        <TableCell>
                          {record.brand} {record.model}
                        </TableCell>
                        <TableCell className="font-semibold text-orange-600">
                          {calculateTotal(record).toLocaleString()} MMK
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                setSelectedRecord(record);
                                setShowDetails(true);
                              }}
                              variant="outline"
                              size="sm"
                              className="gap-1"
                            >
                              <Eye size={16} />
                              View
                            </Button>
                            <Button
                              onClick={() => handleEdit(record)}
                              variant="outline"
                              size="sm"
                              className="gap-1"
                            >
                              <Edit2 size={16} />
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDelete(index)}
                              variant="outline"
                              size="sm"
                              className="gap-1 text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-gray-500 text-lg">
                {searchTerm ? "No records found matching your search." : "No service records yet."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Service Record Details</DialogTitle>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-6">
              {/* Product Info */}
              <div>
                <h3 className="font-semibold text-lg mb-3 text-orange-600">Product Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Date</p>
                    <p className="font-medium">{formatDate(selectedRecord.date)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Brand</p>
                    <p className="font-medium">{selectedRecord.brand}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Model</p>
                    <p className="font-medium">{selectedRecord.model}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Serial No</p>
                    <p className="font-medium">{selectedRecord.serialNo}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Use In Place</p>
                    <p className="font-medium">{selectedRecord.useInPlace}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Purchase Location</p>
                    <p className="font-medium capitalize">{selectedRecord.purchaseLocation}</p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-lg mb-3 text-orange-600">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Name</p>
                    <p className="font-medium">{selectedRecord.customerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Phone</p>
                    <p className="font-medium">{selectedRecord.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600">Address</p>
                    <p className="font-medium">{selectedRecord.address}</p>
                  </div>
                </div>
              </div>

              {/* Service Info */}
              <div>
                <h3 className="font-semibold text-lg mb-3 text-orange-600">Service Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">IN Time</p>
                    <p className="font-medium">{selectedRecord.inTime}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">OUT Time</p>
                    <p className="font-medium">{selectedRecord.outTime}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600">Machines Checklist</p>
                    <div className="flex gap-4 mt-1 text-sm">
                      {selectedRecord.checklist.coffee && <span className="text-green-600">✓ Coffee</span>}
                      {selectedRecord.checklist.water && <span className="text-green-600">✓ Water</span>}
                      {selectedRecord.checklist.descaling && <span className="text-green-600">✓ Descaling</span>}
                      {selectedRecord.checklist.milkClean && <span className="text-green-600">✓ Milk Clean</span>}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600">Technical Issues</p>
                    <p className="font-medium">{selectedRecord.technicalIssues || "None"}</p>
                  </div>
                </div>
              </div>

              {/* Parts */}
              {selectedRecord.parts.some((p) => p.name) && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-orange-600">Parts Used</h3>
                  <div className="space-y-2 text-sm">
                    {selectedRecord.parts
                      .filter((p) => p.name)
                      .map((part, idx) => (
                        <div key={idx} className="flex justify-between bg-gray-50 p-2 rounded">
                          <span>{part.name}</span>
                          <span>
                            {part.qty} × {part.cost.toLocaleString()} = {(part.qty * part.cost).toLocaleString()} MMK
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Costs */}
              <div>
                <h3 className="font-semibold text-lg mb-3 text-orange-600">Costs</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Repaired By</span>
                    <span className="font-medium">{selectedRecord.repairedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Charges</span>
                    <span className="font-medium">{selectedRecord.serviceCharges.toLocaleString()} MMK</span>
                  </div>
                  <div className="flex justify-between border-t-2 border-orange-200 pt-2 text-base font-bold text-orange-600">
                    <span>Total Amount</span>
                    <span>{calculateTotal(selectedRecord).toLocaleString()} MMK</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
