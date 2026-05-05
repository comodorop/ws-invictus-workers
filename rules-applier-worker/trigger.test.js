const amqp = require('amqplib');

async function sendTestEmail() {
    const RABBITMQ_URL = 'amqp://admin:admin@localhost:5672';
    const QUEUE_NAME = 'send_email_queue'; // Asegúrate que sea el mismo nombre que en tu main.ts

    try {
        console.log('--- Conectando a RabbitMQ ---');
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        // Aseguramos que la cola existe
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        // Definimos el payload según la interfaz de tu Consumer
        const emailData = {
            to: 'edgarmoralesaraujo@gmail.com',
            subject: 'Prueba desde Invicter Mailer Worker',
            message: `
        <h1>¡Conexión Exitosa!</h1>
        <p>Este es un mensaje de prueba enviado desde el script aislado hacia el microservicio.</p>
        <p>Hora de envío: ${new Date().toLocaleTimeString()}</p>
      `,
            type: 'html',
            fromName: 'Invicter Test Script'
        };

        const nestJsPayload = {
            pattern: 'send_email_queue', // Debe coincidir con el @EventPattern del controlador
            data: emailData              // Aquí van tus datos
        };

        // Enviamos el mensaje
        const sent = channel.sendToQueue(
            QUEUE_NAME,
            Buffer.from(JSON.stringify(nestJsPayload)),
            { persistent: true }
        );

        if (sent) {
            console.log(sent);
            console.log('✅ Mensaje enviado a la cola:', QUEUE_NAME);
            console.log('Payload:', nestJsPayload);
        } else {
            console.log('❌ No se pudo enviar el mensaje');
        }

        // Cerramos la conexión después de un breve delay
        setTimeout(async () => {
            await connection.close();
            process.exit(0);
        }, 500);

    } catch (error) {
        console.error('Error en el script de prueba:', error);
        process.exit(1);
    }
}

sendTestEmail();