import { Check, Clock, Package, Truck } from "lucide-react";

type OrderStatusProps = {
  status: string;
  className?: string;
};

export function OrderStatus({ status, className = "" }: OrderStatusProps) {
  // Define the status steps and their order
  const statusSteps = [
    { key: "pending", label: "Pending", icon: Clock, color: "bg-yellow-500" },
    { key: "processing", label: "Processing", icon: Package, color: "bg-blue-500" },
    { key: "shipped", label: "Shipped", icon: Truck, color: "bg-purple-500" },
    { key: "delivered", label: "Delivered", icon: Check, color: "bg-green-500" },
  ];

  // Find the current status index
  const currentIndex = statusSteps.findIndex(step => step.key === status);
  const currentStatus = statusSteps[currentIndex >= 0 ? currentIndex : 0];

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStatus.color} text-white mr-2`}>
        <currentStatus.icon className="w-4 h-4" />
      </div>
      <span className="font-medium">{currentStatus.label}</span>
      
      {/* Show progress if not the final status */}
      {currentIndex < statusSteps.length - 1 && (
        <div className="ml-4 flex items-center">
          <div className="h-1 w-16 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${currentStatus.color}`} 
              style={{ width: `${(currentIndex + 1) * 100 / statusSteps.length}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}

export function OrderProgressTracker({ status }: { status: string }) {
  // Define the status steps and their order
  const statusSteps = [
    { key: "pending", label: "Order Received", icon: Clock, color: "bg-yellow-500" },
    { key: "processing", label: "Processing", icon: Package, color: "bg-blue-500" },
    { key: "shipped", label: "Shipped", icon: Truck, color: "bg-purple-500" },
    { key: "delivered", label: "Delivered", icon: Check, color: "bg-green-500" },
  ];

  // Find the current status index
  const currentIndex = statusSteps.findIndex(step => step.key === status);

  return (
    <div className="w-full py-8">
      <div className="relative flex justify-between">
        {/* Progress bar */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 w-full"></div>
        
        {/* Completed progress */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary transition-all duration-500"
          style={{ 
            width: `${currentIndex >= 0 ? (currentIndex / (statusSteps.length - 1)) * 100 : 0}%` 
          }}
        ></div>
        
        {/* Status points */}
        {statusSteps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div key={step.key} className="relative flex flex-col items-center z-10">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 
                  ${isCompleted ? step.color : 'bg-gray-200'} 
                  ${isCurrent ? 'ring-4 ring-offset-2 ring-primary/30' : ''}
                  text-white`}
              >
                <step.icon className="w-4 h-4" />
              </div>
              <span className={`mt-2 text-xs font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}