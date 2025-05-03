import { CheckCircle, Clock, Truck, Package, CircleX } from "lucide-react";

type OrderStatusProps = {
  status: string;
  expectedDeliveryDate?: string | Date | null;
  className?: string;
};

export function OrderStatusTracker({ status, expectedDeliveryDate, className = "" }: OrderStatusProps) {
  // Map status to step number for the progress bar
  const getStepNumber = () => {
    switch (status) {
      case "pending":
        return 0;
      case "processing":
        return 1;
      case "out_for_delivery":
        return 2;
      case "delivered":
        return 3;
      case "cancelled":
        return -1;
      default:
        return 0;
    }
  };

  // Format expected delivery date
  const formatDeliveryDate = () => {
    if (!expectedDeliveryDate) return "Not available";
    
    const date = typeof expectedDeliveryDate === 'string' 
      ? new Date(expectedDeliveryDate) 
      : expectedDeliveryDate;
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const step = getStepNumber();

  // If order is cancelled, show a different UI
  if (status === "cancelled") {
    return (
      <div className={`${className} p-4 border border-red-200 bg-red-50 rounded-lg`}>
        <div className="flex items-center text-red-500 mb-2">
          <CircleX className="mr-2 h-5 w-5" />
          <span className="font-medium">Order Cancelled</span>
        </div>
        <p className="text-sm text-gray-500">This order has been cancelled.</p>
      </div>
    );
  }

  // Status labels
  const steps = [
    { name: "Order Placed", icon: <Clock className="h-6 w-6" /> },
    { name: "Processing", icon: <Package className="h-6 w-6" /> },
    { name: "Out for Delivery", icon: <Truck className="h-6 w-6" /> },
    { name: "Delivered", icon: <CheckCircle className="h-6 w-6" /> }
  ];

  return (
    <div className={`${className} p-4 border rounded-lg`}>
      <h3 className="font-medium text-lg mb-4">Order Status</h3>
      
      {expectedDeliveryDate && (
        <div className="mb-4 p-3 bg-primary/5 rounded">
          <p className="text-sm">
            <span className="font-medium">Expected Delivery:</span> {formatDeliveryDate()}
          </p>
        </div>
      )}
      
      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-8 left-0 right-0 h-0.5 bg-gray-200"></div>
        <div 
          className="absolute top-8 left-0 h-0.5 bg-primary transition-all duration-500"
          style={{ width: `${step === 3 ? '100%' : (step * 33.33)}%` }}
        ></div>
        
        {/* Steps */}
        <div className="flex justify-between relative">
          {steps.map((s, i) => (
            <div key={s.name} className="flex flex-col items-center relative">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 z-10
                  ${i <= step 
                    ? 'bg-primary text-white' 
                    : 'bg-white border-2 border-gray-200 text-gray-400'
                  }`}
              >
                {s.icon}
              </div>
              <span className={`text-xs text-center w-20 ${i <= step ? 'text-primary font-medium' : 'text-gray-500'}`}>
                {s.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Simple label-only component for smaller UI areas
export function OrderStatusLabel({ status }: { status: string }) {
  let color = "bg-gray-100 text-gray-800"; // Default
  let label = "Unknown";
  
  switch (status) {
    case "pending":
      color = "bg-yellow-100 text-yellow-800";
      label = "Pending";
      break;
    case "processing":
      color = "bg-blue-100 text-blue-800";
      label = "Processing";
      break;
    case "out_for_delivery":
      color = "bg-purple-100 text-purple-800";
      label = "Out for Delivery";
      break;
    case "delivered":
      color = "bg-green-100 text-green-800";
      label = "Delivered";
      break;
    case "cancelled":
      color = "bg-red-100 text-red-800";
      label = "Cancelled";
      break;
  }
  
  return (
    <span className={`${color} px-2 py-1 text-xs font-medium rounded-full`}>
      {label}
    </span>
  );
}