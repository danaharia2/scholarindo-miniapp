// Telegram Web App Initialization
const tg = window.Telegram.WebApp;

// Application State
const state = {
    user: null,
    selectedLanguage: null,
    selectedSubject: null,
    attendanceType: null,
    answers: [],
    currentQuestion: 0,
    
    // Data Konfigurasi
    languages: [
        { code: 'english', name: 'English', icon: '🇬🇧', color: '#ff6b6b' },
        { code: 'russian', name: 'Russian', icon: '🇷🇺', color: '#4ecdc4' },
        { code: 'korean', name: 'Korean', icon: '🇰🇷', color: '#ffd166' },
        { code: 'german', name: 'German', icon: '🇩🇪', color: '#06d6a0' },
        { code: 'japanese', name: 'Japanese', icon: '🇯🇵', color: '#118ab2' },
        { code: 'arabic', name: 'Arabic', icon: '🇸🇦', color: '#ef476f' },
        { code: 'turkish', name: 'Turkish', icon: '🇹🇷', color: '#ffd166' },
        { code: 'thai', name: 'Thai', icon: '🇹🇭', color: '#06d6a0' },
        { code: 'mandarin', name: 'Mandarin', icon: '🇨🇳', color: '#073b4c' }
    ],
    
    subjects: {
        english: ['Basic', 'Intermediate', 'Advanced', 'Business'],
        russian: ['Basic', 'Intermediate', 'Advanced'],
        korean: ['Basic', 'Intermediate', 'Advanced', 'K-Pop'],
        german: ['Basic', 'Intermediate', 'Advanced'],
        japanese: ['Basic', 'Intermediate', 'Advanced', 'Anime'],
        arabic: ['Basic', 'Intermediate', 'Advanced', 'Quranic'],
        turkish: ['Basic', 'Intermediate', 'Advanced'],
        thai: ['Basic', 'Intermediate', 'Advanced'],
        mandarin: ['Basic', 'Intermediate', 'Advanced', 'Business']
    },
    
    questions: {
        hadir: [
            "Bagaimana kelas hari ini?",
            "Kritik dan sarannya untuk kelas hari ini?",
            "Masukan Keyword yang dikasih pada kelas hari ini?"
        ],
        izin: [
            "Apa alasan kamu izin kelas hari ini?",
            "Kasih kata peringatan dan motivasi biar bisa hadir di kelas berikutnya."
        ]
    }
};

// Initialize Telegram Web App
function initTelegramApp() {
    try {
        // Expand to full screen
        tg.expand();
        
        // Ready the app
        tg.ready();
        
        // Get user data
        state.user = tg.initDataUnsafe?.user || {
            id: Math.floor(Math.random() * 1000000000),
            first_name: 'User',
            username: 'user'
        };
        
        // Update user info display
        updateUserInfo();
        
        // Initialize main app
        initApp();
        
    } catch (error) {
        console.error('Error initializing Telegram app:', error);
        showError('Gagal menghubungkan ke Telegram. Pastikan Anda membuka melalui bot.');
    }
}

// Update user information display
function updateUserInfo() {
    const userInfoEl = document.getElementById('user-info');
    if (userInfoEl && state.user) {
        userInfoEl.innerHTML = `
            <span class="badge bg-light text-dark">
                <i class="fas fa-user me-1"></i>
                ${state.user.first_name} 
                ${state.user.username ? `(@${state.user.username})` : ''}
            </span>
        `;
    }
}

// Initialize application
function initApp() {
    // Hide loading
    document.getElementById('loading').style.display = 'none';
    
    // Show language section
    showLanguageSection();
    
    // Load languages
    loadLanguages();
    
    // Set up event listeners
    setupEventListeners();
}

// Load languages to UI
function loadLanguages() {
    const languageListEl = document.getElementById('language-list');
    if (!languageListEl) return;
    
    languageListEl.innerHTML = '';
    
    state.languages.forEach(lang => {
        const col = document.createElement('div');
        col.className = 'col-6 col-md-4 col-lg-3 mb-3';
        
        const btn = document.createElement('button');
        btn.className = 'language-btn w-100';
        btn.innerHTML = `
            <div style="font-size: 2rem;">${lang.icon}</div>
            <div class="mt-2 fw-bold">${lang.name}</div>
            <small class="text-muted">${state.subjects[lang.code]?.length || 3} level</small>
        `;
        
        btn.style.borderColor = lang.color;
        btn.onclick = () => selectLanguage(lang.code, lang.name);
        
        col.appendChild(btn);
        languageListEl.appendChild(col);
    });
}

