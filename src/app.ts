// src/app.ts
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import classRoutes from './routes/classes.routes';
import subjectRoutes from './routes/subjects.routes';
import lessonRoutes from './routes/lessons.routes';
import progressRoutes from './routes/progress.routes';

// NEW
import adminClassesRoutes from './routes/admin.classes.routes';
import adminChaptersRoutes from './routes/admin.chapters.routes';
import adminSubjectsRoutes from './routes/admin.subjects.routes';
import adminLessonsRoutes from './routes/admin.lessons.routes';

import { notFound, errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/progress', progressRoutes);

// Mount admin routes
app.use('/api/admin/classes', adminClassesRoutes);
app.use('/api/admin/chapters', adminChaptersRoutes);
app.use('/api/admin/subjects', adminSubjectsRoutes);
app.use('/api/admin/lessons', adminLessonsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
