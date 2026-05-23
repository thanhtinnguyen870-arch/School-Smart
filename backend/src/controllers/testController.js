import mammoth from "mammoth";
import xlsx from "xlsx";
import Test from "../models/Test.js";
import TestResult from "../models/TestResult.js";
import Student from "../models/Student.js";

const questionKeyword = "(?:C\\u00e2u|Cau|Question|C\\u00c3\\u00a2u)";
const answerKeyword = "(?:\\u0110\\u00e1p\\s*\\u00e1n|Dap\\s*an|Answer|\\u00c4\\u0090\\u00c3\\u00a1p\\s*\\u00c3\\u00a1n)";
const questionStartRegex = new RegExp(`(?:^|\\n)\\s*${questionKeyword}\\s*(\\d+)[\\.:)\\-]`, "gi");

const normalizeAnswer = (value = "") => {
  const match = String(value).trim().toUpperCase().match(/^([ABCD])(?:[\.:)\-\s]|$)/);
  return match ? match[1] : "";
};

const isCorrectMultipleAnswer = (studentAnswer = "", correctAnswer = "") => {
  const normalizedCorrect = normalizeAnswer(correctAnswer);
  const normalizedStudent = normalizeAnswer(studentAnswer);
  if (normalizedCorrect && normalizedStudent) return normalizedStudent === normalizedCorrect;
  return String(studentAnswer).trim() === String(correctAnswer).trim();
};

const resultReleaseTime = (test, result) => {
  const baseTime = test?.endTime || result?.submittedAt || new Date();
  return new Date(new Date(baseTime).getTime() + 2 * 60 * 1000);
};

const canViewResult = (test, result, now = new Date()) =>
  Boolean(result && now >= resultReleaseTime(test, result));

const getStudentForRequest = async (req) => {
  if (req.user?.role !== "student") return null;
  return Student.findOne({ userId: req.user._id });
};

