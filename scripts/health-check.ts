import https from 'https';

const API_URL = 'https://lexaureon.com/api/lex/run';

function checkHealth(): void {
  const url = new URL(API_URL);

  const req = https.request(
    {
      hostname: url.hostname,
      path: url.pathname,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    },
    (res) => {
      let body = '';
      res.on('data', (chunk: Buffer) => { body += chunk.toString(); });
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          const hasStatus = data.status === 'live';
          const hasGovernor = typeof data.governor === 'string' && data.governor.includes('PRAXIS');

          if (hasStatus && hasGovernor) {
            console.log('SYSTEM HEALTHY');
            console.log(`  status: ${data.status}`);
            console.log(`  governor: ${data.governor}`);
          } else {
            console.log('SYSTEM DOWN');
            console.log(`  status field: ${data.status ?? 'missing'}`);
            console.log(`  governor field: ${data.governor ?? 'missing'}`);
            console.log(`  raw: ${body}`);
            process.exit(1);
          }
        } catch {
          console.log('SYSTEM DOWN — invalid JSON response');
          console.log(`  raw: ${body}`);
          process.exit(1);
        }
      });
    }
  );

  req.on('error', (err: Error) => {
    console.log('SYSTEM DOWN — network error');
    console.log(`  ${err.message}`);
    process.exit(1);
  });

  req.end();
}

checkHealth();
