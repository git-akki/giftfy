import { motion } from "framer-motion";
import { TESTIMONIALS, STATS } from "@/data/giftfy";

const SocialProof = () => {
  const doubled = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className="py-20 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gradient-giftfy mb-4">
            People are obsessed 🥰
          </h2>
          <p className="font-body text-lg text-gray-400">
            Real reactions from real recipients
          </p>
        </motion.div>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee hover:[animation-play-state:paused]">
          {doubled.map((t, i) => (
            <div
              key={`${t.name}-${i}`}
              className="flex-shrink-0 w-72 mx-3 p-5 rounded-2xl bg-white border border-pink-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center font-body font-bold text-sm text-pink-600">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-body font-bold text-sm text-gray-800">{t.name}</p>
                  <p className="font-body text-xs text-gray-400">Verified sender ✓</p>
                </div>
                <span className="ml-auto text-xl">{t.emoji}</span>
              </div>
              <p className="font-body text-sm text-gray-600 leading-relaxed">
                "{t.quote}"
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto mt-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-6 sm:gap-12 py-4 px-6 rounded-2xl bg-pink-50 border border-pink-100"
        >
          {[
            { label: "Gifts sent", value: STATS.giftsSent },
            { label: "Avg reaction", value: STATS.avgReaction },
            { label: "Happy recipients", value: STATS.happyRecipients },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-body font-bold text-lg sm:text-xl text-pink-600">
                {stat.value}
              </p>
              <p className="font-body text-xs text-gray-400">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProof;
