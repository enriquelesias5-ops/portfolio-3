document.addEventListener('DOMContentLoaded', () => {

   // --- 1. CUSTOM CURSOR (UPDATED) ---
    const cursor = document.getElementById('custom-cursor');
    if (cursor) {
        document.documentElement.classList.add('js-cursor-enabled');
        
        // Track movement
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        // Dynamic hover detection (works for modal buttons too)
        document.addEventListener('mouseover', (e) => {
            const target = e.target;
            const isClickable = target.closest('a, button, input, textarea, .proof-link, .gallery-nav-btn, .cyber-modal-close');
            
            if (isClickable) {
                cursor.classList.add('cursor-hover');
            } else {
                cursor.classList.remove('cursor-hover');
            }
        });
    }

    // --- 2. LOADER LOGIC ---
    let count = 0;
    const loader = document.getElementById('loader');
    const numDisp = document.getElementById('loader-number');
    const statusDisp = document.getElementById('loader-status');

    const interval = setInterval(() => {
        count += Math.floor(Math.random() * 4) + 1;
        if (count > 40 && count <= 70) statusDisp.innerText = "DECRYPTING_ASSETS...";
        if (count > 70 && count < 100) statusDisp.innerText = "MOUNTING_DRIVES...";
        if (count >= 100) {
            count = 100;
            clearInterval(interval);
            statusDisp.innerText = "BOOT_SUCCESSFUL";
            
            // Fast rotation sweep and expansion on success!
            if (loader) {
                loader.style.setProperty('--orbit-radius', '280px');
                const orbitContainer = loader.querySelector('.orbiting-satellites');
                if (orbitContainer) {
                    orbitContainer.style.animationDuration = '1s';
                }
            }
            
            setTimeout(() => {
                if (loader) {
                    loader.style.opacity = '0';
                    loader.style.transform = 'scale(1.1)';
                    setTimeout(() => { loader.style.display = 'none'; }, 800);
                }
            }, 500);
        }
        
        numDisp.innerText = count.toString().padStart(3, '0') + "%";
        
        // Dynamically scale out the satellite radius as percentage increments!
        if (loader) {
            const currentRadius = Math.min(195, count * 1.95);
            loader.style.setProperty('--orbit-radius', currentRadius + 'px');
        }
    }, 45);

    // --- MAGIC RINGS ANIMATION (Boot Loader) ---
    const ringsCanvas = document.getElementById('magic-rings-canvas');
    if (ringsCanvas && loader) {
        const rCtx = ringsCanvas.getContext('2d');
        let rW, rH;

        function resizeRings() {
            rW = ringsCanvas.width = loader.clientWidth;
            rH = ringsCanvas.height = loader.clientHeight;
        }
        resizeRings();
        window.addEventListener('resize', resizeRings);

        const ringCount = 6;
        const baseRadius = 80;
        const radiusStep = 45;
        const maxLife = 3.5; // seconds per ring cycle
        const speed = 0.8;

        // Each ring has a phase offset so they stagger
        const rings = [];
        for (let i = 0; i < ringCount; i++) {
            rings.push({
                phase: (i / ringCount) * maxLife,
                radius: baseRadius + i * radiusStep
            });
        }

        let startTime = performance.now();
        let ringsAnimId;

        function drawRings(timestamp) {
            ringsAnimId = requestAnimationFrame(drawRings);
            const elapsed = (timestamp - startTime) * 0.001 * speed;

            rCtx.clearRect(0, 0, rW, rH);
            const cx = rW / 2;
            const cy = rH / 2;

            for (let i = 0; i < ringCount; i++) {
                const ring = rings[i];
                const t = (elapsed + ring.phase) % maxLife;
                const progress = t / maxLife;

                // Radius expands over time
                const r = ring.radius + progress * 60;

                // Fade in then fade out
                let alpha;
                if (progress < 0.2) {
                    alpha = progress / 0.2;
                } else if (progress > 0.7) {
                    alpha = 1 - (progress - 0.7) / 0.3;
                } else {
                    alpha = 1;
                }
                alpha *= 0.35; // Keep it subtle so it doesn't overpower the HUD

                // Gradient from cyan to green
                const ratio = i / (ringCount - 1);
                const red = Math.round(0 + ratio * 80);
                const green = Math.round(212 + ratio * 38);
                const blue = Math.round(255 - ratio * 132);

                // Ring line thickness varies
                const thickness = Math.max(1, 2.5 - progress * 1.5);

                // Draw the ring arc (not full circle for style — slight gap)
                const gapAngle = 0.15 + i * 0.05;
                const rotationOffset = elapsed * 0.3 + i * 0.8;

                rCtx.beginPath();
                rCtx.arc(cx, cy, r, rotationOffset + gapAngle, rotationOffset + Math.PI * 2 - gapAngle);
                rCtx.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
                rCtx.lineWidth = thickness;
                rCtx.shadowColor = `rgba(${red}, ${green}, ${blue}, ${alpha * 0.8})`;
                rCtx.shadowBlur = 15;
                rCtx.stroke();

                // Small tick marks at quadrant points
                for (let q = 0; q < 4; q++) {
                    const tickAngle = rotationOffset + q * (Math.PI / 2);
                    const innerR = r - 6;
                    const outerR = r + 6;
                    rCtx.beginPath();
                    rCtx.moveTo(cx + Math.cos(tickAngle) * innerR, cy + Math.sin(tickAngle) * innerR);
                    rCtx.lineTo(cx + Math.cos(tickAngle) * outerR, cy + Math.sin(tickAngle) * outerR);
                    rCtx.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${alpha * 0.6})`;
                    rCtx.lineWidth = 1;
                    rCtx.shadowBlur = 0;
                    rCtx.stroke();
                }
            }

            // Central glow pulse
            const pulseAlpha = 0.08 + Math.sin(elapsed * 2) * 0.04;
            const gradient = rCtx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius);
            gradient.addColorStop(0, `rgba(0, 212, 255, ${pulseAlpha})`);
            gradient.addColorStop(0.5, `rgba(0, 123, 255, ${pulseAlpha * 0.5})`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            rCtx.fillStyle = gradient;
            rCtx.fillRect(0, 0, rW, rH);
        }

        ringsAnimId = requestAnimationFrame(drawRings);

        // Stop animation when loader hides
        const loaderObserver = new MutationObserver(() => {
            if (loader.style.display === 'none') {
                cancelAnimationFrame(ringsAnimId);
                loaderObserver.disconnect();
            }
        });
        loaderObserver.observe(loader, { attributes: true, attributeFilter: ['style'] });
    }

    // --- 3. TERMINAL INTERACTION ---
    const msgInput = document.getElementById('messageInput');
    const termStatus = document.getElementById('terminalStatus');
    const contactForm = document.getElementById('contactForm');

    if (msgInput && termStatus) {
        msgInput.addEventListener('input', () => {
            termStatus.innerText = msgInput.value.length > 0 ? "DATA_BUFFERING..." : "AWAITING_INPUT";
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const senderNameInput = contactForm.querySelector('input[type="text"]');
            const senderName = senderNameInput ? senderNameInput.value : "Guest";

            // Fade out inputs smoothly
            const inputs = contactForm.querySelectorAll('.input-group, .command-line, .terminal-footer');
            inputs.forEach(el => {
                el.style.opacity = '0';
                el.style.transition = 'opacity 0.4s';
            });

            setTimeout(() => {
                inputs.forEach(el => el.style.display = 'none');

                // Add console window inside form
                const consoleDiv = document.createElement('div');
                consoleDiv.className = 'form-console';
                consoleDiv.style.fontFamily = "'JetBrains Mono', monospace";
                consoleDiv.style.fontSize = '0.9rem';
                consoleDiv.style.lineHeight = '1.6';
                consoleDiv.style.color = 'var(--accent-green)';
                consoleDiv.style.padding = '1rem 0';
                consoleDiv.style.textAlign = 'left';
                contactForm.appendChild(consoleDiv);

                const logs = [
                    `$ secure_transmission --sender="${senderName}" --target="satveenraj"`,
                    `> [SYSTEM]: INITIATING CIPHER HANDSHAKE MODULE...`,
                    `> [SYSTEM]: EXCHANGING DIFFIE-HELLMAN KEY PAIRS... [SUCCESS]`,
                    `> [SYSTEM]: CONFIGURING ZERO-TRUST SECURE SESSION LAYER...`,
                    `> [SYSTEM]: ROUTING VIA ENCRYPTED VPN TUNNEL [MELAKA <-> HAMBURG]`,
                    `> [SYSTEM]: DISPATCHING DATA PAC-CHUNKS... [100%]`,
                    `> [SYSTEM]: TRANSMISSION VERIFIED BY SHA-256 INTEGRITY CHECK.`,
                    `> [SYSTEM]: SECURE HANDSHAKE COMPLETED. SESSION TERMINATED.`,
                    `> MESSAGE SENT SUCCESSFULLY. THANK YOU, SPECIALIST ${senderName.toUpperCase()}!`
                ];

                let lineIdx = 0;
                function printNextLogLine() {
                    if (lineIdx < logs.length) {
                        const line = document.createElement('div');
                        line.style.marginBottom = '8px';
                        line.style.opacity = '0';
                        line.style.transition = 'opacity 0.2s';

                        if (logs[lineIdx].startsWith('$')) {
                            line.style.color = '#fff';
                        } else if (logs[lineIdx].includes('SUCCESS') || logs[lineIdx].includes('THANK YOU')) {
                            line.style.color = 'var(--accent-green)';
                        } else if (logs[lineIdx].includes('INITIATING') || logs[lineIdx].includes('DISPATCHING')) {
                            line.style.color = 'var(--primary-blue)';
                        } else {
                            line.style.color = 'var(--text-gray)';
                        }

                        consoleDiv.appendChild(line);

                        let charIdx = 0;
                        const text = logs[lineIdx];
                        line.style.opacity = '1';

                        function typeChar() {
                            if (charIdx < text.length) {
                                line.innerHTML += text[charIdx];
                                charIdx++;
                                setTimeout(typeChar, 15);
                            } else {
                                lineIdx++;
                                contactForm.scrollTop = contactForm.scrollHeight;
                                setTimeout(printNextLogLine, 350);
                            }
                        }
                        typeChar();
                    } else {
                        addLiveLog(`CONNECT: Secure payload received from ${senderName.toUpperCase()}`);
                    }
                }
                printNextLogLine();
            }, 450);
        });
    }

    // --- 4. RANDOM GLITCH ENGINE ---
    const screenContainer = document.querySelector('.screen-container');
    function triggerRandomGlitch() {
        if (!screenContainer) return;
        screenContainer.classList.add('violent-glitch');
        const duration = Math.floor(Math.random() * 350) + 350;
        setTimeout(() => {
            screenContainer.classList.remove('violent-glitch');
            setTimeout(triggerRandomGlitch, Math.floor(Math.random() * 6000) + 4000);
        }, duration);
    }
    setTimeout(triggerRandomGlitch, 3000);

    // --- 5. DEAD PIXEL GENERATOR ---
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'dead-pixel';
        p.style.left = Math.random() * 100 + 'vw';
        p.style.top = Math.random() * 100 + 'vh';
        p.style.animationDelay = Math.random() * 4 + 's';
        document.body.appendChild(p);
    }

    // --- 6. WORLD CLOCKS ---
    function updateClocks() {
        const now = new Date();
        const options = { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
        const kulTime = document.getElementById('kulTime');
        const hamTime = document.getElementById('hamTime');
        if (kulTime) kulTime.innerText = now.toLocaleTimeString('en-GB', { ...options, timeZone: 'Asia/Kuala_Lumpur' }) + " MYT";
        if (hamTime) hamTime.innerText = now.toLocaleTimeString('en-GB', { ...options, timeZone: 'Europe/Berlin' }) + " CEST";
    }
    setInterval(updateClocks, 1000);
    updateClocks();


    // --- 8. TACTICAL CIPHER (GLITCH TEXT) ---
    const glyphs = "ABCDEFHIJKLMNOPQRSTUVWXYZ0123456789#%&@$*+^=}{*ß-_";
    function decodeEffect(el) {
        let iteration = 0;
        const originalText = el.dataset.value || el.innerText;
        if (!el.dataset.value) el.dataset.value = originalText;

        clearInterval(el.interval);
        el.interval = setInterval(() => {
            el.innerText = originalText.split("").map((letter, index) => {
                if (index < iteration) return originalText[index];
                return glyphs[Math.floor(Math.random() * glyphs.length)];
            }).join("");

            if (iteration >= originalText.length) clearInterval(el.interval);
            iteration += 1 / 3;
        }, 30);
    }

    document.querySelectorAll('.glitch-text').forEach(item => {
        item.addEventListener('mouseenter', () => decodeEffect(item));
    });

    // --- 9. UNIFIED MOTION ENGINE (TILT) ---
    const tiltCards = document.querySelectorAll('.glass-card');
    document.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;

        tiltCards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = clientX - rect.left;
            const y = clientY - rect.top;
            const xc = rect.width / 2;
            const yc = rect.height / 2;
            const dx = x - xc;
            const dy = y - yc;
            // Subtle tilt effect
            card.style.transform = `perspective(10000px) rotateX(${-dy / 55}deg) rotateY(${dx / 55}deg) translateZ(5px)`;
        });
    });

    document.addEventListener('mouseleave', () => {
        tiltCards.forEach(card => card.style.transform = `perspective(10000px) rotateX(0deg) rotateY(0deg)`);
    });

    // trigger denial //
    function triggerDenial() {
        document.body.classList.add('access-denied');
        setTimeout(() => document.body.classList.remove('access-denied'), 400);
    }
    // --- 10. REVEAL OBSERVER ---
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.glass-card, .content-grid').forEach(el => revealObserver.observe(el));
    // Ping  //
    setInterval(() => {
        const ping = document.getElementById('ping-value');
        if (ping) {
            const variance = Math.floor(Math.random() * 25) - 10;
            ping.innerText = Math.max(12, 24 + variance);
        }
    }, 1000);
    document.querySelectorAll('a[href="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            triggerDenial();
        });
    });// --- TERMINAL LOGIC ---
    const termInput = document.getElementById('terminal-input');
    const termOutput = document.getElementById('terminal-output');
    const terminalBox = document.querySelector('.terminal-box');

    if (termInput) {
        termInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = termInput.value.trim();
                if (cmd) {
                    processCommand(cmd);
                }
                termInput.value = '';
            }
        });
    }

    if (terminalBox && termInput) {
        terminalBox.addEventListener('click', () => {
            termInput.focus();
        });
    }

    // Add event delegation on terminal output for clickable command shortcuts!
    if (termOutput) {
        termOutput.addEventListener('click', (e) => {
            if (e.target.classList.contains('cmd-shortcut')) {
                const cmdText = e.target.innerText.trim();
                if (termInput) {
                    processCommand(cmdText);
                    termInput.value = '';
                    termInput.focus();
                }
            }
        });
    }

    function processCommand(cmd) {
        let response = "";
        const cleanCmd = cmd.toLowerCase().trim();

        if (cleanCmd === 'help') {
            response = `AVAILABLE COMMANDS: 
            [<span class="cmd-shortcut" style="color: var(--accent-green); cursor: pointer; text-decoration: underline;">whoami</span>] 
            [<span class="cmd-shortcut" style="color: var(--accent-green); cursor: pointer; text-decoration: underline;">ls</span>] 
            [<span class="cmd-shortcut" style="color: var(--accent-green); cursor: pointer; text-decoration: underline;">sudo access</span>] 
            [<span class="cmd-shortcut" style="color: var(--accent-green); cursor: pointer; text-decoration: underline;">feed galaxy</span>] 
            [<span class="cmd-shortcut" style="color: var(--accent-green); cursor: pointer; text-decoration: underline;">feed network</span>] 
            [<span class="cmd-shortcut" style="color: var(--accent-green); cursor: pointer; text-decoration: underline;">clear</span>]`;
        } else if (cleanCmd === 'whoami') {
            response = "USER: SATVEENRAJ_SINGH // ROLE: SECURITY_ANALYST";
        } else if (cleanCmd === 'ls') {
            response = "PROJECTS: [AIRCRAFT_TELEMETRY] [NETWORK_SOC] [PENTEST_v1]";
        } else if (cleanCmd === 'sudo access') {
            response = "<span style='color: #ff5555;'>[CRITICAL] PERMISSION DENIED. IP LOGGED.</span>";
            if (terminalBox) {
                terminalBox.classList.add('access-denied');
                setTimeout(() => terminalBox.classList.remove('access-denied'), 1000);
            }
        } else if (cleanCmd === 'feed galaxy') {
            const feedToggleBtn = document.getElementById('feed-toggle');
            const activeFeed = localStorage.getItem('bg_feed') || 'galaxy';
            if (activeFeed !== 'galaxy' && feedToggleBtn) {
                feedToggleBtn.click();
            }
            response = "SYSTEM: Telemetry backdrop feed forced to COSMIC_GALAXY.";
        } else if (cleanCmd === 'feed network') {
            const feedToggleBtn = document.getElementById('feed-toggle');
            const activeFeed = localStorage.getItem('bg_feed') || 'galaxy';
            if (activeFeed !== 'network' && feedToggleBtn) {
                feedToggleBtn.click();
            }
            response = "SYSTEM: Telemetry backdrop feed forced to NETWORK_PARTICLES.";
        } else if (cleanCmd === 'clear') {
            termOutput.innerHTML = "";
            return;
        } else {
            response = `COMMAND NOT FOUND: ${cmd}. Type [<span class="cmd-shortcut" style="color: var(--accent-green); cursor: pointer; text-decoration: underline;">help</span>] for commands.`;
        }

        termOutput.innerHTML += `<div><span style='color:#bd93f9'>> ${cmd}</span></div><div style="margin-bottom: 8px;">${response}</div>`;
        termOutput.scrollTop = termOutput.scrollHeight;
    }

    // --- DYNAMIC LOGGING ---
    function addLiveLog(message) {
        const logContainer = document.getElementById('log-container');
        const time = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.innerHTML = `<span style="color:rgba(255,255,255,0.3)">[${time}]</span> ${message}`;
        logContainer.prepend(entry);
        if (logContainer.childNodes.length > 10) logContainer.lastChild.remove();
    }

    // Random Security Logs
    setInterval(() => {
        const logs = [
            "[WARN] Unauthorized attempt from 192.168.1.105",
            "[INFO] Port 443 scanning detected",
            "[OK] SSL Handshake complete",
            "[SYSTEM] Aircraft Telemetry Syncing..."
        ];
        addLiveLog(logs[Math.floor(Math.random() * logs.length)]);
    }, 5000);

    // Log User Scrolling
    window.addEventListener('scroll', () => {
        if (window.scrollY % 500 === 0) addLiveLog("User navigating system memory...");
    });

    // --- 11. LIGHT/DARK THEME OVERRIDE ---
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.documentElement.classList.add('light-mode');
            themeToggle.innerHTML = '<span style="font-size: 1.25rem;">🔳</span>'; // Monochrome Dark mode
        } else {
            themeToggle.innerHTML = '<span style="font-size: 1.25rem;">🕶️</span>'; // Dark Stealth mode
        }

        themeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('light-mode');
            const isLight = document.documentElement.classList.contains('light-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            themeToggle.innerHTML = isLight ? '<span style="font-size: 1.25rem;">🔳</span>' : '<span style="font-size: 1.25rem;">🕶️</span>';

            // Log the theme change in the live cockpit logs!
            addLiveLog(`SYSTEM: Theme override to ${isLight ? "MONOCHROME_DARK" : "NIGHT_TACTICAL_STEALTH"}`);
        });
    }

    // --- 12. TACTICAL LANGUAGE OVERRIDE SYSTEM ---
    const translations = {
        en: {
            nav_home: "Home",
            nav_about: "About",
            nav_skills: "Skills",
            nav_experience: "Experience",
            nav_education: "Education",
            nav_achievements: "Projects",
            nav_contact: "Establish_Connection",
            hero_typewriter: "STRATEGY • SECURITY • EXECUTION",
            hero_subbox: "> SECURE_ARCHITECTURE_SPECIALIST // EST. 1998",
            about_title: "PERSONNEL_PROFILE",
            about_log_label: "> LOG_LEVEL:",
            about_log_value: "SCANNING_DIRECTORY... [1] MATCH_FOUND",
            about_bio_id: "> BIOMETRIC_ID: SATVEENRAJ_SINGH_A/L_RAJWANT_SINGH",
            about_bio_text: "Operational specialist focused on the intersection of Cyber Security and Visual Design. With a deployment history in Hamburg spanning mechanical engineering, electrical systems, and high-level policy auditing, currently optimizing core logic through Computer Security studies in Melaka.",
            about_metadata_title: "> IDENTITY_METADATA",
            meta_init_label: "[INITIALIZATION_DATE]:",
            meta_deploy_label: "[ACTIVE_DEPLOYMENT]:",
            meta_nation_label: "[REGIONAL_AFFILIATION]:",
            meta_nation_val: "MALAYSIAN",
            verify_clearance: "[VERIFY_CLEARANCE]",
            summary_title: "OPERATIONAL_SUMMARY",
            summary_overview_label: "> COMPREHENSIVE_OVERVIEW:",
            summary_overview: "CONSOLIDATED DOSSIER RECORDS AND MISSION-CRITICAL FOCUS POINTS.",
            summary_card_status: "SECURE",
            summary_card_title: "SECURE SYSTEM SPECIALIST",
            summary_card_desc: "Designing high-security computing boundaries and resilient cyber architectures through academic study and workshop deployment.",
            summary_card_btn: "[INITIATE_HANDSHAKE]",
            summary_focus_label: "MISSION_CRITICAL_FOCUS",
            summary_focus_h3: "Core Architecture & Passion",
            summary_focus_p1_lbl: "> CURRENT_PASSION:",
            summary_focus_p1: "Constructing isolated network testbeds, simulated virtualization sandboxes, and bridging deep technical protocols with smooth visual design layouts.",
            summary_focus_p2_lbl: "> OPERATIONAL_MINDSET:",
            summary_focus_p2: "Security is not merely a set of rules—it is a continuous architecture. My objective is to minimize vulnerabilities, automate verification systems, and deploy clean zero-tolerance threat-prevention platforms.",
            summary_focus_p3_lbl: "> HAMBURG & MELAKA SYNERGY:",
            summary_focus_p3: "Leveraging hands-on mechanical workshop precision and industrial electrical diagnostics gained in Germany with high-level academic computer security theory in Malaysia.",

            // New section translations
            skills_title: "CORE_CAPABILITIES",
            skills_lbl: "> RADAR_SCAN:",
            skills_desc: "TOOLKITS INITIALIZED. MODULE LOADED. DETECTING COMPETENCIES... SYSTEM_CHECK: OPTIMAL.",
            skills_hud_01: "[01] OPERATIONAL_AWARENESS",
            skills_hud_02: "[02] CREATIVE_ENGINE_CONFIDENCE",
            skills_hud_03: "[03] COMMUNICATION_FREQUENCIES",
            lang_en_desc: "Zero-Latency Execution.",
            lang_de_desc: "Core Integration Module.",
            lang_ms_desc: "High Bandwidth Performance.",
            lang_zh_desc: "Basic Handshake Capability.",
            lang_pa_desc: "Limited Interception Available.",
            validate_credentials_btn: "[VALIDATE_CREDENTIALS]",

            exp_title: "DEPLOYMENT_HISTORY",
            exp_lbl: "> STATUS:",
            exp_desc: "EXECUTING REAL-WORLD SYSTEMS UNDER OPERATIONAL CONSTRAINTS...",
            exp_allianz_status: "NODE_STATUS: LEGACY_ARCHIVE",
            exp_allianz_title: "Policy Auditor",
            exp_allianz_desc: "Assisted in managing and supporting insurance policy processes, handling administrative tasks, and contributing to operations within the company’s policy management division.",
            exp_hoehle_status: "DECLASSIFIED",
            exp_hoehle_title: "Junior Mechanic",
            exp_hoehle_desc: "Performed precision workshop operations including measuring, sawing, drilling, and on-site repair of steel structures, supporting welding and machining workflows.",
            exp_beeck_status: "STRICTLY_CONFIDENTIAL",
            exp_beeck_title: "Junior Electrician",
            exp_beeck_desc: "Worked as an electrician performing installations in old and new buildings, maintaining lighting and intercom systems, setting up data networks, and conducting technical safety measurements according to VDE and DGUV regulations.",
            exp_beeck_btn: "[ACCESS_VALIDATION]",

            edu_title: "KNOWLEDGE_BASE",
            edu_lbl: "> SYSTEM_SPECS:",
            edu_desc: "ACQUIRING MULTIDISCIPLINARY FOUNDATIONS IN SECURE COMPUTING FOLLOWING ANALYTICAL LOGIC.",
            edu_utem_status: "CURRENT_OBJECTIVE: INTEL_GATHERING_IN_PROGRESS",
            edu_utem_title: "B.Sc. Computer Security",
            edu_utem_desc: "Specializing in computer security and network analysis with special interests in website and software design.",
            edu_utem_prog: "[PROG: DEGREE_ACQUISITION]",
            edu_fcuc_status: "TOP_SECRET",
            edu_fcuc_title: "Foundational Studies",
            edu_fcuc_desc: "Graduated with an Australian Tertiary Admission Rank (ATAR) of 93.9, reflecting understanding of Science and Mathematical fundamentals. Achieved Western Australian Certificate of Education (WACE).",
            edu_fcuc_prog: "[INTEL: ACADEMIC_RANK]",
            edu_smk_status: "STRICTLY_CONFIDENTIAL",
            edu_smk_title: "Secondary Education",
            edu_smk_desc: "Comprehensive asset evaluation for the period 2011-2015.",
            edu_smk_prog_logic: "[INTEL: LOGIC_PROCESSING]",
            edu_smk_prog_comm: "[INTEL: COMMUNICATION_PROTOCOLS]",
            edu_smk_prog_field: "[INTEL: FIELD_OPERATIONS]",
            edu_smk_btn: "[DECRYPT_FULL_VALIDATION_ASSETS]",

            proj_title: "WORK_PRODUCED",
            proj_lbl: "> LOG_ANALYSIS:",
            proj_desc: "AUDITING LAB TESTBEDS, SIMULATION ENVIRONMENTS, AND REFACTORING PROJECTS COMPLETED AT THE UNIVERSITY.",
            proj_range_title: "Cybersecurity Range Lab",
            proj_range_desc: "Designed and engineered a multi-node virtualization testbed utilizing isolated subnets to safely simulate and audit network intrusions, vulnerability analysis, and active firewall policy verification.",
            proj_monitor_title: "Active Host Monitor",
            proj_monitor_desc: "Built a lightweight Python daemon that monitors system security parameters, parses active network listening socket handshakes, and logs access attempts dynamically to terminal nodes.",
            proj_audit_title: "Web Audit Suite",
            proj_audit_desc: "Developed a modular automated visual dashboard for querying insecure site headers, tracking cross-origin requests, and logging certificate handshake authenticity protocols.",
            proj_btn: "[INTEGRITY_CHECK]",

            contact_title: "ESTABLISH_CONNECTION",
            contact_lbl: "> SIGNAL_STRENGTH:",
            contact_desc: "NOMINAL. READY TO DISCUSS SECURE ARCHITECTURE OR FUTURE COLLABORATIONS.",
            contact_form_identity: "SENDER_IDENTITY",
            contact_placeholder_name: "Enter name...",
            contact_form_email: "RETURN_PATH_EMAIL",
            contact_form_data: "TRANSMISSION_DATA",
            contact_placeholder_msg: "Type your message here...",
            contact_form_btn: "Transmit Packet",
            contact_form_status_lbl: "STATUS: ",
            contact_form_awaiting: "AWAITING_INPUT..."
        },
        de: {
            nav_home: "Startseite",
            nav_about: "Über mich",
            nav_skills: "Kompetenzen",
            nav_experience: "Erfahrung",
            nav_education: "Ausbildung",
            nav_achievements: "Projekte",
            nav_contact: "Verbindung_aufbauen",
            hero_typewriter: "STRATEGIE • SICHERHEIT • AUSFÜHRUNG",
            hero_subbox: "> SPEZIALIST_FÜR_SICHERE_ARCHITEKTUR // GEB. 1998",
            about_title: "PERSONALPROFIL",
            about_log_label: "> PROTOKOLL:",
            about_log_value: "VERZEICHNIS_SCANNT... [1] TREFFER_GEFUNDEN",
            about_bio_id: "> BIOMETRISCHE_ID: SATVEENRAJ_SINGH_A/L_RAJWANT_SINGH",
            about_bio_text: "Spezialist mit Fokus auf der Schnittstelle zwischen Cybersicherheit und visuellem Design. Mit Einsatzerfahrung in Hamburg in den Bereichen Maschinenbau, Elektrotechnik und High-Level-Richtlinien-Audits, optimiert er derzeit die Kernlogik durch ein Studium der Computersicherheit in Melaka.",
            about_metadata_title: "> IDENTITÄTSMETADATEN",
            meta_init_label: "[INITIALISIERUNGSDATUM]:",
            meta_deploy_label: "[AKTUELLER_EINSATZORT]:",
            meta_nation_label: "[STAATSANGEHÖRIGKEIT]:",
            meta_nation_val: "MALAYSISCH",
            verify_clearance: "[SICHERHEIT_VERIFIZIEREN]",
            summary_title: "OPERATIVE_ZUSAMMENFASSUNG",
            summary_overview_label: "> UMFASSENDE_ÜBERSICHT:",
            summary_overview: "KONSOLIDIERTE DOSSIER-EINTRÄGE UND EINSATZKRITISCHE FOKUSPUNKTE.",
            summary_card_status: "SICHER",
            summary_card_title: "SPEZIALIST FÜR SICHERE SYSTEME",
            summary_card_desc: "Entwicklung hochsicherer Systemgrenzen und robuster Cyber-Architekturen durch akademische Ausbildung und praktischen Werkstatteinsatz.",
            summary_card_btn: "[HANDSHAKE_STARTEN]",
            summary_focus_label: "EINSATZKRITISCHER_FOKUS",
            summary_focus_h3: "Kernarchitektur & Leidenschaft",
            summary_focus_p1_lbl: "> AKTUELLE_LEIDENSCHAFT:",
            summary_focus_p1: "Aufbau isolierter Netztestumgebungen, virtueller Sandbox-Simulationen und die Verknüpfung tiefer technischer Protokolle mit ansprechenden visuellen Layouts.",
            summary_focus_p2_lbl: "> OPERATIVE_HALTUNG:",
            summary_focus_p2: "Sicherheit ist nicht nur ein Regelwerk – sie ist eine kontinuierliche Architektur. Mein Ziel ist es, Schwachstellen zu minimieren, Verifikationsprozesse zu automatisieren und kompromisslose Plattformen zur Bedrohungsabwehr zu etablieren.",
            summary_focus_p3_lbl: "> SYNERGIE HAMBURG & MELAKA:",
            summary_focus_p3: "Verbindung von praktischer mechanischer Präzision und industrieller Elektrodiagnose aus Hamburg mit tiefgehender akademischer Computersicherheitstheorie aus Malaysia.",

            // New section translations
            skills_title: "KERNKOMPETENZEN",
            skills_lbl: "> RADAR_SCAN:",
            skills_desc: "WERKZEUGE INITIALISIERT. MODUL GELADEN. ERMITTLE KOMPETENZEN... SYSTEM_CHECK: OPTIMAL.",
            skills_hud_01: "[01] OPERATIVE_AUSRICHTUNG",
            skills_hud_02: "[02] KREATIVE_SYSTEMKOMPETENZ",
            skills_hud_03: "[03] KOMMUNIKATIONSFREQUENZEN",
            lang_en_desc: "Verzögerungsfreie Ausführung.",
            lang_de_desc: "Kernintegrationsmodul.",
            lang_ms_desc: "Hohe Bandbreitenleistung.",
            lang_zh_desc: "Grundlegende Handshake-Fähigkeit.",
            lang_pa_desc: "Eingeschränkte Überwachung verfügbar.",
            validate_credentials_btn: "[REFERENZEN_VALIDIEREN]",

            exp_title: "EINSATZHISTORIE",
            exp_lbl: "> STATUS:",
            exp_desc: "AUSFÜHRUNG REALE SYSTEME UNTER OPERATIVEN BEDINGUNGEN...",
            exp_allianz_status: "KNOTEN_STATUS: VERZEICHNIS_ARCHIV",
            exp_allianz_title: "Policen-Auditor",
            exp_allianz_desc: "Unterstützung bei der Verwaltung und Bearbeitung von Versicherungspolicen, Erledigung administrativer Aufgaben und Mitwirkung am operativen Geschäft im Bereich Policenmanagement.",
            exp_hoehle_status: "FREIGEGEBEN",
            exp_hoehle_title: "Junior-Schlosser",
            exp_hoehle_desc: "Präzise Werkstattarbeiten wie Messen, Sägen, Bohren sowie Montage und Reparatur von Stahlkonstruktionen vor Ort; Unterstützung von Schweiß- und Zerspanungsabläufen.",
            exp_beeck_status: "STRENG_GEHEIM",
            exp_beeck_title: "Junior-Elektriker",
            exp_beeck_desc: "Tätigkeit als Elektriker für Alt- und Neubauinstallationen, Instandhaltung von Beleuchtungs- und Sprechanlagen, Aufbau von Datennetzwerken sowie Durchführung sicherheitstechnischer Messungen nach VDE- und DGUV-Richtlinien.",
            exp_beeck_btn: "[ZUGANGS_VALIDIERUNG]",

            edu_title: "WISSENSSPEICHER",
            edu_lbl: "> SYSTEM_KONFIG:",
            edu_desc: "ERWERB MULTIDISZIPLINÄRER GRUNDLAGEN IN SICHERER INFORMATIK NACH ANALYTISCHER LOGIK.",
            edu_utem_status: "AKTIVES_ZIEL: DATENERFASSUNG_LÄUFT",
            edu_utem_title: "B.Sc. Computersicherheit",
            edu_utem_desc: "Spezialisierung auf Computersicherheit und Netzwerkanalyse mit besonderem Fokus auf Web- und Softwareentwicklung.",
            edu_utem_prog: "[FORTSCHR: STUDIENABSCHLUSS]",
            edu_fcuc_status: "STRENG_GEHEIM",
            edu_fcuc_title: "Grundlagenstudium",
            edu_fcuc_desc: "Abschluss mit einem Australian Tertiary Admission Rank (ATAR) von 93,9, was ein tiefes Verständnis wissenschaftlicher und mathematischer Grundlagen belegt. Erlangung des Western Australian Certificate of Education (WACE).",
            edu_fcuc_prog: "[STATUS: AKADEMISCHER_RANG]",
            edu_smk_status: "STRENG_GEHEIM",
            edu_smk_title: "Sekundarstufe",
            edu_smk_desc: "Umfassende Leistungsbewertung für den Zeitraum 2011-2015.",
            edu_smk_prog_logic: "[SYSTEM: LOGISCHE_VERARBEITUNG]",
            edu_smk_prog_comm: "[SYSTEM: KOMMUNIKATIONSPROTOKOLLE]",
            edu_smk_prog_field: "[SYSTEM: AUSSENEINSÄTZE]",
            edu_smk_btn: "[VALIDIERUNGSASSSETS_ENTSCHLÜSSELN]",

            proj_title: "PROJEKTARBEITEN",
            proj_lbl: "> PROJEKT_AUDIT:",
            proj_desc: "AUDITIERUNG VON LABOR-TESTUMGEBUNGEN, SIMULATIONEN UND CODE-REFACTORINGS AN DER UNIVERSITÄT.",
            proj_range_title: "Cybersicherheits-Testlabor",
            proj_range_desc: "Entwicklung und Aufbau einer mandantenfähigen Virtualisierungs-Testumgebung mit isolierten Subnetzen zur sicheren Simulation und Auditierung von Netzwerkeindringlingen, Schwachstellenanalysen und aktiver Firewall-Richtlinienprüfung.",
            proj_monitor_title: "Aktiver Host-Monitor",
            proj_monitor_desc: "Entwicklung eines leichtgewichtigen Python-Daemons zur Überwachung von Systemsicherheitsparametern, Analyse aktiver Netzwerk-Sockets und dynamischen Protokollierung von Zugriffsversuchen.",
            proj_audit_title: "Web-Audit-Suite",
            proj_audit_desc: "Entwicklung eines modularen, automatisierten Dashboards zur Abfrage unsicherer Website-Header, Verfolgung von Cross-Origin-Requests und Verifizierung von Zertifikat-Handshakes.",
            proj_btn: "[INTEGRITÄTSPRÜFUNG]",

            contact_title: "VERBINDUNG_AUFBAUEN",
            contact_lbl: "> SIGNALSTÄRKE:",
            contact_desc: "NOMINAL. BEREIT FÜR ZUSAMMENARBEIT ODER SICHERHEITSARCHITEKTUR-DISKUSSIONEN.",
            contact_form_identity: "SENDER_IDENTITÄT",
            contact_placeholder_name: "Name eingeben...",
            contact_form_email: "RÜCKKANAL_EMAIL",
            contact_form_data: "ÜBERTRAGUNGSDATEN",
            contact_placeholder_msg: "Nachricht hier eingeben...",
            contact_form_btn: "Paket Senden",
            contact_form_status_lbl: "STATUS: ",
            contact_form_awaiting: "WARTE_AUF_EINGABE..."
        }
    };

    const langToggle = document.getElementById('lang-toggle');

    function applyLanguage(lang) {
        const translationSet = translations[lang];
        if (!translationSet) return;

        document.querySelectorAll('[data-trn]').forEach(el => {
            const key = el.getAttribute('data-trn');
            if (translationSet[key]) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = translationSet[key];
                } else {
                    el.innerText = translationSet[key];
                }
            }
        });

        if (langToggle) {
            langToggle.innerHTML = lang === 'de'
                ? '<span style="font-size: 1.25rem;">🇩🇪</span>'
                : '<span style="font-size: 1.25rem;">🇬🇧</span>';
        }
    }

    if (langToggle) {
        const savedLang = localStorage.getItem('language') || 'en';
        applyLanguage(savedLang);

        langToggle.addEventListener('click', () => {
            const currentLang = localStorage.getItem('language') === 'de' ? 'en' : 'de';
            applyLanguage(currentLang);
            localStorage.setItem('language', currentLang);
            addLiveLog(`SYSTEM: Language override to ${currentLang.toUpperCase()}`);
        });
    }

    // --- 13. SPOTLIGHT CARD TRACKER ---
    document.querySelectorAll('.glass-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // --- 14. HYPERSPEED WARP CANVAS ---
    const warpCanvas = document.getElementById('hyperspeed-canvas');
    if (warpCanvas) {
        const ctx = warpCanvas.getContext('2d');
        let width, height;
        let stars = [];
        const maxStars = 120;
        const speed = 6;

        function resizeWarp() {
            width = warpCanvas.width = warpCanvas.offsetWidth;
            height = warpCanvas.height = warpCanvas.offsetHeight;
        }

        function initStars() {
            stars = [];
            for (let i = 0; i < maxStars; i++) {
                stars.push({
                    x: Math.random() * width - width / 2,
                    y: Math.random() * height - height / 2,
                    z: Math.random() * width,
                    color: Math.random() > 0.4 ? 'var(--primary-blue)' : 'var(--accent-green)'
                });
            }
        }

        function drawWarp() {
            ctx.fillStyle = 'rgba(10, 11, 16, 0.15)'; // Softer trails
            ctx.fillRect(0, 0, width, height);

            ctx.lineWidth = 1.5;
            const cx = width / 2;
            const cy = height / 2;

            stars.forEach(star => {
                star.z -= speed;
                if (star.z <= 0) {
                    star.z = width;
                    star.x = Math.random() * width - width / 2;
                    star.y = Math.random() * height - height / 2;
                }

                const k = 128.0 / star.z;
                const px = star.x * k + cx;
                const py = star.y * k + cy;

                if (px >= 0 && px <= width && py >= 0 && py <= height) {
                    const size = (1 - star.z / width) * 4;
                    ctx.beginPath();
                    // Draw a vector trail radiating from the center!
                    const tailK = 128.0 / (star.z + speed * 2);
                    const tx = star.x * tailK + cx;
                    const ty = star.y * tailK + cy;

                    ctx.strokeStyle = star.color;
                    ctx.moveTo(px, py);
                    ctx.lineTo(tx, ty);
                    ctx.stroke();
                }
            });

            requestAnimationFrame(drawWarp);
        }

        window.addEventListener('resize', resizeWarp);
        resizeWarp();
        initStars();
        drawWarp();
    }

    // --- 15. SCRAMBLE TEXT GLITCH DECODER ---
    const scrambleElements = document.querySelectorAll('.scramble-text');
    const chars = '01XYZ%$#@!&<>[]{}+-*0101';

    function scrambleText(element) {
        const originalText = element.getAttribute('data-original') || element.innerText;
        if (!element.getAttribute('data-original')) {
            element.setAttribute('data-original', originalText);
        }

        let iterations = 0;
        const interval = setInterval(() => {
            element.innerText = originalText
                .split('')
                .map((char, index) => {
                    if (char === ' ' || char === '_' || char === '/' || char === '.') return char;
                    if (index < iterations) {
                        return originalText[index];
                    }
                    return chars[Math.floor(Math.random() * chars.length)];
                })
                .join('');

            if (iterations >= originalText.length) {
                clearInterval(interval);
                element.innerText = originalText;
            }
            iterations += 1 / 2; // Smoother gradual decrypt
        }, 30);
    }

    // Scramble on view
    const scrambleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                scrambleText(entry.target);
            }
        });
    }, { threshold: 0.1 });

    scrambleElements.forEach(el => {
        scrambleObserver.observe(el);
        // Also scramble on hover!
        el.addEventListener('mouseenter', () => scrambleText(el));
    });

    // --- 16. NODE PHYSICS TELEMETRY ---
    const physicsCanvas = document.getElementById('physics-canvas');
    if (physicsCanvas) {
        const pCtx = physicsCanvas.getContext('2d');
        let pWidth = physicsCanvas.width = physicsCanvas.parentElement.offsetWidth;
        let pHeight = physicsCanvas.height = physicsCanvas.parentElement.offsetHeight;

        let nodes = [];
        const maxNodes = 25;
        let mouse = { x: null, y: null, radius: 80 };

        function resizePhysics() {
            if (!physicsCanvas.parentElement) return;
            pWidth = physicsCanvas.width = physicsCanvas.parentElement.offsetWidth;
            pHeight = physicsCanvas.height = physicsCanvas.parentElement.offsetHeight;
        }

        class Node {
            constructor() {
                this.x = Math.random() * pWidth;
                this.y = Math.random() * pHeight;
                this.vx = (Math.random() - 0.5) * 1.5;
                this.vy = (Math.random() - 0.5) * 1.5;
                this.radius = Math.random() * 4 + 2;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Wall collisions
                if (this.x < this.radius || this.x > pWidth - this.radius) this.vx *= -1;
                if (this.y < this.radius || this.y > pHeight - this.radius) this.vy *= -1;

                // Mouse deflection
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = this.x - mouse.x;
                    const dy = this.y - mouse.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < mouse.radius) {
                        const force = (mouse.radius - dist) / mouse.radius;
                        const angle = Math.atan2(dy, dx);
                        this.vx += Math.cos(angle) * force * 0.4;
                        this.vy += Math.sin(angle) * force * 0.4;

                        // Friction limit
                        const speed = Math.hypot(this.vx, this.vy);
                        if (speed > 3) {
                            this.vx = (this.vx / speed) * 3;
                            this.vy = (this.vy / speed) * 3;
                        }
                    }
                }
            }
            draw() {
                pCtx.beginPath();
                pCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                pCtx.fillStyle = 'var(--accent-green)';
                pCtx.fill();
            }
        }

        function initPhysics() {
            nodes = [];
            for (let i = 0; i < maxNodes; i++) {
                nodes.push(new Node());
            }
        }

        function drawPhysics() {
            pCtx.clearRect(0, 0, pWidth, pHeight);

            // Draw links
            pCtx.lineWidth = 0.5;
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
                    if (dist < 80) {
                        pCtx.beginPath();
                        pCtx.strokeStyle = `rgba(80, 250, 123, ${1 - dist / 80})`;
                        pCtx.moveTo(nodes[i].x, nodes[i].y);
                        pCtx.lineTo(nodes[j].x, nodes[j].y);
                        pCtx.stroke();
                    }
                }
            }

            nodes.forEach(node => {
                node.update();
                node.draw();
            });

            requestAnimationFrame(drawPhysics);
        }

        physicsCanvas.addEventListener('mousemove', e => {
            const rect = physicsCanvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        physicsCanvas.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        window.addEventListener('resize', resizePhysics);
        initPhysics();
        drawPhysics();
    }

    // --- 17. MASTER INTERACTIVE BACKGROUND ENGINE (GALAXY & NETWORK SWAPPER) ---
    const bgCanvas = document.getElementById('bg-canvas');
    if (bgCanvas) {
        const ctx = bgCanvas.getContext('2d');
        let width = bgCanvas.width = window.innerWidth;
        let height = bgCanvas.height = window.innerHeight;

        let activeFeed = localStorage.getItem('bg_feed') || 'galaxy'; // 'galaxy' or 'network'

        // Core settings
        let galaxyStars = [];
        let networkParticles = [];
        const maxGalaxyStars = 1500;
        const maxNetworkParticles = 120;

        let mouse = { x: null, y: null, radius: 150 };

        function resizeCanvas() {
            width = bgCanvas.width = window.innerWidth;
            height = bgCanvas.height = window.innerHeight;
            initGalaxy();
            initNetwork();
        }

        // --- GALAXY MATH ---
        const numArms = 4;
        const armAngleSpan = (2 * Math.PI) / numArms;

        class Star {
            constructor() {
                this.reset();
            }
            reset() {
                const distFactor = Math.pow(Math.random(), 3.5);
                this.r = distFactor * Math.max(width, height) * 0.7;
                this.armIndex = Math.floor(Math.random() * numArms);
                const baseAngle = this.armIndex * armAngleSpan;
                const spiralTightness = 0.0025;
                const armAngleOffset = this.r * spiralTightness;
                const dispersion = (Math.random() - 0.5) * (180 / (this.r + 15));
                this.angle = baseAngle + armAngleOffset + dispersion;
                this.size = Math.random() * 1.5 + 0.3;

                if (distFactor < 0.12) {
                    this.colorBase = 'rgba(255, 235, 180, ';
                    this.opacity = Math.random() * 0.6 + 0.4;
                } else {
                    const colors = [
                        'rgba(80, 250, 123, ',
                        'rgba(0, 123, 255, ',
                        'rgba(0, 212, 255, '
                    ];
                    this.colorBase = colors[Math.floor(Math.random() * colors.length)];
                    this.opacity = Math.random() * 0.5 + 0.2;
                }
                this.rotationSpeed = (0.02 / (this.r + 10)) + 0.0003;
            }
            update() {
                this.angle += this.rotationSpeed;
                let cx = width / 2;
                let cy = height / 2;
                let targetX = cx + Math.cos(this.angle) * this.r;
                let targetY = cy + Math.sin(this.angle) * this.r;

                if (mouse.x !== null && mouse.y !== null) {
                    const dx = targetX - mouse.x;
                    const dy = targetY - mouse.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < mouse.radius) {
                        const force = (mouse.radius - dist) / mouse.radius;
                        targetX += (dx / dist) * force * 35;
                        targetY += (dy / dist) * force * 35;
                    }
                }
                this.x = targetX;
                this.y = targetY;
                this.opacity += (Math.random() - 0.5) * 0.04;
                this.opacity = Math.max(0.1, Math.min(0.7, this.opacity));
            }
            draw() {
                const isLight = document.documentElement.classList.contains('light-mode');
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = isLight ? `rgba(0, 0, 0, ${this.opacity})` : `${this.colorBase}${this.opacity})`;
                ctx.fill();
            }
        }

        function initGalaxy() {
            galaxyStars = [];
            for (let i = 0; i < maxGalaxyStars; i++) {
                galaxyStars.push(new Star());
            }
        }

        // --- NETWORK PARTICLES MATH ---
        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.7;
                this.vy = (Math.random() - 0.5) * 0.7;
                this.radius = Math.random() * 3 + 1;

                const colors = [
                    'rgba(80, 250, 123, ',
                    'rgba(0, 123, 255, ',
                    'rgba(0, 212, 255, '
                ];
                this.colorBase = colors[Math.floor(Math.random() * colors.length)];
                this.opacity = Math.random() * 0.4 + 0.3;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Boundary wrapping
                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;

                // Mouse repulsion
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = this.x - mouse.x;
                    const dy = this.y - mouse.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < mouse.radius) {
                        const force = (mouse.radius - dist) / mouse.radius;
                        this.x += (dx / dist) * force * 4;
                        this.y += (dy / dist) * force * 4;
                    }
                }
            }
            draw() {
                const isLight = document.documentElement.classList.contains('light-mode');
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = isLight ? `rgba(0, 0, 0, ${this.opacity})` : `${this.colorBase}${this.opacity})`;
                ctx.fill();
            }
        }

        function initNetwork() {
            networkParticles = [];
            for (let i = 0; i < maxNetworkParticles; i++) {
                networkParticles.push(new Particle());
            }
        }

        // --- MAIN RENDER CYCLE ---
        function drawBackground() {
            const isLight = document.documentElement.classList.contains('light-mode');
            ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.1)' : 'rgba(10, 11, 16, 0.1)';
            ctx.fillRect(0, 0, width, height);

            if (activeFeed === 'galaxy') {
                galaxyStars.forEach(star => {
                    star.update();
                    star.draw();
                });
            } else {
                // Draw network link paths
                ctx.lineWidth = 0.5;
                for (let i = 0; i < networkParticles.length; i++) {
                    for (let j = i + 1; j < networkParticles.length; j++) {
                        const dist = Math.hypot(networkParticles[i].x - networkParticles[j].x, networkParticles[i].y - networkParticles[j].y);
                        if (dist < 130) {
                            ctx.beginPath();
                            ctx.strokeStyle = isLight
                                ? `rgba(0, 0, 0, ${0.15 * (1 - dist / 130)})`
                                : `rgba(0, 123, 255, ${0.15 * (1 - dist / 130)})`;
                            ctx.moveTo(networkParticles[i].x, networkParticles[i].y);
                            ctx.lineTo(networkParticles[j].x, networkParticles[j].y);
                            ctx.stroke();
                        }
                    }
                }

                networkParticles.forEach(particle => {
                    particle.update();
                    particle.draw();
                });
            }

            requestAnimationFrame(drawBackground);
        }

        // --- SWITCH FEED TELEMETRY ---
        const feedToggleBtn = document.getElementById('feed-toggle');

        function updateFeedButtonText() {
            if (!feedToggleBtn) return;
            const currentLang = localStorage.getItem('language') || 'en';
            if (activeFeed === 'galaxy') {
                feedToggleBtn.innerText = currentLang === 'de' ? "[FEED: GALAXIE]" : "[FEED: GALAXY]";
            } else {
                feedToggleBtn.innerText = currentLang === 'de' ? "[FEED: NETZWERK]" : "[FEED: NETWORK]";
            }
        }

        if (feedToggleBtn) {
            updateFeedButtonText();

            feedToggleBtn.addEventListener('click', () => {
                activeFeed = activeFeed === 'galaxy' ? 'network' : 'galaxy';
                localStorage.setItem('bg_feed', activeFeed);
                updateFeedButtonText();
                addLiveLog(`SYSTEM: Telemetry backdrop shifted to ${activeFeed === 'galaxy' ? 'COSMIC_GALAXY' : 'NETWORK_PARTICLES'}`);
            });
        }

        if (langToggle) {
            langToggle.addEventListener('click', () => {
                setTimeout(updateFeedButtonText, 20);
            });
        }

        window.addEventListener('mousemove', e => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        window.addEventListener('resize', resizeCanvas);

        // Boot up
        initGalaxy();
        initNetwork();
        drawBackground();
    }

    // --- 18. HOLOGRAPHIC 3D TILT PROFILE CARD ENGINE ---
    const tiltCard = document.querySelector('.tilt-profile-card');
    if (tiltCard) {
        tiltCard.addEventListener('mousemove', e => {
            const rect = tiltCard.getBoundingClientRect();

            // Mouse coordinates relative to card boundary
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Midpoints
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // 3D rotations (max 15 degrees)
            const rotateY = ((x - centerX) / centerX) * 15;
            const rotateX = -((y - centerY) / centerY) * 15;

            // Dynamic radial sheen position percentages
            const sheenX = (x / rect.width) * 100;
            const sheenY = (y / rect.height) * 100;

            // Update properties
            tiltCard.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(1.03)`;
            tiltCard.style.setProperty('--sheen-x', `${sheenX}%`);
            tiltCard.style.setProperty('--sheen-y', `${sheenY}%`);
        });

        tiltCard.addEventListener('mouseleave', () => {
            // Reset smoothly
            tiltCard.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';
            tiltCard.style.setProperty('--sheen-x', '50%');
            tiltCard.style.setProperty('--sheen-y', '50%');
        });
    }

    // --- 19. RADAR CORE DECRYPTION SYSTEM ---
    const radarNodes = document.querySelectorAll('.skill-node-orbit');
    const coreLabel = document.getElementById('radar-core-label');
    const coreReadout = document.getElementById('radar-core-readout');
    const coreNode = document.querySelector('.radar-core-node');

    if (radarNodes.length && coreLabel && coreReadout && coreNode) {
        const originalLabel = coreLabel.getAttribute('data-original') || "CORE.sys";
        const originalReadout = "SECURE";

        radarNodes.forEach(node => {
            node.addEventListener('mouseenter', () => {
                const labelText = node.getAttribute('data-label');
                const val = node.getAttribute('data-val');
                const unit = node.getAttribute('data-unit');
                
                // Set glowing active class
                coreNode.classList.add('active-core');
                
                // Decrypt label
                coreLabel.innerText = labelText;
                coreLabel.dataset.value = labelText;
                if (typeof decodeEffect === 'function') {
                    decodeEffect(coreLabel);
                }
                
                // Display stats readout
                coreReadout.innerHTML = `<span style="color: var(--accent-green); font-weight: 800;">${val}</span><span style="font-size: 0.6rem; opacity: 0.7; margin-left: 3px;">${unit}</span>`;
                
                // Log to live tactical feed
                if (typeof addLiveLog === 'function') {
                    addLiveLog(`RADAR: Inspecting node telemetry [${labelText}]...`);
                }
            });

            node.addEventListener('mouseleave', () => {
                coreNode.classList.remove('active-core');
                
                // Reset central text
                coreLabel.innerText = originalLabel;
                coreLabel.dataset.value = originalLabel;
                if (typeof decodeEffect === 'function') {
                    decodeEffect(coreLabel);
                }
                
                coreReadout.innerHTML = originalReadout;
            });
        });
    }

    // --- 20. CYBER DOSSIER DECRYPTOR MODAL LOGIC ---
    const modal = document.getElementById('dossier-modal');
    const modalClose = modal ? modal.querySelector('.cyber-modal-close') : null;
    const modalOverlay = modal ? modal.querySelector('.cyber-modal-overlay') : null;
    const decryptorScreen = modal ? modal.querySelector('.decryptor-scan-screen') : null;
    const viewerFrame = modal ? modal.querySelector('.decrypted-viewer-frame') : null;
    const dossierContent = document.getElementById('modal-dossier-content');
    const modalFooter = modal ? modal.querySelector('.cyber-modal-footer') : null;
    
    // Pagination state for multi-asset dossiers
    let galleryAssets = [];
    let currentGalleryIndex = 0;

    const dossierData = {
        languages: [
            {
                badge: "SECURE_CREDENTIAL // LANGUAGE_C2_PRO",
                title: "CAMBRIDGE PROFICIENCY CLEARANCE",
                role: "English Language Mastery - Level C2",
                id: "CAM-2024-ENG-77291",
                summary: "Cambridge Assessment English: Certificate of Proficiency in English. Grade A awarded, representing the highest levels of structural linguistics, speech analysis, and advanced technical literature parsing under CEFR Level C2 guidelines.",
                skills: ["LITERATURE", "PHONETICS", "TECHNICAL_WRITING", "CEFR_C2"],
                footer: "ORIGIN: CAMBRIDGE_UK // VERIFICATION: VALID"
            },
            {
                badge: "SECURE_CREDENTIAL // LANGUAGE_B2_GI",
                title: "GOETHE-ZERTIFIKAT CLEARANCE",
                role: "German Technical Communication - Level B2",
                id: "GI-2023-DEU-88190",
                summary: "Goethe-Institut Deutschprüfung B2. Verified competency in complex business terminology, engineering documentation, and professional technical correspondence under CEFR Level B2 standards.",
                skills: ["TECHNICAL_GERMAN", "DIAGNOSTICS", "CORRESPONDENCE", "CEFR_B2"],
                footer: "ORIGIN: GOETHE_INSTITUT // VERIFICATION: VALID"
            },
            {
                badge: "SECURE_CREDENTIAL // SPM_CLEARED",
                title: "NATIONAL CURRICULUM BM CLEARANCE",
                role: "National Language Command - Distinction A+",
                id: "SPM-2021-MYS-45928",
                summary: "Sijil Pelajaran Malaysia (SPM). Awarded Grade A+ (Highest Distinction) in Bahasa Melayu, verifying exceptional mastery of national formal language syntax, logic composition, and advanced prose parsing.",
                skills: ["SYNTAX", "FORMAL_PROSE", "LITERATURE", "DISTINCTION"],
                footer: "ORIGIN: MOE_MALAYSIA // VERIFICATION: VALID"
            }
        ],
        allianz: {
            badge: "EXPERIENCE_CLEARANCE // AZT_GER",
            title: "ALLIANZ TRADE COMPLIANCE DOSSIER",
            role: "Security Administrator & Technical Auditor Intern",
            id: "AZT-DEU-2024-INTERN-09",
            summary: "Successfully executed automated security verification audit scripts across cloud server meshes. Collaborated on declassified firewall telemetry parsing, server log monitoring, and automated security reports. Verified clearance level: Standard High-Tech Compliance.",
            skills: ["FIREWALLS", "CLOUD_MESH", "AUDIT_SCRIPTS", "COMPLIANCE"],
            footer: "OFFICE: HAMBURG // INTEGRITY: 100%_SECURED"
        },
        hoehle: {
            badge: "EXPERIENCE_CLEARANCE // FHM_METALL",
            title: "FRANK HÖHLE PRECISION METALWORK DOSSIER",
            role: "CNC Metalwork Specialist & Machining Tech",
            id: "FHM-DEU-2023-MACH-14",
            summary: "Authorized clearance for CNC metal fabrication and precision metal engineering. Certified in automated MIG/WIG welding diagnostics, mechanical blueprints analysis, and high-precision band-saw calibrations.",
            skills: ["CNC_PROGRAMMING", "MIG_WIG_WELDING", "BLUEPRINTS", "HEAVY_MECH"],
            footer: "LOCATION: PINNEBERG // STATUS: COMPLETED"
        },
        beeck: {
            badge: "EXPERIENCE_CLEARANCE // VDB_ELEKTRO",
            title: "VON DER BEECK HIGH-VOLTAGE DIAGNOSTICS",
            role: "Industrial Automation & Electrical Technician",
            id: "VDB-DEU-2022-ELEC-88",
            summary: "Licensed high-voltage technician under DGUV and VDE standardizations. Spearheaded diagnostics and fault-isolation across automation circuits, industrial power grids, and digital PLCs (Programmable Logic Controllers).",
            skills: ["DGUV_V3", "VDE_COMPLIANCE", "PLC_DIAGNOSTICS", "400V_SYS"],
            footer: "LOCATION: HAMBURG // CLEARANCE: LEVEL_A"
        },
        utem: {
            badge: "EDUCATION_CLEARANCE // UTM_CYBER",
            title: "UTEM CYBER DEFENSE LABORATORY DOSSIER",
            role: "Cyber Range Engineering & Network Sandbox",
            id: "UTM-MYS-2021-RANGE-11",
            summary: "Specialized diagnostics of active intrusion telemetry loops. Developed secure sandbox containers for network load testing, configured intrusion prevention systems, and analyzed penetration logs across active digital ranges.",
            skills: ["CYBER_RANGE", "INTRUSION_DETECTION", "SANDBOX", "PEN_TESTING"],
            footer: "INSTITUTE: MALACCA // INTEGRITY: SECURED"
        },
        fcuc: {
            badge: "EDUCATION_CLEARANCE // FCU_SE",
            title: "FIRST CITY SE ACADEMIC RECORD",
            role: "Software Engineering Core Module Diagnostics",
            id: "FCU-MYS-2022-BACH-05",
            summary: "Completed Software Engineering Core Modules. Outstanding technical achievements: Advanced Algorithms and Data Structures (Grade A), Software Architecture Security (Grade A), and Automated Networking Meshes (Distinction).",
            skills: ["ALGORITHMS", "SOFTWARE_ARCH", "DATA_STRUCTURES", "NETWORKING"],
            footer: "CAMPUS: PETALING_JAYA // STATUS: CLASS_1"
        },
        smkst: {
            badge: "EDUCATION_CLEARANCE // SMK_ST",
            title: "SMK SUNGAI TAPANG NATIONAL RECORD",
            role: "Pure Science Stream Academic Clearance",
            id: "SMKST-MYS-2021-SEC-72",
            summary: "Completed National Secondary Education (SPM) with 7A+/2A Distinction in the Pure Science stream. Core focus on Physics models, Chemistry formulations, and Advanced Mathematics metrics.",
            skills: ["PURE_SCIENCE", "ADV_MATH", "PHYSICS_MODELS", "CHEMISTRY"],
            footer: "LOCATION: KUCHING // RATING: OPTIMAL"
        },
        project: {
            badge: "PROJECT_INTEGRITY // PROJ_CHK",
            title: "APPLICATION INFRASTRUCTURE CHECK",
            role: "Project Architecture & Codebase Diagnostics",
            id: "PRJ-2026-STABLE-v2",
            summary: "Integrity check completed successfully. Verified clean responsive layouts, CRT telemetry nodes, fully functional star-warp canvas animations, and secure WebP/image rendering models.",
            skills: ["RESPONSIVE_UI", "TELEMETRY", "PHYSICS_CANVAS", "LOGS_FEED"],
            footer: "INTEGRITY_INDEX: 1.00_STABLE // SYSTEM: OK"
        }
    };

    function renderDossierCard(data, href) {
        if (!data) return "";
        const skillsMarkup = data.skills.map(s => `<span class="dossier-skill-tag">[${s}]</span>`).join(" ");
        const externalLinkBtn = href ? `<a href="${href}" target="_blank" class="send-btn" style="margin-top: 15px; display: inline-block; text-decoration: none; width: 100%; text-align: center;">[ACCESS_EXTERNAL_DRIVE_NODE]</a>` : "";
        const imagePlaceholder = `<div class="dossier-image-placeholder" style="width: 100%; height: 200px; background: rgba(0, 123, 255, 0.1); border: 1px dashed var(--primary-blue); margin-bottom: 15px; display: flex; align-items: center; justify-content: center;">
            <span style="color: var(--primary-blue); opacity: 0.6; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem;">[CERTIFICATE_IMAGE_SLOT]</span>
        </div>`;

        return `
            <div class="simulated-dossier-card">
                <span class="dossier-badge">${data.badge}</span>
                <div class="dossier-header-grid">
                    <div class="dossier-meta-item">
                        <span class="meta-lbl">DOSSIER // DECRYPT_ID</span>
                        <span class="meta-val">${data.id}</span>
                    </div>
                    <div class="dossier-meta-item">
                        <span class="meta-lbl">STATUS // LEVEL</span>
                        <span class="meta-val">RESTRICTED_ACCESS</span>
                    </div>
                </div>
                ${imagePlaceholder}
                <div class="dossier-cert-body">
                    <h4>${data.title}</h4>
                    <p style="color: var(--text-white); font-weight: bold; font-size: 0.9rem; margin-bottom: 5px;">${data.role}</p>
                    <p>${data.summary}</p>
                </div>
                <div class="dossier-skills-list">
                    ${skillsMarkup}
                </div>
                <div class="dossier-verification-footer">
                    <span>${data.footer}</span>
                    <span style="color: var(--accent-green)">● SIGNATURE_VERIFIED</span>
                </div>
                ${externalLinkBtn}
            </div>
        `;
    }

    function updateGallerySlide(href) {
        if (!galleryAssets.length) return;
        const currentData = galleryAssets[currentGalleryIndex];
        const countSpan = modal ? modal.querySelector('.gallery-page-indicator') : null;
        if (dossierContent) dossierContent.innerHTML = renderDossierCard(currentData, href);
        if (countSpan) countSpan.innerText = `ASSET ${currentGalleryIndex + 1} OF ${galleryAssets.length}`;
    }

    function triggerModalDecryption(dossierKey, href) {
        if (!modal) return;
        
        // Show modal and overlay
        modal.classList.add('active');
        
        // Reset screens
        if (decryptorScreen) decryptorScreen.style.opacity = '1';
        if (decryptorScreen) decryptorScreen.style.display = 'flex';
        if (viewerFrame) viewerFrame.style.display = 'none';
        if (modalFooter) modalFooter.style.display = 'none';
        
        // Reset log lines
        const logLines = modal.querySelectorAll('.decrypt-log-line');
        logLines.forEach((line, idx) => {
            line.style.animation = 'none';
            // Trigger reflow
            void line.offsetWidth;
            line.style.animation = `line-reveal 0.15s forwards ${idx * 0.15}s`;
        });
        
        const progressFill = modal.querySelector('.decrypt-progress-fill');
        const statusText = modal.querySelector('.decrypt-status-text');
        
        if (progressFill) progressFill.style.width = '0%';
        if (statusText) statusText.innerText = 'DECRYPTING... 0%';
        
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.floor(Math.random() * 8) + 4;
            if (progress >= 100) {
                progress = 100;
                clearInterval(progressInterval);
                
                // Show actual content
                setTimeout(() => {
                    if (decryptorScreen) decryptorScreen.style.opacity = '0';
                    setTimeout(() => {
                        if (decryptorScreen) decryptorScreen.style.display = 'none';
                        if (viewerFrame) viewerFrame.style.display = 'flex';
                        
                        // Load exact content
                        if (dossierKey === 'languages') {
                            galleryAssets = dossierData.languages;
                            currentGalleryIndex = 0;
                            updateGallerySlide(href);
                            if (modalFooter) modalFooter.style.display = 'flex';
                        } else {
                            galleryAssets = [];
                            const cardData = dossierData[dossierKey] || dossierData.project;
                            if (dossierContent) dossierContent.innerHTML = renderDossierCard(cardData, href);
                            if (modalFooter) modalFooter.style.display = 'none';
                        }
                    }, 300);
                }, 300);
            }
            if (progressFill) progressFill.style.width = `${progress}%`;
            if (statusText) statusText.innerText = `DECRYPTING... ${progress}%`;
        }, 35);
    }

    // Intercept click on proof links!
    document.addEventListener('click', (e) => {
        const link = e.target.closest('.proof-link');
        if (!link) return;
        
        e.preventDefault();
        
        // Determine which dossier key to load
        let dossierKey = 'project';
        const href = link.getAttribute('href') || '';
        const dataTrn = link.getAttribute('data-trn') || '';
        
        if (dataTrn.includes('validate_credentials_btn')) {
            dossierKey = 'languages';
        } else if (dataTrn.includes('exp_beeck_btn') || href.includes('1gpZS4W1PzB5ZkzhfmrJqu3ntNEThgfp1')) {
            dossierKey = 'beeck';
        } else if (dataTrn.includes('edu_smk_btn') || href.includes('1ABDfEoKuQOmG2_ezSrKH9N3Xn4blQjuG')) {
            dossierKey = 'smkst';
        } else if (href.includes('1opbm-yxCPJT90hoG7wpaWOuHnEF31qNg')) {
            dossierKey = 'allianz';
        } else if (href.includes('1hzRCBKa2RscamqHswD86im1VI7sz6Via')) {
            dossierKey = 'hoehle';
        } else if (href.includes('15uSf4v9et4lw3HJDUPxIT5foOai2YGE5')) {
            dossierKey = 'fcuc';
        } else if (link.parentElement && link.parentElement.innerHTML && (link.parentElement.innerHTML.includes('UTeM') || link.outerHTML.includes('UTeM'))) {
            dossierKey = 'utem';
        }
        
        triggerModalDecryption(dossierKey, href);
        
        if (typeof addLiveLog === 'function') {
            addLiveLog(`DECRYPT: Secure dossier clearance loaded [${dossierKey.toUpperCase()}]`);
        }
    });

    // Close Modal listeners
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            if (modal) modal.classList.remove('active');
        });
    }
    if (modalOverlay) {
        modalOverlay.addEventListener('click', () => {
            if (modal) modal.classList.remove('active');
        });
    }

    // Modal Gallery navigation
    if (modal) {
        const prevBtn = modal.querySelector('.prev-btn');
        const nextBtn = modal.querySelector('.next-btn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (galleryAssets.length <= 1) return;
                currentGalleryIndex = (currentGalleryIndex - 1 + galleryAssets.length) % galleryAssets.length;
                updateGallerySlide();
                if (typeof addLiveLog === 'function') {
                    addLiveLog(`DOSSIER: Paged to credential slide [${currentGalleryIndex + 1}]`);
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (galleryAssets.length <= 1) return;
                currentGalleryIndex = (currentGalleryIndex + 1) % galleryAssets.length;
                updateGallerySlide();
                if (typeof addLiveLog === 'function') {
                    addLiveLog(`DOSSIER: Paged to credential slide [${currentGalleryIndex + 1}]`);
                }
            });
        }
    }

    // --- 21. TARGET LOCK RETICLE SYSTEM ---
    // Dynamically create reticle elements and coordinate HUD inside every .side-visual
    const sideVisuals = document.querySelectorAll('.side-visual');
    sideVisuals.forEach(visual => {
        // Make sure the inner wrapper has relative positioning
        const innerWrap = visual.querySelector('div');
        if (innerWrap) innerWrap.style.position = 'relative';
        innerWrap.style.overflow = 'hidden';

        // Create the reticle element
        const reticle = document.createElement('div');
        reticle.className = 'target-reticle';
        innerWrap.appendChild(reticle);

        // Create the coordinate HUD bar
        const coordHud = document.createElement('div');
        coordHud.className = 'reticle-coord-hud';
        coordHud.innerHTML = `
            <span class="coord-x">X: 0000</span>
            <span class="reticle-lock-label">TGT_LOCK</span>
            <span class="coord-y">Y: 0000</span>
        `;
        innerWrap.appendChild(coordHud);

        // Track mouse movement
        let isActive = false;

        innerWrap.addEventListener('mouseenter', () => {
            isActive = true;
            reticle.style.opacity = '1';
            coordHud.style.opacity = '1';
            if (typeof addLiveLog === 'function') {
                const label = innerWrap.querySelector('[style*="ASSET_ID"]')?.innerText?.trim() || 'ASSET';
                addLiveLog(`TARGETING: Reticle lock engaged on [${label}]`);
            }
        });

        innerWrap.addEventListener('mouseleave', () => {
            isActive = false;
            reticle.style.opacity = '0';
            coordHud.style.opacity = '0';
        });

        innerWrap.addEventListener('mousemove', (e) => {
            if (!isActive) return;
            const rect = innerWrap.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Move reticle to cursor
            reticle.style.left = `${x}px`;
            reticle.style.top = `${y}px`;

            // Normalize to percentage coords
            const normX = Math.round((x / rect.width) * 9999);
            const normY = Math.round((y / rect.height) * 9999);

            coordHud.querySelector('.coord-x').innerText = `X: ${String(normX).padStart(4, '0')}`;
            coordHud.querySelector('.coord-y').innerText = `Y: ${String(normY).padStart(4, '0')}`;
        });
    });

    // --- TASK 17: SCROLL REVEAL OBSERVER ---
    const revealElements = document.querySelectorAll('.glass-card, .instrument-box');
    revealElements.forEach(el => el.classList.add('reveal-on-scroll'));

    const scrollRevealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                scrollRevealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => scrollRevealObserver.observe(el));

    // --- TASK 17: HOVER SOUNDS (Web Audio API) ---
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;

    function playHoverBeep() {
        if (!audioCtx) {
            audioCtx = new AudioContext();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime); // High pitch beep
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.05);
        
        gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime); // Very low volume
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
    }

    // Attach hover sound to primary buttons and interactive elements
    const hoverTargets = document.querySelectorAll('.glass-card, .instrument-box, button, .proof-link');
    hoverTargets.forEach(target => {
        target.addEventListener('mouseenter', () => {
            playHoverBeep();
        });
    });

}); // End of DOMContentLoaded