'use client';

import FooterNavBar from '@/components/FooterNav';
import SkillOverlay from '@/components/SkillOverlay';
import SkillRow from '@/components/SkillRow';
import { useState } from 'react';

interface Skill {
  id: string;
  label: string;
  icon: string;
  level: 'rookie' | 'intermediate' | 'advanced';
}

export default function SkillsPage() {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [levelOverlay, setLevelOverlay] = useState<{ cluster: string; level: string } | null>(null);

  const handleHover = (id: string, label: string, level: string) => {
    setHoveredSkill(label);
    setLevelOverlay({ cluster: label, level });
  };

  const handleLeave = () => {
    setHoveredSkill(null);
    setLevelOverlay(null);
  };

  const skills: Skill[] = [
    { id: 'python', label: 'Python', icon: '/skills/python.svg', level: 'advanced' },
    { id: 'r', label: 'R', icon: '/skills/r-project.svg', level: 'rookie' },
    { id: 'next', label: 'Next.js', icon: '/skills/next.js.svg', level: 'rookie' },
    { id: 'postgres', label: 'PostgreSQL', icon: '/skills/postgres.svg', level: 'rookie' },
    { id: 'cpp', label: 'C++', icon: '/skills/c++.svg', level: 'intermediate' },
    { id: 'hdfs', label: 'HDFS', icon: '/skills/hdfs.svg', level: 'intermediate' },
    { id: 'tensorflow', label: 'TensorFlow', icon: '/skills/tensorflow.svg', level: 'advanced' },
    { id: 'huggingface', label: 'HuggingFace', icon: '/skills/huggingface.svg', level: 'advanced' },
    { id: 'django', label: 'Django', icon: '/skills/django.svg', level: 'intermediate' },
    { id: 'gcp', label: 'Google Cloud Platform', icon: '/skills/gcp.svg', level: 'intermediate' },
    { id: 'git', label: 'Git', icon: '/skills/git.svg', level: 'intermediate' },
    { id: 'htmlcss', label: 'HTML', icon: '/skills/html-5.svg', level: 'rookie' },
    { id: 'css', label: 'CSS', icon: '/skills/css.svg', level: 'rookie' },
    { id: 'fastapi', label: 'FastAPI', icon: '/skills/fastapi.svg', level: 'intermediate' },
    { id: 'sql', label: 'SQL', icon: '/skills/mysql.svg', level: 'advanced' },
    { id: 'nodejs', label: 'Node.js', icon: '/skills/Node.js.svg', level: 'intermediate' },
    { id: 'numpy', label: 'NumPy', icon: '/skills/numpy.svg', level: 'advanced' },
    { id: 'scikit', label: 'Scikit-learn', icon: '/skills/scikit-learn.svg', level: 'advanced' },
    { id: 'open', label: 'OpenCV', icon: '/skills/opencv.svg', level: 'advanced' },
    { id: 'keras', label: 'Keras', icon: '/skills/keras.svg', level: 'advanced' },
    { id: 'mongodb', label: 'MongoDB', icon: '/skills/mongodb.svg', level: 'intermediate' },
    { id: 'matplotlib', label: 'Matplotlib', icon: '/skills/matplotlib.svg', level: 'advanced' },
    { id: 'pytorch', label: 'PyTorch', icon: '/skills/pytorch.svg', level: 'advanced' },
  ];

  return (
    <main className="relative w-full min-h-screen bg-black overflow-hidden pb-28">
      <div className="pt-20 px-4 space-y-6">
        <SkillRow
          title="ROOKIE"
          skills={skills.filter((s) => s.level === 'rookie')}
          onHover={handleHover}
          onLeave={handleLeave}
        />
        <SkillRow
          title="INTERMEDIATE"
          skills={skills.filter((s) => s.level === 'intermediate')}
          onHover={handleHover}
          onLeave={handleLeave}
        />
        <SkillRow
          title="ADVANCED"
          skills={skills.filter((s) => s.level === 'advanced')}
          onHover={handleHover}
          onLeave={handleLeave}
        />
      </div>

      <SkillOverlay
        hoveredSkill={levelOverlay?.cluster || null}
        level={levelOverlay?.level || null}
      />

      <FooterNavBar />
    </main>
  );
}









