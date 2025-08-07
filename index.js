const block = {
  get: async (cid) => {
    throw new Error(`unexpected block API get for ${cid}`);
  },
  put: async () => {
    throw new Error('unexpected block API put');
  },
};

async function hash(content_, options_) {
  const { importer } = await import('ipfs-unixfs-importer');
  const options = options_ || {};
  options.onlyHash = true;

  let content = content_;
  if (typeof content === 'string') {
    content = [{ content: new TextEncoder().encode(content) }];
  } else if (content instanceof Object.getPrototypeOf(Uint8Array)) {
    content = [{ content }];
  }

  let lastCID;
  for await (const c of importer(content, block, options)) {
    lastCID = c.cid;
  }
  return lastCID;
}

async function hashFiles(path, options) {
  const { globSource } = await import('ipfs-http-client');
  options = {
    cidVersion: 0, // Lines up with the smart contract code
    hidden: true,
    ...options,
  };

  const files = globSource(path, '**');

  const rootCID = await hash(files, options);
  return rootCID;
}

module.exports = {
  cidToHex(cid) {
    return `0x${Buffer.from(cid.bytes.slice(2)).toString('hex')}`;
  },

  of: hash,

  async ofFile(path) {
    return await hashFiles(path, {});
  },

  async ofDir(path) {
    return await hashFiles(path, {
      wrapWithDirectory: true,
    });
  },
};
