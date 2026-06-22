import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { QuestionBankClientFilters } from '@entities/question/lib/filterQuestionBankItems';
import { filterQuestionBankItems } from '@entities/question/lib/filterQuestionBankItems';
import {
  groupQuestionsByPrimarySkill,
  mergeEmptyCustomSkillGroups,
} from '@entities/question/lib/groupQuestionsBySkill';
import type { QuestionListItem } from '@entities/question/model/types';
import { CustomScopeBadge } from '@entities/question/ui/CustomScopeBadge';
import type { Skill } from '@features/question-bank/api/questionBankApi';
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
  filters: QuestionBankClientFilters;
  allSkills?: Skill[];
};

export function QuestionBankSkillAccordion({
  items,
  filters,
  allSkills = [],
}: QuestionBankSkillAccordionProps) {
  const groups = useMemo(() => {
    const filtered = filterQuestionBankItems(items, filters);
    const grouped = groupQuestionsByPrimarySkill(filtered);
    const merged = mergeEmptyCustomSkillGroups(grouped, allSkills);
    const customById = new Map(allSkills.map((skill) => [skill.id, skill.isCustom]));
    const customByCode = new Map(allSkills.map((skill) => [skill.code, skill.isCustom]));

    return merged.map((group) => ({
      ...group,
      skill: {
        ...group.skill,
        isCustom:
          group.skill.isCustom ??
          customById.get(group.skill.id) ??
          customByCode.get(group.skill.code) ??
          group.items.some((item) => item.topic.skill?.isCustom),
      },
    }));
  }, [items, filters, allSkills]);

  const [openSkills, setOpenSkills] = useState<string[]>([]);

  if (groups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
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
            <span className="flex min-w-0 flex-1 items-center gap-2">
              <span className="truncate text-sm font-semibold text-foreground">
                {group.skill.name}
              </span>
              {group.skill.isCustom ? <CustomScopeBadge /> : null}
            </span>
            <Badge variant="muted" className="mr-2">
              {group.items.length}
            </Badge>
          </AccordionTrigger>
          <AccordionContent className="px-3">
            {group.items.length > 0 ? (
              <QuestionBankTable items={group.items} />
            ) : (
              <p className="py-4 text-sm text-muted-foreground">
                Вопросов в этом стеке пока нет.{' '}
                <Link
                  to={`/dashboard/question-bank/new?skillId=${encodeURIComponent(group.skill.id)}`}
                  className="text-brand-primary hover:underline"
                >
                  Создать первый вопрос
                </Link>
              </p>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
