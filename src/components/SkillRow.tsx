'use client';

import SkillIcon from '@/components/SkillIcon';

interface Skill {
  id: string;
  label: string;
  icon: string;
  level: 'rookie' | 'intermediate' | 'advanced';
}

interface SkillRowProps {
  title: string;
  skills: Skill[];
  onHover: (id: string, label: string, level: string) => void;
  onLeave: () => void;
}

export default function SkillRow({ title, skills, onHover, onLeave }: SkillRowProps) {
  return (
    <div className="w-full max-w-5xl mx-auto mb-6">
      {/* <h2 className="text-white text-base font-semibold text-center mb-2 uppercase tracking-widest opacity-70">
        {title}
      </h2> */}
      <div className="no-scrollbar flex overflow-x-auto justify-center space-x-6 px-4 pb-2">
        {skills.map((skill) => (
          <SkillIcon
            key={skill.id}
            id={skill.id}
            label={skill.label}
            icon={skill.icon}
            onHover={() => onHover(skill.id, skill.label, skill.level)}
            onLeave={onLeave}
          />
        ))}
      </div>
    </div>
  );
}


