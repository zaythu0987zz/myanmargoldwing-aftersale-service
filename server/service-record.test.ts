import { describe, expect, it } from "vitest";

describe("Service Record Calculations", () => {
  it("should calculate total cost correctly with parts and service charges", () => {
    const parts = [
      { id: "1", name: "O-ring", qty: 1, cost: 50000 },
      { id: "2", name: "Gasket", qty: 2, cost: 50000 },
    ];
    const serviceCharges = 135000;

    const partsCost = parts.reduce((sum, part) => sum + part.qty * part.cost, 0);
    const totalCost = partsCost + serviceCharges;

    expect(partsCost).toBe(150000); // 1*50000 + 2*50000
    expect(totalCost).toBe(285000); // 150000 + 135000
  });

  it("should calculate total cost with zero parts", () => {
    const parts: any[] = [];
    const serviceCharges = 135000;

    const partsCost = parts.reduce((sum, part) => sum + part.qty * part.cost, 0);
    const totalCost = partsCost + serviceCharges;

    expect(partsCost).toBe(0);
    expect(totalCost).toBe(135000);
  });

  it("should calculate total cost with zero service charges", () => {
    const parts = [
      { id: "1", name: "O-ring", qty: 1, cost: 50000 },
      { id: "2", name: "Gasket", qty: 2, cost: 50000 },
    ];
    const serviceCharges = 0;

    const partsCost = parts.reduce((sum, part) => sum + part.qty * part.cost, 0);
    const totalCost = partsCost + serviceCharges;

    expect(partsCost).toBe(150000);
    expect(totalCost).toBe(150000);
  });

  it("should encode complete service record data in QR", () => {
    const record = {
      date: "2026-06-15",
      brand: "DeLonghi",
      model: "ESAM3300",
      serialNo: "SN123456",
      useInPlace: "Office",
      purchaseLocation: "myanmar",
      customerName: "John Doe",
      phone: "09123456789",
      address: "Yangon",
      inTime: "10:00 AM",
      outTime: "04:00 PM",
      checklist: {
        coffee: true,
        water: true,
        descaling: false,
        milkClean: true,
      },
      technicalIssues: "Machine not brewing properly",
      parts: [
        { name: "O-ring", qty: 1, cost: 50000, subtotal: 50000 },
        { name: "Gasket", qty: 2, cost: 50000, subtotal: 100000 },
      ],
      repairedBy: "Zaw Lin phyo",
      serviceCharges: 135000,
      totalAmount: 285000,
      timestamp: "2026-06-15T08:00:00.000Z",
    };

    const qrData = JSON.stringify(record);
    const parsed = JSON.parse(qrData);

    expect(parsed.date).toBe("2026-06-15");
    expect(parsed.brand).toBe("DeLonghi");
    expect(parsed.model).toBe("ESAM3300");
    expect(parsed.serialNo).toBe("SN123456");
    expect(parsed.customerName).toBe("John Doe");
    expect(parsed.totalAmount).toBe(285000);
    expect(parsed.checklist.coffee).toBe(true);
    expect(parsed.parts.length).toBe(2);
    expect(parsed.parts[0].subtotal).toBe(50000);
  });
});
