import { motion } from "framer-motion";
import { useCreateGift } from "@/hooks/use-create-gift";

const FinalCTA = () => {
  const createGift = useCreateGift();
  return (
    <section className="py-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="p-10 sm:p-14 rounded-[2rem] bg-gradient-to-br from-pink-100 via-purple-50 to-orange-50 border border-pink-100 relative overflow-hidden"
        >
          <span className="absolute top-4 left-6 text-3xl opacity-30 animate-gentle-float">💝</span>
          <span className="absolute bottom-6 right-8 text-2xl opacity-30 animate-float">🎁</span>
          <span className="absolute top-8 right-12 text-2xl opacity-20 animate-gentle-float">✨</span>

          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gradient-giftfy mb-4 relative z-10">
            Don't just wish them —<br />surprise them 💝
          </h2>
          <p className="font-body text-lg text-gray-500 mb-8 relative z-10">
            Takes just 2 minutes. Starts free.
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 8px 30px rgba(236,72,153,0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => createGift()}
            className="gradient-btn text-white font-body font-bold text-lg px-10 py-4 rounded-full shadow-lg relative z-10"
          >
            Create Your Gift 🎁
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
