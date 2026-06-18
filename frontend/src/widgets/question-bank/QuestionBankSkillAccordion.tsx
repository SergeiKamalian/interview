import { useMemo, useState } from 'react';
import type { QuestionBankClientFilters } from '@entities/question/lib/filterQuestionBankItems';
import { filterQuestionBankItems } from '@entities/question/lib/filterQuestionBankItems';
import {
  groupQuestionsByPrimarySkill,
  type QuestionSkillGroup,
} from '@entities/question/lib/groupQuestionsBySkill';
import type { QuestionListItem } from '@entities/question/model/types';
import { QuestionBankTable } from './QuestionBankTable';

type QuestionBankSkillAccordionProps = {
  items: QuestionListItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  filters: QuestionBankClientFilters;
};

export function QuestionBankSkillAccordion({
  items,
  selectedId,
  onSelect,
  filters,
}: QuestionBankSkillAccordionProps) {
  const groups = useMemo(() => {
    const filtered = filterQuestionBankItems(items, filters);
    return groupQuestionsByPrimarySkill(filtered);
  }, [items, filters]);

  const [openSkills, setOpenSkills] = useState<Set<string>>(() => new Set());

  const toggleSkill = (code: string) => {
    setOpenSkills((current) => {
      const next = new Set(current);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  if (groups.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        {items.length === 0
          ? 'Вопросов пока нет.'
          : 'Ничего не найдено по выбранным фильтрам.'}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <SkillAccordionSection
          key={group.skill.code}
          group={group}
          isOpen={openSkills.has(group.skill.code)}
          onToggle={() => toggleSkill(group.skill.code)}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

type SkillAccordionSectionProps = {
  group: QuestionSkillGroup;
  isOpen: boolean;
  onToggle: () => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

function SkillAccordionSection({
  group,
  isOpen,
  onToggle,
  selectedId,
  onSelect,
}: SkillAccordionSectionProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span
            className={[
              'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold transition',
              isOpen
                ? 'bg-brand-primary text-white'
                : 'bg-slate-100 text-slate-600',
            ].join(' ')}
            aria-hidden
          >
            {isOpen ? '−' : '+'}
          </span>
          <span className="truncate text-sm font-semibold text-slate-900">
            {group.skill.name}
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          {group.items.length}
        </span>
      </button>

      {isOpen && (
        <div className="border-t border-slate-200 px-4 py-4">
          <QuestionBankTable
            items={group.items}
            selectedId={selectedId}
            onSelect={onSelect}
            showDetails={false}
          />
        </div>
      )}
    </section>
  );
}
