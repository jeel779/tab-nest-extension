export function getSegmentHue(id) {
  let hue = 0;
  for (const char of id) hue = (hue * 31 + char.charCodeAt(0)) & 0xffffffff;
  return Math.abs(hue) % 360;
}
