// PahadiCart "Bol Kar Order Karein" Voice-to-Cart Engine
(function() {
  class PahadiVoiceOrderEngine {
    constructor() {
      this.recognition = null;
      this.isListening = false;
      this.initSpeech();
    }

    initSpeech() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'hi-IN';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;

        this.recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          console.log('🎤 Voice Speech Recognized:', transcript);
          this.processVoiceText(transcript);
        };

        this.recognition.onerror = (event) => {
          console.warn('Speech recognition error:', event.error);
          this.setListeningStatus(false, 'Aawaz sunne mein samasya hui. Dobara bolein.');
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.setListeningStatus(false, 'Mic band hai. Tap karein bolne ke liye.');
        };
      }
    }

    openVoiceModal() {
      const existing = document.getElementById('pahadiVoiceModal');
      if (existing) existing.remove();

      const modal = document.createElement('div');
      modal.id = 'pahadiVoiceModal';
      modal.style.cssText = 'position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(2,6,23,0.85); backdrop-filter:blur(8px); z-index:999999; display:flex; align-items:center; justify-content:center; padding:16px; font-family:var(--font-sans, sans-serif);';

      modal.innerHTML = [
        '<div style="background:#0f172a; border:1px solid rgba(16,185,129,0.3); border-radius:24px; max-width:440px; width:100%; padding:28px 24px; text-align:center; color:#f8fafc; box-shadow:0 20px 50px rgba(0,0,0,0.8); position:relative;">',
          '<button onclick="window.pahadiVoice.closeModal()" style="position:absolute; top:16px; right:16px; background:none; border:none; color:#94a3b8; font-size:18px; cursor:pointer;">✕</button>',
          '<div style="display:inline-block; background:rgba(16,185,129,0.15); color:#10b981; font-size:11px; font-weight:800; padding:3px 10px; border-radius:20px; margin-bottom:12px;">',
            '🎙️ BOL KAR ORDER KAREIN (VOICE-TO-CART)',
          '</div>',
          '<h3 style="font-size:18px; font-weight:800; margin-bottom:6px; color:#ffffff;">Aapki Aawaz, Aapka Samaan</h3>',
          '<p style="font-size:12.5px; color:#94a3b8; margin-bottom:24px;">Hindi ya aam Pahadi bolchaal mein bolein, samaan turant cart mein add ho jayega.</p>',
          
          '<!-- Animated Pulsing Mic Button -->',
          '<div style="position:relative; width:110px; height:110px; margin:0 auto 20px; display:flex; align-items:center; justify-content:center;">',
            '<div id="micPulseRing" style="position:absolute; width:100%; height:100%; border-radius:50%; background:rgba(16,185,129,0.25); animation:voicePulse 1.5s infinite;"></div>',
            '<button id="micActiveBtn" onclick="window.pahadiVoice.toggleListen()" style="position:relative; width:80px; height:80px; border-radius:50%; background:linear-gradient(135deg, #10b981, #047857); border:none; color:#fff; font-size:34px; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 10px 25px rgba(16,185,129,0.5);">',
              '🎤',
            '</button>',
          '</div>',

          '<div id="voiceStatusText" style="font-size:13.5px; font-weight:700; color:#34d399; margin-bottom:16px; min-height:20px;">',
            'Sun raha hoon... Boliye!',
          '</div>',

          '<!-- Quick Spoken Sample Chips for 1-Click Simulation -->',
          '<div style="border-top:1px dashed rgba(255,255,255,0.1); padding-top:14px; text-align:left;">',
            '<div style="font-size:10.5px; color:#94a3b8; margin-bottom:8px; font-weight:700;">SAMPLE VOICE PROMPTS (CLICK TO TRY):</div>',
            '<div style="display:flex; flex-direction:column; gap:6px;">',
              '<button onclick="window.pahadiVoice.simulateVoicePrompt(\'2 Siddu aur 1kg Kinnaur seb bhej do Shamti\')" style="background:#1e293b; border:1px solid rgba(255,255,255,0.08); color:#cbd5e1; padding:8px 12px; border-radius:10px; font-size:11.5px; text-align:left; cursor:pointer;">',
                '🗣️ "2 Siddu aur 1kg Kinnaur seb bhej do Shamti"',
              '</button>',
              '<button onclick="window.pahadiVoice.simulateVoicePrompt(\'Hot Thukpa aur momo chahiye The Ridge pe\')" style="background:#1e293b; border:1px solid rgba(255,255,255,0.08); color:#cbd5e1; padding:8px 12px; border-radius:10px; font-size:11.5px; text-align:left; cursor:pointer;">',
                '🗣️ "Hot Thukpa aur momo chahiye The Ridge pe"',
              '</button>',
              '<button onclick="window.pahadiVoice.simulateVoicePrompt(\'Chamba Rajma aur Kangra Chai bhej do Bhagsunag\')" style="background:#1e293b; border:1px solid rgba(255,255,255,0.08); color:#cbd5e1; padding:8px 12px; border-radius:10px; font-size:11.5px; text-align:left; cursor:pointer;">',
                '🗣️ "Chamba Rajma aur Kangra Chai bhej do Bhagsunag"',
              '</button>',
            '</div>',
          '</div>',
        '</div>'
      ].join('');

      if (!document.getElementById('voicePulseStyles')) {
        const style = document.createElement('style');
        style.id = 'voicePulseStyles';
        style.innerHTML = '@keyframes voicePulse { 0% { transform: scale(0.95); opacity: 0.8; } 50% { transform: scale(1.3); opacity: 0.2; } 100% { transform: scale(0.95); opacity: 0.8; } }';
        document.head.appendChild(style);
      }

      document.body.appendChild(modal);
      this.startListening();
    }

    startListening() {
      if (this.recognition) {
        try {
          this.recognition.start();
          this.isListening = true;
          this.setListeningStatus(true, 'Sun raha hoon... Boliye!');
        } catch(e) {
          console.log('Recognition already active or blocked:', e);
        }
      } else {
        this.setListeningStatus(true, 'Mic simulate ready. Boliye ya sample click karein!');
      }
    }

    toggleListen() {
      if (this.isListening) {
        if (this.recognition) this.recognition.stop();
        this.isListening = false;
        this.setListeningStatus(false, 'Mic paused. Tap to speak again.');
      } else {
        this.startListening();
      }
    }

    setListeningStatus(listening, text) {
      const el = document.getElementById('voiceStatusText');
      if (el) el.innerText = text;
      const ring = document.getElementById('micPulseRing');
      if (ring) ring.style.display = listening ? 'block' : 'none';
    }

    processVoiceText(transcript) {
      this.setListeningStatus(false, '“' + transcript + '” Samjha gaya!');
      
      const currentTown = window.customerApp ? window.customerApp.currentTown : 'solan';
      const parsed = window.pahadiWA ? window.pahadiWA.parseOrderText(transcript, currentTown) : { items: [], colony: 'Shamti' };

      setTimeout(() => {
        if (window.customerApp) {
          parsed.items.forEach(it => {
            const product = (window.PAHADICART_DATA && window.PAHADICART_DATA.products || []).find(p => p.id === it.id) || {
              id: it.id,
              name: it.name,
              price: it.price,
              image: '🍎'
            };
            for (let i = 0; i < it.qty; i++) {
              window.customerApp.addToCart(product);
            }
          });
        }

        if ('speechSynthesis' in window) {
          const speech = new SpeechSynthesisUtterance(
            'Shandar! Aapke cart mein ' + parsed.items.length + ' items add kar diye gaye hain.'
          );
          speech.lang = 'hi-IN';
          window.speechSynthesis.speak(speech);
        }

        const itemsSummary = parsed.items.map(i => i.qty + 'x ' + i.name.split('(')[0]).join(', ');
        alert('🎙️ Voice Recognized: "' + transcript + '"\n\n✅ Cart mein ' + itemsSummary + ' safaltapoorvak add ho gaye!');
        this.closeModal();
      }, 700);
    }

    simulateVoicePrompt(phrase) {
      this.processVoiceText(phrase);
    }

    closeModal() {
      if (this.recognition) {
        try { this.recognition.stop(); } catch(e) {}
      }
      this.isListening = false;
      const modal = document.getElementById('pahadiVoiceModal');
      if (modal) modal.remove();
    }
  }

  window.pahadiVoice = new PahadiVoiceOrderEngine();
})();
