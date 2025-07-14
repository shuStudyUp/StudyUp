// api/users.js
var dbconn = require('../dbconn/dbconn.js'); // dbconn.js 경로 확인

// 사용자 생성 API
async function createUser(req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ success: false, error: '모든 필드를 입력해주세요.' });
    }

    // 실제 앱에서는 비밀번호를 해싱해야 합니다! (예: bcrypt)
    // 여기서는 예시를 위해 평문 비밀번호를 사용합니다.
    const password_hash = password;

    try {
        await dbconn('users').insert({
            username: username,
            email: email,
            password_hash: password_hash
        });
        console.log(`✅ 사용자 "${username}" 생성 완료`);
        res.status(200).json({ success: true, message: `사용자 "${username}"가 성공적으로 생성되었습니다.` });
    } catch (err) {
        console.error("❌ 사용자 생성 오류:", err);
        if (err.code === 'ER_DUP_ENTRY') { // 중복 엔트리 오류 (UNIQUE 제약 조건 위반)
            res.status(409).json({ success: false, error: '이미 존재하는 사용자 이름 또는 이메일입니다.' });
        } else {
            res.status(500).json({ success: false, error: '사용자 생성 중 오류 발생' });
        }
    }
}

// 사용자 목록 조회 API
async function listUsers(req, res) {
    try {
        // 비밀번호 해시는 노출하지 않도록 특정 컬럼만 선택
        const users = await dbconn('users').select('id', 'username', 'email', 'created_at');
        console.log("✅ 사용자 목록 조회 성공:", users.length, "명");
        res.status(200).json({ success: true, data: { list: users } });
    } catch (err) {
        console.error("❌ 사용자 목록 조회 오류:", err);
        res.status(500).json({ success: false, error: '사용자 목록 조회 중 오류 발생' });
    }
}

// 사용자 통계 API (현재는 총 사용자 수만 반환)
async function userStats(req, res) {
    try {
        const totalUsers = await dbconn('users').count('id as count').first();
        console.log("✅ 사용자 통계 조회 성공. 총 사용자 수:", totalUsers.count);
        res.status(200).json({ success: true, data: { total_users: totalUsers.count } });
    } catch (err) {
        console.error("❌ 사용자 통계 조회 오류:", err);
        res.status(500).json({ success: false, error: '사용자 통계 조회 중 오류 발생' });
    }
}

module.exports = {
    createUser,
    listUsers,
    userStats
};