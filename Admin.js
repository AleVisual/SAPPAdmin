const API_URL = 'https://fine-micro-thy-hygiene.trycloudflare.com';

// Iconos SVG para UI
const EYE_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
const EYE_OFF_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
const SUCCESS_SVG = '<svg viewBox="0 0 24 24" width="50" height="50" stroke="#2ecc71" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="msg-icon-success"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
const WARNING_SVG = '<svg viewBox="0 0 24 24" width="50" height="50" stroke="#f1c40f" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="msg-icon-warning"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
const DELETE_SVG = '<svg viewBox="0 0 24 24" width="50" height="50" stroke="#ff4757" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="msg-icon-error"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
const ERROR_SVG = '<svg viewBox="0 0 24 24" width="50" height="50" stroke="#ff4757" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="msg-icon-error"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';

document.addEventListener('DOMContentLoaded', () => {
    // Si ya estábamos logueados en este panel
    if (sessionStorage.getItem('superAdminMode')) {
        showDashboard();
    }

    const form = document.getElementById('superAdminForm');
    const loginBtn = document.getElementById('loginBtn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('saUsername').value;
        const password = document.getElementById('saPassword').value;

        loginBtn.textContent = 'Verificando...';
        loginBtn.disabled = true;

        try {
            // El endpoint nuevo oculto que devuelve TODO en texto plano
            const res = await fetch(`${API_URL}/api/superadmin/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (res.ok) {
                const data = await res.json();
                
                // Guardamos la sesión y los datos crudos temporalmente
                sessionStorage.setItem('superAdminMode', 'true');
                sessionStorage.setItem('sa_users_cache', JSON.stringify(data.users));
                
                // loginError.textContent = ''; // Removed as per instruction
                showDashboard();
            } else {
                const data = await res.json();
                showMsgModal('Acceso Denegado', data.message || 'Credenciales incorrectas.', 'error');
                // Limpiar campos en error
                document.getElementById('saUsername').value = '';
                document.getElementById('saPassword').value = '';
                document.getElementById('saPassword').type = 'password';
                document.getElementById('saUsername').focus();
            }

        } catch (e) {
            console.error(e);
            showMsgModal('Error de Servidor', 'No se pudo contactar con el sistema central.', 'error');
            document.getElementById('saUsername').value = '';
            document.getElementById('saPassword').value = '';
            document.getElementById('saPassword').type = 'password';
            document.getElementById('saUsername').focus();
        } finally {
            loginBtn.textContent = 'Desbloquear Registros';
            loginBtn.disabled = false;
            document.querySelectorAll('.eye-btn').forEach(b => b.innerHTML = EYE_SVG);
        }
    });

    document.getElementById('openDeleteBtn').addEventListener('click', () => {
        document.getElementById('deleteModal').classList.remove('hidden');
        document.getElementById('stepDelKey').classList.remove('hidden');
        document.getElementById('stepDelForm').classList.add('hidden');
        document.getElementById('delKey').value = '';
        document.getElementById('delUser').value = '';
        document.getElementById('delError').textContent = '';
        
        // Resetear tipos de input y botones de ojo
        document.getElementById('delKey').type = 'password';
        document.querySelectorAll('#deleteModal .eye-btn').forEach(b => b.innerHTML = EYE_SVG);
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.removeItem('superAdminMode');
        sessionStorage.removeItem('sa_users_cache');
        window.location.reload();
    });
}); // Fin de DOMContentLoaded

// ================= REGISTRO MODAL =================
let keyTemp = '';

document.getElementById('openRegisterBtn').addEventListener('click', () => {
    document.getElementById('registerModal').classList.remove('hidden');
    document.getElementById('stepKey').classList.remove('hidden');
    document.getElementById('stepForm').classList.add('hidden');
    document.getElementById('regKey').value = '';
    document.getElementById('regUser').value = '';
    document.getElementById('regPass').value = '';
    document.getElementById('regError').textContent = '';
    
    // Resetear tipos de input y botones de ojo
    document.querySelectorAll('.input-wrapper input, .input-wrapper .input-modal').forEach(i => i.type = 'password');
    document.querySelectorAll('.eye-btn').forEach(b => b.innerHTML = EYE_SVG);
});

function closeRegModal() {
    document.getElementById('registerModal').classList.add('hidden');
}

// ================= UTILIDADES UI =================

function togglePass(id, btn) {
    const input = document.getElementById(id);
    if (!input) return;
    const isPass = input.type === 'password';
    input.type = isPass ? 'text' : 'password';
    btn.innerHTML = isPass ? EYE_OFF_SVG : EYE_SVG;
}

function showMsgModal(title, msg, type = 'success') {
    const modal = document.getElementById('messageModal');
    const icon = document.getElementById('msgIcon');
    const ttl = document.getElementById('msgTitle');
    const content = document.getElementById('msgContent');

    ttl.textContent = title;
    content.textContent = msg;
    
    if (type === 'success') icon.innerHTML = SUCCESS_SVG;
    else if (type === 'danger') icon.innerHTML = DELETE_SVG;
    else if (type === 'error') icon.innerHTML = ERROR_SVG;
    else icon.innerHTML = WARNING_SVG;

    modal.classList.remove('hidden');
}

function closeMsgModal() {
    document.getElementById('messageModal').classList.add('hidden');
}

// ================= BORRADO DE CUENTA =================
let delKeyTemp = '';

function closeDelModal() {
    document.getElementById('deleteModal').classList.add('hidden');
}

function verifyDelKey() {
    const key = document.getElementById('delKey').value;
    const err = document.getElementById('delError');
    if (key === '07241416') {
        delKeyTemp = key;
        err.textContent = '';
        document.getElementById('stepDelKey').classList.add('hidden');
        document.getElementById('stepDelForm').classList.remove('hidden');
    } else {
        err.textContent = 'Clave incorrecta.';
    }
}

async function submitDelete() {
    const user = document.getElementById('delUser').value;
    const err = document.getElementById('delError');

    if (!user) {
        err.textContent = 'Escribí el usuario.';
        return;
    }

    err.textContent = 'Procesando...';
    err.style.color = 'var(--gold)';

    try {
        const res = await fetch(`${API_URL}/api/superadmin/delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: delKeyTemp, username: user })
        });

        const data = await res.json();

        if (res.ok) {
            closeDelModal();
            showMsgModal('Cuenta Eliminada', 'El administrador ha sido removido físicamente del servidor.', 'danger');
            // Limpiar login por si acaso
            document.getElementById('saUsername').value = '';
            document.getElementById('saPassword').value = '';
        } else {
            err.textContent = data.message || 'Error al eliminar.';
            err.style.color = '#ff4757';
        }
    } catch (error) {
        err.textContent = 'Error de conexión.';
        err.style.color = '#ff4757';
    }
}

