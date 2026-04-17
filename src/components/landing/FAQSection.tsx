import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FAQItem } from "@/data/giftfy";

interface FAQSectionProps {
  items: FAQItem[];
  title?: string;
  subtitle?: string;
}

const FAQSection = ({
  items,
  title = "Got questions? We got you 🤗",
  subtitle = "Everything you need to know before you start",
}: FAQSectionProps) => {
  return (
    <section id="faq" className="py-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gradient-giftfy mb-4">
            {title}
          </h2>
          <p className="font-body text-lg text-gray-400">{subtitle}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {items.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border border-pink-100 rounded-2xl px-5 data-[state=open]:bg-pink-50/50 transition-colors"
              >
                <AccordionTrigger className="font-body font-semibold text-left text-gray-800 hover:no-underline py-5 text-base">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="font-body text-gray-500 text-base leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
