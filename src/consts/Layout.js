const aspect_ratio = window.innerWidth / window.innerHeight;
export const LINE_FACTOR = aspect_ratio < 1.12 ? 0.75 : 0.55;
export const LINE_LENGTH = aspect_ratio < 1.12 ? window.innerWidth * LINE_FACTOR : window.innerHeight * LINE_FACTOR;
