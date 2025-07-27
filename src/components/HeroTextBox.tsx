'use client'

import { motion } from 'framer-motion'

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2 },
  },
};

const lineRevealVariant = {
  hidden: { y: '110%' },
  visible: {
    y: '0%',
    transition: {
      ease: 'easeInOut',
      duration: 0.8,
    },
  },
};

export default function HeroTextBox() {
  const role = "AI Jedi | Guardian of the Neural Force";
  const description = `I’m Sajid — a developer strong with the Source (both the Force and open source). I don’t just build models; I train Padawans of the machine world. Whether it’s decoding emotions like a mind-reading droid or generating art from thought, I’m all about using AI to bring balance to the data galaxy. I’ve seen too many models fall to the dark side of overfitting. My mission? Build with intention, automate with wisdom, and always trust the model... but verify it with a lightsaber (or maybe a confusion matrix). This is the way.`;

  return (
    <motion.div
      className="absolute top-10 right-10 z-30 w-full max-w-xl pointer-events-auto text-white text-left space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Role */}
      <motion.div
        className="overflow-hidden"
      >
        <motion.p
          variants={lineRevealVariant}
          className="text-sm uppercase tracking-wider font-semibold"
        >
          {role}
        </motion.p>
      </motion.div>

      {/* Description */}
      <motion.div
        className="overflow-hidden"
      >
        <motion.p
          variants={lineRevealVariant}
          className="text-base font-light leading-relaxed"
        >
          {description}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}















