// src/components/navbar/Logo.jsx
import { Link } from 'react-router-dom';
import { FaFilm } from 'react-icons/fa';
//import { motion } from 'framer-motion';

export default function Logo() {
  return (
    <div className="flex-shrink-0 mr-6 sm:mr-12">
      <Link to="/" className="flex items-center group">
        <motion.div whileHover={{ rotate: 15 }} className="mr-3">
          <FaFilm className="text-gray-100 text-2xl group-hover:text-blue-400 transition-colors" />
        </motion.div>
        <span className="text-gray-100 text-xl font-bold tracking-tighter group-hover:text-blue-400 transition-colors">
          FLICK<span className="text-blue-400">BOX</span>
        </span>
      </Link>
    </div>
  );
}
