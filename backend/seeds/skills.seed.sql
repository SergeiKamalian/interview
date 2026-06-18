-- Lookup skills for question bank (idempotent)
-- Run before bulk topic seed: pnpm seed:skills

INSERT INTO professions (code, name)
VALUES ('frontend_developer', 'Frontend Developer')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO skills (code, name) VALUES
  ('javascript', 'JavaScript'),
  ('typescript', 'TypeScript'),
  ('react', 'React'),
  ('css', 'CSS'),
  ('html', 'HTML'),
  ('html-css', 'HTML & CSS'),
  ('angular', 'Angular'),
  ('vue', 'Vue'),
  ('nextjs', 'Next.js'),
  ('nuxt', 'Nuxt'),
  ('nodejs', 'Node.js'),
  ('nestjs', 'NestJS'),
  ('expressjs', 'Express.js'),
  ('docker', 'Docker'),
  ('git', 'Git'),
  ('sql', 'SQL'),
  ('redux', 'Redux'),
  ('patterns', 'Design Patterns'),
  ('principles', 'Software Principles'),
  ('architecture', 'Architecture')
ON DUPLICATE KEY UPDATE name = VALUES(name);
