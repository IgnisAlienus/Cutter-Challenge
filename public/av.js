function playSound(soundFile) {
  const audio = new Audio(`/resources/${soundFile}`);
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
