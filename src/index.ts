import VanillaTilt from 'vanilla-tilt';

document.querySelectorAll('.slider-item').forEach((card) => {
  VanillaTilt.init(card as any, {
    'max': 10,
    'speed': 300,
    'glare': true,
    'max-glare': 0.1,
  });
});

function getRandomGradient(): string {
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const angle = Math.floor(Math.random() * 360);
  const color1 = getRandomColor();
  const color2 = getRandomColor();
  const color3 = getRandomColor();

  return `linear-gradient(${angle}deg, ${color1}, ${color2}, ${color3})`;
}

document.querySelectorAll('.slider-image-wrapper > div').forEach((div) => {
  (div as HTMLElement).style.backgroundImage = getRandomGradient();
});

export {};
