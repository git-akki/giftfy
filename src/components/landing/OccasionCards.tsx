import { motion } from "framer-motion";
import { OCCASIONS } from "@/data/giftfy";
import { useCreateGift } from "@/hooks/use-create-gift";

const OccasionCards = () => {
  const createGift = useCreateGift();
  return (
    <section className="py-20 px-4 sm:px-6 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gradient-giftfy mb-4">
            Perfect for every special moment ✨
          </h2>
          <p className="font-body text-lg text-gray-400 max-w-md mx-auto">
            Pick an occasion and make someone's day unforgettable
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {OCCASIONS.map((occasion, i) => (
            <motion.div
              key={occasion.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <motion.button
                whileHover={{ y: -6, boxShadow: "0 12px 40px rgba(236,72,153,0.15)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => createGift({ occasion: occasion.name.toLowerCase().replace("'s", "").replace(" ", "-") })}
                className={`w-full p-6 sm:p-8 rounded-3xl bg-gradient-to-br ${occasion.gradient} border border-white/50 text-center group transition-all`}
              >
                <span className="text-4xl sm:text-5xl block mb-3 group-hover:scale-110 transition-transform">
                  {occasion.emoji}
                </span>
                <span className="font-body font-bold text-base sm:text-lg text-gray-700 block mb-1">
                  {occasion.name}
                </span>
                <span className="font-body text-sm text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  Create now →
                </span>
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OccasionCards;
