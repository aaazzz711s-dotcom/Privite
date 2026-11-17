# Original ambient soundtrack for the lounge tour, synthesised from scratch (no samples, no third-party music).
#   python3 music.py out.wav [seconds]
import sys, wave
import numpy as np

SR = 44100
out, total = sys.argv[1], float(sys.argv[2]) if len(sys.argv) > 2 else 42.0
BEAT = 60 / 72.0                       # 72 bpm
BAR = 4 * BEAT
n = int(SR * (total + 1.0))
L = np.zeros(n); R = np.zeros(n)
rng = np.random.default_rng(7)

def hz(name):
    names = {'C': 0, 'C#': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'Bb': 10, 'B': 11}
    return 440.0 * 2 ** ((names[name[:-1]] + 12 * (int(name[-1]) + 1) - 69) / 12)

def add(sig, t0, pan=0.0, gain=1.0):
    i = int(t0 * SR)
    if i >= n: return
    sig = sig[: n - i] * gain
    L[i:i + len(sig)] += sig * np.cos((pan + 1) * np.pi / 4)
    R[i:i + len(sig)] += sig * np.sin((pan + 1) * np.pi / 4)

def env(length, a, r):
    t = np.arange(int(length * SR)) / SR
    e = np.minimum(1, t / a) * np.minimum(1, (length - t) / r)
    return np.clip(e, 0, 1) ** 1.5

def pad(f, length):
    t = np.arange(int(length * SR)) / SR
    s = np.zeros_like(t)
    for det in (-0.004, 0.0, 0.004):
        for k, a in ((1, 1.0), (2, 0.35), (3, 0.18), (4, 0.07)):
            s += a * np.sin(2 * np.pi * f * (1 + det) * k * t + rng.uniform(0, 6.28))
    return s / 5 * env(length, 1.3, 1.6) * (1 + 0.08 * np.sin(2 * np.pi * 0.21 * t))

def pluck(f, length=1.6):
    t = np.arange(int(length * SR)) / SR
    s = np.zeros_like(t)
    for k in range(1, 11):
        s += (1.0 / k) * np.sin(2 * np.pi * f * k * t * (1 + 0.0004 * k * k)) * np.exp(-t * (1.6 + 0.55 * k * k))
    return s * np.minimum(1, t / 0.004)

def lead(f, length):
    t = np.arange(int((length + 0.25) * SR)) / SR
    vib = 1 + 0.0035 * np.sin(2 * np.pi * 5.2 * t) * np.clip((t - 0.25) / 0.4, 0, 1)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    s = np.sin(ph) + 0.22 * np.sin(2 * ph) + 0.08 * np.sin(3 * ph)
    e = np.minimum(1, t / 0.07) * np.clip((length + 0.25 - t) / 0.25, 0, 1)
    return s * e

def thump(length=0.28):
    t = np.arange(int(length * SR)) / SR
    return np.sin(2 * np.pi * (48 * t + 30 * (1 - np.exp(-t * 28)) / 28)) * np.exp(-t * 13)

def shaker(length=0.09):
    t = np.arange(int(length * SR)) / SR
    x = rng.standard_normal(len(t)); x = x - np.concatenate(([0], x[:-1]))      # crude high-pass
    return x * np.exp(-t * 55)

CH = {'Dm': (['D3', 'A3', 'D4', 'F4', 'A4'], 'D2'), 'Bb': (['Bb2', 'F3', 'A3', 'D4', 'F4'], 'Bb1'),
      'Gm': (['G2', 'D3', 'G3', 'Bb3', 'D4'], 'G1'), 'A': (['A2', 'E3', 'G3', 'C#4', 'E4'], 'A1')}
prog = ['Dm', 'Bb', 'Gm', 'A'] * 3 + ['Dm']
ARP = {'Dm': ['D4', 'F4', 'A4', 'D5', 'A4', 'F4', 'A4', 'E4'], 'Bb': ['Bb3', 'D4', 'F4', 'A4', 'F4', 'D4', 'F4', 'D4'],
       'Gm': ['G3', 'Bb3', 'D4', 'G4', 'D4', 'Bb3', 'D4', 'A3'], 'A': ['A3', 'C#4', 'E4', 'G4', 'E4', 'C#4', 'Bb3', 'C#4']}
