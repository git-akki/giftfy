// src/data/giftfy.ts

export interface PricingTier {
  name: string;
  price: number;
  priceLabel: string;
  badge?: string;
  features: { text: string; included: boolean }[];
  cta: string;
  highlighted?: boolean;
}

export interface Occasion {
  name: string;
  emoji: string;
  gradient: string;
}

export interface Testimonial {
  name: string;
  avatar: string;
  quote: string;
  emoji: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Step {
  number: number;
  title: string;
  description: string;
  emoji: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    name: "Free",
    price: 0,
    priceLabel: "₹0",
    features: [
      { text: "3 photos", included: true },
      { text: "1 message", included: true },
      { text: "Giftfy branding", included: true },
      { text: "Expires in 7 days", included: true },
      { text: "Music library", included: false },
      { text: "Custom music upload", included: false },
      { text: "Video support", included: false },
      { text: "Premium templates", included: false },
    ],
    cta: "Start Free",
  },
  {
    name: "Sweet",
    price: 79,
    priceLabel: "₹79",
    badge: "Most Popular 💖",
    highlighted: true,
    features: [
      { text: "10 photos", included: true },
      { text: "Custom message", included: true },
      { text: "No branding", included: true },
      { text: "Never expires", included: true },
      { text: "Music library", included: true },
      { text: "Custom music upload", included: false },
      { text: "Video support", included: false },
      { text: "Premium templates", included: false },
    ],
    cta: "Create Gift",
  },
  {
    name: "Premium",
    price: 199,
    priceLabel: "₹199",
    features: [
      { text: "Unlimited photos", included: true },
      { text: "Custom message", included: true },
      { text: "No branding", included: true },
      { text: "Never expires", included: true },
      { text: "Music library", included: true },
      { text: "Custom music upload", included: true },
      { text: "Video support", included: true },
      { text: "Premium templates", included: true },
      { text: "QR code", included: true },
      { text: "Scheduled reveal", included: true },
    ],
    cta: "Create Gift",
  },
  {
    name: "Deluxe",
    price: 399,
    priceLabel: "₹399",
    features: [
      { text: "Everything in Premium", included: true },
      { text: "Custom URL", included: true },
      { text: "Password protection", included: true },
      { text: "Story mode (multi-page)", included: true },
      { text: "View analytics", included: true },
    ],
    cta: "Create Gift",
  },
];

export const OCCASIONS: Occasion[] = [
  { name: "Birthday", emoji: "🎂", gradient: "from-pink-200 to-rose-200" },
  { name: "Anniversary", emoji: "💍", gradient: "from-purple-200 to-pink-200" },
  { name: "Valentine's", emoji: "💘", gradient: "from-red-200 to-pink-200" },
  { name: "Friendship Day", emoji: "🤝", gradient: "from-amber-200 to-orange-200" },
  { name: "Rakhi", emoji: "🪢", gradient: "from-yellow-200 to-amber-200" },
  { name: "Diwali", emoji: "🪔", gradient: "from-orange-200 to-yellow-200" },
];

export const HOW_IT_WORKS: Step[] = [
  {
    number: 1,
    title: "Pick a vibe",
    description: "Choose an occasion and pick a template that matches the mood",
    emoji: "🎨",
  },
  {
    number: 2,
    title: "Make it yours",
    description: "Add photos, write a heartfelt message, pick the perfect song",
    emoji: "✨",
  },
  {
    number: 3,
    title: "Send the link",
    description: "Share via WhatsApp, Instagram, or copy the link — they'll love it",
    emoji: "🚀",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  { name: "Priya", avatar: "P", quote: "She literally cried 😭💖 Best birthday surprise ever!", emoji: "😭" },
  { name: "Rohit", avatar: "R", quote: "Way better than a boring card. My girlfriend loved it!", emoji: "🥰" },
  { name: "Ananya", avatar: "A", quote: "Made one for my bestie in 2 mins. She's still talking about it!", emoji: "✨" },
  { name: "Arjun", avatar: "A", quote: "The unwrap animation is so cute. 10/10 would recommend", emoji: "🎁" },
  { name: "Meera", avatar: "M", quote: "Used it for our anniversary. Husband was SHOOK 😂", emoji: "💍" },
  { name: "Karan", avatar: "K", quote: "₹79 for this? Absolute steal. Made my mom's day!", emoji: "🎂" },
];

export const LANDING_FAQ: FAQItem[] = [
  {
    question: "How does the recipient open the gift?",
    answer: "They'll receive a link (via WhatsApp, Instagram, or however you share it). When they tap it, they'll see a beautiful unwrap animation followed by your personalized gift page with photos, messages, and music!",
  },
  {
    question: "Can I edit after paying?",
    answer: "Yes! You can edit your gift page anytime before you share the link. Once shared, the content is locked so the recipient gets the perfect experience you designed.",
  },
  {
    question: "Is payment secure?",
    answer: "Absolutely. We use Razorpay, one of India's most trusted payment gateways. Your payment info is encrypted and we never store your card details.",
  },
  {
    question: "What if they don't have the link?",
    answer: "You can reshare the link anytime from your dashboard. You can also generate a QR code (Premium & above) that they can scan to open the gift.",
  },
  {
    question: "Can I add videos?",
    answer: "Yes! Video support is available on Premium (₹199) and Deluxe (₹399) tiers. You can upload short video clips that play right in the gift page.",
  },
  {
    question: "Does the gift expire?",
    answer: "Free gifts expire after 7 days. All paid tiers (Sweet, Premium, Deluxe) never expire — your gift page lives forever!",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept UPI, debit/credit cards, wallets (Paytm, PhonePe, etc.), and net banking — all through Razorpay's secure payment gateway.",
  },
];

export const PRICING_FAQ: FAQItem[] = [
  {
    question: "Is this a one-time payment or subscription?",
    answer: "One-time payment! Pay once, your gift page is yours forever. No hidden fees, no recurring charges.",
  },
  {
    question: "Can I get a refund?",
    answer: "If you haven't shared your gift link yet, we offer a full refund within 24 hours of purchase. Once the link is shared, refunds are not available since the gift has been delivered.",
  },
  {
    question: "Do prices include taxes?",
    answer: "Yes! All prices shown are inclusive of GST and all applicable taxes. What you see is what you pay.",
  },
  {
    question: "Can I upgrade my plan later?",
    answer: "Yes! You can upgrade from any tier to a higher one by paying the difference. Just visit your gift dashboard and click 'Upgrade'.",
  },
  {
    question: "Is my payment information safe?",
    answer: "100%. Payments are processed by Razorpay, a PCI-DSS compliant payment gateway trusted by thousands of Indian businesses. We never see or store your card details.",
  },
  {
    question: "What payment methods are supported?",
    answer: "UPI (Google Pay, PhonePe, Paytm), debit cards, credit cards, wallets, and net banking. UPI payments are instant — pay in 4 seconds!",
  },
];

export const STATS = {
  giftsSent: "2,000+",
  avgReaction: "4.9★",
  happyRecipients: "1,500+",
};