// Select language
function selectLanguage(code, name) {
    state.selectedLanguage = code;
    
    // Update UI
    document.getElementById('language-section').style.display = 'none';
    document.getElementById('subject-section').style.display = 'block';
    document.getElementById('selected-language-text').textContent = `Pilih level untuk ${name}:`;
    
    // Load subjects
    loadSubjects(code);
}

// Load subjects for selected language
function loadSubjects(languageCode) {
    const subjectListEl = document.getElementById('subject-list');
    if (!subjectListEl) return;
    
    subjectListEl.innerHTML = '';
    
    const subjects = state.subjects[languageCode] || ['Basic', 'Intermediate', 'Advanced'];
    
    subjects.forEach(subject => {
        const col = document.createElement('div');
        col.className = 'col-6 col-md-4 mb-3';
        
        const btn = document.createElement('button');
        btn.className = 'btn subject-btn w-100';
        btn.innerHTML = `
            <i class="fas fa-book fa-2x mb-2"></i>
            <div>${subject}</div>
        `;
        
        btn.onclick = () => selectSubject(subject);
        
        col.appendChild(btn);
        subjectListEl.appendChild(col);
    });
}

// Select subject
function selectSubject(subject) {
    state.selectedSubject = subject;
    
    // Update UI
    document.getElementById('subject-section').style.display = 'none';
    document.getElementById('attendance-section').style.display = 'block';
    
    // Update class info
    const languageName = state.languages.find(l => l.code === state.selectedLanguage)?.name || 'Unknown';
    document.getElementById('class-name').textContent = `${languageName} ${subject}`;
    document.getElementById('class-details').textContent = 'Silakan pilih jenis absensi';
}

// Select attendance type
function selectAttendanceType(type) {
    state.attendanceType = type;
    state.answers = [];
    state.currentQuestion = 0;
    
    // Show questions section
    document.getElementById('questions-section').style.display = 'block';
    
    // Load questions
    loadQuestions();
}

// Load questions based on attendance type
function loadQuestions() {
    const questionsListEl = document.getElementById('questions-list');
    if (!questionsListEl) return;
    
    questionsListEl.innerHTML = '';
    
    const questions = state.questions[state.attendanceType] || [];
    const requiredQuestions = state.attendanceType === 'hadir' ? 3 : 2;
    
    questions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-card';
        questionDiv.innerHTML = `
            <label class="form-label fw-bold mb-2">
                <span class="badge bg-primary me-2">${index + 1}</span>
                ${question}
            </label>
            <textarea 
                class="form-control question-textarea" 
                rows="3" 
                data-index="${index}"
                placeholder="Tulis jawaban Anda di sini..."
                oninput="updateAnswer(${index}, this.value)"
                required
            ></textarea>
            <div class="text-end mt-1">
                <small class="text-muted">
                    <span id="char-count-${index}">0</span> karakter
                </small>
            </div>
        `;
        
        questionsListEl.appendChild(questionDiv);
    });
    
    // Update submit button text
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.innerHTML = `
            <i class="fas fa-paper-plane me-2"></i>
            Kirim Absensi ${state.attendanceType === 'hadir' ? 'Hadir' : 'Izin'}
            (${requiredQuestions} pertanyaan)
        `;
    }
}

// Update answer in state
function updateAnswer(index, value) {
    state.answers[index] = value;
    
    // Update character count
    const charCountEl = document.getElementById(`char-count-${index}`);
    if (charCountEl) {
        charCountEl.textContent = value.length;
    }
}

// Submit attendance
function submitAttendance() {
    // Validate answers
    const requiredQuestions = state.attendanceType === 'hadir' ? 3 : 2;
    const allAnswered = state.answers.length >= requiredQuestions && 
                       state.answers.every(a => a && a.trim().length > 0);
    
    if (!allAnswered) {
        tg.showAlert(`Harap isi semua ${requiredQuestions} pertanyaan!`);
        return;
    }
    
    // Prepare data for backend
    const data = {
        type: 'attendance',
        language: state.selectedLanguage,
        subject: state.selectedSubject,
        attendance_type: state.attendanceType,
        answers: state.answers,
        user_id: state.user.id,
        username: state.user.username || state.user.first_name,
        timestamp: new Date().toISOString(),
        version: '1.0'
    };
    
    // Send data to Telegram bot
    tg.sendData(JSON.stringify(data));
    
    // Show success message
    tg.showAlert(`✅ Absensi ${state.attendanceType} berhasil dikirim!\n\nTerima kasih telah mengisi absensi.`);
    
    // Reset form
    setTimeout(() => {
        document.getElementById('questions-section').style.display = 'none';
        state.answers = [];
        loadMockStats(); // Refresh stats
    }, 2000);
}

