// api/users.js (전체 코드)
var dbconn = require('../dbconn/dbconn.js');

// 사용자 생성 API
async function createUser(req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ success: false, error: '모든 필드를 입력해주세요.' });
    }

    const password_hash = password; // ⚠️ 중요: 실제 앱에서는 비밀번호를 반드시 해싱해야 합니다! (예: bcrypt)

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

// 사용자 삭제 API
async function deleteUser(req, res) {
    const { id } = req.body;

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

// 💡 사용자 로그인 API
async function loginUser(req, res) {
    const { usernameOrEmail, password } = req.body; 

    if (!usernameOrEmail || !password) {
        return res.status(400).json({ success: false, error: '사용자 이름/이메일과 비밀번호를 모두 입력해주세요.' });
    }

    try {
        const user = await dbconn('users')
            .where({ username: usernameOrEmail })
            .orWhere({ email: usernameOrEmail })
            .first();

        if (!user) {
            return res.status(401).json({ success: false, error: '사용자 이름 또는 이메일이 올바르지 않습니다.' });
        }

        if (user.password_hash === password) {
            console.log(`✅ 사용자 "${user.username}" 로그인 성공`);
            res.status(200).json({ success: true, message: '로그인 성공!', user: { id: user.id, username: user.username, email: user.email } });
        } else {
            console.log(`❌ 사용자 "${user.username}" 비밀번호 불일치`);
            res.status(401).json({ success: false, error: '비밀번호가 올바르지 않습니다.' });
        }
    } catch (err) {
        console.error("❌ 사용자 로그인 오류:", err);
        res.status(500).json({ success: false, error: '로그인 중 오류 발생' });
    }
}

// 💡 사용자 로그아웃 API 추가
async function logoutUser(req, res) {
    // 실제 앱에서는 여기에서 세션 무효화, JWT 블랙리스트 추가 등의 로직이 들어갑니다.
    // 현재는 단순히 성공 메시지를 반환합니다.
    console.log("✅ 로그아웃 요청 수신. (실제 세션/토큰 무효화 로직 필요)");
    res.status(200).json({ success: true, message: '성공적으로 로그아웃되었습니다.' });
}


module.exports = {
    createUser,
    listUsers,
    userStats,
    deleteUser,
    loginUser,
    logoutUser // 💡 logoutUser 함수를 내보냅니다.
};
