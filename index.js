function getElements() {
  const time = new Date();
  const hour = time.getHours();
  const minute = time.getMinutes();
  const second = time.getSeconds();

  const degreeHour = -hour / 12 * 360;
  const degreeMin = -minute / 60 * 360;
  const degreeSec = -second / 60 * 360;

  const clockHour = document.getElementsByClassName('clock-hour')[0];
  const clockMin = document.getElementsByClassName('clock-min')[0];
  const clockSec = document.getElementsByClassName('clock-sec')[0];

  clockHour.style.setProperty('transform', `rotate(${degreeHour}deg)`);
  clockMin.style.setProperty('transform', `rotate(${degreeMin}deg)`);
  clockSec.style.setProperty('transform', `rotate(${degreeSec}deg)`);
}

setInterval(getElements, 10);