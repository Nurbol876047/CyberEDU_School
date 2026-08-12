document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const themeLabel = document.getElementById('theme-label');
    
    themeToggle.addEventListener('change', function() {
        if(this.checked) {
            document.documentElement.setAttribute('data-theme', 'light');
            themeLabel.textContent = 'Бастауыш сыныптарға';
        } else {
            document.documentElement.removeAttribute('data-theme');
            themeLabel.textContent = 'Жоғарғы сыныптарға';
        }
    });

    const mainContent = document.getElementById('main-content');
    const moduleView = document.getElementById('module-view');
    const backBtn = document.getElementById('back-btn');
    const contentArea = document.getElementById('module-content-area');
    const stageIndicator = document.getElementById('stage-indicator');
    const moduleTitleDisplay = document.getElementById('module-title-display');
    
    let currentModuleId = 1;
    let currentStage = 1; // 1: Theory, 2: Simulator, 3: Quiz
    let currentStep = 0;
    let quizScore = 0;

    const modulesData = {
        1: {
            title: "Сенімді құпия сөз",
            theory: [
                { 
                    title: 'Құпия сөз деген не?', 
                    text: 'Құпия сөз — бұл ғаламтордағы құлыбыңның құпия кілті. Егер кілт тым қарапайым болса, хакер оны оңай тауып алады!',
                    visual: `
                        <div class="visual-box">
                            <div class="hacker-scene">
                                <div class="password-box bad-password">123456</div>
                                <div class="lock-icon" id="lock-icon">🔓</div>
                                <div class="hacker-alert">Хакер бұзып кірді!</div>
                            </div>
                        </div>
                    `,
                    onRender: () => {
                        if (window.anime) {
                            anime({ targets: '#lock-icon', rotate: [0, -20, 20, -20, 20, 0], duration: 800, easing: 'easeInOutSine', loop: true });
                        }
                    }
                },
                { 
                    title: 'Қорғанысты қалай құруға болады?', 
                    text: 'Жақсы құпия сөз күрделі лабиринт сияқты: ұзын, үлкен-кіші әріптер, сандар мен белгілерден тұрады. Туған күн немесе есімді қолданбаңыз.',
                    visual: `
                        <div class="visual-box">
                            <div class="shield-scene">
                                <div class="password-box good-password">#Qalqan_2026!</div>
                                <div class="shield-icon" id="shield-icon">🛡️</div>
                                <div class="shield-glow"></div>
                                <div class="safe-alert">Сенімді қорғаныс!</div>
                            </div>
                        </div>
                    `,
                    onRender: () => {
                        if (window.anime) {
                            anime({ targets: '.shield-glow', scale: [1, 1.8, 1], opacity: [0.3, 0.8, 0.3], duration: 2000, easing: 'easeInOutQuad', loop: true });
                            anime({ targets: '#shield-icon', translateY: [-10, 10], direction: 'alternate', loop: true, easing: 'easeInOutSine', duration: 1500 });
                        }
                    }
                }
            ],
            tasks: [
                { type: 'pwd-builder' },
                { 
                    type: 'drag-drop',
                    title: 'B түрі: Құпия сөздерді бөл',
                    desc: 'Төмендегі парольдерді ұстап, тиісті ұяшыққа тастаңыз.',
                    zone1: { id: 'weak', label: 'Әлсіз парольдер', class: 'weak-zone' },
                    zone2: { id: 'strong', label: 'Мықты парольдер', class: 'strong-zone' },
                    items: [
                        { text: '123456', type: 'weak' },
                        { text: 'Qalqan!2026', type: 'strong' },
                        { text: 'qwerty', type: 'weak' },
                        { text: 'S3cur3#P@ss', type: 'strong' },
                        { text: 'admin123', type: 'weak' }
                    ]
                },
                { type: 'choice', question: 'Құпия сөзді қайда сақтау керек?', opts: ['Стикерде', 'Дәптерге жазып қою', 'Құпия сөздер менеджерінде', 'Досыма айту'], a: 2, exp: "Маскоттың кеңесі: Достарға құпия сөзді айтуға болмайды, ал стикерді кез келген адам көре алады! Тағы бір рет байқап көр." }
            ],
            quiz: [
                { q: 'Егер құпия сөзіңді байқаусызда досыңа айтып қойсаң, оны өзгерту керек пе?', opts: ['Иә, міндетті түрде', 'Жоқ, егер ол ең жақын досым болса'], a: 0 },
                { q: 'Құпия сөзді не сенімді етеді?', opts: ['Қысқа болуы', 'Туған күнді қолдану', 'Әріптер, сандар және арнайы белгілердің қоспасы'], a: 2 },
                { q: 'Құпия сөздерді қайда сақтау қауіпсіз?', opts: ['Бөтен компьютердің браузерінде', 'Құпия сөздер менеджерінде', 'Телефондағы құпия сөзсіз жазбаларда'], a: 1 },
                { q: 'Екі факторлы аутентификация деген не?', opts: ['Екі түрлі құпия сөз енгізу', 'Құпия сөзге қосымша СМС немесе қосымшадан келетін код', 'Саусақ ізі'], a: 1 },
                { q: 'Барлық әлеуметтік желілер үшін бір құпия сөзді қолдануға бола ма?', opts: ['Әрине', 'Ешқашан, бұл қауіпті'], a: 1 }
            ]
        },
        2: {
            title: "Жеке деректер",
            theory: [
                {
                    title: 'Жеке деректер деген не?',
                    text: 'Сенің атың, мекенжайың, мектебің, телефон нөмірің — бұл сенің жеке деректерің. Оларды интернетте кез келген адамға айтуға болмайды.',
                    visual: `
                        <div class="visual-box">
                            <div class="data-scene" style="display: flex; justify-content: center; gap: 20px; align-items: center; flex-wrap: wrap;">
                                <div class="data-card" id="data-card-1">🏠 Мекенжай</div>
                                <div class="data-card main-card" id="data-main">👤 Сенің профилің</div>
                                <div class="data-card" id="data-card-2">📱 Телефон</div>
                            </div>
                        </div>
                    `,
                    onRender: () => {
                        if (window.anime) {
                            anime({
                                targets: ['.data-card:not(.main-card)'],
                                translateX: (el, i) => i === 0 ? [50, 0] : [-50, 0],
                                opacity: [0, 1],
                                duration: 1500,
                                delay: anime.stagger(200),
                                easing: 'easeOutElastic(1, .8)'
                            });
                            anime({
                                targets: '.main-card',
                                boxShadow: ['0 0 0 rgba(0, 255, 237, 0)', '0 0 20px rgba(0, 255, 237, 0.5)'],
                                direction: 'alternate',
                                loop: true,
                                duration: 1000
                            });
                        }
                    }
                },
                {
                    title: 'Қандай қауіп бар?',
                    text: 'Егер алаяқтар сенің жеке деректеріңді біліп алса, олар сенің атыңнан жаман істер жасауы немесе ата-анаңды алдауы мүмкін.',
                    visual: `
                        <div class="visual-box">
                            <div class="hacker-scene" style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
                                <div id="hacker-pc" style="font-size: 64px; line-height: 1;">💻</div>
                                <div class="data-fly" id="data-fly" style="font-size: 24px; background: white; color: black; padding: 5px 10px; border-radius: 5px; font-weight: bold;">📞 8701...</div>
                                <div class="hacker-alert" id="scam-alert" style="opacity: 0;">Алаяқтық жасалуда!</div>
                            </div>
                        </div>
                    `,
                    onRender: () => {
                        if (window.anime) {
                            anime.timeline({ loop: true })
                            .add({
                                targets: '#data-fly',
                                translateY: [50, -50],
                                scale: [1, 0.5],
                                opacity: [1, 0],
                                duration: 1500,
                                easing: 'easeInSine'
                            })
                            .add({
                                targets: '#scam-alert',
                                opacity: [0, 1, 0],
                                duration: 1000,
                                easing: 'linear'
                            }, '-=500');
                        }
                    }
                }
            ],
            tasks: [
                { type: 'choice', question: 'Бейтаныс сайт саған тегін ойын ұсынып, телефон нөміріңді сұраса не істейсің?', opts: ['Бірден жазамын', 'Жазып, ойынды жүктеймін', 'Ешқашан жазбаймын, ата-анама айтамын'], a: 2, exp: "Тегін сыйлықтар көбінесе алаяқтардың тұзағы болады. Жеке нөміріңді ешқашан берме." },
                { 
                    type: 'drag-drop',
                    title: 'Деректерді бөл',
                    desc: 'Қандай деректерді бөлісуге болады, ал қандай деректерді құпия ұстау керек?',
                    zone1: { id: 'safe', label: 'Бөлісуге болады', class: 'strong-zone' },
                    zone2: { id: 'secret', label: 'Құпия ұстау керек', class: 'weak-zone' },
                    items: [
                        { text: 'Сүйікті кино', type: 'safe' },
                        { text: 'Үй мекенжайы', type: 'secret' },
                        { text: 'Хобби (Футбол)', type: 'safe' },
                        { text: 'Телефон нөмір', type: 'secret' },
                        { text: 'Мектептің аты', type: 'secret' }
                    ]
                }
            ],
            quiz: [
                { q: 'Қайсысы жеке дерекке жатпайды?', opts: ['Мекенжай', 'Жақсы көретін түс', 'Телефон нөмір'], a: 1 },
                { q: 'Әлеуметтік желіде фото жариялағанда нені байқау керек?', opts: ['Киімімнің әдемілігін', 'Фонда үйдің мекенжайы немесе мектеп аты көрініп тұрмауын', 'Лайк саны'], a: 1 },
                { q: 'Интернеттегі «дос» сенен үйіңнің қайда екенін сұраса?', opts: ['Толық мекенжайды айтамын', 'Жауап бермеймін немесе бұғаттаймын', 'Тек көшені ғана айтамын'], a: 1 },
                { q: 'Неліктен мектеп атын интернетте ашық жазу қауіпті?', opts: ['Алаяқтар сені сол жерден тауып алуы мүмкін', 'Мұғалім ұрсады', 'Онда тұрған ештеңе жоқ'], a: 0 },
                { q: 'Бейтаныс адам телефон нөміріңе СМС-код жіберіп, оны айтуды сұраса:', opts: ['Айтамын', 'Ешқашан айтпаймын, бұл алаяқтар', 'Тек достарыма айтамын'], a: 1 }
            ]
        },
        3: {
            title: "Ғаламтордағы бейтаныс адамдар",
            theory: [
                {
                    title: 'Интернеттегі достар – шынымен де дос па?',
                    text: 'Интернетте кез келген адам өзін басқа адаммын деп таныстыра алады. Сенімен сөйлесіп отырған баланың артында ересек адам отыруы мүмкін.',
                    visual: `
                        <div class="visual-box">
                            <div class="hacker-scene" style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
                                <div id="mask-icon" style="font-size: 80px; line-height: 1;">🎭</div>
                                <div class="safe-alert" id="mask-text" style="color: orange; font-size: 20px;">Ол кім екенін нақты білмейсің!</div>
                            </div>
                        </div>
                    `,
                    onRender: () => {
                        if (window.anime) {
                            anime({
                                targets: '#mask-icon',
                                rotateY: [0, 360],
                                duration: 2000,
                                loop: true,
                                easing: 'linear'
                            });
                        }
                    }
                },
                {
                    title: 'Ешқашан кездесуге барма!',
                    text: 'Егер интернетте танысқан адам сені далаға шақырса, міндетті түрде ата-анаңа айт. Ол қауіпті болуы мүмкін.',
                    visual: `
                        <div class="visual-box">
                            <div class="shield-scene" style="display: flex; gap: 30px; align-items: center; justify-content: center;">
                                <div id="stranger-icon" style="font-size: 50px;">👤</div>
                                <div id="stranger-msg" style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 10px; border: 1px solid red; font-size: 16px;">"Саябақта кездесейік?"</div>
                                <div id="block-shield" style="font-size: 50px; display: none;">🛡️</div>
                            </div>
                        </div>
                    `,
                    onRender: () => {
                        setTimeout(() => {
                            const shield = document.getElementById('block-shield');
                            const msg = document.getElementById('stranger-msg');
                            if (shield && msg) {
                                shield.style.display = 'block';
                                msg.style.textDecoration = 'line-through';
                                msg.style.borderColor = 'gray';
                            }
                        }, 1500);
                    }
                }
            ],
            tasks: [
                { type: 'choice', question: 'Бейтаныс адам саған хат жазып, суретіңді сұрады. Не істейсің?', opts: ['Жіберемін', 'Оның суретін сұраймын', 'Бұғаттаймын (блокқа қоямын)'], a: 2, exp: "Бейтаныс адамдарға сурет жіберуге болмайды. Ең дұрысы — бұғаттау." },
                { type: 'choice', question: 'Ойында бір ойыншы саған: "Маған пароліңді берсең, саған көп кристалл (ақша) беремін" дейді.', opts: ['Паролімді беремін', 'Мүлдем сенбеймін, шағым (репорт) жіберемін', 'Жарты паролімді айтамын'], a: 1, exp: "Тегін кристалл уәде ету — алаяқтардың сүйікті айласы." }
            ],
            quiz: [
                { q: 'Бейтаныс адам сенің мекенжайыңды сұраса?', opts: ['Айтамын', 'Жауап бермей, бұғаттаймын', 'Тек қаланы айтамын'], a: 1 },
                { q: 'Желіде танысқан адам сені кездесуге шақырды. Не істейсің?', opts: ['Досыммен бірге барамын', 'Барамын, өйткені ол жақсы адам сияқты', 'Ешқашан бармаймын және ата-анама айтамын'], a: 2 },
                { q: 'Онлайн достарға сенуге бола ма?', opts: ['Иә, олар мені түсінеді', 'Жоқ, олардың кім екенін нақты білмеймін', 'Оларға бар құпиямды айта аламын'], a: 1 },
                { q: 'Аватаркасында сүйкімді мысық тұрған адам саған жазса, ол міндетті түрде жақсы бала ма?', opts: ['Иә', 'Жоқ, суретті кез келген адам қоя алады'], a: 1 },
                { q: 'Ересек адам сенен "бұл туралы ата-анаңа айтпа" деп өтінсе?', opts: ['Сыр сақтаймын', 'Міндетті түрде ата-анама айтамын, бұл қауіпті сигнал'], a: 1 }
            ]
        },
        4: {
            title: "Кибербуллинг",
            theory: [
                {
                    title: 'Кибербуллинг деген не?',
                    text: 'Интернетте біреуді мазақ ету, қорлау немесе жаман сөздер жазу — бұл кибербуллинг. Экран артында отырып жаман сөз жазу да қылмысқа жатады.',
                    visual: `
                        <div class="visual-box">
                            <div class="hacker-scene" style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
                                <div id="sad-face" style="font-size: 64px;">😢</div>
                                <div style="display: flex; gap: 10px;">
                                    <div class="mean-msg" style="background: rgba(255,0,0,0.2); padding: 5px 10px; border-radius: 8px;">Сен ақымақсың!</div>
                                    <div class="mean-msg" style="background: rgba(255,0,0,0.2); padding: 5px 10px; border-radius: 8px;">Суретің жаман!</div>
                                </div>
                            </div>
                        </div>
                    `,
                    onRender: () => {
                        if (window.anime) {
                            anime({
                                targets: '.mean-msg',
                                translateY: [20, 0],
                                opacity: [0, 1],
                                delay: anime.stagger(500),
                                easing: 'easeOutQuad'
                            });
                        }
                    }
                },
                {
                    title: 'Кибербуллингті қалай тоқтатамыз?',
                    text: 'Егер саған жаман сөздер жазса: Жауап берме ➡️ Бұғатта (Блок) ➡️ Үлкендерге айт.',
                    visual: `
                        <div class="visual-box">
                            <div class="shield-scene" style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                                <div class="action-step" style="padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px;">1. Жауап берме 🤫</div>
                                <div class="action-step" style="padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px;">2. Бұғатта 🚫</div>
                                <div class="action-step" style="padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px;">3. Көмек сұра 👨‍👩‍👦</div>
                            </div>
                        </div>
                    `,
                    onRender: () => {
                        if (window.anime) {
                            anime({
                                targets: '.action-step',
                                scale: [0.9, 1],
                                opacity: [0, 1],
                                delay: anime.stagger(400),
                                easing: 'easeOutElastic(1, .5)'
                            });
                        }
                    }
                }
            ],
            tasks: [
                { type: 'choice', question: 'Топтық чатта сыныптасыңды бәрі мазақ етіп жатыр. Не істейсің?', opts: ['Мен де қосыламын', 'Үндемей чаттан шығып кетемін', 'Скриншот жасап, мұғалімге көрсетемін және досымды қолдаймын'], a: 2, exp: "Үндемеу де буллингті қолдағанмен тең. Көмек сұрау — ең батыл қадам." },
                { type: 'choice', question: 'Біреу сенің фотоңның астына жаман пікір (комментарий) жазды.', opts: ['Оған да жаман сөз жазамын', 'Оны бұғаттаймын (блок) және пікірді өшіремін', 'Парақшамды толық өшіремін'], a: 1, exp: "Жаман адаммен ұрысып уақыт кетірме, жай ғана бұғатта." }
            ],
            quiz: [
                { q: 'Кибербуллинг кімге әсер етеді?', opts: ['Тек әлсіздерге', 'Кез келген адамға', 'Тек кішкентайларға'], a: 1 },
                { q: 'Егер біреу саған желіде қоқан-лоққы жасаса?', opts: ['Қорқамын', 'Дәлелдерді (скриншот) сақтап, үлкендерге айтамын', 'Жауап қайтарамын'], a: 1 },
                { q: 'Буллингті көрген кезде үндемеу...', opts: ['Оны тоқтатады', 'Жағдайды одан сайын ушықтырады'], a: 1 },
                { q: 'Жаман пікір жазатын адамды қалай жеңуге болады?', opts: ['Бұғаттау (ignore/block) арқылы', 'Онымен ұрысу арқылы', 'Жалынғанда'], a: 0 },
                { q: 'Интернеттегі мінез-құлық нені білдіреді?', opts: ['Кімге не жазсаң да өз еркің', 'Өмірде қалай сыпайы болсаң, интернетте де солай болу'], a: 1 }
            ]
        },
        5: {
            title: "Фейктер мен алдау",
            theory: [
                {
                    title: 'Фишинг деген не?',
                    text: 'Алаяқтар танымал сайттардың көшірмесін жасап, сенің пароліңді ұрлағысы келеді. Мысалы, roblox.com орнына r0bl0x.com деп жазылуы мүмкін.',
                    visual: `
                        <div class="visual-box">
                            <div style="display: flex; flex-direction: column; gap: 10px; align-items: center;">
                                <div style="background: rgba(255,255,255,0.1); padding: 10px 20px; border-radius: 8px; border: 2px solid #5BD15B;">✅ www.roblox.com</div>
                                <div id="fake-url" style="background: rgba(255,0,0,0.1); padding: 10px 20px; border-radius: 8px; border: 2px solid #ff4d4d; position: relative;">❌ www.r0bl0x-free.com</div>
                            </div>
                        </div>
                    `,
                    onRender: () => {
                        if (window.anime) {
                            anime({
                                targets: '#fake-url',
                                translateX: [-5, 5, -5, 5, 0],
                                duration: 1000,
                                loop: true,
                                easing: 'easeInOutSine'
                            });
                        }
                    }
                },
                {
                    title: 'Тегін сыйлықтар – тұзақ',
                    text: 'Интернеттегі "Сен iPhone ұтып алдың!" немесе "Тегін кристалл алу үшін осында бас" деген жарнамалардың бәрі дерлік өтірік.',
                    visual: `
                        <div class="visual-box">
                            <div id="prize-banner" style="background: linear-gradient(45deg, #ff00cc, #3333ff); padding: 20px; border-radius: 12px; text-align: center; cursor: pointer;">
                                <h3 style="margin:0; color: white;">🎉 ТЕГІН iPHONE ҰТЫП АЛ! 🎉</h3>
                                <p style="margin:5px 0 0 0; color: white;">Дәл қазір басып, мекенжайыңды жаз!</p>
                            </div>
                            <div id="prize-alert" style="display: none; color: #ff4d4d; font-weight: bold; text-align: center; margin-top: 15px; font-size: 20px;">🚨 БҰЛ АЛАЯҚТЫҚ! БАСПА!</div>
                        </div>
                    `,
                    onRender: () => {
                        if (window.anime) {
                            anime({
                                targets: '#prize-banner',
                                scale: [1, 1.05],
                                direction: 'alternate',
                                loop: true,
                                duration: 500,
                                easing: 'easeInOutSine'
                            });
                        }
                        const banner = document.getElementById('prize-banner');
                        if (banner) {
                            banner.addEventListener('click', () => {
                                document.getElementById('prize-alert').style.display = 'block';
                                if(window.anime) anime.remove('#prize-banner');
                                banner.style.opacity = '0.5';
                                banner.style.filter = 'grayscale(100%)';
                            });
                        }
                    }
                }
            ],
            tasks: [
                { type: 'choice', question: 'Қай сілтеме қауіпсіз?', opts: ['www.youtube-free-premium.net', 'www.youtube.com', 'www.youtubbe.com'], a: 1, exp: "Тек ресми және дұрыс жазылған сілтемелерге кіру керек." },
                { 
                    type: 'drag-drop',
                    title: 'Фейкті анықта',
                    desc: 'Қайсысына сенуге болады, ал қайсысы өтірік (фейк)?',
                    zone1: { id: 'trust', label: 'Сенуге болады ✅', class: 'strong-zone' },
                    zone2: { id: 'fake', label: 'Фейк (Өтірік) ❌', class: 'weak-zone' },
                    items: [
                        { text: 'Ресми сайттағы жаңалық', type: 'trust' },
                        { text: '«Тегін iPhone» жарнамасы', type: 'fake' },
                        { text: 'Пароль сұраған хат', type: 'fake' },
                        { text: 'Ата-анаңнан келген СМС', type: 'trust' }
                    ]
                }
            ],
            quiz: [
                { q: 'Фишинг деген не?', opts: ['Интернетте балық аулау ойыны', 'Сайттың көшірмесін жасап, пароль ұрлау', 'Жаңа вирус'], a: 1 },
                { q: '«Сен миллион ұттың!» деген хат келсе не істейсің?', opts: ['Қуанып, сілтемеге өтемін', 'Өшіремін немесе бұғаттаймын', 'Достарыма жіберемін'], a: 1 },
                { q: 'Неліктен алаяқтар тегін сыйлықтар ұсынады?', opts: ['Олар өте жомарт', 'Сенің жеке деректеріңді ұрлау үшін'], a: 1 },
                { q: 'Сілтеменің қауіпсіз екенін қалай білуге болады?', opts: ['Сілтеменің басында "https://" болуы және атауында қате болмауы керек', 'Егер ол әдемі көрінсе, қауіпсіз', 'Досым жіберсе болды, тексеретін ештеңе жоқ'], a: 0 },
                { q: 'Егер байқаусызда қауіпті сілтемеге кіріп кетсең не істеу керек?', opts: ['Дереу шығып, үлкендерге айту', 'Сайтты ары қарай оқу', 'Пароль жазу'], a: 0 }
            ]
        },
        6: {
            title: "Экран уақыты",
            theory: [
                {
                    title: 'Телефонда көп отырудың зияны',
                    text: 'Экранға ұзақ қарау көзді құртады, ұйқыны бұзады және миды шаршатады. Өмір тек интернетте емес!',
                    visual: `
                        <div class="visual-box" style="display: flex; justify-content: space-around; align-items: center;">
                            <div style="text-align: center;">
                                <div id="battery-red" style="font-size: 50px;">🪫</div>
                                <p style="color: #ff4d4d; font-weight: bold;">Күні бойы телефон</p>
                            </div>
                            <div style="text-align: center;">
                                <div id="battery-green" style="font-size: 50px;">🔋</div>
                                <p style="color: var(--accent-cyan); font-weight: bold;">Уақытпен қолдану</p>
                            </div>
                        </div>
                    `,
                    onRender: () => {
                        if (window.anime) {
                            anime({ targets: '#battery-red', opacity: [1, 0.5], direction: 'alternate', loop: true, duration: 800 });
                            anime({ targets: '#battery-green', translateY: [-10, 0], direction: 'alternate', loop: true, duration: 1000 });
                        }
                    }
                },
                {
                    title: '20-20-20 Ережесі',
                    text: 'Әр 20 минут сайын экраннан көзді алып, 20 секунд бойы 20 фут (6 метр) қашықтыққа қарау керек. Бұл көзді демалдырады.',
                    visual: `
                        <div class="visual-box" style="display: flex; justify-content: center; align-items: center; gap: 20px; flex-wrap: wrap;">
                            <div class="rule-box" style="font-size: 30px; font-weight: bold; background: rgba(0,255,237,0.1); padding: 15px; border-radius: 50%;">20м</div>
                            <div style="font-size: 24px;">➡️</div>
                            <div class="rule-box" style="font-size: 30px; font-weight: bold; background: rgba(0,255,237,0.1); padding: 15px; border-radius: 50%;">20с</div>
                            <div style="font-size: 24px;">➡️</div>
                            <div class="rule-box" style="font-size: 30px; font-weight: bold; background: rgba(0,255,237,0.1); padding: 15px; border-radius: 50%;">6м</div>
                        </div>
                    `,
                    onRender: () => {
                        if (window.anime) {
                            anime({
                                targets: '.rule-box',
                                scale: [0.8, 1.1, 1],
                                delay: anime.stagger(500),
                                loop: true,
                                duration: 2000
                            });
                        }
                    }
                }
            ],
            tasks: [
                { type: 'choice', question: 'Ұйықтар алдында не істеген дұрыс?', opts: ['TikTok қарау', 'Ойын ойнау', 'Кітап оқу немесе бірден ұйықтау'], a: 2, exp: "Ұйықтар алдындағы экран сәулесі миға «күндіз» деген сигнал беріп, ұйқыны бұзады." },
                { 
                    type: 'drag-drop',
                    title: 'Уақытты дұрыс бөл',
                    desc: 'Қай әрекет пайдалы, ал қайсысын шектеу керек?',
                    zone1: { id: 'good', label: 'Пайдалы істер ✅', class: 'strong-zone' },
                    zone2: { id: 'bad', label: 'Шектеу керек ❌', class: 'weak-zone' },
                    items: [
                        { text: 'Далада достармен ойнау', type: 'good' },
                        { text: 'Күні бойы ойын ойнау', type: 'bad' },
                        { text: 'Кітап оқу', type: 'good' },
                        { text: 'Телефонға қарап тамақ ішу', type: 'bad' },
                        { text: 'Спортпен айналысу', type: 'good' }
                    ]
                }
            ],
            quiz: [
                { q: 'Экран алдында көп отыру неге әкеледі?', opts: ['Көздің көруі жақсарады', 'Ұйқысыздық, көздің нашарлауы және бас ауруы', 'Ақылды боламын'], a: 1 },
                { q: 'Көзді демалдыру үшін қандай ереже қолданылады?', opts: ['10-10-10', '20-20-20', '30-30-30'], a: 1 },
                { q: 'Тамақ ішіп отырғанда телефон қарау дұрыс па?', opts: ['Иә, қызық болады', 'Жоқ, бұл асқорытуды бұзады және миды шаршатады'], a: 1 },
                { q: 'Қай уақытта телефонды мүлдем қолданбаған дұрыс?', opts: ['Күндіз', 'Ұйықтар алдында кем дегенде 1 сағат бұрын', 'Таңертең'], a: 1 },
                { q: 'Егер көзің қызарып, басың ауырса не істеу керек?', opts: ['Экран жарығын азайту', 'Телефонды қойып, таза ауаға шығу немесе демалу', 'Ойынды жалғастыру'], a: 1 }
            ]
        }
    };

    document.getElementById('module-1-btn').addEventListener('click', () => openModule(1));
    document.getElementById('module-2-btn').addEventListener('click', () => openModule(2));
    document.getElementById('module-3-btn').addEventListener('click', () => openModule(3));
    document.getElementById('module-4-btn').addEventListener('click', () => openModule(4));
    document.getElementById('module-5-btn').addEventListener('click', () => openModule(5));
    document.getElementById('module-6-btn').addEventListener('click', () => openModule(6));
    document.getElementById('parents-panel-btn').addEventListener('click', openParentsPanel);

    backBtn.addEventListener('click', () => {
        moduleView.classList.add('hidden');
        mainContent.classList.remove('hidden');
    });

    function openModule(id) {
        currentModuleId = id;
        moduleTitleDisplay.textContent = modulesData[id].title;
        stageIndicator.style.display = '';
        mainContent.classList.add('hidden');
        moduleView.classList.remove('hidden');
        currentStage = 1;
        currentStep = 0;
        quizScore = 0;
        renderState();
    }

    function openParentsPanel() {
        mainContent.classList.add('hidden');
        moduleView.classList.remove('hidden');
        
        moduleTitleDisplay.textContent = 'Ата-аналар мен мұғалімдерге';
        stageIndicator.style.display = 'none';
        
        const currentProgress = document.getElementById('main-progress-text').textContent || '0%';
        const isFinished = parseInt(currentProgress) >= 80;
        
        contentArea.innerHTML = `
            <style>
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            </style>
            <div class="dashboard-wrapper" style="display: flex; gap: 30px; max-width: 1100px; margin: 0 auto; color: var(--text-primary); flex-wrap: wrap; padding-bottom: 40px;">
                <!-- Sidebar -->
                <div style="flex: 0 0 260px; background: rgba(255,255,255,0.03); border: 1px solid var(--card-border); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 10px; height: max-content;">
                    <button class="dash-tab active" data-tab="tab-progress" style="text-align: left; padding: 15px 20px; border-radius: 12px; border: none; background: var(--accent-cyan); color: var(--bg-start); font-weight: bold; cursor: pointer; transition: 0.3s; font-size: 16px;">📊 Үлгерім</button>
                    <button class="dash-tab" data-tab="tab-guides" style="text-align: left; padding: 15px 20px; border-radius: 12px; border: none; background: transparent; color: var(--text-primary); font-weight: 500; cursor: pointer; transition: 0.3s; font-size: 16px;">📚 Кеңестер мен мысалдар</button>
                    <button class="dash-tab" data-tab="tab-settings" style="text-align: left; padding: 15px 20px; border-radius: 12px; border: none; background: transparent; color: var(--text-primary); font-weight: 500; cursor: pointer; transition: 0.3s; font-size: 16px;">⚙️ Баптаулар</button>
                </div>
                
                <!-- Content Area -->
                <div style="flex: 1; min-width: 300px; background: rgba(255,255,255,0.03); border: 1px solid var(--card-border); border-radius: 16px; padding: 40px; text-align: left; position: relative;">
                    
                    <!-- Tab 1: Progress -->
                    <div id="tab-progress" class="dash-content" style="display: block; animation: fadeIn 0.5s ease;">
                        <h2 style="font-size: 32px; margin-bottom: 10px; font-weight: 800;">Жалпы үлгерім панелі</h2>
                        <p style="color: var(--text-secondary); margin-bottom: 30px; font-size: 16px;">Оқушының платформадағы белсенділігі мен нәтижелері.</p>
                        
                        <div style="display: flex; gap: 20px; margin-bottom: 40px; flex-wrap: wrap;">
                            <div style="flex: 1; min-width: 200px; background: rgba(0,255,237,0.08); border: 1px solid var(--accent-cyan); padding: 30px; border-radius: 16px; display: flex; flex-direction: column; justify-content: center; align-items: center; box-shadow: 0 0 30px rgba(0,255,237,0.1);">
                                <div style="font-size: 54px; font-weight: 900; color: var(--accent-cyan); line-height: 1;">${currentProgress}</div>
                                <div style="font-size: 16px; font-weight: 500; margin-top: 10px; color: var(--text-primary);">Жалпы өту деңгейі</div>
                            </div>
                            <div style="flex: 1; min-width: 200px; background: rgba(255,217,0,0.08); border: 1px solid var(--accent-yellow); padding: 30px; border-radius: 16px; display: flex; flex-direction: column; justify-content: center; align-items: center; box-shadow: 0 0 30px rgba(255,217,0,0.1);">
                                <div style="font-size: 54px; font-weight: 900; color: var(--accent-yellow); line-height: 1;">6</div>
                                <div style="font-size: 16px; font-weight: 500; margin-top: 10px; color: var(--text-primary);">Барлық модульдер</div>
                            </div>
                        </div>
                        
                        <h3 style="font-size: 22px; margin-bottom: 20px; border-bottom: 1px solid var(--card-border); padding-bottom: 15px;">Модульдер тізімі</h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;">
                            ${[
                                {title: 'Сенімді құпия сөз', status: 'Аяқталды ✅', color: 'var(--accent-cyan)'},
                                {title: 'Жеке деректер', status: 'Процесте ⏳', color: 'var(--accent-yellow)'},
                                {title: 'Кибербуллинг', status: 'Жабық 🔒', color: '#666'},
                                {title: 'Алаяқтық', status: 'Жабық 🔒', color: '#666'},
                                {title: 'Фейктер', status: 'Жабық 🔒', color: '#666'},
                                {title: 'Экран уақыты', status: 'Жабық 🔒', color: '#666'}
                            ].map(m => `
                                <div style="background: rgba(255,255,255,0.02); padding: 18px 20px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(255,255,255,0.05);">
                                    <span style="font-weight: 500; font-size: 15px;">${m.title}</span>
                                    <span style="color: ${isFinished ? 'var(--accent-cyan)' : m.color}; font-size: 12px; font-weight: bold; background: rgba(0,0,0,0.4); padding: 6px 10px; border-radius: 20px;">${isFinished ? 'Аяқталды ✅' : m.status}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Tab 2: Guides -->
                    <div id="tab-guides" class="dash-content" style="display: none; animation: fadeIn 0.5s ease;">
                        <h2 style="font-size: 32px; margin-bottom: 10px; font-weight: 800;">Ата-аналарға арналған кеңестер</h2>
                        <p style="color: var(--text-secondary); margin-bottom: 35px; font-size: 16px;">Визуалды нұсқаулықтар мен қауіпсіздік шаралары.</p>
                        
                        <div style="display: flex; flex-direction: column; gap: 35px;">
                            <!-- Guide 1 -->
                            <div style="display: flex; gap: 30px; align-items: center; background: rgba(0,0,0,0.2); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); flex-wrap: wrap;">
                                <img src="assets/parental_control.png" style="width: 220px; height: 220px; object-fit: cover; border-radius: 16px; box-shadow: 0 0 30px rgba(0,255,237,0.15);" alt="Parental Control">
                                <div style="flex: 1; min-width: 250px;">
                                    <h3 style="color: var(--accent-cyan); margin: 0 0 15px 0; font-size: 24px;">Ата-ана бақылауы (Parental Control)</h3>
                                    <p style="font-size: 15px; line-height: 1.7; color: var(--text-secondary); margin-bottom: 20px;">Google Family Link немесе iOS Screen Time орнату арқылы баланың құрылғысындағы қауіпті қосымшаларды бұғаттаңыз және экран алдында өткізетін уақытын шектеңіз.</p>
                                    <div style="display: flex; gap: 12px;">
                                        <span style="background: rgba(0,255,237,0.1); color: var(--accent-cyan); padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: bold;">Уақыт шектеу</span>
                                        <span style="background: rgba(0,255,237,0.1); color: var(--accent-cyan); padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: bold;">Бұғаттау</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Guide 2 -->
                            <div style="display: flex; gap: 30px; align-items: center; background: rgba(0,0,0,0.2); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); flex-wrap: wrap-reverse;">
                                <div style="flex: 1; min-width: 250px;">
                                    <h3 style="color: var(--accent-purple); margin: 0 0 15px 0; font-size: 24px;">Сенімді қарым-қатынас орнату</h3>
                                    <p style="font-size: 15px; line-height: 1.7; color: var(--text-secondary); margin-bottom: 20px;">Желіде қауіп төнгенде (кибербуллинг немесе алаяқтар) бала ең бірінші сізге айтуы керек. Бұл үшін ұрыспай, оларды қолдап, ашық сөйлесуді әдетке айналдырыңыз.</p>
                                    <div style="display: flex; gap: 12px;">
                                        <span style="background: rgba(139,92,246,0.1); color: var(--accent-purple); padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: bold;">Психология</span>
                                        <span style="background: rgba(139,92,246,0.1); color: var(--accent-purple); padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: bold;">Қолдау</span>
                                    </div>
                                </div>
                                <img src="assets/family.png" style="width: 220px; height: 220px; object-fit: cover; border-radius: 16px; box-shadow: 0 0 30px rgba(139,92,246,0.15);" alt="Family Cybersecurity">
                            </div>
                        </div>
                    </div>

                    <!-- Tab 3: Settings -->
                    <div id="tab-settings" class="dash-content" style="display: none; animation: fadeIn 0.5s ease;">
                        <h2 style="font-size: 32px; margin-bottom: 10px; font-weight: 800;">Баптаулар</h2>
                        <p style="color: var(--text-secondary); margin-bottom: 35px; font-size: 16px;">Платформаның жұмыс істеу режимін реттеңіз.</p>
                        
                        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--card-border); padding: 30px; border-radius: 16px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 5px 15px rgba(0,0,0,0.2);">
                            <div>
                                <h3 style="margin: 0; font-size: 20px;">Апталық есеп алу</h3>
                                <p style="font-size: 15px; color: var(--text-secondary); margin: 8px 0 0 0;">Оқушының үлгерімі туралы e-mail немесе Telegram-ға есеп жіберу</p>
                            </div>
                            <label style="position: relative; display: inline-block; width: 66px; height: 38px;">
                                <input type="checkbox" style="opacity: 0; width: 0; height: 0;" checked>
                                <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--accent-cyan); border-radius: 38px; transition: .4s;">
                                    <span style="position: absolute; height: 30px; width: 30px; left: 4px; bottom: 4px; background-color: white; border-radius: 50%; transition: .4s; transform: translateX(28px);"></span>
                                </span>
                            </label>
                        </div>
                        
                        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--card-border); padding: 30px; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 5px 15px rgba(0,0,0,0.2);">
                            <h3 style="margin: 0 0 12px 0; font-size: 20px;">Марапаттау сертификаты</h3>
                            <p style="font-size: 15px; color: var(--text-secondary); margin-bottom: 25px;">Барлық 6 модульден сәтті өткен жағдайда, марапаттау сертификатын жүктеп алуға болады.</p>
                            <button class="btn btn-primary" id="cert-btn-new" ${isFinished ? '' : 'disabled'}>Сертификатты жүктеу</button>
                            ${!isFinished ? '<p style="font-size: 14px; color: #ff4d4d; margin-top: 15px; font-weight: 500;">Бұғатталған: Әлі барлық модульдер толық орындалмаған.</p>' : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;

        const tabs = contentArea.querySelectorAll('.dash-tab');
        const contents = contentArea.querySelectorAll('.dash-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => {
                    t.classList.remove('active');
                    t.style.background = 'transparent';
                    t.style.color = 'var(--text-primary)';
                });
                
                contents.forEach(c => c.style.display = 'none');
                
                tab.classList.add('active');
                tab.style.background = 'var(--accent-cyan)';
                tab.style.color = 'var(--bg-start)';
                
                const targetId = tab.getAttribute('data-tab');
                document.getElementById(targetId).style.display = 'block';
            });
        });

        if (isFinished) {
            document.getElementById('cert-btn-new').addEventListener('click', () => {
                alert('Құттықтаймыз! Сертификат жүктелуде... (Демо нұсқа)');
            });
        }
    }

    function renderState() {
        contentArea.innerHTML = '';
        const mData = modulesData[currentModuleId];
        
        if (currentStage === 1) {
            stageIndicator.textContent = "1-кезең: Теория";
            if (currentStep < mData.theory.length) {
                renderTheory(mData.theory[currentStep]);
            } else {
                currentStage = 2; currentStep = 0;
                renderState();
            }
        } else if (currentStage === 2) {
            stageIndicator.textContent = `2-кезең: Жаттықтырушы (${currentStep + 1}/${mData.tasks.length})`;
            if (currentStep < mData.tasks.length) {
                const task = mData.tasks[currentStep];
                if (task.type === 'pwd-builder') renderPasswordBuilder();
                else if (task.type === 'drag-drop') renderDragDropTask(task);
                else if (task.type === 'choice') renderChoiceTask(task.question, task.opts, task.a, task.exp);
            } else {
                currentStage = 3; currentStep = 0;
                renderState();
            }
        } else if (currentStage === 3) {
            stageIndicator.textContent = `3-кезең: Квиз (${currentStep + 1}/${mData.quiz.length})`;
            if (currentStep < mData.quiz.length) {
                const q = mData.quiz[currentStep];
                renderChoiceTask(q.q, q.opts, q.a, "", true);
            } else {
                renderResult();
            }
        }
    }

    function renderTheory(data) {
        const div = document.createElement('div');
        div.className = 'task-container';
        div.innerHTML = `
            <h2>${data.title}</h2>
            ${data.visual ? data.visual : ''}
            <p>${data.text}</p>
            <button class="btn btn-primary btn-large" id="next-btn" style="margin-top:20px;">Келесі</button>
        `;
        contentArea.appendChild(div);
        if (data.onRender) data.onRender();
        document.getElementById('next-btn').addEventListener('click', () => { currentStep++; renderState(); });
    }

    function renderPasswordBuilder() {
        const div = document.createElement('div');
        div.className = 'task-container';
        div.innerHTML = `
            <h3>D түрі: Сенімді құпия сөз конструкторы</h3>
            <div class="visual-box" id="pwd-visual-box" style="margin: 20px 0; padding: 20px; transition: 0.3s ease;">
                <div class="hacker-scene" style="display: flex; justify-content: center; align-items: center; min-height: 120px;">
                    <div class="lock-icon" id="live-lock-icon" style="margin: 0;">🔓</div>
                    <div class="shield-glow" id="live-shield-glow" style="display:none; top: 50%;"></div>
                </div>
            </div>
            <p>Құпия сөз жаса: кемінде 9 таңба, 1 сан, 1 бас әріп.</p>
            <input type="text" id="pwd-input" class="task-input" placeholder="Құпия сөзді енгіз...">
            <p>Сенімділігі: <strong id="pwd-strength">Әлсіз</strong></p>
            <button class="btn btn-primary btn-large" id="pwd-btn" style="margin-top: 10px;">Дайын</button>
        `;
        contentArea.appendChild(div);

        const input = document.getElementById('pwd-input');
        const strLabel = document.getElementById('pwd-strength');
        const icon = document.getElementById('live-lock-icon');
        const glow = document.getElementById('live-shield-glow');
        const vBox = document.getElementById('pwd-visual-box');
        
        let isStrong = false;
        
        if (window.anime) {
            anime({
                targets: '#live-lock-icon',
                rotate: [0, -10, 10, -10, 10, 0],
                duration: 1000,
                easing: 'easeInOutSine',
                loop: true
            });
        }

        input.addEventListener('input', (e) => {
            const val = e.target.value;
            if (window.anime) anime.remove('#live-lock-icon');
            
            if (val.length >= 9 && /\d/.test(val) && /[A-Z]/.test(val)) {
                strLabel.textContent = 'Керемет';
                strLabel.style.color = 'var(--accent-cyan)';
                isStrong = true;
                icon.textContent = '🛡️';
                glow.style.display = 'block';
                vBox.style.borderColor = 'var(--accent-cyan)';
                vBox.style.boxShadow = 'inset 0 0 30px rgba(0, 255, 237, 0.2)';
                
                if (window.anime) {
                    anime({ targets: '#live-lock-icon', scale: [0.8, 1.2, 1], rotate: 0, duration: 800, easing: 'easeOutElastic(1, .5)' });
                    anime({ targets: glow, scale: [1, 1.5, 1], opacity: [0.3, 0.8, 0.3], duration: 2000, easing: 'easeInOutQuad', loop: true });
                }
            } else if (val.length > 5) {
                strLabel.textContent = 'Орташа';
                strLabel.style.color = 'orange';
                isStrong = false;
                icon.textContent = '🔒';
                glow.style.display = 'none';
                vBox.style.borderColor = 'orange';
                vBox.style.boxShadow = 'inset 0 0 20px rgba(255, 165, 0, 0.2)';
                
                if (window.anime) anime({ targets: '#live-lock-icon', scale: [1, 1.1, 1], rotate: 0, duration: 300, easing: 'easeInOutQuad' });
            } else {
                strLabel.textContent = 'Әлсіз';
                strLabel.style.color = 'var(--accent-red, red)';
                isStrong = false;
                icon.textContent = '🔓';
                glow.style.display = 'none';
                vBox.style.borderColor = 'rgba(255, 0, 0, 0.3)';
                vBox.style.boxShadow = 'inset 0 0 20px rgba(255, 0, 0, 0.1)';
                
                if (window.anime) anime({ targets: '#live-lock-icon', rotate: [0, -10, 10, -10, 10, 0], duration: 1000, easing: 'easeInOutSine', loop: true });
            }
        });

        document.getElementById('pwd-btn').addEventListener('click', () => {
            if (isStrong) { currentStep++; renderState(); }
            else alert('Маскоттың жұмсақ кеңесі: Құпия сөз жеткілікті сенімді емес. Сандар мен бас әріптер қос!');
        });
    }

    function renderDragDropTask(taskData) {
        const div = document.createElement('div');
        div.className = 'task-container';
        
        let itemsHtml = taskData.items.map(item => `<div class="pwd-item" draggable="true" data-type="${item.type}">${item.text}</div>`).join('');
        
        div.innerHTML = `
            <h3>${taskData.title}</h3>
            <p>${taskData.desc}</p>
            <div class="sort-task-container" style="margin-top: 20px;">
                <div class="passwords-pool" id="passwords-pool">${itemsHtml}</div>
                <div class="drop-zones">
                    <div class="drop-zone ${taskData.zone1.class}" id="zone1" data-zone="${taskData.zone1.id}">
                        <h4>${taskData.zone1.label}</h4>
                    </div>
                    <div class="drop-zone ${taskData.zone2.class}" id="zone2" data-zone="${taskData.zone2.id}">
                        <h4>${taskData.zone2.label}</h4>
                    </div>
                </div>
            </div>
            <button class="btn btn-primary btn-large" id="sort-btn" style="margin-top: 30px;" disabled>Тексеру</button>
        `;
        contentArea.appendChild(div);

        const draggables = document.querySelectorAll('.pwd-item');
        const containers = [
            document.getElementById('passwords-pool'),
            document.getElementById('zone1'),
            document.getElementById('zone2')
        ];
        const checkBtn = document.getElementById('sort-btn');

        let draggedItem = null;

        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', () => {
                draggedItem = draggable;
                setTimeout(() => draggable.classList.add('dragging'), 0);
            });

            draggable.addEventListener('dragend', () => {
                draggable.classList.remove('dragging');
                draggedItem = null;
                checkCompletion();
            });
        });

        containers.forEach(container => {
            container.addEventListener('dragover', e => {
                e.preventDefault();
                if (container.classList.contains('drop-zone')) {
                    container.classList.add('drag-over');
                }
            });

            container.addEventListener('dragleave', () => {
                container.classList.remove('drag-over');
            });

            container.addEventListener('drop', e => {
                e.preventDefault();
                container.classList.remove('drag-over');
                if (draggedItem) {
                    container.appendChild(draggedItem);
                }
            });
        });

        function checkCompletion() {
            const pool = document.getElementById('passwords-pool');
            if (pool.children.length === 0) {
                checkBtn.disabled = false;
            } else {
                checkBtn.disabled = true;
            }
        }

        checkBtn.addEventListener('click', () => {
            const z1 = document.getElementById('zone1');
            const z2 = document.getElementById('zone2');
            let isCorrect = true;

            const checkZone = (zone, expectedType) => {
                Array.from(zone.children).forEach(child => {
                    if (child.tagName === 'DIV') {
                        if (child.getAttribute('data-type') !== expectedType) {
                            isCorrect = false;
                            child.style.borderColor = '#ff4d4d';
                            child.classList.add('wrong-item');
                        } else {
                            child.style.borderColor = 'var(--accent-cyan)';
                            child.classList.remove('wrong-item');
                        }
                    }
                });
            };

            checkZone(z1, taskData.zone1.id);
            checkZone(z2, taskData.zone2.id);

            if (isCorrect) {
                currentStep++;
                renderState();
            } else {
                if (window.anime) {
                    anime({
                        targets: '.wrong-item',
                        translateX: [-5, 5, -5, 5, 0],
                        duration: 400,
                        easing: 'easeInOutSine'
                    });
                }
            }
        });
    }

    function renderChoiceTask(question, options, correctIdx, explanation, isQuiz = false) {
        const div = document.createElement('div');
        div.className = 'task-container';
        
        let optsHtml = options.map((opt, i) => `<button class="btn btn-secondary opt-btn" data-idx="${i}" style="text-align: left; justify-content: flex-start;">${opt}</button>`).join('');
        
        div.innerHTML = `
            <h3>${question}</h3>
            <div class="task-options">${optsHtml}</div>
            <button class="btn btn-primary btn-large" id="check-btn" style="margin-top: 30px;" disabled>Тексеру</button>
        `;
        contentArea.appendChild(div);

        let selected = null;
        let isChecked = false;
        const optBtns = div.querySelectorAll('.opt-btn');
        const checkBtn = document.getElementById('check-btn');

        optBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (isChecked) return;
                optBtns.forEach(b => { b.classList.remove('btn-primary'); b.classList.add('btn-secondary'); });
                btn.classList.remove('btn-secondary');
                btn.classList.add('btn-primary');
                selected = parseInt(btn.getAttribute('data-idx'));
                checkBtn.disabled = false;
            });
        });

        checkBtn.addEventListener('click', () => {
            if (isChecked) {
                if (!isQuiz && selected !== correctIdx) {
                    isChecked = false;
                    checkBtn.textContent = 'Тексеру';
                    checkBtn.disabled = true;
                    optBtns.forEach(b => { 
                        b.style.pointerEvents = 'auto'; 
                        b.style.backgroundColor = ''; 
                        b.style.borderColor = ''; 
                        b.style.color = '';
                        b.classList.remove('btn-primary');
                        b.classList.add('btn-secondary');
                    });
                    selected = null;
                    const expMsg = div.querySelector('.exp-msg');
                    if(expMsg) expMsg.remove();
                    return;
                }
                currentStep++;
                renderState();
                return;
            }
            
            isChecked = true;
            checkBtn.textContent = 'Келесі';

            optBtns.forEach(b => { b.style.pointerEvents = 'none'; });

            if (selected === correctIdx) {
                if (isQuiz) quizScore++;
                optBtns[selected].style.backgroundColor = '#5BD15B';
                optBtns[selected].style.borderColor = '#5BD15B';
                optBtns[selected].style.color = '#000';
            } else {
                optBtns[selected].style.backgroundColor = '#ff4d4d';
                optBtns[selected].style.borderColor = '#ff4d4d';
                optBtns[selected].style.color = '#fff';
                
                optBtns[correctIdx].style.backgroundColor = '#5BD15B';
                optBtns[correctIdx].style.borderColor = '#5BD15B';
                optBtns[correctIdx].style.color = '#000';
            }

            if (!isQuiz && selected !== correctIdx) {
                const expP = document.createElement('p');
                expP.className = 'exp-msg';
                expP.style.color = '#ff4d4d';
                expP.style.fontWeight = 'bold';
                expP.style.marginTop = '15px';
                expP.textContent = explanation;
                div.insertBefore(expP, checkBtn);
                checkBtn.textContent = 'Қайта көру';
            }
        });
    }

    function renderResult() {
        const mData = modulesData[currentModuleId];
        const finalScore = Math.round((quizScore / mData.quiz.length) * 100);
        const div = document.createElement('div');
        div.className = 'task-container';
        div.style.textAlign = 'center';
        
        const isPassed = finalScore >= 70;
        const color = isPassed ? 'var(--accent-cyan)' : 'var(--accent-red, red)';
        
        div.innerHTML = `
            <h2>Модуль аяқталды!</h2>
            <h1 style="font-size: 64px; margin: 20px 0; color: ${color};">${finalScore}%</h1>
            <p>${isPassed ? 'Керемет! Модульден өттің.' : 'Ұпай аз. Тағы бір рет байқап көр.'}</p>
            <button class="btn btn-primary btn-large" id="finish-btn" style="margin-top: 20px;">Басты бетке оралу</button>
        `;
        contentArea.appendChild(div);

        document.getElementById('finish-btn').addEventListener('click', () => {
            if (isPassed) {
                document.getElementById(`module-${currentModuleId}-stars`).innerHTML = '<span class="star filled">★</span><span class="star filled">★</span><span class="star empty">☆</span>';
                
                let currentProgress = parseInt(document.getElementById('main-progress-text').textContent) || 0;
                if (document.getElementById(`module-${currentModuleId}-stars`).getAttribute('data-passed') !== 'true') {
                    currentProgress += 14; // (100 / 7)
                    if(currentProgress > 100) currentProgress = 100;
                    document.getElementById('main-progress-bar').style.width = `${currentProgress}%`;
                    document.getElementById('main-progress-text').textContent = `${currentProgress}%`;
                    document.getElementById(`module-${currentModuleId}-stars`).setAttribute('data-passed', 'true');
                }
            }
            moduleView.classList.add('hidden');
            mainContent.classList.remove('hidden');
        });
    }
});