const normalizeDocText = (text = "") =>
  text
    .replace(/\r/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/\u0110\u00e1p\s*\n\s*\u00e1n/gi, "\u0110\u00e1p \u00e1n")
    .replace(/Dap\s*\n\s*an/gi, "Dap an")
    .replace(/\u00c4\u0090\u00c3\u00a1p\s*\n\s*\u00c3\u00a1n/gi, "\u00c4\u0090\u00c3\u00a1p \u00c3\u00a1n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const extractAnswerKey = (text = "") => {
  const lines = normalizeDocText(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const answerKey = {};
  const questionKeyRegex = new RegExp(`^${questionKeyword}\\b`, "i");
  const answerKeyRegex = new RegExp(`^${answerKeyword}\\b`, "i");

  for (let index = 0; index < lines.length; index += 1) {
    const currentLine = lines[index];
    const nextLine = lines[index + 1] || "";
    const isQuestionKeyLine = questionKeyRegex.test(currentLine) && /\d/.test(currentLine);
    const isAnswerLine = answerKeyRegex.test(nextLine) && /[ABCD]/i.test(nextLine);

    if (!isQuestionKeyLine || !isAnswerLine) continue;

    const questionNumbers = currentLine.match(/\d+/g) || [];
    const answers = nextLine.match(/\b[ABCD]\b/gi) || [];

    questionNumbers.forEach((questionNumber, answerIndex) => {
      const answer = normalizeAnswer(answers[answerIndex]);
      if (answer) answerKey[Number(questionNumber)] = answer;
    });
  }

  if (Object.keys(answerKey).length) return answerKey;

  const verticalQuestionHeaderRegex = new RegExp(`^${questionKeyword}$`, "i");
  const questionHeaderIndex = lines.findIndex((line) => verticalQuestionHeaderRegex.test(line));
  const answerHeaderIndex = lines.findIndex((line, index) => index > questionHeaderIndex && answerKeyRegex.test(line));

  if (questionHeaderIndex >= 0 && answerHeaderIndex > questionHeaderIndex) {
    const questionNumbers = lines
      .slice(questionHeaderIndex + 1, answerHeaderIndex)
      .flatMap((line) => line.match(/\d+/g) || []);
    const answers = lines
      .slice(answerHeaderIndex + 1)
      .flatMap((line) => line.match(/\b[ABCD]\b/gi) || []);

    questionNumbers.forEach((questionNumber, answerIndex) => {
      const answer = normalizeAnswer(answers[answerIndex]);
      if (answer) answerKey[Number(questionNumber)] = answer;
    });
  }

  return answerKey;
};

const stripAnswerKeySection = (text = "") => {
  const lines = normalizeDocText(text).split("\n");
  const questionKeyRegex = new RegExp(`^${questionKeyword}\\b`, "i");
  const answerKeyRegex = new RegExp(`^${answerKeyword}\\b`, "i");

  for (let index = 0; index < lines.length; index += 1) {
    const currentLine = lines[index].trim();
    const nextLine = (lines[index + 1] || "").trim();
    const isQuestionKeyLine = questionKeyRegex.test(currentLine) && /\d/.test(currentLine);
    const isAnswerLine = answerKeyRegex.test(nextLine) && /[ABCD]/i.test(nextLine);

    if (isQuestionKeyLine && isAnswerLine) return lines.slice(0, index).join("\n").trim();
  }

  const verticalQuestionHeaderRegex = new RegExp(`^${questionKeyword}$`, "i");
  const questionHeaderIndex = lines.findIndex((line) => verticalQuestionHeaderRegex.test(line.trim()));
  const answerHeaderIndex = lines.findIndex((line, index) => index > questionHeaderIndex && answerKeyRegex.test(line.trim()));

  if (questionHeaderIndex >= 0 && answerHeaderIndex > questionHeaderIndex) {
    return lines.slice(0, questionHeaderIndex).join("\n").trim();
  }

  return normalizeDocText(text);
};

const splitQuestionBlocks = (text = "") => {
  const cleanText = normalizeDocText(text);
  const starts = [...cleanText.matchAll(questionStartRegex)].map((match) => ({
    index: match.index,
    number: Number(match[1])
  }));

  return starts.map((start, index) => ({
    number: start.number,
    text: cleanText.slice(start.index, starts[index + 1]?.index || cleanText.length).trim()
  }));
};

const parseQuestionBlock = (block, answerKey) => {
  const oneLineBlock = block.text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
  const body = oneLineBlock.replace(new RegExp(`^${questionKeyword}\\s*\\d+[\\.:)\\-]\\s*`, "i"), "");
  const optionMatches = [...body.matchAll(/(^|\s)([A-D])[\.:)\-]\s+/g)].map((match) => ({
    index: match.index + match[1].length,
    contentStart: match.index + match[0].length,
    label: match[2]
  }));

  if (optionMatches.length < 2) return null;

  const questionText = body.slice(0, optionMatches[0].index).trim();
  const options = optionMatches
    .map((match, index) => {
      const start = match.contentStart;
      const end = optionMatches[index + 1]?.index ?? body.length;
      const optionText = body
        .slice(start, end)
        .replace(new RegExp(`${answerKeyword}\\s*[:：]?\\s*[ABCD].*$`, "i"), "")
        .trim();
      return `${match.label}. ${optionText}`;
    })
    .filter((option) => option.replace(/^[ABCD]\.\s*/, "").trim());

  const inlineAnswer = body.match(new RegExp(`${answerKeyword}\\s*[:：]?\\s*([ABCD])`, "i"));
  const correctAnswer = normalizeAnswer(inlineAnswer?.[1]) || answerKey[block.number] || "";

  if (!questionText || options.length < 2) return null;

  return {
    questionText,
    type: "multiple",
    options,
    correctAnswer,
    score: 1
  };
};

export const parseQuestionsFromText = (text = "") => {
  const answerKey = extractAnswerKey(text);
  return splitQuestionBlocks(stripAnswerKeySection(text))
    .map((block) => parseQuestionBlock(block, answerKey))
    .filter(Boolean);
};

const readQuestionsFromDocx = async (filePath) => {
  const result = await mammoth.extractRawText({ path: filePath });
  return parseQuestionsFromText(result.value);
};

