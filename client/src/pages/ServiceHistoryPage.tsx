import { useLocation } from "wouter";
import ServiceHistory from "./ServiceHistory";

export default function ServiceHistoryPage() {
  const [, setLocation] = useLocation();

  return (
    <ServiceHistory
      onBack={() => setLocation("/")}
      onEdit={(record) => {
        // Store the record to be edited and navigate back
        localStorage.setItem("goldwing_service_record", JSON.stringify(record));
        setLocation("/");
      }}
    />
  );
}
