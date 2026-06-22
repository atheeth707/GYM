/* ============================================================
   PowerFit AI — script.js
   Handles: preloader, navbar, particles, scroll reveals,
   animated counters, testimonials carousel, contact form,
   and the floating FitBot AI chatbot (with typing animation).

   The chatbot is built so you can connect a Gemini or OpenAI
   API key later — see the "AI API CONFIGURATION" section below.
   ============================================================ */

(function () {
  "use strict";

  /* =========================================================
     1. PRELOADER
     Hides the loading screen once the page is fully loaded.
     ========================================================= */
  window.addEventListener("load", function () {
    const preloader = document.getElementById("preloader");
    if (!preloader) return;
    // small delay so the animation is visible briefly
    setTimeout(function () {
      preloader.classList.add("hide");
    }, 700);
  });

  /* =========================================================
     2. NAVBAR — scroll state + mobile menu
     ========================================================= */
  const navbar = document.getElementById("navbar");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  function onScroll() {
    if (!navbar) return;
    if (window.scrollY > 40) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      navToggle.classList.toggle("open");
      navLinks.classList.toggle("open");
    });
    // close menu when a link is clicked
    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navToggle.classList.remove("open");
        navLinks.classList.remove("open");
      });
    });
  }

  /* =========================================================
     3. ANIMATED PARTICLE BACKGROUND
     Lightweight canvas particle network with connecting lines.
     ========================================================= */
  const canvas = document.getElementById("bg-particles");
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    let particles = [];
    let w, h, rafId;
    const PARTICLE_COUNT = window.innerWidth < 720 ? 40 : 80;
    const COLORS = ["#22d3ee", "#3b82f6", "#a855f7"];

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 1.8 + 0.6,
          c: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c;
        ctx.globalAlpha = 0.7;
        ctx.fill();

        // connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = p.c;
            ctx.globalAlpha = (1 - dist / 120) * 0.18;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(draw);
    }

    resize();
    initParticles();
    // respect reduced motion
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      draw();
    } else {
      // draw a single static frame
      draw();
      cancelAnimationFrame(rafId);
    }
    window.addEventListener("resize", function () {
      resize();
      initParticles();
    });
  }

  /* =========================================================
     4. SCROLL REVEAL — Intersection Observer
     Elements with class "reveal" fade/slide in when visible.
     data-reveal controls direction; data-delay staggers them.
     ========================================================= */
  const revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = parseInt(el.getAttribute("data-delay") || "0", 10);
            setTimeout(function () {
              el.classList.add("visible");
            }, delay);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // fallback: just show everything
    revealEls.forEach(function (el) {
      el.classList.add("visible");
    });
  }

  /* =========================================================
     5. ANIMATED COUNTERS (hero stats)
     Counts up to the target value when scrolled into view.
     ========================================================= */
  const counters = document.querySelectorAll(".stat-num");
  let countersDone = false;

  function runCounters() {
    if (countersDone) return;
    countersDone = true;
    counters.forEach(function (el) {
      const target = parseInt(el.getAttribute("data-count") || "0", 10);
      const duration = 1800;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        // easeOutExpo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const value = Math.floor(eased * target);
        el.textContent = value.toLocaleString();
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target.toLocaleString();
      }
      requestAnimationFrame(tick);
    });
  }

  if ("IntersectionObserver" in window && counters.length) {
    const heroObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            runCounters();
            heroObs.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    heroObs.observe(counters[0]);
  } else {
    runCounters();
  }

  /* =========================================================
     6. TESTIMONIALS CAROUSEL
     ========================================================= */
  const testimonials = [
    {
      name: "Karthik R.",
      role: "Lost 18 kg in 6 months",
      initials: "KR",
      text: "PowerFit AI completely changed how I train. FitBot adjusts my plan every week based on my progress — I've never seen results like this before.",
    },
    {
      name: "Priya S.",
      role: "Marathon finisher",
      initials: "PS",
      text: "The AI assistant feels like having a personal coach in my pocket. The cardio zone and heart-rate tracking took my endurance to another level.",
    },
    {
      name: "Aditya N.",
      role: "Gained 8 kg muscle",
      initials: "AN",
      text: "Elite membership is worth every rupee. The trainers are world-class and the AI nutritionist nailed my diet. Best gym I've ever joined.",
    },
    {
      name: "Meera J.",
      role: "Postnatal recovery",
      initials: "MJ",
      text: "Ananya's mobility sessions and the AI recovery suggestions helped me come back stronger than before my pregnancy. Incredible support.",
    },
  ];

  const track = document.getElementById("testimonialTrack");
  const dotsWrap = document.getElementById("carouselDots");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  let currentSlide = 0;
  let autoTimer = null;

  if (track && dotsWrap) {
    // build slides
    testimonials.forEach(function (t) {
      const slide = document.createElement("div");
      slide.className = "testimonial-slide glass";
      slide.innerHTML =
        '<div class="stars">★★★★★</div>' +
        "<blockquote>\"" + t.text + '"</blockquote>' +
        '<div class="testimonial-author">' +
        '<div class="testimonial-avatar">' + t.initials + "</div>" +
        "<div><strong>" + t.name + "</strong><span>" + t.role + "</span></div>" +
        "</div>";
      track.appendChild(slide);

      const dot = document.createElement("button");
      dot.setAttribute("aria-label", "Go to testimonial " + (dotsWrap.children.length + 1));
      dotsWrap.appendChild(dot);
    });

    const dots = dotsWrap.querySelectorAll("button");

    function goTo(index) {
      currentSlide = (index + testimonials.length) % testimonials.length;
      track.style.transform = "translateX(-" + currentSlide * 100 + "%)";
      dots.forEach(function (d, i) {
        d.classList.toggle("active", i === currentSlide);
      });
    }

    function next() { goTo(currentSlide + 1); }
    function prev() { goTo(currentSlide - 1); }

    function startAuto() {
      stopAuto();
      autoTimer = setInterval(next, 5500);
    }
    function stopAuto() {
      if (autoTimer) clearInterval(autoTimer);
    }

    if (nextBtn) nextBtn.addEventListener("click", function () { next(); startAuto(); });
    if (prevBtn) prevBtn.addEventListener("click", function () { prev(); startAuto(); });
    dots.forEach(function (d, i) {
      d.addEventListener("click", function () { goTo(i); startAuto(); });
    });

    // pause on hover
    const carousel = track.parentElement;
    carousel.addEventListener("mouseenter", stopAuto);
    carousel.addEventListener("mouseleave", startAuto);

    goTo(0);
    startAuto();
  }

  /* =========================================================
     7. CONTACT FORM + NEWSLETTER (front-end demo handling)
     Replace the simulated success with a real backend / API
     call when wiring up email delivery.
     ========================================================= */
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = document.getElementById("cf-name").value.trim();
      const email = document.getElementById("cf-email").value.trim();
      const message = document.getElementById("cf-message").value.trim();

      if (!name || !email || !message) {
        if (formStatus) {
          formStatus.textContent = "Please fill in all required fields.";
          formStatus.classList.add("error");
        }
        return;
      }
      // basic email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (formStatus) {
          formStatus.textContent = "Please enter a valid email address.";
          formStatus.classList.add("error");
        }
        return;
      }

      if (formStatus) {
        formStatus.classList.remove("error");
        formStatus.textContent = "Thank you, " + name + "! We'll reach out within 24 hours.";
      }
      contactForm.reset();
      setTimeout(function () {
        if (formStatus) formStatus.textContent = "";
      }, 6000);
    });
  }

  const newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const input = newsletterForm.querySelector("input");
      if (input) {
        input.value = "";
        input.placeholder = "Subscribed! ✓";
        setTimeout(function () { input.placeholder = "Your email"; }, 3000);
      }
    });
  }

  /* =========================================================
     8. TRAINER 3D TILT EFFECT
     Subtle parallax tilt following the cursor.
     ========================================================= */
  const tiltCards = document.querySelectorAll(".tilt");
  tiltCards.forEach(function (card) {
    card.addEventListener("mousemove", function (e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotateX = ((y - cy) / cy) * -7;
      const rotateY = ((x - cx) / cx) * 7;
      card.style.transform =
        "perspective(800px) rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg) translateY(-8px)";
    });
    card.addEventListener("mouseleave", function () {
      card.style.transform = "";
    });
  });

  /* =========================================================
     9. FLOATING FITBOT AI CHATBOT
     ========================================================= */
  const chatToggle = document.getElementById("chatbotToggle");
  const chatWindow = document.getElementById("chatbotWindow");
  const chatClose = document.getElementById("chatbotClose");
  const chatBody = document.getElementById("chatbotBody");
  const chatForm = document.getElementById("chatbotForm");
  const chatInput = document.getElementById("chatbotInput");
  const heroFitBotBtn = document.getElementById("heroFitBotBtn");

  const WELCOME_MSG =
    "Hello! I am FitBot AI. Ask me anything about our gym — memberships, trainers, classes, or your personalized plan.";

  function openChat() {
    if (!chatWindow || !chatBody) return;
    chatWindow.classList.add("open");
    chatWindow.setAttribute("aria-hidden", "false");
    // seed welcome message once
    if (!chatBody.querySelector(".chat-msg")) {
      addAiMessage(WELCOME_MSG, true);
    }
    setTimeout(function () { if (chatInput) chatInput.focus(); }, 350);
  }
  function closeChat() {
    if (!chatWindow) return;
    chatWindow.classList.remove("open");
    chatWindow.setAttribute("aria-hidden", "true");
  }

  if (chatToggle) chatToggle.addEventListener("click", openChat);
  if (chatClose) chatClose.addEventListener("click", closeChat);
  if (heroFitBotBtn) heroFitBotBtn.addEventListener("click", openChat);

  // close on Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeChat();
  });

  /* --- chat message helpers --- */
  function scrollToBottom() {
    if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
  }

  function appendUserMessage(text) {
    const wrap = document.createElement("div");
    wrap.className = "chat-msg user";
    wrap.innerHTML = '<div class="chat-bubble"></div>';
    wrap.querySelector(".chat-bubble").textContent = text;
    chatBody.appendChild(wrap);
    scrollToBottom();
  }

  // Adds an AI bubble. If `instant` is false (default) it types out the text.
  function addAiMessage(text, instant) {
    const wrap = document.createElement("div");
    wrap.className = "chat-msg ai";
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    wrap.appendChild(bubble);
    chatBody.appendChild(wrap);

    if (instant) {
      bubble.textContent = text;
      scrollToBottom();
      return Promise.resolve();
    }

    // Typing animation: reveal characters progressively
    return new Promise(function (resolve) {
      let i = 0;
      bubble.classList.add("type-cursor");
      const speed = 18; // ms per char
      function typeNext() {
        if (i <= text.length) {
          bubble.textContent = text.slice(0, i);
          scrollToBottom();
          i++;
          setTimeout(typeNext, speed);
        } else {
          bubble.classList.remove("type-cursor");
          bubble.textContent = text;
          scrollToBottom();
          resolve();
        }
      }
      typeNext();
    });
  }

  // Shows the three-dot typing indicator while waiting for a response
  function showTypingIndicator() {
    const wrap = document.createElement("div");
    wrap.className = "chat-msg ai";
    wrap.setAttribute("id", "typingIndicator");
    wrap.innerHTML =
      '<div class="chat-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
    chatBody.appendChild(wrap);
    scrollToBottom();
  }
  function removeTypingIndicator() {
    const el = document.getElementById("typingIndicator");
    if (el) el.remove();
  }

  /* --- chat form submission --- */
  if (chatForm) {
    chatForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;

      appendUserMessage(text);
      chatInput.value = "";
      chatInput.disabled = true;

      showTypingIndicator();
      let reply;
      try {
        reply = await getAIResponse(text);
      } catch (err) {
        reply = "Sorry, I had trouble responding just now. Please try again.";
      }
      removeTypingIndicator();

      // small natural delay before typing out the reply
      await new Promise(function (r) { setTimeout(r, 350); });
      await addAiMessage(reply, false);

      chatInput.disabled = false;
      chatInput.focus();
    });
  }

  /* =========================================================
     10. AI API CONFIGURATION
     ---------------------------------------------------------
     Paste your Gemini or OpenAI API key here.
     Set AI_PROVIDER to "gemini" or "openai" and fill in the
     corresponding key. When no key is provided, FitBot falls
     back to a smart local rule-based responder so the demo
     always works.
     ========================================================= */

  /**
   * getAIResponse(userMessage)
   * --------------------------
   * Async function that returns the AI's reply as a string.
   * Replace the placeholder block below with a real API call
   * to Gemini or OpenAI. The chatbot UI already handles the
   * typing animation and error fallback — just return a string.
   */
 async function getAIResponse(userMessage) {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: userMessage
      })
    });

    // If server failed, use local AI
    if (!response.ok) {
      throw new Error("AI server unavailable");
    }

    const data = await response.json();

    // Gemini reply
    if (data.reply && data.reply.trim() !== "") {
      return data.reply.trim();
    }

    // Empty response fallback
    return localFitBotReply(userMessage);

  } catch (error) {
    console.error("FitBot Error:", error);

    // No internet/API failure fallback
    return localFitBotReply(userMessage);
  }
}
function localFitBotReply(message) { const msg = message.toLowerCase(); const has = function () { for (let i = 0; i < arguments.length; i++) { if (msg.indexOf(arguments[i]) !== -1) return true; } return false; }; if (has("price", "pricing", "cost", "fee", "membership", "plan", "join")) return "We have three plans: Basic at ₹1500/month, Premium at ₹4000/3 months (our most popular, recommended), and Elite at ₹14000/year. Would you like help choosing the right one for your goals?"; if (has("trainer", "coach", "instructor")) return "Our certified trainers cover strength, HIIT, powerlifting, mobility and yoga. With Premium or Elite you get personal coaching sessions tailored to you. Want me to match you with a trainer?"; if (has("hour", "time", "open", "close", "timing")) return "We're open Mon–Sat from 5:00 AM to 11:00 PM, and Sun from 7:00 AM to 9:00 PM. Plenty of time to fit your workout in!"; if (has("location", "where", "address", "gym near")) return "PowerFit AI is located at 42 Cyber Towers, Tech Park Road, Bengaluru 560001. Stop by anytime for a free tour!"; if (has("diet", "nutrition", "food", "eat", "meal")) return "Our AI nutritionist builds diet plans around your metabolism and goals — included with Premium and Elite memberships. What are your fitness goals?"; if (has("ai", "fitbot", "how does", "work")) return "I'm FitBot AI! I analyze your progress and adapt your training and nutrition plan in real time, 24/7. Think of me as your always-on personal coach."; if (has("hi", "hello", "hey", "namaste")) return "Hey there! 👋 I'm FitBot AI. I can tell you about our memberships, trainers, classes, timings, or help you pick the perfect plan. What would you like to know?"; if (has("lose weight", "fat", "slim")) return "Great goal! Our cardio zone plus a personalized AI plan is perfect for fat loss. The Premium membership includes diet consultation too. Ready to start?"; if (has("muscle", "gain", "bulk", "strong")) return "For muscle gain, our strength training zone and progressive overload programs are ideal. Elite membership gives you unlimited personal coaching. Shall I tell you more?"; if (has("contact", "phone", "call", "email")) return "You can reach us at +91 98765 43210 or hello@powerfit.ai. Or just fill out the contact form on this page and we'll respond within 24 hours!"; if (has("thank", "thanks", "great", "awesome")) return "You're welcome! 💪 Whenever you're ready to transform, the Join Now button is right here for you."; return "Great question! I can help with memberships (Basic ₹1500/mo, Premium ₹4000/3mo, Elite ₹14000/yr), trainers, classes, timings, diet plans, or anything about PowerFit AI Gym. What would you like to explore?"; } /* ========================================================= 11. FOOTER YEAR ========================================================= */ const yearEl = document.getElementById("year"); if (yearEl) yearEl.textContent = new Date().getFullYear(); })(); 
