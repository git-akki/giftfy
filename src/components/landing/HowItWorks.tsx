import { motion } from "framer-motion";
import { HOW_IT_WORKS } from "@/data/giftfy";

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-gradient-to-b from-white to-pink-50/50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gradient-giftfy mb-4">
            It's ridiculously easy 🤭
          </h2>
          <p className="font-body text-lg text-gray-400">
            Three steps. Two minutes. One happy giftfy.
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden md:block absolute top-24 left-[16.67%] right-[16.67%] h-0.5 border-t-2 border-dashed border-pink-200" />

          <div className="grid md:grid-cols-3 gap-8 md:gap-6 relative">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center relative"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center mx-auto mb-5 border-4 border-white shadow-lg relative z-10"
                >
                  <span className="text-3xl">{step.emoji}</span>
                </motion.div>

                <div className="absolute top-0 left-1/2 ml-6 -mt-1 w-7 h-7 rounded-full bg-pink-500 text-white font-body font-bold text-xs flex items-center justify-center z-20 shadow-md">
                  {step.number}
                </div>

                <h3 className="font-display text-2xl font-bold text-gray-800 mb-2">
                  {step.title}
                </h3>
                <p className="font-body text-gray-500 text-base max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
