# Contributing

## Developers

### Getting started

1. Clone/fork this repo:

   ```bash
   git clone https://github.com/proof-Of-Humanity/proof-Of-Humanity-web/
   ```

2. Copy the `.env.example` file into `.env.local` and set the appropriate values:

   ```bash
   cp .env.example .env.local
   ```

   ```bash
   INFURA_API_KEY=API_key
   NETWORK=kovan # or mainnet
   ```

3. Build the subgraph and the relay schemas:

   ```bash
   npm run build:graph
   npm run dev:relay
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

### Pull requests

After making your changes, you can open a pull request and ask for review.
