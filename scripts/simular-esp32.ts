const BASE_URL = process.env.API_URL ?? 'http://localhost:3000/api/v1';
const codigoSensor = process.argv[2] ?? 'ESP32-POMPEIA-01';
const INTERVALO_MS = Number(process.env.INTERVALO_MS ?? 2000);

const tempestade: Array<[number, number]> = [
  [3, 5], [8, 18], [14, 30], [19, 42], [26, 55], [33, 60], [38, 48],
  [31, 30], [22, 15], [12, 6], [5, 0],
];

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  console.log(`Simulando ${codigoSensor} -> ${BASE_URL}/leituras\n`);
  for (const [nivelAguaCm, chuvaMmHora] of tempestade) {
    const res = await fetch(`${BASE_URL}/leituras`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigoSensor, nivelAguaCm, chuvaMmHora }),
    });
    const corpo = await res.json();
    if (!res.ok) {
      console.error(`Erro ${res.status}:`, corpo);
      process.exit(1);
    }
    const linha = `água ${String(nivelAguaCm).padStart(3)} cm | chuva ${String(chuvaMmHora).padStart(2)} mm/h | ${corpo.nivel.padEnd(7)} | ${corpo.acao}`;
    console.log(corpo.alerta && corpo.acao !== 'MANTIDO' ? `${linha}\n   -> ${corpo.alerta.mensagem}` : linha);
    await esperar(INTERVALO_MS);
  }
}

main().catch((e) => {
  console.error('Falha na simulação. A API está rodando?', e);
  process.exit(1);
});
