'use client';

import ScrollReveal from './ScrollReveal';

export default function BlogDescriptionReveal({ description }: { description: string }) {
  return (
    <div className="mb-8 pl-3 border-l border-white/10">
      <ScrollReveal
        baseOpacity={0.1}
        enableBlur
        baseRotation={2}
        blurStrength={3}
        containerClassName=""
        textClassName="text-white/50 text-base leading-relaxed"
      >
        {description}
      </ScrollReveal>
    </div>
  );
}
