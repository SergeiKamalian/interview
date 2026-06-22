import { getHireRecommendationMeta } from '@entities/candidate/lib/hireRecommendationMeta';
import { getCompanyDecisionLabel } from '@entities/candidate/lib/companyDecisionLabels';
import { getCandidateReviewProgressDetail } from '@entities/candidate/lib/candidateAttemptStatus';
import { formatScore, formatUnixDate } from '@shared/lib/format';
import type { AttemptExportBundle } from './attemptExport.types';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getLevelLabel(value?: string | null): string {
  if (!value) {
    return '—';
  }

  const labels: Record<string, string> = {
    junior: 'Junior',
    middle: 'Middle',
    senior: 'Senior',
    lead: 'Lead',
  };

  return labels[value] ?? value;
}

function getReviewProgressLabel(record: AttemptExportBundle['candidates'][number]): string {
  const detail = getCandidateReviewProgressDetail({
    status: record.attempt.status,
    reviewStatus: record.companyReview.reviewStatus,
    companyDecision: record.companyReview.companyDecision,
    shortlistStatus: record.attempt.shortlistStatus,
    evaluationStatus: record.attempt.overallScore != null ? 'ready' : 'evaluation_pending',
  });

  if (detail) {
    return detail;
  }

  if (record.companyReview.reviewStatus === 'reviewed') {
    return 'Проверка завершена';
  }

  return '—';
}

function getAiVerdictLabel(value: string): string {
  if (value === 'agree') {
    return 'Согласны с ИИ';
  }

  if (value === 'disagree') {
    return 'Не согласны с ИИ';
  }

  return 'Ожидает оценки';
}

function renderList(items: string[]): string {
  if (items.length === 0) {
    return '<p class="muted">—</p>';
  }

  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function renderCandidateSection(
  bundle: AttemptExportBundle,
  index: number,
): string {
  const record = bundle.candidates[index];
  const evaluation = record.evaluation;
  const recommendation = getHireRecommendationMeta(
    record.attempt.hireRecommendation ?? '',
  ).label;

  return `
    <section class="candidate">
      <h2>${index + 1}. ${escapeHtml(record.candidate.name)}</h2>
      <p class="muted">${escapeHtml(record.candidate.email)}</p>
      <div class="grid">
        <div>
          <p class="label">Балл</p>
          <p class="value">${formatScore(record.attempt.overallScore ?? evaluation?.finalScore)}</p>
        </div>
        <div>
          <p class="label">Рекомендация</p>
          <p class="value">${escapeHtml(recommendation)}</p>
        </div>
        <div>
          <p class="label">Уровень</p>
          <p class="value">${escapeHtml(getLevelLabel(record.attempt.achievedLevel))}${
            record.attempt.achievedLevelMethod === 'estimate'
              ? ' <span class="muted">(приблизительно)</span>'
              : ''
          }</p>
        </div>
        <div>
          <p class="label">Завершено</p>
          <p class="value">${escapeHtml(formatUnixDate(record.attempt.completedAt))}</p>
        </div>
      </div>
      <div class="grid review">
        <div>
          <p class="label">Прогресс проверки</p>
          <p class="value">${escapeHtml(getReviewProgressLabel(record))}</p>
        </div>
        <div>
          <p class="label">Оценка ИИ (ваше мнение)</p>
          <p class="value">${escapeHtml(getAiVerdictLabel(record.companyReview.aiAssessmentVerdict))}</p>
        </div>
        <div>
          <p class="label">Решение компании</p>
          <p class="value">${escapeHtml(getCompanyDecisionLabel(record.companyReview.companyDecision))}</p>
        </div>
        <div>
          <p class="label">Избранный кандидат</p>
          <p class="value">${escapeHtml(record.attempt.shortlistStatus === 'shortlisted' ? 'Да' : '—')}</p>
        </div>
      </div>
      ${
        evaluation
          ? `
        <h3>Резюме ИИ</h3>
        <p>${escapeHtml(evaluation.summary)}</p>
        ${
          evaluation.detailedSummary
            ? `<h3>Детали</h3><p>${escapeHtml(evaluation.detailedSummary)}</p>`
            : ''
        }
        <div class="columns">
          <div>
            <h3>Сильные стороны</h3>
            ${renderList(evaluation.strengths)}
          </div>
          <div>
            <h3>Зоны роста</h3>
            ${renderList(evaluation.weaknesses)}
          </div>
          <div>
            <h3>Риски</h3>
            ${renderList(evaluation.risks)}
          </div>
        </div>
      `
          : '<p class="muted">ИИ-оценка ещё не готова — в отчёт включены только данные попытки и review.</p>'
      }
    </section>
  `;
}

export function renderPrintableHtmlReport(bundle: AttemptExportBundle): string {
  const exportedAt = new Date(bundle.exportedAt).toLocaleString('ru-RU');
  const interview = bundle.interview;
  const skills =
    interview.skills.length > 0
      ? interview.skills.map((skill) => escapeHtml(skill)).join(', ')
      : '—';

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <title>Экспорт — ${escapeHtml(interview.title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #111; margin: 24px; line-height: 1.5; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    h2 { font-size: 18px; margin: 0 0 8px; page-break-after: avoid; }
    h3 { font-size: 14px; margin: 16px 0 8px; text-transform: uppercase; letter-spacing: 0.04em; color: #555; }
    .meta { color: #666; font-size: 13px; margin-bottom: 24px; }
    .candidate { border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin-bottom: 20px; page-break-inside: avoid; }
    .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin: 12px 0; }
    .review { border-top: 1px solid #eee; padding-top: 12px; }
    .columns { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
    .label { font-size: 11px; text-transform: uppercase; color: #777; margin: 0 0 4px; }
    .value { font-size: 14px; font-weight: 600; margin: 0; }
    .muted { color: #666; }
    ul { margin: 0; padding-left: 18px; }
    @media print { body { margin: 12mm; } .candidate { break-inside: avoid; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(interview.title)}</h1>
  <p class="meta">
    ${escapeHtml(interview.professionName ?? interview.jobRole)} · ${escapeHtml(getLevelLabel(interview.level))} ·
    ${bundle.candidates.length} кандидат(ов) · экспорт ${escapeHtml(exportedAt)}
  </p>
  <p class="meta">Стек: ${skills}</p>
  ${bundle.candidates.map((_, index) => renderCandidateSection(bundle, index)).join('')}
</body>
</html>`;
}

export function openPrintableHtmlReport(bundle: AttemptExportBundle): void {
  const html = renderPrintableHtmlReport(bundle);
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    throw new Error('Не удалось открыть окно печати. Разрешите всплывающие окна.');
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();

  window.setTimeout(() => {
    printWindow.print();
  }, 250);
}
