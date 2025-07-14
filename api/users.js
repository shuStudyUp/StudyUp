// api/users.js (전체 코드)
var dbconn = require('../dbconn/dbconn.js');

// 사용자 생성 API
async function createUser(req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ success: false, error: '모든 필드를 입력해주세요.' });
    }

    const password_hash = password; // 실제 앱에서는 비밀번호를 해싱해야 합니다!

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
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ success: false, error: '이미 존재하는 사용자 이름 또는 이메일입니다.' });
        } else {
            res.status(500).json({ success: false, error: '사용자 생성 중 오류 발생' });
        }
    }
}

// 사용자 목록 조회 API
async function listUsers(req, res) {
    try {
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

// 💡 새로운 기능: 사용자 삭제 API
async function deleteUser(req, res) {
    const { id } = req.body; // 삭제할 사용자 ID를 받습니다.

    if (!id) {
        return res.status(400).json({ success: false, error: '삭제할 사용자 ID를 입력해주세요.' });
    }

    try {
        const deletedRows = await dbconn('users').where({ id: id }).del();

        if (deletedRows > 0) {
            console.log(`✅ 사용자 ID ${id} 삭제 완료`);
            res.status(200).json({ success: true, message: `사용자 ID ${id}가 성공적으로 삭제되었습니다.` });
        } else {
            console.log(`⚠️ 사용자 ID ${id}를 찾을 수 없거나 이미 삭제되었습니다.`);
            res.status(404).json({ success: false, error: `사용자 ID ${id}를 찾을 수 없거나 이미 삭제되었습니다.` });
        }
    } catch (err) {
        console.error("❌ 사용자 삭제 오류:", err);
        res.status(500).json({ success: false, error: '사용자 삭제 중 오류 발생' });
    }
}

module.exports = {
    createUser,
    listUsers,
    userStats,
    deleteUser // 💡 deleteUser 함수를 내보냅니다.
};