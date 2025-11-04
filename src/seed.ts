import { connectDB } from './db/mongoose';
import { ClassModel } from './models/Class';
import { SubjectModel } from './models/Subject';
import { ChapterModel } from './models/Chapter';
import { LessonModel } from './models/Lesson';

async function seed() {
  await connectDB();

  const lop8 = await ClassModel.findOneAndUpdate(
    { name: 'Lop 8' },
    { name: 'Lop 8' },
    { upsert: true, new: true }
  );

  const subjectConfigs = [
    { name: 'Toan', orderIndex: 1 },
    { name: 'Van', orderIndex: 2 },
    { name: 'Anh', orderIndex: 3 },
    { name: 'Vat ly', orderIndex: 4 },
    { name: 'Hoa hoc', orderIndex: 5 },
    { name: 'Sinh hoc', orderIndex: 6 },
  ];

  const subjectDocs: Record<string, any> = {};

  for (const cfg of subjectConfigs) {
    subjectDocs[cfg.name] = await SubjectModel.findOneAndUpdate(
      { name: cfg.name, classId: lop8._id },
      { name: cfg.name, classId: lop8._id, orderIndex: cfg.orderIndex },
      { upsert: true, new: true }
    );
  }

  const monToan = subjectDocs['Toan'];

  const daiSo = await ChapterModel.findOneAndUpdate(
    { subjectId: monToan._id, title: 'Dai so' },
    { subjectId: monToan._id, title: 'Dai so', orderIndex: 1 },
    { upsert: true, new: true }
  );

  const hinhHoc = await ChapterModel.findOneAndUpdate(
    { subjectId: monToan._id, title: 'Hinh hoc' },
    { subjectId: monToan._id, title: 'Hinh hoc', orderIndex: 2 },
    { upsert: true, new: true }
  );

  const algebraLesson = await LessonModel.findOneAndUpdate(
    { chapterId: daiSo._id, orderIndex: 1 },
    {
      title: 'Bieu thuc dai so',
      chapterId: daiSo._id,
      orderIndex: 1,
      sections: [
        { type: 'THEORY', title: 'Khai niem', text: 'Dinh nghia va quy tac bien doi.', orderIndex: 1 },
        { type: 'EXERCISE', title: 'Bai tap co ban', text: 'Bai 1-10 SGK', orderIndex: 2 },
      ],
    },
    { upsert: true, new: true }
  );

  const geometryLesson = await LessonModel.findOneAndUpdate(
    { chapterId: hinhHoc._id, orderIndex: 1 },
    {
      title: 'Tam giac dong dang',
      chapterId: hinhHoc._id,
      orderIndex: 1,
      sections: [
        { type: 'THEORY', title: 'Tinh chat', text: 'Tong quan ve tam giac dong dang.', orderIndex: 1 },
        { type: 'QUIZ', title: 'Quiz nhanh', text: '5 cau trac nghiem', orderIndex: 2 },
      ],
    },
    { upsert: true, new: true }
  );

  console.log('Seed completed', {
    classId: lop8._id.toString(),
    subjects: subjectConfigs.length,
    chapters: [daiSo.title, hinhHoc.title],
    lessons: [algebraLesson.title, geometryLesson.title],
  });

  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