const uploadedFile = (req, name) => Array.isArray(req.files?.[name]) ? req.files[name][0] : undefined;

const attachQuestionImages = (req, questions = []) =>
  questions.map((question) => {
    if (!question.imageField) return question;

    const file = uploadedFile(req, question.imageField);
    const { imageField, ...rest } = question;
    return file
      ? {
          ...rest,
          imageUrl: `/uploads/${file.filename}`,
          imageName: file.originalname
        }
      : rest;
  });

export const listTests = async (req, res) => {
  res.json(await Test.find().populate("classId createdBy", "className name").sort("-createdAt"));
};

export const getTest = async (req, res) => {
  const test = await Test.findById(req.params.id).populate("classId createdBy", "className name");
  if (!test) return res.status(404).json({ message: "Không tìm thấy bài kiểm tra" });

  if (req.user.role === "student") {
    const student = await getStudentForRequest(req);
    if (!student || String(test.classId?._id || test.classId) !== String(student.classId)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }
  }

  res.json(test);
};

export const createTest = async (req, res) => {
  let questions = req.body.questions || [];

  if (typeof questions === "string") {
    try {
      questions = JSON.parse(questions);
    } catch {
      questions = [];
    }
  }

  const importFile = uploadedFile(req, "file") || req.file;

  if (importFile) {
    if (!importFile.originalname.toLowerCase().endsWith(".docx")) {
      return res.status(422).json({ message: "Hiện tại hệ thống chỉ hỗ trợ import bài kiểm tra từ file .docx." });
    }

    let importedQuestions = [];
    try {
      importedQuestions = await readQuestionsFromDocx(importFile.path);
    } catch {
      return res.status(422).json({ message: "Không thể đọc file Word. Vui lòng kiểm tra lại file .docx." });
    }

    if (!importedQuestions.length) {
      return res.status(422).json({
        message: "Không đọc được câu hỏi trắc nghiệm từ file Word. Vui lòng dùng định dạng: Câu 1..., A/B/C/D và bảng đáp án cuối file."
      });
    }

    const missingAnswers = importedQuestions.filter((question) => !question.correctAnswer).length;
    if (missingAnswers) {
      return res.status(422).json({
        message: `Có ${missingAnswers} câu chưa có đáp án đúng. Vui lòng kiểm tra bảng đáp án cuối file.`
      });
    }

    questions = importedQuestions;
  } else {
    questions = attachQuestionImages(req, questions);
  }

  res.status(201).json(await Test.create({ ...req.body, questions, createdBy: req.user._id }));
};

export const updateTest = async (req, res) => {
  res.json(await Test.findByIdAndUpdate(req.params.id, req.body, { new: true }));
};

export const deleteTest = async (req, res) => {
  await Test.findByIdAndDelete(req.params.id);
  res.json({ message: "Đã xóa bài kiểm tra" });
};

export const submitTest = async (req, res) => {
  const test = await Test.findById(req.params.id);
  if (!test) return res.status(404).json({ message: "Không tìm thấy bài kiểm tra" });

  const student = req.user?.role === "student" ? await getStudentForRequest(req) : null;
  const studentId = student?._id || req.body.studentId;
  if (!studentId) return res.status(422).json({ message: "Không xác định được học sinh làm bài" });
  if (student && String(test.classId) !== String(student.classId)) {
    return res.status(403).json({ message: "Forbidden: insufficient role" });
  }

  const existing = await TestResult.findOne({ testId: test._id, studentId });
  if (existing) return res.status(409).json({ message: "Bạn đã nộp bài kiểm tra này rồi. Mỗi học sinh chỉ được làm 1 lần." });

  let score = 0;
  const answers = req.body.answers || [];

  test.questions.forEach((question, index) => {
    if (question.type === "multiple" && isCorrectMultipleAnswer(answers[index]?.answer, question.correctAnswer)) {
      score += question.score || 1;
    }
  });

  try {
    res.status(201).json(await TestResult.create({
      testId: test._id,
      studentId,
      answers,
      score,
      submittedAt: new Date()
    }));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Bạn đã nộp bài kiểm tra này rồi. Mỗi học sinh chỉ được làm 1 lần." });
    }
    throw error;
  }
};

