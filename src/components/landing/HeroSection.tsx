import { motion } from "framer-motion";
import PhoneMockup from "./PhoneMockup";
import { useCreateGift } from "@/hooks/use-create-gift";

const floatingEmojis = ["💝", "🎁", "🎂", "✨", "💌", "🎀"];

const HeroSection = () => {
  const createGift = useCreateGift();
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-pink-50 via-white to-white" />

      {floatingEmojis.map((emoji, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl sm:text-3xl opacity-20 pointer-events-none select-none"
          style={{
            left: `${10 + i * 15}%`,
            top: `${15 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        >
          {emoji}
        </motion.span>
      ))}

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block font-body text-sm font-semibold text-pink-500 bg-pink-50 px-4 py-1.5 rounded-full mb-6 border border-pink-100">
                🎀 The cutest way to say you care
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6"
            >
              <span className="text-gradient-giftfy">Send a gift</span>
              <br />
              they'll never forget{" "}
              <span className="inline-block animate-heartbeat">💝</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-body text-lg sm:text-xl text-gray-500 max-w-lg mx-auto lg:mx-0 mb-8"
            >
              Create a beautiful, personalized digital gift page in 2 minutes. Share it via WhatsApp, Instagram, or any link.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 8px 30px rgba(236,72,153,0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => createGift()}
                className="gradient-btn text-white font-body font-bold text-lg px-8 py-4 rounded-full shadow-lg"
              >
                Create Your Gift 🎁
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
                className="font-body font-semibold text-lg px-8 py-4 rounded-full border-2 border-pink-200 text-pink-500 hover:bg-pink-50 transition-colors"
              >
                See a Demo ✨
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 flex items-center gap-3 justify-center lg:justify-start"
            >
              <div className="flex -space-x-2">
                {["🧑", "👩", "🧑‍🦱", "👩‍🦰"].map((e, i) => (
                  <span key={i} className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-sm border-2 border-white">
                    {e}
                  </span>
                ))}
              </div>
              <span className="font-body text-sm text-gray-400">
                2,000+ gifts sent by happy senders
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex-shrink-0"
          >
            <div className="animate-gentle-float">
              <PhoneMockup>
                <div className="p-4 pt-10 text-center">
                  <div className="text-4xl mb-3 animate-heartbeat">🎁</div>
                  <p className="font-display text-xl text-pink-500 font-bold mb-2">
                    Happy Birthday!
                  </p>
                  <p className="font-handwritten text-base text-gray-400 mb-4">
                    Someone special made this for you...
                  </p>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1 + i * 0.3 }}
                        className="h-24 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100"
                      />
                    ))}
                  </div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.2 }}
                    className="mt-4 p-3 rounded-xl bg-pink-50 border border-pink-100"
                  >
                    <p className="font-handwritten text-sm text-gray-500">
                      "You mean the world to me 💖"
                    </p>
                  </motion.div>
                </div>
              </PhoneMockup>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
