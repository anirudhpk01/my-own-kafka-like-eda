# 🚀 Local Event-Driven Architecture

A lightweight, Kafka-inspired event-driven architecture built for local development and microservices communication. This system provides pub/sub messaging capabilities using Redis as the backbone for topic management and event persistence.

## ✨ Features

- **Event Streaming**: Publish and consume events in real-time
- **Topic-based Messaging**: Organize events by topics for targeted consumption
- **Offset Management**: Track message consumption with automatic offset handling
- **Mailbox Services**: Automatic event delivery to subscribed REST endpoints
- **Event Logs**: Persistent event storage 
- **Redis-powered**: Leverages Redis for topic-consumer mapping
- **RESTful API**: Simple HTTP endpoints for producing and consuming events
- **Plug-and-Play**: Easy integration with existing microservices

## 🏗️ Architecture Overview

![image](https://github.com/user-attachments/assets/e21cd13a-845b-409f-9e8f-a91ca5eae314)



## Screenshots of working

![image](https://github.com/user-attachments/assets/4d4ed615-f57e-47ba-8356-59410b4069a1)
![image](https://github.com/user-attachments/assets/e8ed98ab-95a1-4423-963f-a81a35be66e4)
![image](https://github.com/user-attachments/assets/1c2e49da-cc1b-4d2b-924c-4287687ec220)






### Core Components

1. **Producer Service** (`index.js`): HTTP server exposing REST endpoints for event production and subscription management
2. **Broker Service** (`broker.js`): Background service handling event logs, offset management, and message delivery
3. **Redis Store**: Maintains topic-to-consumer mappings and event persistence
4. **Demo Client** (`democlient.js`): Example consumer application showing integration patterns

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **Redis Server** (v6 or higher)
- **npm** or **yarn**

### Redis Setup

You'll need to install and run Redis on your local machine:

**macOS (using Homebrew):**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
```

**Windows:**
- Download Redis from the official website or use Docker
- Or use WSL with the Linux installation method

**Docker (Alternative):**
```bash
docker run -d -p 6379:6379 redis:alpine
```

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/anirudhpk01/my-own-kafka-like-eda
cd event-driven-architecture
npm install
```

### 2. Start Redis

Make sure Redis is running on `localhost:6379` (default port).

### 3. Start the System

**Terminal 1 - Start the Producer Service:**
```bash
node index.js
```
The API server will start on `http://localhost:3000`

**Terminal 2 - Start the Broker Service:**
```bash
node broker.js
```
This runs the background event processing service.

**Terminal 3 - Start Demo Client (Optional):**
```bash
node democlient.js
```
Demo client runs on `http://localhost:4000`

## 📡 API Endpoints

### Producer Endpoints

#### 🔥 Produce Events
```http
POST /api/produce
Content-Type: application/json

{
  "event": "user.signup",
  "userId": 42,
  "email": "user@example.com",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

#### 📬 Subscribe to Topics
```http
POST /api/subscribe
Content-Type: application/json

{
  "topic": "user.signup",
  "url": "http://localhost:4000"
}
```

#### 📫 Mailbox Service
```http
GET /api/mailbox
```
Internal endpoint for message delivery coordination.

### Consumer Convention

**Important**: Subscribed services must expose a `POST /eda/api/receive` endpoint to receive events.

Example consumer endpoint:
```javascript
app.post('/eda/api/receive', (req, res) => {
  const { event, ...eventData } = req.body;
  console.log(`Received event: ${event}`, eventData);
  res.status(200).json({ status: 'received' });
});
```

## 🔧 Message Format

Events should follow this structure:

```json
{
  "event": "event.type",
  "param1": "value1",
  "param2": "value2",
  "userId": 123,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Event Naming Convention (Optional)

Use dot notation for hierarchical event types:
- `user.signup`
- `user.login`
- `order.created`
- `order.completed`
- `payment.processed`

## 🛠️ Usage Examples

### Publishing Events

```bash
# User signup event
curl -X POST http://localhost:3000/api/produce \
  -H "Content-Type: application/json" \
  -d '{"event":"user.signup","userId":42,"email":"john@example.com"}'

# Order created event
curl -X POST http://localhost:3000/api/produce \
  -H "Content-Type: application/json" \
  -d '{"event":"order.created","orderId":123,"userId":42,"amount":99.99}'
```

### Subscribing to Topics

```bash
# Subscribe your service to user events
curl -X POST http://localhost:3000/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"topic":"user.signup","consumerUrl":"http://localhost:4000"}'
```

### Testing with Demo Client

1. Start the demo client: `node democlient.js`
2. Subscribe the demo client to a topic
3. Produce events and watch them get delivered automatically

## 🏃‍♂️ Integration Guide

### Adding to Your Microservice

1. **Install dependencies** in your service
2. **Add the consumer endpoint**:
   ```javascript
   app.post('/eda/api/receive', (req, res) => {
     const { event, ...data } = req.body;
     
     // Handle the event based on type
     switch(event) {
       case 'user.signup':
         handleUserSignup(data);
         break;
       case 'order.created':
         handleOrderCreated(data);
         break;
       default:
         console.log('Unknown event:', event);
     }
     
     res.status(200).json({ status: 'processed' });
   });
   ```

3. **Subscribe to relevant topics**:
   ```javascript
   const subscribeToTopics = async () => {
     const topics = ['user.signup', 'order.created'];
     
     for (const topic of topics) {
       await fetch('http://localhost:3000/api/subscribe', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           topic,
           consumerUrl: 'http://localhost:YOUR_PORT'
         })
       });
     }
   };
   ```

## 🔍 How It Works

### Event Flow
1. **Producer** sends event to `/api/produce`
2. **Broker** captures event and stores in Redis
3. **Broker** identifies subscribed consumers for the event topic
4. **Mailbox service** delivers events to consumer endpoints
5. **Consumer** processes event via `/eda/api/receive` endpoint

### Offset Management
- Each consumer maintains its own offset for message consumption
- Automatic offset tracking prevents duplicate processing
- Event replay capability for recovery scenarios

### Topic Management
- Redis stores topic-to-consumer mappings
- Dynamic subscription/unsubscription support
- Wildcard topic matching (planned feature)

## 🔧 Configuration

### Environment Variables

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Server Configuration
PRODUCER_PORT=3000
BROKER_POLL_INTERVAL=1000
```

### Redis Keys Structure

```
topics:{topic_name} -> Set of consumer URLs
events:{topic_name} -> List of events
offsets:{consumer_url}:{topic_name} -> Current offset
```

## 🚦 Production Considerations

While this system is designed for local development, consider these aspects for production use:

- **Scaling**: Add connection pooling and cluster support
- **Persistence**: Configure Redis persistence (AOF/RDB)
- **Monitoring**: Add health checks and metrics
- **Security**: Implement authentication and authorization
- **Error Handling**: Add retry mechanisms and dead letter queues

## 🐛 Troubleshooting

### Common Issues

**Redis Connection Error**
```bash
# Check if Redis is running
redis-cli ping
# Should return "PONG"
```

**Events not being delivered**
- Verify consumer endpoint is accessible
- Check consumer implements `/eda/api/receive` endpoint
- Confirm subscription was successful

**Broker not processing events**
- Ensure `broker.js` is running
- Check Redis connectivity
- Verify event format is correct

## 🤝 Contributing

Feel free to submit issues and pull requests. This is an open-source project designed to help developers build event-driven architectures locally.

## 📄 License

MIT License - feel free to use this in your projects!

---

**Happy Event Streaming! 🎉**

