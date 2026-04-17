import { ReactNode } from "react";

interface PhoneMockupProps {
  children: ReactNode;
  className?: string;
}

const PhoneMockup = ({ children, className = "" }: PhoneMockupProps) => (
  <div className={`relative mx-auto ${className}`} style={{ width: 280, height: 560 }}>
    <div className="absolute inset-0 rounded-[3rem] border-[6px] border-gray-800 bg-gray-800 shadow-2xl overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-800 rounded-b-2xl z-10" />
      <div className="w-full h-full rounded-[2.5rem] overflow-hidden bg-gradient-to-b from-pink-50 to-white">
        {children}
      </div>
    </div>
  </div>
);

export default PhoneMockup;
