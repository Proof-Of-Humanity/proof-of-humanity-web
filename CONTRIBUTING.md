# Contributing

## Developers

### Getting started

0. Clone/fork this repo:

   ```bash
   git clone https://github.com/proof-Of-Humanity/proof-Of-Humanity-web/
   ```

1. Install the dependencies:

    ```bash
    npm install
    ```

2. Copy the `.env.example` file into `.env.local` and set the appropriate values:

   ```bash
   cp .env.example .env.local
   ```

   ```bash
   NEXT_PUBLIC_NETWORK=kovan # or mainnet
   NEXT_PUBLIC_INFURA_ENDPOINT='https://{network}.infura.io/v3/{api_key}'
   NEXT_PUBLIC_IPFS_GATEWAY='https://ipfs.kleros.io'
   ```

3. Build the subgraph and the relay schemas locally:

   ```bash
   npm run local:build:graph:test
   npm run local:dev:relay:test
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

### Pull requests

After making your changes, you can open a pull request and ask for review.
