// api/problems.js (전체 코드)
var dbconn = require('../dbconn/dbconn.js');

// 문제 목록 조회 API
async function listProblems(req, res) {
    try {
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
            category: category || null,
            difficulty: difficulty || null
        });
        console.log(`✅ 문제 추가 완료: "${question_text.substring(0, 20)}..."`);
        res.status(200).json({ success: true, message: '문제가 성공적으로 추가되었습니다.' });
    } catch (err) {
        console.error("❌ 문제 추가 오류:", err);
        res.status(500).json({ success: false, error: '문제 추가 중 오류 발생' });
    }
}

// 💡 새로운 기능: 문제 삭제 API
async function deleteProblem(req, res) {
    const { id } = req.body; // 삭제할 문제의 ID를 받습니다.

    if (!id) {
        return res.status(400).json({ success: false, error: '삭제할 문제 ID를 입력해주세요.' });
    }

    try {
        const deletedRows = await dbconn('problems').where({ id: id }).del();

        if (deletedRows > 0) {
            console.log(`✅ 문제 ID ${id} 삭제 완료`);
            res.status(200).json({ success: true, message: `문제 ID ${id}가 성공적으로 삭제되었습니다.` });
        } else {
            console.log(`⚠️ 문제 ID ${id}를 찾을 수 없거나 이미 삭제되었습니다.`);
            res.status(404).json({ success: false, error: `문제 ID ${id}를 찾을 수 없거나 이미 삭제되었습니다.` });
        }
    } catch (err) {
        console.error("❌ 문제 삭제 오류:", err);
        res.status(500).json({ success: false, error: '문제 삭제 중 오류 발생' });
    }
}


module.exports = {
    listProblems,
    addProblem,
    deleteProblem // 💡 deleteProblem 함수를 내보냅니다.
};