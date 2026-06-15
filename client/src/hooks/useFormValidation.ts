import { useState } from "react";

interface ValidationErrors {
  [key: string]: string;
}

export function useFormValidation() {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateServiceRecord = (record: any): boolean => {
    const newErrors: ValidationErrors = {};

    // Required fields validation
    if (!record.date) newErrors.date = "Date is required";
    if (!record.brand) newErrors.brand = "Brand is required";
    if (!record.model) newErrors.model = "Model is required";
    if (!record.serialNo) newErrors.serialNo = "Serial Number is required";
    if (!record.customerName) newErrors.customerName = "Customer Name is required";
    if (!record.phone) newErrors.phone = "Phone Number is required";
    if (!record.repairedBy) newErrors.repairedBy = "Repaired By is required";

    // At least one part should have data if service charges are 0
    const hasValidParts = record.parts.some((p: any) => p.name && p.qty > 0 && p.cost > 0);
    const totalCost = record.parts.reduce((sum: number, p: any) => sum + (p.qty * p.cost || 0), 0) + record.serviceCharges;
    
    if (!hasValidParts && record.serviceCharges === 0) {
      newErrors.parts = "At least one part or service charge is required";
    }

    if (totalCost === 0) {
      newErrors.totalAmount = "Total amount cannot be zero";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearErrors = () => setErrors({});

  return {
    errors,
    validateServiceRecord,
    clearErrors,
  };
}