export const results = async (req, res) => {
  res.json(await TestResult.find({ testId: req.params.id }).populate("studentId"));
};

export const exportResultsExcel = async (req, res) => {
  const test = await Test.findById(req.params.id).populate("classId");
  if (!test) return res.status(404).json({ message: "Không tìm thấy bài kiểm tra" });

  const rows = await TestResult.find({ testId: req.params.id }).populate("studentId").sort("-submittedAt");
  const totalScore = test.questions.reduce((sum, question) => sum + (question.score || 1), 0);
  const data = rows.map((row, index) => ({
    STT: index + 1,
    "Mã học sinh": row.studentId?.studentCode || "",
    "Họ tên": row.studentId?.fullName || "",
    "Lớp": test.classId?.className || row.studentId?.classId?.className || "",
    "Điểm": row.score,
    "Tổng điểm": totalScore,
    "Số câu": test.questions.length,
    "Thời gian nộp": row.submittedAt ? new Date(row.submittedAt).toLocaleString("vi-VN") : "",
    "Trạng thái": row.status || "submitted"
  }));

  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(data);
  worksheet["!cols"] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 28 },
    { wch: 12 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 22 },
    { wch: 14 }
  ];
  xlsx.utils.book_append_sheet(workbook, worksheet, "Ket qua");

  const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
  const safeTitle = String(test.title || "ket-qua-bai-kiem-tra").replace(/[^\p{L}\p{N}_-]+/gu, "-");
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="${safeTitle}.xlsx"`);
  res.send(buffer);
};

export const available = async (req, res) => {
  res.json(await Test.find({ status: "open", startTime: { $lte: new Date() }, endTime: { $gte: new Date() } }).populate("classId"));
};

export const studentTests = async (req, res) => {
  const student = await getStudentForRequest(req);
  if (!student) return res.status(404).json({ message: "Không tìm thấy hồ sơ học sinh" });

  const now = new Date();
  const tests = await Test.find({
    status: "open",
    $or: [{ classId: student.classId }, { classId: { $exists: false } }, { classId: null }]
  }).populate("classId").sort("-createdAt");

  const results = await TestResult.find({ studentId: student._id, testId: { $in: tests.map((test) => test._id) } });
  const resultMap = new Map(results.map((result) => [String(result.testId), result]));

  res.json(tests.map((test) => {
    const result = resultMap.get(String(test._id));
    const releaseAt = resultReleaseTime(test, result);
    return {
      ...test.toObject(),
      resultId: result?._id,
      submitted: Boolean(result),
      score: canViewResult(test, result, now) ? result.score : undefined,
      canViewResult: canViewResult(test, result, now),
      resultReleaseAt: result ? releaseAt : undefined,
      isOpen: (!test.startTime || test.startTime <= now) && (!test.endTime || test.endTime >= now)
    };
  }));
};

export const myResult = async (req, res) => {
  const student = await getStudentForRequest(req);
  if (!student) return res.status(404).json({ message: "Không tìm thấy hồ sơ học sinh" });

  const test = await Test.findById(req.params.id).populate("classId");
  if (!test) return res.status(404).json({ message: "Không tìm thấy bài kiểm tra" });

  const result = await TestResult.findOne({ testId: test._id, studentId: student._id });
  if (!result) return res.status(404).json({ message: "Bạn chưa nộp bài kiểm tra này" });

  const releaseAt = resultReleaseTime(test, result);
  if (!canViewResult(test, result)) {
    return res.status(403).json({
      message: "Điểm sẽ hiển thị sau khi bài kiểm tra kết thúc 2 phút.",
      resultReleaseAt: releaseAt
    });
  }

  const totalScore = test.questions.reduce((sum, question) => sum + (question.score || 1), 0);
  res.json({
    test,
    result,
    totalScore,
    resultReleaseAt: releaseAt
  });
};
