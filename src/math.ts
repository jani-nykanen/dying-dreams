

export const clamp = (x : number, min : number, max : number) : number => Math.min(max, Math.max(x, min));


export const negMod = (m : number, n : number) => ((m % n) + n) % n;
