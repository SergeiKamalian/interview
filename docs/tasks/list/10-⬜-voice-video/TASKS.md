# 10 — Voice и video интервью Tasks

Overall status: ⬜ todo

---

## Subtasks

### TASK-10.1 — Разрешение доступа к микрофону

Status: [ ] todo  
File:

```txt
subtasks/001-⬜-add-microphone-permission.md
```

Goal:

Добавить UX для запроса и обработки разрешения микрофона в public interview flow.

---

### TASK-10.2 — Запись аудио ответа

Status: [ ] todo  
File:

```txt
subtasks/002-⬜-add-audio-recording.md
```

Goal:

Реализовать запись аудио ответа через MediaRecorder с preview, перезаписью и ограничением длительности.

---

### TASK-10.3 — Endpoint загрузки аудио

Status: [ ] todo  
File:

```txt
subtasks/003-⬜-add-audio-upload-endpoint.md
```

Goal:

Добавить backend endpoint для загрузки аудио ответа кандидата с валидацией формата/размера и привязкой к interview answer.

---

### TASK-10.4 — Speech-to-text транскрибация

Status: [ ] todo  
File:

```txt
subtasks/004-⬜-add-speech-to-text.md
```

Goal:

Реализовать STT pipeline: конвертировать загруженное аудио в текст transcript и сохранять результат для AI evaluation.

---

### TASK-10.5 — Text-to-speech для вопросов

Status: [ ] todo  
File:

```txt
subtasks/005-⬜-add-text-to-speech.md
```

Goal:

Добавить TTS сервис для озвучивания вопроса интервью и подсказок кандидату.

---

### TASK-10.6 — Хранение аудио-артефактов

Status: [ ] todo  
File:

```txt
subtasks/006-⬜-add-audio-storage.md
```

Goal:

Добавить persistent storage metadata для аудио файлов и связь с интервью/ответами.

---

### TASK-10.7 — Разрешение доступа к камере

Status: [ ] todo  
File:

```txt
subtasks/007-⬜-add-camera-permission.md
```

Goal:

Добавить обработку camera permission и UX-подсказки перед видеоответом кандидата.

---

### TASK-10.8 — Запись видео ответа

Status: [ ] todo  
File:

```txt
subtasks/008-⬜-add-video-recording.md
```

Goal:

Реализовать запись видео ответа (с аудио) через MediaRecorder с предпросмотром и контролем длительности.

---

### TASK-10.9 — Загрузка и хранение видео

Status: [ ] todo  
File:

```txt
subtasks/009-⬜-add-video-upload-storage.md
```

Goal:

Добавить backend endpoint загрузки видео и metadata storage, аналогично аудио, с учетом больших файлов.

---

### TASK-10.10 — Playback в отчете интервью

Status: [ ] todo  
File:

```txt
subtasks/010-⬜-add-report-playback.md
```

Goal:

Добавить audio/video playback в dashboard report: рекрутер может прослушать/посмотреть ответ кандидата напрямую из отчета.

---

## Completion rule

Блок `10-⬜-voice-video` считается completed только когда все subtasks `10.1`–`10.10` имеют status `[x] done`; папка переименована в `10-✅-voice-video`.
