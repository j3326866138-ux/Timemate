// 注册。회원가입


const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", function(event) {
        // 防止页面刷新 페이지 새로고침 방지
        event.preventDefault();
        // 获取输入值 입력값 가져오기
        const name =
            document.getElementById("registerName").value.trim();
        const id =
            document.getElementById("registerId").value.trim();
        const password =
            document.getElementById("registerPassword").value;
        // 导入已有用户기존 사용자 가져오기
        const users =
            JSON.parse(localStorage.getItem("users")) || [];
        // ID 重复检查 중복 확인
        const existingUser =
            users.find(function(user) {
                return user.id === id;
            });
        if (existingUser) {
            document.getElementById("registerMessage").textContent =
                "이미 존재하는 아이디입니다.";
            return;
        }
        // 创建新用户 새로운 사용자 생성
        const newUser = {
            name: name,
            id: id,
            password: password
        };
        // 添加用户 사용자 추가
        users.push(newUser);
        // 保存到 localStorage 에 저장
        localStorage.setItem(
            "users",
            JSON.stringify(users)
        );
        // 显示消息 메시지 표시
        document.getElementById("registerMessage").textContent =
            "회원가입이 완료되었습니다.";
        // 1 秒后跳转到登录界面 초 후 로그인 페이지로 이동
        setTimeout(function() {
            window.location.href = "login.html";
        }, 1000);
    });
}
// 登录 로그인

const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", function(event) {
        // 防止页面刷新 
        event.preventDefault();
        // 获取输入值 
        const id =
            document.getElementById("loginId").value.trim();
        const password =
            document.getElementById("loginPassword").value;
        // 导入已保存的用户
        const users =
            JSON.parse(localStorage.getItem("users")) || [];
        // 验证账号和密码 아이디와 비밀번호 확인
        const user = users.find(function(user) {
            return user.id === id &&
                user.password === password;
        });
        // 登录失败 로그인 실패
        if (!user) {
            document.getElementById("loginMessage").textContent =
                "아이디 또는 비밀번호가 올바르지 않습니다.";
            return;
        }
        // 保存已登录用户 로그인한 사용자 저장
        localStorage.setItem(
            "currentUser",
            JSON.stringify(user)
        );
        // 返回主页 메인 페이지로 이동
        window.location.href = "index.html";
    });
}