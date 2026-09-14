import confetti from "canvas-confetti";

export function triggerRegisterConfetti() {
  const end = Date.now() + 2000;
  const colors = ["#6E49A6", "#FF7A57", "#5CC498"];

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}