// Cancel attendance
function cancelAttendance() {
    document.getElementById('questions-section').style.display = 'none';
    state.answers = [];
    tg.showAlert('Absensi dibatalkan.');
}

// Navigation functions
function showLanguageSection() {
    hideAllSections();
    document.getElementById('language-section').style.display = 'block';
    updateActiveNav('language');
}

function showAttendanceSection() {
    hideAllSections();
    if (state.selectedLanguage && state.selectedSubject) {
        document.getElementById('attendance-section').style.display = 'block';
        updateActiveNav('attendance');
    } else {
        showLanguageSection();
        tg.showAlert('Silakan pilih bahasa dan level terlebih dahulu.');
    }
}

function showStatsSection() {
    hideAllSections();
    if (state.selectedLanguage && state.selectedSubject) {
        document.getElementById('stats-section').style.display = 'block';
        updateActiveNav('stats');
        
        // Update stats display
        const languageName = state.languages.find(l => l.code === state.selectedLanguage)?.name || 'Unknown';
        document.getElementById('stats-class-name').textContent = `${languageName} ${state.selectedSubject}`;
        
        // Load stats (mock for now)
        loadMockStats();
    } else {
        showLanguageSection();
        tg.showAlert('Silakan pilih bahasa dan level terlebih dahulu untuk melihat statistik.');
    }
}

function showHelp() {
    tg.showPopup({
        title: '❓ Bantuan Penggunaan',
        message: `
📚 **SCHOLARINDO MINI APP**

**Cara Menggunakan:**
1. Pilih bahasa yang ingin diakses
2. Pilih level kelas
3. Klik tombol "Hadir" atau "Izin"
4. Isi pertanyaan yang muncul
5. Kirim absensi

**Persyaratan:**
• Hadir: 3 pertanyaan wajib diisi
• Izin: 2 pertanyaan wajib diisi
• Alpha: Hanya untuk admin

**Info Kontak:**
Hubungi admin jika ada kendala.
        `,
        buttons: [
            { id: 'ok', type: 'default', text: 'Mengerti' }
        ]
    });
}

// Helper functions
function hideAllSections() {
    const sections = ['language-section', 'subject-section', 'attendance-section', 'stats-section'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

function updateActiveNav(active) {
    document.querySelectorAll('.btn-nav').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[onclick*="${active}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

function backToLanguages() {
    document.getElementById('subject-section').style.display = 'none';
    document.getElementById('language-section').style.display = 'block';
    updateActiveNav('language');
}

function backToAttendance() {
    document.getElementById('stats-section').style.display = 'none';
    document.getElementById('attendance-section').style.display = 'block';
    updateActiveNav('attendance');
}

// Mock stats (in real app, this would fetch from backend)
function loadMockStats() {
    // Mock data
    const hadir = Math.floor(Math.random() * 10) + 5;
    const izin = Math.floor(Math.random() * 5) + 1;
    const alpha = Math.floor(Math.random() * 3);
    const total = hadir + izin + alpha;
    const attendanceRate = total > 0 ? Math.round((hadir / total) * 100) : 0;
    
    // Update UI
    document.getElementById('total-hadir').textContent = hadir;
    document.getElementById('total-izin').textContent = izin;
    document.getElementById('total-alpha').textContent = alpha;
    document.getElementById('attendance-rate').textContent = `${attendanceRate}%`;
    
    // Update progress bar
    const progressBar = document.getElementById('attendance-progress');
    if (progressBar) {
        progressBar.style.width = `${attendanceRate}%`;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Telegram event listeners
    tg.onEvent('viewportChanged', () => {
        tg.expand();
    });
    
    // Handle back button
    tg.BackButton.onClick(() => {
        if (document.getElementById('subject-section').style.display === 'block') {
            backToLanguages();
        } else if (document.getElementById('attendance-section').style.display === 'block') {
            backToLanguages();
        } else if (document.getElementById('stats-section').style.display === 'block') {
            backToAttendance();
        }
    });
}

// Error handling
function showError(message) {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
        loadingEl.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Error!</strong><br>
                ${message}
            </div>
            <button class="btn btn-primary mt-3" onclick="location.reload()">
                <i class="fas fa-redo me-2"></i>Coba Lagi
            </button>
        `;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initTelegramApp);