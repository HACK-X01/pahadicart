// PahadiCart WhatsApp Conversational Commerce & Mountain Voice IVR Engine
(function() {
  class PahadiWhatsAppBot {
    constructor() {
      this.chatHistory = [
        { sender: 'bot', text: 'Namaste ji! 🙏 Main PahadiCart WhatsApp Assistant hoon. Aap yahan aam bolchaal (Hindi/Hinglish) mein likh kar direct order de sakte hain!\n\nJaise: \"Bhaiya 1kg Kinnaur seb aur 2 Siddu bhej do Shamti mein\"', time: 'Abhi' }
      ];
      this.isOpen = false;
      this.initUI();
    }

    parseOrderText(input, townId = 'solan') {
      const text = input.toLowerCase();
      const data = window.PAHADICART_DATA || {};
      const allProducts = data.products || [];
      const matchedItems = [];

      // Keyword dictionaries
      const keywords = [
        { terms: ['seb', 'apple', 'apples', 'kinnaur'], id: 'p-1', name: 'Kinnaur Crisp Royal Delicious Apples (1 kg)', price: 140 },
        { terms: ['siddu', 'sidu', 'seedu'], id: 'p-2', name: 'Fresh Siddu Dough & Roasted Walnut Kit', price: 180 },
        { terms: ['momo', 'momos'], id: 'p-7', name: 'Steamed Pahadi Veggie Momos (8 pcs)', price: 110 },
        { terms: ['thukpa', 'thukpa soup'], id: 'p-8', name: 'Hot Tibetan Noodle Thukpa Soup', price: 130 },
        { terms: ['mushroom', 'mushrooms', 'khumb'], id: 'p-4', name: 'Solan Fresh White Button Mushrooms (400g)', price: 90 },
        { terms: ['rajma', 'rajmah'], id: 'p-5', name: 'Traditional Chamba Red Rajma (1 kg)', price: 165 },
        { terms: ['tea', 'chai', 'green tea'], id: 'p-3', name: 'Kangra Valley Organic Orthodox Green Tea (250g)', price: 220 },
        { terms: ['halwa', 'badam halwa'], id: 'p-201', name: 'Himachali Walnut & Badam Halwa (500g)', price: 280 },
        { terms: ['tingmo', 'shapta'], id: 'p-301', name: 'Authentic Steamed Tingmo & Veg Shapta', price: 220 }
      ];

      keywords.forEach(k => {
        const found = k.terms.some(term => text.includes(term));
        if (found) {
          // Detect quantity
          let qty = 1;
          if (text.includes('2kg') || text.includes('2 ') || text.includes('do ')) qty = 2;
          if (text.includes('3kg') || text.includes('3 ') || text.includes('teen ')) qty = 3;
          matchedItems.push({ id: k.id, name: k.name, price: k.price, qty });
        }
      });

      // If no item matched, fallback to apples & siddu
      if (matchedItems.length === 0) {
        matchedItems.push({ id: 'p-1', name: 'Kinnaur Crisp Royal Delicious Apples (1 kg)', price: 140, qty: 1 });
        matchedItems.push({ id: 'p-2', name: 'Fresh Siddu Dough & Roasted Walnut Kit', price: 180, qty: 1 });
      }

      // Detect Colony / Landmark
      let colony = 'Shamti, Upper Pine Lane';
      if (text.includes('mall road') || text.includes('mall')) colony = 'Mall Road Lower Bazaar';
      if (text.includes('sanjauli')) colony = 'Sanjauli Switchback Lane';
      if (text.includes('ridge')) colony = 'The Ridge Heritage Post';
      if (text.includes('bhagsunag') || text.includes('bhagsu')) colony = 'Bhagsunag Waterfall Trail';
      if (text.includes('mcleod') || text.includes('square')) colony = 'McLeod Ganj Main Square';
      if (text.includes('kotwali')) colony = 'Kotwali Bazaar';

      return { items: matchedItems, colony };
    }

    sendUserMessage(text) {
      if (!text || !text.trim()) return;
      const cleanText = text.trim();
      this.chatHistory.push({ sender: 'user', text: cleanText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
      this.renderMessages();

      const currentTown = window.customerApp?.currentTown || 'solan';
      const parsed = this.parseOrderText(cleanText, currentTown);

      setTimeout(() => {
        // Create live order
        const orderId = 'ORD-' + Math.floor(3000 + Math.random() * 6000);
        const itemTotal = parsed.items.reduce((s, i) => s + (i.price * i.qty), 0);
        const grandTotal = itemTotal + 25 + 25 + 15; // delivery + stairs + elevation

        const newOrder = {
          id: orderId,
          town: currentTown,
          customer: {
            name: 'Aarav Sharma (WhatsApp)',
            phone: '98160-12890',
            colony: parsed.colony,
            address: 'Delivered via WhatsApp Chat Ordering',
            staircaseDetails: 'Descend 25 stairs from main road',
            hasStairs: true
          },
          items: parsed.items,
          pricing: { itemTotal, deliveryFee: 25, totalAmount: grandTotal },
          status: 'placed',
          otp: String(Math.floor(1000 + Math.random() * 9000)),
          source: 'whatsapp'
        };

        if (window.pahadiBus) {
          window.pahadiBus.placeOrder(newOrder);
        }

        const botReply = '✅ Order Confirmed via WhatsApp! 🏔️\n\n' +
          '• Order ID: *' + orderId + '*\n' +
          '• Items: ' + parsed.items.map(i => i.qty + 'x ' + i.name).join(', ') + '\n' +
          '• Drop Location: *' + parsed.colony + '*\n' +
          '• Total Amount: *₹' + grandTotal + '* (COD / UPI on Doorstep)\n\n' +
          '🔔 *Dukandar ko \"Ghar Ki Ghanti\" chime chala gaya hai!* Nearest rider jaldi hi deliver karega.';

        this.chatHistory.push({ sender: 'bot', text: botReply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
        this.renderMessages();

        // Trigger simulated voice IVR to shopkeeper
        this.playShopkeeperVoiceCall(orderId, parsed.items);
      }, 1000);
    }

    playShopkeeperVoiceCall(orderId, items) {
      console.log('📞 Triggering automated Hindi IVR call to Merchant for ' + orderId);
      
      // Play bell chime first
      if (window.hillAudio && window.hillAudio.playMerchantChime) {
        window.hillAudio.playMerchantChime();
      }

      // Native SpeechSynthesis in Hindi
      if ('speechSynthesis' in window) {
        const itemNames = items.map(i => i.qty + ' ' + i.name.split('(')[0]).join(' aur ');
        const speech = new SpeechSynthesisUtterance(
          'Namaskar Sharma Ji! PahadiCart se naya WhatsApp order aaya hai. ' + itemNames + '. Kripya counter par check karein.'
        );
        speech.lang = 'hi-IN';
        speech.rate = 0.95;
        window.speechSynthesis.speak(speech);
      }
    }

    initUI() {
      // Create Floating WhatsApp Widget
      const widget = document.createElement('div');
      widget.id = 'pahadiWhatsAppWidget';
      widget.innerHTML = `
        <!-- Floating Button -->
        <div id="waFloatingBtn" onclick="window.pahadiWA.toggleChat()" style="position:fixed; bottom:24px; right:24px; width:58px; height:58px; border-radius:50%; background:#25D366; box-shadow:0 10px 25px rgba(37,211,102,0.45); display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:99999; transition:transform 0.2s ease;">
          <svg style="width:34px; height:34px; fill:#ffffff;" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z"/>
          </svg>
          <span style="position:absolute; top:-4px; right:-4px; background:#ef4444; color:#fff; font-size:10px; font-weight:800; padding:2px 6px; border-radius:10px; border:2px solid #040813;">WhatsApp</span>
        </div>

        <!-- Chat Window -->
        <div id="waChatWindow" style="display:none; position:fixed; bottom:92px; right:24px; width:360px; max-width:calc(100vw - 32px); height:520px; background:#0b141a; border:1px solid rgba(37,211,102,0.3); border-radius:18px; box-shadow:0 20px 50px rgba(0,0,0,0.8); z-index:99999; flex-direction:column; overflow:hidden; font-family:var(--font-sans, sans-serif);">
          
          <!-- Header -->
          <div style="background:#1f2c34; padding:12px 16px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.08);">
            <div style="display:flex; align-items:center; gap:10px;">
              <div style="width:36px; height:36px; border-radius:50%; background:#25D366; display:flex; align-items:center; justify-content:center; font-size:18px;">🏔️</div>
              <div>
                <div style="font-weight:700; color:#e9edef; font-size:13.5px;">PahadiCart WhatsApp Bot</div>
                <div style="font-size:11px; color:#25D366;">Online &bull; Instant Hill Ordering</div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <button onclick="window.pahadiWA.simulateVoicePrompt()" title="Simulate Merchant Voice Call" style="background:rgba(255,255,255,0.08); border:none; color:#38bdf8; padding:6px; border-radius:6px; cursor:pointer; font-size:13px;">📞</button>
              <button onclick="window.pahadiWA.toggleChat()" style="background:transparent; border:none; color:#8696a0; font-size:16px; cursor:pointer;">✕</button>
            </div>
          </div>

          <!-- Quick Chips -->
          <div style="background:#111b21; padding:8px 12px; display:flex; gap:6px; overflow-x:auto; border-bottom:1px solid rgba(255,255,255,0.05); scrollbar-width:none;">
            <button onclick="window.pahadiWA.quickSend('Bhaiya 1kg Kinnaur seb aur 2 Siddu bhej do Shamti')" style="background:#202c33; border:1px solid rgba(37,211,102,0.25); color:#25D366; padding:4px 10px; border-radius:12px; font-size:11px; white-space:nowrap; cursor:pointer;">🍎 1kg Seb + 2 Siddu</button>
            <button onclick="window.pahadiWA.quickSend('Hot Thukpa aur momo chahiye The Ridge pe')" style="background:#202c33; border:1px solid rgba(37,211,102,0.25); color:#25D366; padding:4px 10px; border-radius:12px; font-size:11px; white-space:nowrap; cursor:pointer;">🍜 Thukpa &amp; Momos</button>
            <button onclick="window.pahadiWA.quickSend('Chamba Rajma aur Kangra Chai bhej do Bhagsunag')" style="background:#202c33; border:1px solid rgba(37,211,102,0.25); color:#25D366; padding:4px 10px; border-radius:12px; font-size:11px; white-space:nowrap; cursor:pointer;">🫘 Rajma + Chai</button>
          </div>

          <!-- Messages Container -->
          <div id="waMessages" style="flex:1; padding:14px; overflow-y:auto; display:flex; flex-direction:column; gap:10px; background:radial-gradient(circle, rgba(17,27,33,0.9), #0b141a);">
            <!-- Rendered dynamically -->
          </div>

          <!-- Input Box -->
          <div style="background:#202c33; padding:10px 14px; display:flex; align-items:center; gap:8px;">
            <input type="text" id="waInput" placeholder="Type order in Hindi or Hinglish..." onkeydown="if(event.key==='Enter') window.pahadiWA.handleSend()" style="flex:1; background:#2a3942; border:none; color:#d1d7db; padding:8px 14px; border-radius:8px; font-size:12.5px; outline:none;" />
            <button onclick="window.pahadiWA.handleSend()" style="background:#00a884; border:none; color:#ffffff; width:34px; height:34px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center;">➔</button>
          </div>

        </div>
      `;

      document.body.appendChild(widget);
      this.renderMessages();
    }

    renderMessages() {
      const container = document.getElementById('waMessages');
      if (!container) return;

      container.innerHTML = this.chatHistory.map(m => {
        const isUser = m.sender === 'user';
        return `
          <div style="align-self:${isUser ? 'flex-end' : 'flex-start'}; max-width:85%; background:${isUser ? '#005c4b' : '#202c33'}; color:#e9edef; padding:8px 12px; border-radius:${isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px'}; font-size:12px; line-height:1.45; box-shadow:0 1px 2px rgba(0,0,0,0.3); word-break:break-word;">
            ${m.text.replace(/\n/g, '<br/>')}
            <div style="font-size:9.5px; color:${isUser ? '#8696a0' : '#8696a0'}; text-align:right; margin-top:4px;">${m.time}</div>
          </div>
        `;
      }).join('');

      container.scrollTop = container.scrollHeight;
    }

    toggleChat() {
      this.isOpen = !this.isOpen;
      const win = document.getElementById('waChatWindow');
      if (win) {
        win.style.display = this.isOpen ? 'flex' : 'none';
        if (this.isOpen) {
          setTimeout(() => document.getElementById('waInput')?.focus(), 100);
        }
      }
    }

    handleSend() {
      const input = document.getElementById('waInput');
      if (!input || !input.value.trim()) return;
      const text = input.value;
      input.value = '';
      this.sendUserMessage(text);
    }

    quickSend(msg) {
      this.sendUserMessage(msg);
    }

    simulateVoicePrompt() {
      this.playShopkeeperVoiceCall('ORD-VOICE', [{ qty: 1, name: 'Kinnaur Seb' }, { qty: 2, name: 'Siddu' }]);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { window.pahadiWA = new PahadiWhatsAppBot(); });
  } else {
    window.pahadiWA = new PahadiWhatsAppBot();
  }
})();
