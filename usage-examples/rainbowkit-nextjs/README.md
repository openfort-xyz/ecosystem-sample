# Third party auth with Firebase and Rapidfire ID

## How to run locally

** To run this sample, you need to install/link your own ecosystem wallet. **

**1. Clone and configure the sample**

Copy the .env.local.example file into a file named .env.local in the folder of the server you want to use. For example:

```
cp .env.local.example .env.local
```

You will need an Openfort account in order to run the demo. Once you set up your account, go to the Openfort [developer dashboard](https://dashboard.openfort.xyz/apikeys) to find your API keys.

To enable your embedded signer, you can follow the instructions [here](https://www.openfort.io/docs/guides/auth/embedded-signer).

```
NEXTAUTH_SHIELD_ENCRYPTION_SHARE=
NEXTAUTH_SHIELD_SECRET_KEY=
NEXT_PUBLIC_SHIELD_API_KEY=
NEXT_PUBLIC_OPENFORT_PUBLIC_KEY=<replace-with-your-publishable-key>
NEXTAUTH_OPENFORT_SECRET_KEY=<replace-with-your-secret-key>
```

**2. Create a Policy and add a Contract**

[![Required](https://img.shields.io/badge/REQUIRED-TRUE-ORANGE.svg)](https://shields.io/)

You can create Policies and add Contracts in the Dashboard or with the API. This sample requires a Policy and a Contract to run. Once you've created them, and add its ID to `CollectButton`.

`contract_id` is the ID of a [Contract](https://www.openfort.io/docs/reference/api/create-contract-object) for your contract. A contract has a chainId. 
If you need a test contract address, use 0x2522F4Fc9aF2E1954a3D13f7a5B2683A00a4543A (NFT contract deployed in 80002 Amoy).

`policy_id` is the ID of a [Policy](https://www.openfort.io/docs/reference/api/create-a-policy-object) for your contract. A policy has a contract and chainId. For this demo to work, the policy must have both the contract and the register sessions as rules.

```
NEXT_PUBLIC_CHAIN_ID=
NEXT_PUBLIC_CONTRACT_ID=
NEXT_PUBLIC_POLICY_ID=
```

**3. Get your Firebase Config**

First go to Firebase config: Console > Project settings > General adn create an app for your prohject if you still don't have one. 

<img width="1083" alt="image" src="https://github.com/openfort-xyz/samples/assets/62625514/f5884f03-ebbd-4c16-a154-b04803d40874">

Copy the FirebaseConfig and continue

<img width="1066" alt="image" src="https://github.com/openfort-xyz/samples/assets/62625514/46067ccc-7821-4a9e-91c2-728ec17782c5">

Then go to Firebase-Admin config: Console > Project settings > Service accounts and generate a "New Private Key"

<img width="1005" alt="image" src="https://github.com/openfort-xyz/samples/assets/62625514/2281e7d8-096e-49d4-b0d4-d2344e933f34">

Update `.env`

**4. Set up Firebase Auth in Openfort**

To set up Firebase to authenticate players with Openfort, visit your [dashboard provider settings](https://dashboard.openfort.xyz/players/auth/providers). You can follow a guide on how to set up Firebase Auth in Openfort [here](https://www.openfort.io/docs/guides/auth/external-auth/firebase).

<div align="center">
  <img
    width="50%"
    height="50%"
    src="https://blog-cms.openfort.xyz/uploads/firebase_auth_8ccee72abf.png?updated_at=2023-11-09T19:56:44.398Z"
    alt='firebase auth'
  />
</div>

**5. Follow the server instructions on how to run**

Install & Run:

```bash
npm install
npm run dev
# or
yarn
yarn dev
```


## Get support
If you found a bug or want to suggest a new [feature/use case/sample], please [file an issue](../../issues).

If you have questions, comments, or need help with code, we're here to help:
- on [Discord](https://discord.com/invite/t7x7hwkJF4)
- on Twitter at [@openfortxyz](https://twitter.com/openfortxyz)
- by [email](mailto:support+github@openfort.xyz)
