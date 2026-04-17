import { motion } from "framer-motion";

interface Props {
  onNext?: () => void;
  onPrev?: () => void;
  nextLabel?: string;
}

const NavigationButtons = ({ onNext, onPrev, nextLabel = "Next" }: Props) => (
  <div className="flex gap-3 mt-8 justify-center">
    {onPrev && (
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={onPrev}
        className="flex items-center gap-1.5 font-body font-semibold text-sm px-5 py-2.5 rounded-full transition-all"
        style={{
          background: "hsl(340 30% 93%)",
          color: "hsl(340 30% 40%)",
          boxShadow: "0 2px 8px hsl(345 30% 70% / 0.15)",
        }}
      >
        ← Back
      </motion.button>
    )}
    {onNext && (
      <motion.button
        whileHover={{ scale: 1.06, boxShadow: "0 4px 20px hsl(345 55% 60% / 0.3)" }}
        whileTap={{ scale: 0.94 }}
        onClick={onNext}
        className="flex items-center gap-1.5 font-body font-semibold text-sm px-6 py-2.5 rounded-full text-white transition-all"
        style={{
          background: "linear-gradient(135deg, hsl(345 55% 62%), hsl(330 45% 58%))",
          boxShadow: "0 3px 12px hsl(345 55% 60% / 0.25)",
        }}
      >
        {nextLabel} →
      </motion.button>
    )}
  </div>
);

export default NavigationButtons;
