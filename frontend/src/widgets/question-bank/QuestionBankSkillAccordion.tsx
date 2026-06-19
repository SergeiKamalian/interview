import { useMemo, useState } from 'react';
import type { QuestionBankClientFilters } from '@entities/question/lib/filterQuestionBankItems';
import { filterQuestionBankItems } from '@entities/question/lib/filterQuestionBankItems';
import {
  groupQuestionsByPrimarySkill,
} from '@entities/question/lib/groupQuestionsBySkill';
import type { QuestionListItem } from '@entities/question/model/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
} from '@shared/ui';
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

  const [openSkills, setOpenSkills] = useState<string[]>([]);

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
    <Accordion
      multiple
      value={openSkills}
      onValueChange={setOpenSkills}
      className="space-y-3"
    >
      {groups.map((group) => (
        <AccordionItem
          key={group.skill.code}
          value={group.skill.code}
          className="overflow-hidden rounded-xl border border-border bg-card px-1"
        >
          <AccordionTrigger className="px-3 hover:no-underline">
            <span className="flex min-w-0 flex-1 items-center gap-3">
              <span className="truncate text-sm font-semibold text-foreground">
                {group.skill.name}
              </span>
            </span>
            <Badge variant="muted" className="mr-2">{group.items.length}</Badge>
          </AccordionTrigger>
          <AccordionContent className="px-3">
            <QuestionBankTable
              items={group.items}
              selectedId={selectedId}
              onSelect={onSelect}
              showDetails={false}
            />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
