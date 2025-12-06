import React from "react";

interface StepProgressBarProps {
    /** Array of step labels */
    steps: string[];
    /** Current step (1-based index) */
    currentStep: number;
    /** Optional color customization */
    activeColor?: string;
    inactiveColor?: string;
    /** Optional width of connector line */
    connectorWidth?: string;
}

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
    steps,
    currentStep,
    activeColor = "bg-blue-900",
    inactiveColor = "bg-gray-300",
    connectorWidth = "100%",
}) => {
    return (
        <div className="flex justify-between items-center relative mb-10 mt-6 w-full px-4 sm:px-6">
            {steps.map((label, index) => {
                const stepIndex = index + 1;
                const isActive = currentStep >= stepIndex;
                const isCompleted = currentStep > stepIndex;

                return (
                    <div key={index} className="flex-1 flex flex-col items-center relative">
                        {/* Step Circle */}
                        <div
                            className={`w-10 h-10 flex items-center justify-center rounded-full text-white text-lg font-semibold transition-all duration-300 z-10 ${isActive ? `${activeColor} scale-110 shadow-lg` : inactiveColor
                                }`}
                        >
                            {stepIndex}
                        </div>

                        {/* Step Label */}
                        <p
                            className={`mt-2 text-xs sm:text-sm font-medium text-center ${isActive ? "text-blue-900" : "text-gray-500"
                                }`}
                        >
                            {label}
                        </p>

                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div
                                className={`absolute top-5 left-[50%] translate-x-5 h-1 ${inactiveColor} z-0`}
                                style={{ width: connectorWidth }}
                            >
                                <div
                                    className={`h-1 ${activeColor} transition-all duration-500`}
                                    style={{ width: isCompleted ? "100%" : "0%" }}
                                ></div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
