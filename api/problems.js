// api/problems.js
var dbconn = require('../dbconn/dbconn.js'); // dbconn.js 경로 확인

// 문제 목록 조회 API
async function listProblems(req, res) {
    try {
        // problems 테이블이 존재하지 않으면 여기서 오류가 발생합니다.
        // 하지만 파일 자체는 존재하므로 'Cannot find module' 오류는 해결됩니다.
        const problems = await dbconn('problems').select('*');
        console.log("✅ 문제 목록 조회 성공:", problems.length, "개");
        res.status(200).json({ success: true, data: { list: problems } });
    } catch (err) {
        console.error("❌ 문제 목록 조회 오류:", err);
        res.status(500).json({ success: false, error: '문제 목록 조회 중 오류 발생' });
    }
}

// 문제 추가 API (수동으로 문제 데이터를 DB에 넣을 때 사용)
async function addProblem(req, res) {
    const { question_text, answer_text, category, difficulty } = req.body;
    if (!question_text || !answer_text) {
        return res.status(400).json({ success: false, error: '문제 내용과 정답을 입력해주세요.' });
    }

    try {
        await dbconn('problems').insert({
            question_text,
            answer_text,
            category: category || null, // 카테고리가 없으면 null
            difficulty: difficulty || null // 난이도가 없으면 null
        });
        console.log(`✅ 문제 추가 완료: "${question_text.substring(0, 20)}..."`);
        res.status(200).json({ success: true, message: '문제가 성공적으로 추가되었습니다.' });
    } catch (err) {
        console.error("❌ 문제 추가 오류:", err);
        res.status(500).json({ success: false, error: '문제 추가 중 오류 발생' });
    }
}

module.exports = {
    listProblems,
    addProblem
};
