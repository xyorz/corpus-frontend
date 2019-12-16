function hashCode(str) {
  let h = 0;
  let len = str.length;
  let t = 2147483648;
  for (let i = 0; i < len; i++) {
      h = 31 * h + str.charCodeAt(i);
      if (h > 2147483647) h %= t; 
  }
  return h;
}

function randomWord(randomFlag, min, max) {
  let str = "",
      range = min,
      arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  if (randomFlag) {
      range = Math.round(Math.random() * (max - min)) + min;
  }
  for (let i = 0; i < range; i++) {
      let pos = Math.round(Math.random() * (arr.length - 1));
      str += arr[pos];
  }
  return str;
}


function getHashCode() {
  let timestamp = (new Date()).valueOf();
  let myRandom = randomWord(false, 6);
  let hCode = hashCode(myRandom + timestamp.toString());
  return hCode;
}

export default getHashCode;