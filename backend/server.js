// package.json debe tener "type": "module"
// package.json: { "type": "module" }
import app from './app.js'; 

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});