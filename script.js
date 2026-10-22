(() => {
  const weddingDate = new Date('2027-06-06T18:00:00+05:00');
  const byId = (id) => document.getElementById(id);

  // Smooth reveal as sections enter the screen.
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('visible'));
  }

  // Opening the invitation scrolls gently to the welcome message.
  byId('openInvitation').addEventListener('click', () => {
    const cover = byId('cover');
    cover.classList.add('opening', 'opened');
    document.querySelector('.welcome').scrollIntoView({ behavior: 'smooth' });
  });

  // Countdown uses Aktau's UTC+05:00 time.
  function updateCountdown() {
    const distance = weddingDate.getTime() - Date.now();
    if (distance <= 0) {
      byId('countdown').innerHTML = '<p>Сегодня наш особенный день. Спасибо, что вы с нами!</p>';
      return;
    }
    const days = Math.floor(distance / 86400000);
    const hours = Math.floor((distance % 86400000) / 3600000);
    const minutes = Math.floor((distance % 3600000) / 60000);
    const seconds = Math.floor((distance % 60000) / 1000);
    byId('days').textContent = String(days).padStart(3, '0');
    byId('hours').textContent = String(hours).padStart(2, '0');
    byId('minutes').textContent = String(minutes).padStart(2, '0');
    byId('seconds').textContent = String(seconds).padStart(2, '0');
  }
  updateCountdown();
  window.setInterval(updateCountdown, 1000);

  // Audio only starts after a visitor presses the button, as browsers require.
  const audio = byId('weddingMusic');
  const musicButton = byId('musicToggle');
  const musicLabel = byId('musicLabel');
  let musicAttempted = false;
  musicButton.addEventListener('click', async () => {
    if (!musicAttempted) {
      musicAttempted = true;
      try {
        await audio.play();
        musicButton.classList.add('playing');
        musicLabel.textContent = 'Выключить музыку';
        musicButton.setAttribute('aria-label', 'Выключить музыку');
      } catch (error) {
        musicLabel.textContent = 'Добавьте assets/piano.mp3';
        musicButton.setAttribute('aria-label', 'Добавьте аудиофайл piano.mp3');
      }
      return;
    }
    if (audio.paused) {
      try {
        await audio.play();
        musicButton.classList.add('playing');
        musicLabel.textContent = 'Выключить музыку';
        musicButton.setAttribute('aria-label', 'Выключить музыку');
      } catch (error) {
        musicLabel.textContent = 'Не удалось включить';
      }
    } else {
      audio.pause();
      musicButton.classList.remove('playing');
      musicLabel.textContent = 'Включить музыку';
      musicButton.setAttribute('aria-label', 'Включить музыку');
    }
  });

  // Formspree handles the RSVP submission. Replace YOUR_FORM_ID first.
  const form = byId('rsvpForm');
  const status = byId('formStatus');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (form.action.includes('YOUR_FORM_ID')) {
      status.textContent = 'Форма пока не подключена. Организатору нужно настроить Formspree — см. README.md.';
      status.style.color = '#8d3c38';
      return;
    }
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.style.opacity = '.7';
    status.textContent = 'Отправляем ваш ответ…';
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        status.textContent = 'Спасибо! Ваш ответ отправлен. Будем рады увидеться!';
        status.style.color = '#596a43';
        form.reset();
      } else {
        status.textContent = 'Не удалось отправить ответ. Попробуйте ещё раз чуть позже.';
        status.style.color = '#8d3c38';
      }
    } catch (error) {
      status.textContent = 'Похоже, нет соединения. Проверьте интернет и попробуйте снова.';
      status.style.color = '#8d3c38';
    } finally {
      submitButton.disabled = false;
      submitButton.style.opacity = '1';
    }
  });
})();