MEL = {4: [('D5', 1.5), ('C5', .5), ('A4', 2)], 5: [('Bb4', 1.5), ('A4', .5), ('F4', 2)], 6: [('G4', 1), ('A4', 1), ('Bb4', 1), ('D5', 1)],
       7: [('C#5', 2), ('Bb4', .5), ('A4', 1.5)], 8: [('D5', 1), ('F5', 1), ('E5', 1), ('D5', 1)], 9: [('D5', 1.5), ('C5', .5), ('Bb4', 2)],
       10: [('Bb4', 1), ('A4', 1), ('G4', 1), ('F4', 1)], 11: [('E4', 1), ('G4', 1), ('Bb4', .5), ('A4', 1.5)], 12: [('D5', 4)]}

for b, ch in enumerate(prog):
    t0 = b * BAR
    notes, bass = CH[ch]
    last = b == len(prog) - 1
    for i, nm in enumerate(notes):
        add(pad(hz(nm), BAR + (3.0 if last else 1.3)), t0 - 0.25 if b else 0, pan=(i - 2) * 0.22, gain=0.17)
    t = np.arange(int((BAR + 0.6) * SR)) / SR
    add(np.sin(2 * np.pi * hz(bass) * t) * env(BAR + 0.6, 0.12, 0.9), t0, gain=0.30)
    if not last:
        for i, nm in enumerate(ARP[ch]):
            if b == 0 and i < 2: continue
            add(pluck(hz(nm)), t0 + i * BEAT / 2, pan=0.45 if i % 2 else -0.45, gain=0.26 if i % 4 == 0 else 0.19)
        if 2 <= b:
            for beat in (0, 2): add(thump(), t0 + beat * BEAT, gain=0.42)
            for i in range(8):
                if i % 2: add(shaker(), t0 + i * BEAT / 2, pan=0.3, gain=0.035)
    if b in MEL:
        tt = t0
        for nm, d in MEL[b]:
            add(lead(hz(nm), d * BEAT * 0.96), tt, pan=0.08, gain=0.15); tt += d * BEAT

# feedback delay + convolution reverb (exponentially decaying filtered noise)
def delay(x, time=BEAT * 0.75, fb=0.33, mix=0.22):
    d = int(time * SR); y = x.copy(); tap = x.copy()
    for _ in range(4):
        tap = np.concatenate((np.zeros(d), tap[:-d])) * fb; y += tap * mix / fb
    return y
def reverb(x, seed):
    r = np.random.default_rng(seed); m = int(2.4 * SR); t = np.arange(m) / SR
    ir = r.standard_normal(m) * np.exp(-t * 2.6); ir[: int(0.012 * SR)] = 0
    k = np.ones(24) / 24; ir = np.convolve(ir, k, 'same')                 # darken the tail
    size = 1 << int(np.ceil(np.log2(len(x) + m)))
    return np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[: len(x)] / np.sqrt(np.sum(ir ** 2))
L2, R2 = delay(L), delay(R, BEAT * 0.5)
L = L2 + 0.34 * reverb(L2, 1); R = R2 + 0.34 * reverb(R2, 2)

N = int(total * SR); L, R = L[:N], R[:N]
t = np.arange(N) / SR
fade = np.clip(t / 1.2, 0, 1) * np.clip((total - t) / 3.0, 0, 1) ** 1.3
L *= fade; R *= fade
peak = max(np.abs(L).max(), np.abs(R).max()); g = 0.84 / peak
L = np.tanh(L * g * 1.15) / np.tanh(1.15); R = np.tanh(R * g * 1.15) / np.tanh(1.15)
pcm = (np.stack([L, R], 1) * 0.92 * 32767).astype('<i2')
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('wrote', out, round(total, 2), 's')
