'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const ROLES = [
  { id: 'student', label: 'Student', desc: 'Studying for exams or courses', icon: '📚' },
  { id: 'developer', label: 'Developer', desc: 'Building software and writing code', icon: '💻' },
  { id: 'designer', label: 'Designer', desc: 'Creating visual and UX experiences', icon: '🎨' },
  { id: 'freelancer', label: 'Freelancer', desc: 'Working independently across projects', icon: '🚀' },
  { id: 'researcher', label: 'Researcher', desc: 'Analyzing data and exploring ideas', icon: '🔬' },
  { id: 'founder', label: 'Founder', desc: 'Building and growing a startup', icon: '💡' },
  { id: 'teacher', label: 'Teacher', desc: 'Teaching, training, or mentoring others', icon: '👨‍🏫' },
  { id: 'office_worker', label: 'Professional', desc: 'Working in a corporate or office role', icon: '💼' },
  { id: 'medical_student', label: 'Medical Student', desc: 'Preparing for med school or residency', icon: '🩺' },
  { id: 'competitive_exam', label: 'Exam Candidate', desc: 'Preparing for competitive or entrance exams', icon: '📝' },
  { id: 'university', label: 'University Student', desc: 'Undergrad or graduate studies', icon: '🎓' },
  { id: 'other', label: 'Something else', desc: 'We still want to help you', icon: '✨' },
];

export const ROLES_LIST = ROLES;

const itemStagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.03 } },
};

const itemFade = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
};

interface RoleStepProps {
  selectedRole: string;
  onSelectRole: (role: string) => void;
  direction: number;
}

export function RoleStep({ selectedRole, onSelectRole, direction }: RoleStepProps) {
  return (
    <motion.div
      initial={{ x: direction > 0 ? 60 : -60, opacity: 0, scale: 0.97, filter: 'blur(3px)' }}
      animate={{ x: 0, opacity: 1, scale: 1, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 260, damping: 25 } }}
      exit={{ x: direction > 0 ? -60 : 60, opacity: 0, scale: 0.97, filter: 'blur(3px)', transition: { type: 'spring', stiffness: 260, damping: 25 } }}
    >
      <h2 className="mb-2 text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
        What best describes you?
      </h2>
      <p className="mb-6 text-sm text-zinc-500">
        This helps your coach tailor advice to your workflow.
      </p>
      <motion.div
        variants={itemStagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
        role="radiogroup"
        aria-label="Choose your role"
      >
        {ROLES.map((role) => (
          <motion.button
            key={role.id}
            variants={itemFade}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectRole(role.id)}
            role="radio"
            aria-checked={selectedRole === role.id}
            aria-label={`${role.label} — ${role.desc}`}
            className={cn(
              'group relative flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all duration-200',
              selectedRole === role.id
                ? 'border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-300 ring-1 ring-emerald-500/20'
                : 'border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:border-white/[0.12] hover:bg-white/[0.04] hover:text-zinc-200'
            )}
          >
            {selectedRole === role.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20"
              >
                <Check className="h-3 w-3 text-emerald-400" />
              </motion.div>
            )}
            <span className="text-xl" aria-hidden="true">{role.icon}</span>
            <span className="text-sm font-medium">{role.label}</span>
            <span className="text-xs text-zinc-500 leading-snug">{role.desc}</span>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}
