(() => {
  const canvas = document.querySelector('#particle-flow');
  if (!canvas || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const context = canvas.getContext('2d');
  const particles = Array.from({ length: 430 }, (_, index) => ({
    x: Math.random(),
    y: Math.pow(Math.random(), 1.8),
    speed: 0.00009 + Math.random() * 0.00028,
    size: 0.45 + Math.random() * 2.1,
    phase: Math.random() * Math.PI * 2,
    bright: index % 13 === 0,
  }));
  let width = 0;
  let height = 0;

  function resize() {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  function frame(time) {
    context.clearRect(0, 0, width, height);
    const center = height * 0.5;
    for (const particle of particles) {
      particle.x += particle.speed;
      if (particle.x > 1.05) particle.x = -0.05;
      const flow = Math.sin(particle.x * Math.PI) * 0.86;
      const spread = (particle.y - 0.5) * height * (0.18 + (1 - flow) * 1.9);
      const y = center + spread + Math.sin(time * 0.0012 + particle.phase) * 7;
      const x = particle.x * width;
      const edge = Math.min(1, Math.max(0, Math.sin(particle.x * Math.PI) * 1.45));
      const alpha = edge * (particle.bright ? 0.94 : 0.28 + flow * 0.35);
      context.beginPath();
      context.fillStyle = `rgba(40, 230, 222, ${alpha})`;
      context.shadowBlur = particle.bright ? 15 : 5;
      context.shadowColor = '#28e6de';
      context.arc(x, y, particle.size * (0.8 + flow), 0, Math.PI * 2);
      context.fill();
    }
    context.shadowBlur = 0;
    requestAnimationFrame(frame);
  }
  new ResizeObserver(resize).observe(canvas);
  resize();
  requestAnimationFrame(frame);
})();

(() => {
  const form = document.querySelector('#waitlist-form');
  if (!form) return;
  const status = document.querySelector('#waitlist-status');
  const submit = form.querySelector('button[type="submit"]');
  const sitekey = form.dataset.turnstileSitekey;
  let turnstileToken = '';

  function setStatus(message, state = '') {
    status.textContent = message;
    status.dataset.state = state;
  }
  function loadTurnstile() {
    if (!sitekey) {
      setStatus('Čekací listina se právě připravuje. Vraťte se prosím brzy.');
      submit.disabled = true;
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = () => window.turnstile.render('#turnstile-slot', {
      sitekey,
      theme: 'dark',
      callback: (token) => { turnstileToken = token; },
      'expired-callback': () => { turnstileToken = ''; },
      'error-callback': () => setStatus('Ověření proti robotům se nepodařilo načíst. Zkuste to prosím znovu.', 'error'),
    });
    document.head.append(script);
  }
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (!sitekey || !turnstileToken) {
      setStatus('Dokončete prosím ověření proti robotům.', 'error');
      return;
    }
    submit.disabled = true;
    setStatus('Přidávám vás do fronty…');
    try {
      const response = await fetch(form.dataset.api, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.elements.email.value,
          consent: form.elements.consent.checked,
          turnstileToken,
          privacyVersion: '2026-09-06',
          source: 'mike-site',
        }),
      });
      if (!response.ok) throw new Error('request failed');
      form.reset();
      turnstileToken = '';
      setStatus('Hotovo. Ozveme se, až bude M.I.K.E. připravený.', 'success');
    } catch {
      setStatus('Frontu se nepodařilo uložit. Zkuste to prosím za chvíli.', 'error');
    } finally {
      submit.disabled = false;
    }
  });
  loadTurnstile();
})();
