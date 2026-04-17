import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-pink-100 bg-pink-50/30 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <Link to="/" className="font-display text-2xl font-bold text-gradient-giftfy">
              Giftfy 💝
            </Link>
            <p className="font-body text-sm text-gray-400 mt-1">
              Digital gifts that make them cry happy tears
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link to="/pricing" className="font-body text-sm text-gray-500 hover:text-pink-500 transition-colors">
              Pricing
            </Link>
            <a href="#faq" className="font-body text-sm text-gray-500 hover:text-pink-500 transition-colors">
              FAQ
            </a>
            <a href="#" className="font-body text-sm text-gray-500 hover:text-pink-500 transition-colors">
              Terms
            </a>
            <a href="#" className="font-body text-sm text-gray-500 hover:text-pink-500 transition-colors">
              Privacy
            </a>
            <a href="#" className="font-body text-sm text-gray-500 hover:text-pink-500 transition-colors">
              Refund Policy
            </a>
          </div>

          <div className="flex items-center gap-4">
            <a href="#" className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 hover:bg-pink-200 transition-colors text-sm">
              IG
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 hover:bg-pink-200 transition-colors text-sm">
              X
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-pink-100 text-center">
          <p className="font-body text-sm text-gray-400">
            Made with 💖 in India &middot; &copy; {new Date().getFullYear()} Giftfy
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
