# Holo Chat Cockpit

An IoT device control app utilizing the ICP platform.  
You can intuitively control IoT devices using button operations, AR, and chat.

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- dfx 0.27.0 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bypptech/holo-chat-cockpit
   cd holo-chat-cockpit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up ICP local environment**
   ```bash
   cd icp_canister
   dfx start --clean --background
   dfx deploy
   cd ..
   ```

4. **Set environment variables**
   2.1 Create `.env` from the template
   ```bash
   cp .env.template .env
   ```
   2.2 Edit `.env`
   ```env
   EXPO_PUBLIC_ICP_MAINNET_CANISTER_ID_DRIVE_GACHA="canister-id-here"
   EXPO_PUBLIC_ICP_MAINNET_CANISTER_ID_DRIVE_GACHA_SECRET_TOKEN="secret-token-here"
   ```

5. **Start the development server**
   ```bash
   npx expo start --web
   ```