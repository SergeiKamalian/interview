import { useMemo, useState } from 'react';
import {
  useAttemptReviewNotesQuery,
  useCreateAttemptReviewNoteMutation,
  useUpdateAttemptReviewNoteMutation,
} from '@entities/candidate/api/attemptReviewApi';
import { selectAuthUser } from '@features/auth/model/selectors';
import { useAppSelector } from '@app/store/hooks';
import { formatUnixDate } from '@shared/lib/format';
import { Badge, Button, Card, Spinner, Textarea } from '@shared/ui';
import { MessageSquare, Pencil } from 'lucide-react';

type AttemptTeamNotesPanelProps = {
  attemptId: string;
};

type NoteItemProps = {
  note: {
    id: string;
    body: string;
    authorId: string;
    authorName: string;
    createdAt: number;
    updatedAt: number;
  };
  canEdit: boolean;
  onUpdated: () => void;
};

function NoteItem({ note, canEdit, onUpdated }: NoteItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(note.body);
  const [updateNote, { isLoading }] = useUpdateAttemptReviewNoteMutation();

  const handleSave = async () => {
    const body = draft.trim();

    if (!body || body === note.body) {
      setIsEditing(false);
      setDraft(note.body);
      return;
    }

    await updateNote({ noteId: note.id, body }).unwrap();
    setIsEditing(false);
    onUpdated();
  };

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-foreground">{note.authorName}</p>
          <p className="text-xs text-muted-foreground">
            {formatUnixDate(note.createdAt)}
            {note.updatedAt !== note.createdAt
              ? ` · изменено ${formatUnixDate(note.updatedAt)}`
              : null}
          </p>
        </div>
        {canEdit && !isEditing ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setDraft(note.body);
              setIsEditing(true);
            }}
          >
            <Pencil className="size-4" />
            Изменить
          </Button>
        ) : null}
      </div>
      {isEditing ? (
        <div className="mt-3 space-y-2">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={4}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={isLoading || !draft.trim()}
              onClick={() => void handleSave()}
            >
              Сохранить
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={isLoading}
              onClick={() => {
                setDraft(note.body);
                setIsEditing(false);
              }}
            >
              Отмена
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{note.body}</p>
      )}
    </div>
  );
}

export function AttemptTeamNotesPanel({ attemptId }: AttemptTeamNotesPanelProps) {
  const authUser = useAppSelector(selectAuthUser);
  const [draft, setDraft] = useState('');
  const { data: notes = [], isLoading, isFetching, refetch } =
    useAttemptReviewNotesQuery(attemptId, { skip: !attemptId });
  const [createNote, { isLoading: isCreating }] =
    useCreateAttemptReviewNoteMutation();

  const sortedNotes = useMemo(
    () =>
      [...notes].sort((left, right) => {
        if (left.createdAt !== right.createdAt) {
          return left.createdAt - right.createdAt;
        }

        return left.id.localeCompare(right.id);
      }),
    [notes],
  );

  const handleCreate = async () => {
    const body = draft.trim();

    if (!body) {
      return;
    }

    await createNote({ attemptId, body }).unwrap();
    setDraft('');
  };

  return (
    <Card header="Заметки команды">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Внутренние заметки видны коллегам в вашей компании. Только автор может
          редактировать свою заметку.
        </p>

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner />
            Загрузка заметок…
          </div>
        ) : sortedNotes.length > 0 ? (
          <div className="space-y-3">
            {sortedNotes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                canEdit={authUser?.id === note.authorId}
                onUpdated={() => void refetch()}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Пока нет заметок — добавьте первую для команды.
          </p>
        )}

        <div className="space-y-2">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Например: согласен с оценкой, но слабый English на собеседовании"
            rows={4}
          />
          <Button
            disabled={isCreating || isFetching || !draft.trim()}
            onClick={() => void handleCreate()}
          >
            Добавить заметку
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function AttemptTeamNotesIndicator({
  hasTeamNotes,
}: {
  hasTeamNotes?: boolean;
}) {
  if (!hasTeamNotes) {
    return null;
  }

  return (
    <Badge variant="outline" className="gap-1">
      <MessageSquare className="size-3" />
      Есть заметки
    </Badge>
  );
}
