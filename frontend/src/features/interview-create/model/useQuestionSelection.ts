import { useCallback, useMemo, useState } from 'react';
import type { QuestionListItem } from '@entities/question/model/types';

export function useQuestionSelection(available: QuestionListItem[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectedQuestions = useMemo(
    () =>
      selectedIds
        .map((id) => available.find((item) => item.id === id))
        .filter((item): item is QuestionListItem => Boolean(item)),
    [available, selectedIds],
  );

  const toggleQuestion = useCallback((id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }, []);

  const moveUp = useCallback((id: string) => {
    setSelectedIds((current) => {
      const index = current.indexOf(id);
      if (index <= 0) {
        return current;
      }

      const next = [...current];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }, []);

  const moveDown = useCallback((id: string) => {
    setSelectedIds((current) => {
      const index = current.indexOf(id);
      if (index < 0 || index >= current.length - 1) {
        return current;
      }

      const next = [...current];
      [next[index + 1], next[index]] = [next[index], next[index + 1]];
      return next;
    });
  }, []);

  const removeQuestion = useCallback((id: string) => {
    setSelectedIds((current) => current.filter((item) => item !== id));
  }, []);

  return {
    selectedIds,
    selectedQuestions,
    toggleQuestion,
    moveUp,
    moveDown,
    removeQuestion,
  };
}
