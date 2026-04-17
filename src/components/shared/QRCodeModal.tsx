import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface QRCodeModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
  recipientName: string;
}

const QRCodeModal = ({ open, onClose, url, recipientName }: QRCodeModalProps) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl p-8 shadow-xl text-center max-w-xs w-full relative"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
          <p className="font-display text-xl font-bold text-gradient-giftfy mb-4">
            QR Code for {recipientName}
          </p>
          <div className="bg-white p-4 rounded-2xl inline-block border border-pink-100">
            <QRCodeSVG value={url} size={200} fgColor="#ec4899" />
          </div>
          <p className="font-body text-xs text-gray-400 mt-4">
            Scan to open the gift page 💝
          </p>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default QRCodeModal;