function verifyRegKey() {
    const key = document.getElementById('regKey').value;
    const err = document.getElementById('regError');
    if (key === '0726') {
        keyTemp = key;
        err.textContent = '';
        document.getElementById('stepKey').classList.add('hidden');
        document.getElementById('stepForm').classList.remove('hidden');
    } else {
        err.textContent = 'Clave incorrecta.';
    }
}

async function submitRegister() {
    const user = document.getElementById('regUser').value;
    const pass = document.getElementById('regPass').value;
    const err = document.getElementById('regError');

    if (!user || !pass) {
        err.textContent = 'Completá todos los campos.';
        return;
    }

    err.textContent = 'Registrando...';
    err.style.color = '#f1c40f'; // color esperando

    try {
        const res = await fetch(`${API_URL}/api/superadmin/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: keyTemp, username: user, password: pass })
        });

        if (res.ok) {
            closeRegModal();
            showMsgModal('¡Registro Exitoso!', 'El nuevo administrador ha sido creado correctamente en el sistema.', 'success');
            document.getElementById('saUsername').value = user;
            document.getElementById('saPassword').value = ''; 
        } else {
            const data = await res.json();
            err.textContent = data.message || 'Error al registrar.';
            err.style.color = '#ff4757';
        }
    } catch (error) {
        err.textContent = 'Error de conexión.';
        err.style.color = '#ff4757';
    }
}

function showDashboard() {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('dashboardSection').classList.remove('hidden');
    renderUsersTable();
}

function renderUsersTable() {
    const tbody = document.getElementById('usersBody');
    const usersStr = sessionStorage.getItem('sa_users_cache');
    
    if (!usersStr) return;
    const users = JSON.parse(usersStr);
    
    tbody.innerHTML = '';

    users.forEach(u => {
        const tr = document.createElement('tr');
        
        // Tratar si está pendiente de loguearse para capturarla
        const isPending = !!u.rawPassword.includes('Aún no');
        const passClass = isPending ? 'secret-pass pending' : 'secret-pass';
        
        // Mensaje prearmado para WhatsApp
        const msgTpl = `¡Hola! Acá te paso tu contraseña de acceso de SApp.\nUsuario: ${u.username}\nClave: ${u.rawPassword}`;

        tr.innerHTML = `
            <td><strong>${u.username}</strong></td>
            <td>${(u.folderType || 'Ninguna').toUpperCase()}</td>
            <td><span class="${passClass}">${u.rawPassword}</span></td>
            <td>
                <button class="btn-whatsapp" onclick="copyToClipboard('${encodeURIComponent(msgTpl)}')">
                    <svg viewBox="0 0 24 24" fill="none" class="feather feather-copy" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copiar Datos
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

function copyToClipboard(encodedMsg) {
    const text = decodeURIComponent(encodedMsg);
    navigator.clipboard.writeText(text).then(() => {
        showToast();
    }).catch(err => {
        console.error('Error al copiar:', err);
        alert("Tu navegador bloqueó la copia automática, podés copiarla seleccionándola.");
    });
}

function showToast() {
    const t = document.getElementById('toast');
    t.classList.add('toast-show');
    setTimeout(() => {
        t.classList.remove('toast-show');
    }, 2500);
}
