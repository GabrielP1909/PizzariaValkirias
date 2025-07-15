document.addEventListener('DOMContentLoaded', function() {
    // Obter a instância de autenticação do Firebase
    // As variáveis globais são definidas no script type="module" nos arquivos HTML
    const auth = window.firebaseAuth;
    const createUserWithEmailAndPassword = window.createUserWithEmailAndPassword;
    const signInWithEmailAndPassword = window.signInWithEmailAndPassword;
    const signOut = window.signOut;
    const onAuthStateChanged = window.onAuthStateChanged;

    // Lógica para o formulário de Registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const name = document.getElementById('registerName').value; // Nome será armazenado no perfil do usuário
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                alert('As senhas não coincidem!');
                return;
            }

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Opcional: Armazenar o nome do usuário no perfil do Firebase (displayName)
                // Para usar updateProfile, você precisaria importá-lo no script type="module"
                // e adicioná-lo a window.updateProfile
                // Ex: import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
                // window.updateProfile = updateProfile;
                // await window.updateProfile(user, { displayName: name });

                alert('Conta criada com sucesso! Agora você pode fazer login.');
                window.location.href = 'login.html'; // Redirecionar para a página de login
            } catch (error) {
                let errorMessage = 'Erro ao criar conta.';
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = 'Este e-mail já está cadastrado. Por favor, faça login ou use outro e-mail.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'O formato do e-mail é inválido.';
                        break;
                    case 'auth/weak-password':
                        errorMessage = 'A senha é muito fraca. Use pelo menos 6 caracteres.';
                        break;
                    default:
                        errorMessage += ` Detalhes: ${error.message}`;
                }
                alert(errorMessage);
                console.error("Erro de registro:", error);
            }
        });
    }

    // Lógica para o formulário de Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                alert(`Bem-vindo(a)! Login realizado com sucesso.`);
                window.location.href = 'index.html'; // Redirecionar para a página inicial
            } catch (error) {
                let errorMessage = 'Erro ao fazer login.';
                switch (error.code) {
                    case 'auth/invalid-email':
                        errorMessage = 'O formato do e-mail é inválido.';
                        break;
                    case 'auth/user-disabled':
                        errorMessage = 'Esta conta foi desativada.';
                        break;
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                        errorMessage = 'E-mail ou senha incorretos. Por favor, tente novamente.';
                        break;
                    default:
                        errorMessage += ` Detalhes: ${error.message}`;
                }
                alert(errorMessage);
                console.error("Erro de login:", error);
            }
        });
    }

    // Lógica para verificar o status de login e atualizar o cabeçalho
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        onAuthStateChanged(auth, (user) => {
            // Remover links de login/registro existentes para evitar duplicação
            // É importante remover os elementos <li> inteiros, não apenas os <a>
            const loginLi = navLinks.querySelector('li a[href="login.html"]')?.parentElement;
            const registerLi = navLinks.querySelector('li a[href="register.html"]')?.parentElement;
            const userGreetingLi = navLinks.querySelector('li a[href="#"]'); // Para "Olá, usuário"
            const logoutLi = navLinks.querySelector('li #logoutBtn')?.parentElement;

            if (loginLi) loginLi.remove();
            if (registerLi) registerLi.remove();
            if (userGreetingLi) userGreetingLi.remove();
            if (logoutLi) logoutLi.remove();

            if (user) {
                // Usuário está logado
                const userLi = document.createElement('li');
                // user.displayName pode ser nulo se não foi definido no registro
                userLi.innerHTML = `<a href="#">Olá, ${user.displayName || user.email}</a>`;
                navLinks.appendChild(userLi);

                const newLogoutLi = document.createElement('li');
                newLogoutLi.innerHTML = `<a href="#" id="logoutBtn">Sair</a>`;
                navLinks.appendChild(newLogoutLi);

                document.getElementById('logoutBtn').addEventListener('click', async function(e) {
                    e.preventDefault();
                    try {
                        await signOut(auth);
                        alert('Você foi desconectado.');
                        // Redirecionar para a página inicial ou recarregar para atualizar o cabeçalho
                        window.location.href = 'index.html';
                    } catch (error) {
                        alert('Erro ao desconectar: ' + error.message);
                        console.error("Erro ao desconectar:", error);
                    }
                });
            } else {
                // Usuário não está logado
                // Adicionar links de login e registro
                const newLoginLi = document.createElement('li');
                newLoginLi.innerHTML = `<a href="login.html">Login</a>`;
                navLinks.appendChild(newLoginLi);

                const newRegisterLi = document.createElement('li');
                newRegisterLi.innerHTML = `<a href="register.html">Criar Conta</a>`;
                navLinks.appendChild(newRegisterLi);
            }
        });
    }
});
