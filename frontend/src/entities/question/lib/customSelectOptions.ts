import type { SelectOption } from '@shared/ui/Select/SelectField';

type NamedCustomEntity = {
  id: string;
  name: string;
  isCustom: boolean;
};

export function toSelectOption(entity: NamedCustomEntity): SelectOption {
  return {
    value: entity.id,
    label: entity.name,
    isCustom: entity.isCustom,
  };
}

export function toSkillSelectOptions(
  skills: Array<{ id: string; name: string; isCustom: boolean }>,
): SelectOption[] {
  return skills.map(toSelectOption);
}

export function toTopicSelectOptions(
  topics: Array<{ id: string; name: string; isCustom: boolean }>,
): SelectOption[] {
  return topics.map(toSelectOption);
}
