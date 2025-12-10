  const mahdi = document.getElementById('Mahdi');
  const punchSound = document.getElementById('punchSound');

  mahdi.addEventListener('click', () => {
    // Play punch sound
    punchSound.currentTime = 0;
    punchSound.play();

    // Animate punch
    mahdi.classList.remove('punched');
    void mahdi.offsetWidth; // trigger reflow
    mahdi.classList.add('punched');
  });