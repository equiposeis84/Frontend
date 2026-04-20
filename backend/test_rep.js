const testRepartidores = async () => {
  try {
    const loginRes = await fetch('http://localhost:3000/api/usuarios/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@remate.com', password: 'pass123' })
    });
    
    // Get cookies from the response
    const cookies = loginRes.headers.get('set-cookie');
    
    const repRes = await fetch('http://localhost:3000/api/repartidores', {
      headers: { 'Cookie': cookies }
    });
    
    const data = await repRes.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
};

testRepartidores();
