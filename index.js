/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const delay = require('delay');
const {VeresOne} = require('did-veres-one');

const peers = [
  'genesis.bee.veres.one',
  'alturas.bee.veres.one',
  'saopaulo.bee.veres.one',
  'frankfurt.bee.veres.one',
  'singapore.bee.veres.one',
  'mumbai.bee.veres.one',
  'tokyo.bee.veres.one',
];

const clients = peers.map(hostname => new VeresOne({hostname, mode: 'test'}));

async function run() {
  const go = true;
  let counter = 0;
  while(go) {
    const dids = await Promise.all(clients.map(v1 => generateDid(v1)));
    console.log('DIDS', dids);
    await delay(30000);
    for(const did of dids) {
      await Promise.all(clients.map(v1 => getDid({did, v1})));
    }
    counter += dids.length;
    console.log(`${Date()} Counter ${counter}`);
  }
}

async function getDid({did, v1}) {
  let remote;
  while(!remote) {
    try {
      remote = await v1.getRemote({did});
    } catch(e) {
      if(e.name !== 'NotFoundError') {
        throw e;
      }
      await delay(10000);
    }
  }
  if(!remote.found) {
    throw new Error(`DID not found ${did}`);
  }
  console.log(`Found ${did}`);
}

async function generateDid(v1) {
  const didDocument = await v1.generate();
  v1.register({didDocument});
  return didDocument.id;
}

run().catch(console.error);
