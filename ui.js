// ui.js – UI enhancements and micro-animations
// -------------------------------------------------

// ===== FADE-IN on scroll (IntersectionObserver) =====
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1,
};
const fadeInCallback = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
      observer.unobserve(entry.target);
    }
  });
};
const fadeObserver = new IntersectionObserver(fadeInCallback, observerOptions);

// ===== RIPPLE EFFECT =====
// Must be defined before it is referenced below
function createRipple(event) {
  const button = event.currentTarget;
  const circle = document.createElement('span');
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
  circle.style.top  = `${event.clientY - button.getBoundingClientRect().top  - radius}px`;
  circle.classList.add('ripple');
  // Remove old ripple if one still exists
  const oldRipple = button.querySelector('span.ripple');
  if (oldRipple) oldRipple.remove();
  button.appendChild(circle);
}

// ===== INIT on DOM ready =====
document.addEventListener('DOMContentLoaded', () => {
  // Observe all quick-card elements for fade-in
  document.querySelectorAll('.q-card').forEach(card => fadeObserver.observe(card));

  // ===== MOUSE TRACKING GLOW FOR CARDS =====
  document.getElementById('welcomeScreen').addEventListener('mousemove', (e) => {
    for (const card of document.querySelectorAll('.q-card')) {
      const rect = card.getBoundingClientRect(),
            x = e.clientX - rect.left,
            y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    }
  });

  // Add ripple-btn class AND attach ripple listener to interactive buttons
  document.querySelectorAll('.new-chat-btn, .topic-btn').forEach(btn => {
    btn.classList.add('ripple-btn');
    btn.addEventListener('click', createRipple);
  });

  // Smooth scroll for any internal anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
});
