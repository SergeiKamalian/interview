import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  useSkillsQuery,
  useTopicsQuery,
  type Skill,
  type Topic,
} from '@features/question-bank/api/questionBankApi';
import {
  useArchiveCompanySkillMutation,
  useArchiveCompanyTopicMutation,
} from '@features/company-question-bank/api/companyQuestionBankApi';
import { CompanySkillDialog } from '@features/company-question-bank/ui/CompanySkillDialog';
import { CompanyTopicDialog } from '@features/company-question-bank/ui/CompanyTopicDialog';
import { CustomScopeBadge } from '@entities/question/ui/CustomScopeBadge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@shared/ui/alert-dialog';
import {
  Alert,
  Card,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shared/ui';
import { Button as ShadcnButton } from '@shared/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared/ui/table';

export function QuestionBankTaxonomyPage() {
  const { data: skills = [], isLoading: skillsLoading, isError: skillsError } =
    useSkillsQuery();
  const { data: topics = [], isLoading: topicsLoading, isError: topicsError } =
    useTopicsQuery();

  const companySkills = useMemo(
    () => skills.filter((skill: Skill) => skill.isCustom),
    [skills],
  );
  const companyTopics = useMemo(
    () => topics.filter((topic: Topic) => topic.isCustom),
    [topics],
  );

  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [archiveSkillTarget, setArchiveSkillTarget] = useState<Skill | null>(
    null,
  );
  const [archiveTopicTarget, setArchiveTopicTarget] = useState<Topic | null>(
    null,
  );

  const [archiveSkill, archiveSkillState] = useArchiveCompanySkillMutation();
  const [archiveTopic, archiveTopicState] = useArchiveCompanyTopicMutation();

  const openCreateSkill = () => {
    setEditingSkill(null);
    setSkillDialogOpen(true);
  };

  const openEditSkill = (skill: Skill) => {
    setEditingSkill(skill);
    setSkillDialogOpen(true);
  };

  const openCreateTopic = () => {
    setEditingTopic(null);
    setTopicDialogOpen(true);
  };

  const openEditTopic = (topic: Topic) => {
    setEditingTopic(topic);
    setTopicDialogOpen(true);
  };

  const handleArchiveSkill = async () => {
    if (!archiveSkillTarget) {
      return;
    }

    try {
      await archiveSkill(archiveSkillTarget.id).unwrap();
      toast.success('Skill архивирован');
      setArchiveSkillTarget(null);
    } catch {
      toast.error('Не удалось архивировать skill');
    }
  };

  const handleArchiveTopic = async () => {
    if (!archiveTopicTarget) {
      return;
    }

    try {
      await archiveTopic(archiveTopicTarget.id).unwrap();
      toast.success('Topic архивирован');
      setArchiveTopicTarget(null);
    } catch {
      toast.error('Не удалось архивировать topic');
    }
  };

  const isLoading = skillsLoading || topicsLoading;
  const isError = skillsError || topicsError;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <ShadcnButton
            variant="ghost"
            size="sm"
            className="mb-2 px-0"
            render={<Link to="/dashboard/question-bank" />}
          >
            ← К банку вопросов
          </ShadcnButton>
          <h2 className="text-xl font-semibold text-foreground">
            Company taxonomy
          </h2>
          <p className="text-sm text-muted-foreground">
            Свои skills и topics поверх платформенного банка — для fork,
            custom questions и приоритета в suggest.
          </p>
        </div>
      </div>

      <Card>
        <Tabs defaultValue="topics">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <TabsList>
              <TabsTrigger value="topics">Topics</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
            </TabsList>
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner />
              Загрузка taxonomy…
            </div>
          )}

          {isError && (
            <Alert variant="error" title="Не удалось загрузить taxonomy">
              Проверьте подключение и попробуйте обновить страницу.
            </Alert>
          )}

          <TabsContent value="topics" className="space-y-4">
            <div className="flex justify-end">
              <ShadcnButton onClick={openCreateTopic}>
                Создать topic
              </ShadcnButton>
            </div>

            {!isLoading && companyTopics.length === 0 && (
              <Alert variant="info" title="Company topics пока нет">
                Создайте topic под global или company skill — например Internal
                API Gateway под React.
              </Alert>
            )}

            {companyTopics.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Skill</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companyTopics.map((topic) => (
                      <TableRow key={topic.id}>
                        <TableCell className="font-mono text-xs">
                          {topic.code}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {topic.name}
                            <CustomScopeBadge />
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {topic.skill?.name ?? '—'}
                        </TableCell>
                        <TableCell>{topic.interviewWeight}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <ShadcnButton
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditTopic(topic)}
                            >
                              Редактировать
                            </ShadcnButton>
                            <ShadcnButton
                              variant="ghost"
                              size="sm"
                              onClick={() => setArchiveTopicTarget(topic)}
                            >
                              Архивировать
                            </ShadcnButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="skills" className="space-y-4">
            <div className="flex justify-end">
              <ShadcnButton onClick={openCreateSkill}>
                Создать skill
              </ShadcnButton>
            </div>

            {!isLoading && companySkills.length === 0 && (
              <Alert variant="info" title="Company skills пока нет">
                Создайте skill с префиксом компании, например
                acme_internal_api.
              </Alert>
            )}

            {companySkills.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companySkills.map((skill) => (
                      <TableRow key={skill.id}>
                        <TableCell className="font-mono text-xs">
                          {skill.code}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {skill.name}
                            <CustomScopeBadge />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <ShadcnButton
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditSkill(skill)}
                            >
                              Редактировать
                            </ShadcnButton>
                            <ShadcnButton
                              variant="ghost"
                              size="sm"
                              onClick={() => setArchiveSkillTarget(skill)}
                            >
                              Архивировать
                            </ShadcnButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      <CompanySkillDialog
        open={skillDialogOpen}
        onOpenChange={setSkillDialogOpen}
        skill={editingSkill}
      />
      <CompanyTopicDialog
        open={topicDialogOpen}
        onOpenChange={setTopicDialogOpen}
        topic={editingTopic}
      />

      <AlertDialog
        open={archiveSkillTarget != null}
        onOpenChange={(open: boolean) => !open && setArchiveSkillTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Архивировать skill?</AlertDialogTitle>
            <AlertDialogDescription>
              Skill «{archiveSkillTarget?.name}» скроется из списков, но
              останется в базе.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              disabled={archiveSkillState.isLoading}
              onClick={() => void handleArchiveSkill()}
            >
              Архивировать
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={archiveTopicTarget != null}
        onOpenChange={(open: boolean) => !open && setArchiveTopicTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Архивировать topic?</AlertDialogTitle>
            <AlertDialogDescription>
              Topic «{archiveTopicTarget?.name}» скроется из списков, но
              останется в базе.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              disabled={archiveTopicState.isLoading}
              onClick={() => void handleArchiveTopic()}
            >
              Архивировать
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
