import { motion } from "framer-motion";
import { useCreateGift } from "@/hooks/use-create-gift";

const FloatingCreateButton = () => {
  const createGift = useCreateGift();
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 2, type: "spring", stiffness: 200 }}
      className="fixed bottom-6 right-6 z-40 md:hidden"
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => createGift()}
        className="gradient-btn text-white font-body font-bold text-sm px-5 py-3 rounded-full shadow-xl flex items-center gap-2"
        style={{ boxShadow: "0 8px 30px rgba(236,72,153,0.35)" }}
      >
        <span>Create Gift</span>
        <span>🎁</span>
      </motion.button>
    </motion.div>
  );
};

export default FloatingCreateButton;
