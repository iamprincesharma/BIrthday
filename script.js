/* ==========================================================================
   PREMIUM CINEMATIC BIRTHDAY WEBSITE - CORE ENGINE (VANILLA JS)
   Architecture: High-Performance Canvas Particles, Programmatic Web Audio,
   Browser SpeechSynthesis, Staggered Scene Director & Mobile Interactions.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // ----------------------------------------------------------------------
    // 1. STATE & DOM SELECTORS
    // ----------------------------------------------------------------------
    const dom = {
        wrapper: document.getElementById('app-wrapper'),
        canvas: document.getElementById('magic-canvas'),
        musicBtn: document.getElementById('music-toggle'),
        
        // Panels
        loaderPanel: document.getElementById('loader-panel'),
        scene1Panel: document.getElementById('scene-1-panel'),
        scene2Panel: document.getElementById('scene-2-panel'),
        finalePanel: document.getElementById('finale-panel'),
        
        // Buttons
        unlockBtn: document.getElementById('unlock-btn'),
        enterParkBtn: document.getElementById('enter-park-btn'),
        wishBtn: document.getElementById('wish-btn'),
        replayBtn: document.getElementById('replay-btn'),
        
        // Progress Indicator
        loadProgress: document.getElementById('load-progress'),
        
        // Elements
        shinchanTrack: document.getElementById('shinchan-track'),
        shinchanBubble: document.getElementById('shinchan-bubble'),
        shinchanOpening: document.getElementById('shinchan-opening'),
        spotlight: document.getElementById('opening-spotlight'),
        balloonsContainer: document.getElementById('balloons-container'),
        cake: document.getElementById('birthday-cake'),
        grandTitle: document.getElementById('grand-title'),
        grandQuote: document.getElementById('grand-quote'),
        
        // Stage Characters
        characters: {
            shinchan: document.getElementById('char-shinchan'),
            doraemon: document.getElementById('char-doraemon'),
            hattori: document.getElementById('char-hattori'),
            bheem: document.getElementById('char-bheem'),
            motu: document.getElementById('char-motu'),
            patlu: document.getElementById('char-patlu')
        }
    };

    // Global Interactive States
    let audioCtx = null;
    let masterGain = null;
    let isMuted = false;
    let musicTimer = null;
    let melodyIndex = 0;
    let nextNoteTime = 0;
    let isMusicPlaying = false;
    let scene1Timer = null;
    let balloonInterval = null;
    let isFinale = false;

    // ----------------------------------------------------------------------
    // 2. HIGH-PERFORMANCE 2D CANVAS PARTICLE ENGINE
    // ----------------------------------------------------------------------
    const canvas = dom.canvas;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let width = 0;
    let height = 0;

    // Handle high-DPI scaling dynamically
    function resizeCanvas() {
        const rect = dom.wrapper.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.resetTransform();
        ctx.scale(dpr, dpr);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle Base Classes
    class StarParticle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * (height * 0.7); // Constrain mostly to upper sky
            this.size = 0.5 + Math.random() * 1.5;
            this.alpha = Math.random();
            this.speed = 0.01 + Math.random() * 0.02;
            this.glow = Math.random() > 0.5;
        }
        update() {
            this.alpha += this.speed;
            if (this.alpha > 1 || this.alpha < 0) {
                this.speed = -this.speed;
            }
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
            ctx.fillStyle = '#FFF';
            if (this.glow) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#FFD700';
            }
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        isDead() { return false; }
    }

    class DustParticle {
        constructor() {
            this.reset();
            this.y = Math.random() * height; // Distribute on start
        }
        reset() {
            this.x = Math.random() * width;
            this.y = height + 10;
            this.size = 1 + Math.random() * 2;
            this.speedY = 0.3 + Math.random() * 0.8;
            this.angle = Math.random() * Math.PI * 2;
            this.swingSpeed = 0.01 + Math.random() * 0.02;
            this.alpha = 0.2 + Math.random() * 0.6;
        }
        update() {
            this.y -= this.speedY;
            this.angle += this.swingSpeed;
            this.x += Math.sin(this.angle) * 0.2;
            if (this.y < -10) {
                this.reset();
            }
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = '#FFD700';
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#FFD700';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        isDead() { return false; }
    }

    class HeartParticle {
        constructor(x, y, scaleSpeed = 0) {
            this.x = x || Math.random() * width;
            this.y = y || height + 20;
            this.size = 6 + Math.random() * 10;
            this.speedY = 0.5 + Math.random() * 1.2;
            this.angle = Math.random() * Math.PI * 2;
            this.swing = 0.01 + Math.random() * 0.02;
            this.alpha = 1;
            this.fade = 0.002 + Math.random() * 0.005;
            this.color = Math.random() > 0.5 ? '#FFB7C5' : '#E0B0FF';
        }
        update() {
            this.y -= this.speedY;
            this.angle += this.swing;
            this.x += Math.sin(this.angle) * 0.4;
            this.alpha -= this.fade;
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.alpha);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            // Draw a cute vector heart shape on canvas
            const topY = this.y - this.size / 2;
            ctx.moveTo(this.x, this.y);
            ctx.bezierCurveTo(this.x - this.size / 2, topY, this.x - this.size, topY + this.size / 3, this.x, this.y + this.size);
            ctx.bezierCurveTo(this.x + this.size, topY + this.size / 3, this.x + this.size / 2, topY, this.x, this.y);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        isDead() { return this.alpha <= 0; }
    }

    class ConfettiParticle {
        constructor(x, y, vx, vy, color) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.color = color;
            this.size = 4 + Math.random() * 6;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = -0.1 + Math.random() * 0.2;
            this.gravity = 0.15;
            this.drag = 0.98;
            this.alpha = 1.0;
            this.fade = 0.01 + Math.random() * 0.015;
            this.shape = Math.random() > 0.4 ? 'rect' : 'circle';
        }
        update() {
            this.vy += this.gravity;
            this.vx *= this.drag;
            this.vy *= this.drag;
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.rotSpeed;
            this.alpha -= this.fade;
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.alpha);
            ctx.fillStyle = this.color;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.beginPath();
            if (this.shape === 'rect') {
                ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size * 1.5);
            } else {
                ctx.arc(0, 0, this.size/2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
        isDead() { return this.alpha <= 0 || this.y > height + 20; }
    }

    class SparkleParticle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 4;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.size = 2 + Math.random() * 4;
            this.color = '#FFD700';
            this.alpha = 1.0;
            this.fade = 0.03 + Math.random() * 0.03;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.05; // slight gravity
            this.alpha -= this.fade;
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.alpha);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            
            // Draw four-pointed sparkling star
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - this.size);
            ctx.lineTo(this.x + this.size * 0.3, this.y - this.size * 0.3);
            ctx.lineTo(this.x + this.size, this.y);
            ctx.lineTo(this.x + this.size * 0.3, this.y + this.size * 0.3);
            ctx.lineTo(this.x, this.y + this.size);
            ctx.lineTo(this.x - this.size * 0.3, this.y + this.size * 0.3);
            ctx.lineTo(this.x - this.size, this.y);
            ctx.lineTo(this.x - this.size * 0.3, this.y - this.size * 0.3);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        isDead() { return this.alpha <= 0; }
    }

    class FireworkRocket {
        constructor(x, y, targetY, speed) {
            this.x = x;
            this.y = y;
            this.targetY = targetY;
            this.vy = -speed;
            this.size = 3;
            this.alpha = 1.0;
        }
        update() {
            this.y += this.vy;
            // Spawn tiny trailing sparkles
            if (Math.random() > 0.4) {
                particles.push(new SparkleParticle(this.x, this.y));
            }
        }
        draw() {
            ctx.save();
            ctx.fillStyle = '#FFF';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#FFB7C5';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        isDead() {
            if (this.y <= this.targetY) {
                // Explode!
                spawnFireworkExplosion(this.x, this.y);
                return true;
            }
            return false;
        }
    }

    class FireworkSparkle {
        constructor(x, y, vx, vy, color) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.color = color;
            this.size = 2 + Math.random() * 3;
            this.alpha = 1.0;
            this.fade = 0.015 + Math.random() * 0.02;
            this.gravity = 0.08;
            this.drag = 0.96;
        }
        update() {
            this.vy += this.gravity;
            this.vx *= this.drag;
            this.vy *= this.drag;
            this.x += this.vx;
            this.y += this.vy;
            this.alpha -= this.fade;
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.alpha);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 12;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        isDead() { return this.alpha <= 0; }
    }

    // Populate Permanent Sky Stars & Floating Dust
    for (let i = 0; i < 35; i++) {
        particles.push(new StarParticle());
    }
    for (let i = 0; i < 15; i++) {
        particles.push(new DustParticle());
    }

    // Engine Spawners
    function triggerConfettiBlast(x, y, count = 60) {
        const colors = ['#FFB7C5', '#E0B0FF', '#AEC6CF', '#FFD1B3', '#FFFDD0', '#FFD700', '#FF2A6D', '#00F5D4'];
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 7;
            const vx = Math.cos(angle) * speed;
            // Bias velocity slightly upwards
            const vy = Math.sin(angle) * speed - (2 + Math.random() * 4);
            particles.push(new ConfettiParticle(x, y, vx, vy, colors[Math.floor(Math.random() * colors.length)]));
        }
    }

    function spawnFireworkExplosion(x, y) {
        const colors = ['#FF5E7E', '#FFD700', '#AEC6CF', '#00F5D4', '#E0B0FF', '#FFFDD0'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const count = 45 + Math.floor(Math.random() * 25);
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 5.5;
            particles.push(new FireworkSparkle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                color
            ));
        }
        // Launch a couple of micro secondary delay sparkles
        setTimeout(() => {
            if (isFinale) {
                for (let i = 0; i < 8; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 0.5 + Math.random() * 2;
                    particles.push(new FireworkSparkle(
                        x + (Math.random() * 20 - 10), y + (Math.random() * 20 - 10),
                        Math.cos(angle) * speed,
                        Math.sin(angle) * speed,
                        '#FFF'
                    ));
                }
            }
        }, 150);
    }

    function launchRocket() {
        const startX = 50 + Math.random() * (width - 100);
        const startY = height;
        const targetY = 80 + Math.random() * (height * 0.4);
        const speed = 7 + Math.random() * 4;
        particles.push(new FireworkRocket(startX, startY, targetY, speed));
        playFireworkSound();
    }

    // Main 60 FPS requestAnimationFrame Loop
    function tick() {
        ctx.clearRect(0, 0, width, height);

        // Update & Render all active particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.update();
            p.draw();
            if (p.isDead()) {
                particles.splice(i, 1);
            }
        }

        // Keep ambient dust and stars populated
        const activeDustCount = particles.filter(p => p instanceof DustParticle).length;
        if (activeDustCount < 15) {
            particles.push(new DustParticle());
        }

        // Keep ambient floating hearts in finale
        if (isFinale && Math.random() > 0.96) {
            particles.push(new HeartParticle());
        }

        requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    // ----------------------------------------------------------------------
    // 3. PROGRAMMATIC WEB AUDIO MUSIC SYNTHESIZER
    // ----------------------------------------------------------------------
    const FREQS = {
        'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
        'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00
    };

    // Synthesized "Happy Birthday" melody (F major starting on C4)
    const melody = [
        { note: 'C4', dur: 0.75 }, { note: 'C4', dur: 0.25 }, { note: 'D4', dur: 1 }, { note: 'C4', dur: 1 }, { note: 'F4', dur: 1 }, { note: 'E4', dur: 2 },
        { note: 'C4', dur: 0.75 }, { note: 'C4', dur: 0.25 }, { note: 'D4', dur: 1 }, { note: 'C4', dur: 1 }, { note: 'G4', dur: 1 }, { note: 'F4', dur: 2 },
        { note: 'C4', dur: 0.75 }, { note: 'C4', dur: 0.25 }, { note: 'C5', dur: 1 }, { note: 'A4', dur: 1 }, { note: 'F4', dur: 1 }, { note: 'E4', dur: 1 }, { note: 'D4', dur: 2 },
        { note: 'Bb4', dur: 0.75 }, { note: 'Bb4', dur: 0.25 }, { note: 'A4', dur: 1 }, { note: 'F4', dur: 1 }, { note: 'G4', dur: 1 }, { note: 'F4', dur: 2.5 }
    ];

    function initAudio() {
        if (audioCtx) return;
        
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContextClass();
        masterGain = audioCtx.createGain();
        
        // Build Premium Spatial Reverb using generated White Noise Buffer
        const reverb = createReverb(audioCtx, 1.6, 2.0);
        const reverbGain = audioCtx.createGain();
        reverbGain.gain.value = 0.35;

        // Build Retro Analog Delay/Echo Loop
        const delay = audioCtx.createDelay(1.0);
        delay.delayTime.value = 0.375; // Matches ~80-100 BPM rhythmic echo
        const delayFeedback = audioCtx.createGain();
        delayFeedback.gain.value = 0.35;

        // Connections
        masterGain.connect(audioCtx.destination);
        
        masterGain.connect(delay);
        delay.connect(delayFeedback);
        delayFeedback.connect(delay); // feedback loop
        delayFeedback.connect(masterGain);

        masterGain.connect(reverb);
        reverb.connect(reverbGain);
        reverbGain.connect(audioCtx.destination);

        masterGain.gain.setValueAtTime(0.3, audioCtx.currentTime); // Perfect volume level
    }

    function createReverb(ctx, duration, decay) {
        const sampleRate = ctx.sampleRate;
        const length = sampleRate * duration;
        const impulse = ctx.createBuffer(2, length, sampleRate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);
        for (let i = 0; i < length; i++) {
            const percent = i / length;
            const val = (Math.random() * 2 - 1) * Math.pow(1 - percent, decay);
            left[i] = val;
            right[i] = val;
        }
        const convolver = ctx.createConvolver();
        convolver.buffer = impulse;
        return convolver;
    }

    // Play a single soft bell-like triangle-wave note
    function playMelodyNote(noteName, time, duration) {
        if (!audioCtx || isMuted || !FREQS[noteName]) return;
        
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(masterGain);
        
        osc.type = 'triangle'; // Soft flute/music-box woodwind tone
        osc.frequency.setValueAtTime(FREQS[noteName], time);
        
        // Bell Envelope: fast attack, linear release
        gainNode.gain.setValueAtTime(0.001, time);
        gainNode.gain.linearRampToValueAtTime(0.18, time + 0.05); // sweet soft attack
        gainNode.gain.setValueAtTime(0.18, time + duration - 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration); // smooth pop-free fade
        
        osc.start(time);
        osc.stop(time + duration);
    }

    // Play a supporting warm chord in the bass/mid frequencies
    function playChord(rootFreq, secondaryFreq, time, duration) {
        if (!audioCtx || isMuted) return;

        [rootFreq, secondaryFreq].forEach(freq => {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            osc.connect(gainNode);
            gainNode.connect(masterGain);
            
            osc.type = 'sine'; // Pure sine for warmth
            osc.frequency.setValueAtTime(freq, time);
            
            // Ultra soft backing padding envelope
            gainNode.gain.setValueAtTime(0.001, time);
            gainNode.gain.linearRampToValueAtTime(0.04, time + 0.1);
            gainNode.gain.setValueAtTime(0.04, time + duration - 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);
            
            osc.start(time);
            osc.stop(time + duration);
        });
    }

    // Choreograph matching chords to melody progression
    function playChordIfNeeded(idx, time) {
        const beatSec = 0.545; // 110 BPM
        // Align chords exactly with note starts
        if (idx === 0) playChord(87.31, 130.81, time, beatSec * 6); // F Major chord (F2, C3)
        if (idx === 5) playChord(65.41, 164.81, time, beatSec * 6); // C Major chord (C2, E3)
        if (idx === 11) playChord(87.31, 130.81, time, beatSec * 6); // F Major
        if (idx === 14) playChord(58.27, 146.83, time, beatSec * 4); // Bb Major chord (Bb1, D3)
        if (idx === 18) playChord(65.41, 98.00, time, beatSec * 2);   // C Major (C2, G2)
        if (idx === 21) playChord(87.31, 130.81, time, beatSec * 4); // F Major
    }

    // Sequencer scheduler engine
    function runSequencer() {
        if (!isMusicPlaying) return;
        
        const beatSec = 0.545; // 110 BPM
        const note = melody[melodyIndex];
        const duration = note.dur * beatSec;
        
        if (audioCtx.currentTime > nextNoteTime - 0.1) {
            playMelodyNote(note.note, nextNoteTime, duration);
            playChordIfNeeded(melodyIndex, nextNoteTime);
            
            nextNoteTime += duration;
            melodyIndex = (melodyIndex + 1) % melody.length;
        }
        
        // Loop back scheduler
        const lookahead = (nextNoteTime - audioCtx.currentTime) * 1000 - 45;
        musicTimer = setTimeout(runSequencer, Math.max(10, lookahead));
    }

    function startMusicEngine() {
        initAudio();
        if (isMusicPlaying) return;
        isMusicPlaying = true;
        nextNoteTime = audioCtx.currentTime + 0.1;
        runSequencer();
        dom.musicBtn.classList.add('playing');
    }

    function stopMusicEngine() {
        isMusicPlaying = false;
        clearTimeout(musicTimer);
        dom.musicBtn.classList.remove('playing');
    }

    // Programmatic Sound Effects
    function playPopSound() {
        if (!audioCtx || isMuted) return;
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(masterGain);
        
        // Balloon pop is a fast downward pitch sweep
        osc.frequency.setValueAtTime(450, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.12);
        
        gainNode.gain.setValueAtTime(0.28, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.12);
    }

    function playSparkleSound() {
        if (!audioCtx || isMuted) return;
        const freqs = [1000, 1350, 1600, 1950, 2200];
        freqs.forEach((freq, idx) => {
            const time = audioCtx.currentTime + idx * 0.04;
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            osc.connect(gainNode);
            gainNode.connect(masterGain);
            
            osc.frequency.setValueAtTime(freq, time);
            gainNode.gain.setValueAtTime(0.06, time);
            gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
            
            osc.start(time);
            osc.stop(time + 0.08);
        });
    }

    function playFireworkSound() {
        if (!audioCtx || isMuted) return;
        
        // Low frequency thud/boom
        const osc = audioCtx.createOscillator();
        const oscGain = audioCtx.createGain();
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        
        osc.frequency.setValueAtTime(140, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(25, audioCtx.currentTime + 0.35);
        oscGain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);

        // High frequency fizzle noise
        const bufferSize = audioCtx.sampleRate * 0.25;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(900, audioCtx.currentTime);
        filter.Q.setValueAtTime(1.8, audioCtx.currentTime);

        const noiseGain = audioCtx.createGain();
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(masterGain);

        noiseGain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);

        noise.start();
        noise.stop(audioCtx.currentTime + 0.25);
    }

    // ----------------------------------------------------------------------
    // 4. MUSIC CONTROLLER UI TOGGLE
    // ----------------------------------------------------------------------
    dom.musicBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        if (isMuted) {
            dom.musicBtn.classList.add('muted');
            dom.musicBtn.classList.remove('playing');
        } else {
            dom.musicBtn.classList.remove('muted');
            if (isMusicPlaying) {
                dom.musicBtn.classList.add('playing');
            } else {
                startMusicEngine();
            }
        }
    });

    // ----------------------------------------------------------------------
    // 5. INTRO SCREEN SIMULATOR (LOADER)
    // ----------------------------------------------------------------------
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 8) + 4;
        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
            
            // Fade out the progress line & Reveal magical button
            dom.loadProgress.style.width = '100%';
            setTimeout(() => {
                dom.loadProgress.parentElement.style.opacity = '0';
                dom.loadProgress.parentElement.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    dom.loadProgress.parentElement.classList.add('hidden');
                    dom.unlockBtn.classList.remove('hidden');
                }, 400);
            }, 500);
        } else {
            dom.loadProgress.style.width = progress + '%';
        }
    }, 120);

    // Click trigger to transition from loading screen to Scene 1
    dom.unlockBtn.addEventListener('click', () => {
        // Unlock Web Audio API instantly with first interaction
        startMusicEngine();
        dom.musicBtn.disabled = false;
        
        // Dissolve Loader Panel
        dom.loaderPanel.classList.remove('active');
        
        // Set spotlight coordinate start matching offscreen Shinchan
        dom.spotlight.style.background = `radial-gradient(circle at -150px 75%, rgba(255, 255, 255, 0.3) 0%, rgba(0,0,0,0.96) 55%)`;
        
        // Activate Scene 1 Panel
        setTimeout(() => {
            dom.scene1Panel.classList.add('active');
            triggerScene1Flow();
        }, 300);
    });

    // ----------------------------------------------------------------------
    // 6. SCENE 1 DIRECTOR (SHINCHAN WALKS IN & GREETS)
    // ----------------------------------------------------------------------
    function triggerScene1Flow() {
        const shinchanTrack = dom.shinchanTrack;
        const shinchanChar = dom.shinchanOpening;
        
        // Initialize walk animation
        shinchanChar.classList.add('walking');
        let currentPos = -150;
        const targetPos = Math.floor(width / 2) - 55; // perfectly centered coordinates
        
        const walkInterval = setInterval(() => {
            currentPos += 2.5; // step forward rate
            shinchanTrack.style.left = currentPos + 'px';
            
            // Move spotlight to track Shinchan walk
            dom.spotlight.style.background = `radial-gradient(circle at ${currentPos + 55}px 75%, rgba(255, 255, 255, 0.32) 0%, rgba(0,0,0,0.96) 55%)`;
            
            if (currentPos >= targetPos) {
                clearInterval(walkInterval);
                
                // Switch walk cycle to waving/blinking pose
                shinchanChar.classList.remove('walking');
                shinchanChar.classList.add('waving');
                
                // Slight bounce joy delay, then speak!
                setTimeout(() => {
                    triggerShinchanGreeting();
                }, 400);
            }
        }, 30);
    }

    function triggerShinchanGreeting() {
        // Pop Speech Bubble
        dom.shinchanBubble.classList.remove('hidden');
        
        const mouthElement = document.getElementById('shin-mouth');
        
        // Start lip syncing
        mouthElement.classList.add('talking');
        
        // Play the pre-recorded MP3 voice
        const voice = document.getElementById("shinchanVoice");
        
        if (voice) {
            voice.currentTime = 0;
            voice.play().catch(err => {
                console.warn("Autoplay blocked or audio load failed:", err);
                // Fallback: trigger after a delay so the experience doesn't break
                setTimeout(() => {
                    mouthElement.classList.remove("talking");
                    shinchanGreetingComplete();
                }, 2500);
            });
            
            voice.onended = () => {
                mouthElement.classList.remove("talking");
                shinchanGreetingComplete();
            };
        } else {
            console.error("Audio element with id 'shinchanVoice' was not found in the HTML.");
            // Fallback if the element does not exist
            setTimeout(() => {
                mouthElement.classList.remove("talking");
                shinchanGreetingComplete();
            }, 2500);
        }
    }

    function shinchanGreetingComplete() {
        // Wiggle Shinchan in happiness
        dom.shinchanOpening.classList.add('character-dance-state');
        
        // Reveal Park Entrance Button
        setTimeout(() => {
            dom.enterParkBtn.classList.remove('hidden');
            
            // Auto advance after 4.5 seconds of no activity (Fully handsfree cinematic flow)
            scene1Timer = setTimeout(() => {
                if (dom.scene1Panel.classList.contains('active')) {
                    dom.enterParkBtn.click();
                }
            }, 4500);
        }, 500);
    }

    // Manual Skip / Entrance Button Trigger
    dom.enterParkBtn.addEventListener('click', () => {
        clearTimeout(scene1Timer);
        
        // Trigger giant colorful transition explosion!
        triggerConfettiBlast(width / 2, height / 2, 80);
        playPopSound();
        
        // Shift Scene Panels
        dom.scene1Panel.classList.remove('active');
        dom.scene2Panel.classList.add('active');
        
        // Initialize Scene 2 content
        triggerScene2Flow();
    });

    // ----------------------------------------------------------------------
    // 7. SCENE 2 DIRECTOR (PARK ENTRANCES & CELEBRATION PLAYGROUND)
    // ----------------------------------------------------------------------
    function triggerScene2Flow() {
        
        // Staggered Character Entrances with custom timings
        const schedule = [
            { id: 'shinchan', delay: 100, anim: 'slide' },
            { id: 'doraemon', delay: 1200, anim: 'fly' },
            { id: 'hattori', delay: 2600, anim: 'ninja' },
            { id: 'bheem', delay: 3800, anim: 'run' },
            { id: 'motu', delay: 5200, anim: 'dance' },
            { id: 'patlu', delay: 5600, anim: 'dance' }
        ];

        schedule.forEach(char => {
            setTimeout(() => {
                enterCharacterCinematically(char.id, char.anim);
            }, char.delay);
        });

        // Enable floating balloons spawning infinitely
        balloonInterval = setInterval(() => {
            if (!isFinale) spawnFloatingBalloon();
        }, 2500);

        // Reveal the final Wish Trigger Button after friends assemble
        setTimeout(() => {
            document.getElementById('park-actions').classList.add('show');
        }, 7000);
    }

    function enterCharacterCinematically(id, style) {
        const charElement = dom.characters[id];
        charElement.classList.add('visible');

        // Dynamic Entrance Choreography
        if (style === 'slide') {
            // Shinchan steps in from left to position
            charElement.style.left = '6%';
            charElement.classList.add('character-wave-state');
            setTimeout(() => {
                triggerIndividualBubble(id, "I'm back, Anbi! ✨", 2000);
            }, 800);
        }
        else if (style === 'fly') {
            // Doraemon floats down with propeller spinning
            charElement.style.bottom = '12%';
            playSparkleSound();
            setTimeout(() => {
                charElement.classList.add('character-wave-state');
                triggerIndividualBubble(id, "Doracake Party! 🥞", 2200);
            }, 1000);
        }
        else if (style === 'ninja') {
            // Hattori drops down from above in a puff of smoke
            const smoke = charElement.querySelector('.ninja-smoke-cloud');
            smoke.classList.remove('hidden');
            smoke.classList.add('smoke-explode');
            
            charElement.style.bottom = '14%';
            playPopSound();
            
            setTimeout(() => {
                charElement.classList.add('character-wave-state');
                triggerIndividualBubble(id, "Nin-nin! ⚔️", 2200);
            }, 600);
        }
        else if (style === 'run') {
            // Bheem runs from right edge to position
            charElement.style.left = '74%';
            setTimeout(() => {
                charElement.classList.add('character-wave-state');
                triggerIndividualBubble(id, "Laddoo power! 😋", 2200);
            }, 800);
        }
        else if (style === 'dance') {
            // Motu & Patlu slide in side-by-side dancing
            if (id === 'motu') charElement.style.left = '20%';
            if (id === 'patlu') charElement.style.left = '48%';
            
            setTimeout(() => {
                charElement.classList.add('character-dance-state');
                const text = (id === 'motu') ? "Samosas are ready! 🥟" : "Anbi, make a wish! 💡";
                triggerIndividualBubble(id, text, 2500);
            }, 1000);
        }
    }

    function triggerIndividualBubble(charId, text, duration = 2000) {
        const bubble = dom.characters[charId].querySelector('.char-bubble');
        if (!bubble) return;
        
        bubble.innerText = text;
        bubble.classList.add('active');
        
        setTimeout(() => {
            bubble.classList.remove('active');
        }, duration);
    }

    // ----------------------------------------------------------------------
    // 8. INTERACTIVE BALLOON ENGINE
    // ----------------------------------------------------------------------
    function spawnFloatingBalloon() {
        const balloon = document.createElement('div');
        balloon.className = 'balloon-entity';
        
        // Random Premium Gradient Colors
        const colors = [
            { bg: 'linear-gradient(135deg, #FFB7C5, #E63946)', line: '#E63946' }, // Pink/Red
            { bg: 'linear-gradient(135deg, #AEC6CF, #4361EE)', line: '#4361EE' }, // Blue
            { bg: 'linear-gradient(135deg, #E0B0FF, #7209B7)', line: '#7209B7' }, // Purple
            { bg: 'linear-gradient(135deg, #FFD1B3, #F3722C)', line: '#F3722C' }, // Orange
            { bg: 'linear-gradient(135deg, #FFFDD0, #FFD700)', line: '#FFD700' }  // Gold
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        balloon.style.background = color.bg;
        balloon.style.left = 30 + Math.random() * (width - 80) + 'px';
        
        // Structure balloon string
        const knot = document.createElement('div');
        knot.className = 'balloon-knot';
        const string = document.createElement('div');
        string.className = 'balloon-string';
        
        balloon.appendChild(knot);
        balloon.appendChild(string);
        dom.balloonsContainer.appendChild(balloon);

        // Animate up
        let bottomPos = -80;
        const driftSpeed = 1.2 + Math.random() * 1.5;
        const swingFactor = 1 + Math.random() * 2;
        let swayTime = Math.random() * 100;

        function floatUp() {
            if (isFinale || !balloon.parentNode) {
                balloon.remove();
                return;
            }

            bottomPos += driftSpeed;
            swayTime += 0.03;
            
            balloon.style.bottom = bottomPos + 'px';
            balloon.style.transform = `translateX(${Math.sin(swayTime) * swingFactor}px)`;

            if (bottomPos < height + 100) {
                requestAnimationFrame(floatUp);
            } else {
                balloon.remove();
            }
        }
        requestAnimationFrame(floatUp);

        // Tap-to-Pop Interaction
        balloon.addEventListener('touchstart', (e) => {
            e.preventDefault();
            popBalloon(balloon);
        });
        balloon.addEventListener('mousedown', () => {
            popBalloon(balloon);
        });
    }

    function popBalloon(element) {
        const rect = element.getBoundingClientRect();
        const wrapperRect = dom.wrapper.getBoundingClientRect();
        
        // Relative canvas coordinate mapping
        const x = rect.left - wrapperRect.left + (rect.width / 2);
        const y = rect.top - wrapperRect.top + (rect.height / 2);
        
        // Spawn pop particles & Sound
        triggerConfettiBlast(x, y, 20);
        playPopSound();
        element.remove();
    }

    // ----------------------------------------------------------------------
    // 9. STAGE CHARACTER AND FLOATING ICE CREAM TAP ACTIONS
    // ----------------------------------------------------------------------
    
    // Wire up stage character click responses
    Object.keys(dom.characters).forEach(key => {
        const char = dom.characters[key];
        
        const triggerInteraction = () => {
            if (isFinale) return;
            
            // Spawn star sparkles at character top coordinates
            const rect = char.getBoundingClientRect();
            const wrapperRect = dom.wrapper.getBoundingClientRect();
            const x = rect.left - wrapperRect.left + (rect.width / 2);
            const y = rect.top - wrapperRect.top + (rect.height / 3);
            
            for (let i = 0; i < 15; i++) {
                particles.push(new SparkleParticle(x, y));
            }
            playSparkleSound();
            
            // Trigger customized cartoon quotes on tap
            const quotes = {
                shinchan: ["Hehe, do you like my dance? 🍑", "Let's eat laddoos together, Anbi!", "Buri Buri Zaemon! 🐷"],
                doraemon: ["I brought a magic tool for your wish! 🎒", "Anbi is my best friend! 💙", "Take copter zoom! 🚁"],
                hattori: ["Nin-nin! Keep smiling always, Anbi!", "Ninja run is super fast! 💨", "Ninja smoke vanish! 🌫️"],
                bheem: ["Dholakpur ki Shakti is with you! 💪", "Eat a laddoo and feel super strong!", "Let's party together!"],
                motu: ["Samosas are sweeter on Anbi's birthday!", "Khaali pet mere dimaag ki batti nahi jalti! 💡", "Yahoo! Dance with me!"],
                patlu: ["Your smile is brighter than any idea! 💡", "Motu, stop thinking about samosas now!", "Happy Birthday, Dear Anbi! ✨"]
            };
            
            const randomQuote = quotes[key][Math.floor(Math.random() * quotes[key].length)];
            triggerIndividualBubble(key, randomQuote, 2500);

            // Temporary dance wiggle boost
            char.classList.add('character-dance-state');
            setTimeout(() => {
                if (!isFinale) char.classList.remove('character-dance-state');
            }, 2000);
        };

        char.addEventListener('mousedown', triggerInteraction);
        char.addEventListener('touchstart', (e) => {
            e.preventDefault();
            triggerInteraction();
        });
    });

    // Wire up floating ice creams rotation
    document.querySelectorAll('.floating-icecream').forEach(icecream => {
        const tapIceCream = () => {
            const rect = icecream.getBoundingClientRect();
            const wrapperRect = dom.wrapper.getBoundingClientRect();
            const x = rect.left - wrapperRect.left + (rect.width / 2);
            const y = rect.top - wrapperRect.top + (rect.height / 2);

            for (let i = 0; i < 12; i++) {
                particles.push(new SparkleParticle(x, y));
            }
            playSparkleSound();

            icecream.style.transform = 'scale(1.4) rotate(360deg)';
            setTimeout(() => {
                icecream.style.transform = '';
            }, 600);
        };

        icecream.addEventListener('mousedown', tapIceCream);
        icecream.addEventListener('touchstart', (e) => {
            e.preventDefault();
            tapIceCream();
        });
    });

    // ----------------------------------------------------------------------
    // 10. SCENE 3 & 4 DIRECTOR (GRAND FINALE & CAKE REVEAL)
    // ----------------------------------------------------------------------
    let fireworkInterval = null;

    dom.wishBtn.addEventListener('click', () => {
        isFinale = true;
        clearInterval(balloonInterval);
        
        // Hide make a wish trigger
        document.getElementById('park-actions').classList.remove('show');
        
        // Cinematic Zoom/Pan Camera layout transition
        dom.scene2Panel.classList.add('finale-zoom');

        // Bring characters closer together to assemble around the rising cake!
        assembleCharactersAroundCake();

        // Reveal the magical birthday cake
        setTimeout(() => {
            dom.cake.classList.remove('hidden');
            dom.cake.classList.add('visible');
            playSparkleSound();
        }, 800);

        // Transition to Grand Finale lighting & content overlay
        setTimeout(() => {
            dom.finalePanel.classList.add('active');
            
            // Spawn majestic Fireworks continuously
            fireworkInterval = setInterval(() => {
                if (isFinale) launchRocket();
            }, 1000);

            // Scale in glowing 3D Heading
            setTimeout(() => {
                dom.grandTitle.classList.add('visible');
                triggerConfettiBlast(width / 2, height / 3, 50);
            }, 1000);

            // Fade in emotional handwritten blessing
            setTimeout(() => {
                dom.grandQuote.classList.add('visible');
                
                // Gently fade background synthesizer volume for quiet warmth
                if (masterGain) {
                    masterGain.gain.exponentialRampToValueAtTime(0.18, audioCtx.currentTime + 3.0);
                }
            }, 3000);

            // Reveal replay button
            setTimeout(() => {
                dom.replayBtn.classList.remove('hidden');
                dom.replayBtn.classList.add('visible');
            }, 5500);

        }, 1500);
    });

    function assembleCharactersAroundCake() {
        // Precise coordinates to fit screen without overlaps (Staggered around Center Cake)
        const placements = {
            shinchan: { left: '10%', bottom: '5%' },
            doraemon: { left: '26%', bottom: '10%' },
            hattori: { left: '62%', bottom: '11%' },
            bheem: { left: '76%', bottom: '5%' },
            motu: { left: '22%', bottom: '2%' },
            patlu: { left: '48%', bottom: '1%' }
        };

        Object.keys(placements).forEach(key => {
            const char = dom.characters[key];
            char.style.left = placements[key].left;
            char.style.bottom = placements[key].bottom;
            
            // Force all into joy waving/dancing states in unison
            char.classList.remove('character-wave-state');
            char.classList.add('character-dance-state');
        });
    }

    // ----------------------------------------------------------------------
    // 11. CELEBRATE AGAIN (REPLAY CONTROLLER)
    // ----------------------------------------------------------------------
    dom.replayBtn.addEventListener('click', () => {
        isFinale = false;
        clearInterval(fireworkInterval);
        
        // Reset Volume
        if (masterGain) {
            masterGain.gain.exponentialRampToValueAtTime(0.3, audioCtx.currentTime + 1.0);
        }

        // Dissolve Panels
        dom.finalePanel.classList.remove('active');
        dom.scene2Panel.classList.remove('finale-zoom');
        dom.cake.classList.remove('visible');
        dom.cake.classList.add('hidden');
        dom.grandTitle.classList.remove('visible');
        dom.grandQuote.classList.remove('visible');
        dom.replayBtn.classList.remove('visible');
        dom.replayBtn.classList.add('hidden');
        document.getElementById('park-actions').classList.remove('show');

        // Reset Character positions
        const resetPlacements = {
            shinchan: { left: '6%', bottom: '6%' },
            doraemon: { left: '28%', bottom: '12%' },
            hattori: { left: '54%', bottom: '14%' },
            bheem: { left: '74%', bottom: '6%' },
            motu: { left: '20%', bottom: '2%' },
            patlu: { left: '48%', bottom: '1%' }
        };

        Object.keys(resetPlacements).forEach(key => {
            const char = dom.characters[key];
            char.style.left = resetPlacements[key].left;
            char.style.bottom = resetPlacements[key].bottom;
            char.classList.remove('character-dance-state');
            char.classList.remove('character-wave-state');
        });

        // Take back to Scene 2 and trigger fresh staggered layout
        triggerScene2Flow();
    });

});
