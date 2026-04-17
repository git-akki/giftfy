import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-pink-50 via-white to-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="text-7xl mb-6"
        >
          😢
        </motion.div>
        <h1 className="font-display text-6xl font-bold text-gradient-giftfy mb-3">
          Oops!
        </h1>
        <p className="font-body text-lg text-gray-400 mb-8 max-w-sm mx-auto">
          We couldn't find that page. Maybe the gift link expired or the URL has a typo?
        </p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            to="/"
            className="inline-block gradient-btn text-white font-body font-bold text-base px-8 py-3.5 rounded-full shadow-lg"
          >
            Back to Home 💝
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
