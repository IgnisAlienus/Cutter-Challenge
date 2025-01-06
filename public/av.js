function playSound(soundFile, volume) {
  const audio = new Audio(`/resources/${soundFile}`);
  if (volume) {
    audio.volume = volume;
  }
  audio.play();
}

function changeLight(index, action) {
  // Send POST request to change the light
  fetch(`/light?lightNumber=${index}&action=${action}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export { playSound, changeLight };
