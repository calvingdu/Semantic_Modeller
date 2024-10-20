import React from 'react';
import { motion } from 'framer-motion';

const Switch = ({ checked, onCheckedChange }) => {
  return (
    <motion.div
      className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer ${
        checked ? 'bg-green-500' : 'bg-gray-300'
      }`}
      onClick={() => onCheckedChange(!checked)}
    >
      <motion.div
        className="w-6 h-6 bg-white rounded-full shadow-md"
        layout
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 30
        }}
        style={{
          translateX: checked ? '24px' : '0px'
        }}
      />
    </motion.div>
  );
};

export default Switch;