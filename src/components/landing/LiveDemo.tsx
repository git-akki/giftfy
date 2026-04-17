import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import PhoneMockup from "./PhoneMockup";

const LiveDemo = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="demo" className="py-20 px-4 sm:px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gradient-giftfy mb-4">
            See what your recipient will see 👀
          </h2>
          <p className="font-body text-lg text-gray-400 max-w-md mx-auto">
            This is the magic moment when they open your gift
          </p>
        </motion.div>

        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <PhoneMockup className="shadow-2xl">
              <div className="p-4 pt-10 text-center relative overflow-hidden">
                {isInView && (
                  <>
                    {["🎉", "🎊", "✨", "💖", "🌟", "💝", "🎀", "⭐"].map((emoji, i) => (
                      <motion.span
                        key={i}
                        className="absolute text-lg pointer-events-none"
                        initial={{
                          x: 120,
                          y: 200,
                          opacity: 1,
                          scale: 0,
                        }}
                        animate={{
                          x: 120 + (Math.cos((i * Math.PI * 2) / 8) * 100),
                          y: 200 + (Math.sin((i * Math.PI * 2) / 8) * 100) - 50,
                          opacity: [0, 1, 1, 0],
                          scale: [0, 1.2, 1, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          delay: 0.5 + i * 0.08,
                          ease: "easeOut",
                        }}
                      >
                        {emoji}
                      </motion.span>
                    ))}
                  </>
                )}

                <motion.div
                  initial={{ scale: 1.5, opacity: 1 }}
                  animate={isInView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                  className="text-5xl mb-4"
                >
                  🎁
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ delay: 1 }}
                  className="font-display text-2xl text-pink-500 font-bold mb-1"
                >
                  Happy Birthday! 🎂
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ delay: 1.3 }}
                  className="font-handwritten text-base text-gray-400 mb-4"
                >
                  From someone who adores you
                </motion.p>

                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 60 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 1.8 + i * 0.3, duration: 0.5 }}
                    className="h-20 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 mb-2 flex items-center justify-center"
                  >
                    <span className="text-2xl opacity-50">
                      {["📸", "🥰", "🌅"][i]}
                    </span>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 2.8 }}
                  className="mt-3 p-3 rounded-xl bg-pink-50 border border-pink-100"
                >
                  <p className="font-handwritten text-sm text-gray-600">
                    "Every moment with you is a gift. Happy birthday, my love! 💖"
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ delay: 3.2 }}
                  className="mt-3 flex items-center justify-center gap-1.5"
                >
                  <span className="text-sm">🎵</span>
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-pink-400 rounded-full"
                      animate={{ height: [8, 16, 8] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                  <span className="font-body text-xs text-gray-400 ml-1">Now playing</span>
                </motion.div>
              </div>
            </PhoneMockup>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LiveDemo;
