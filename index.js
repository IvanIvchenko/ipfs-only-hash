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

async function ofDirWithStream(stream, filename) {
  const { importer } = await import('ipfs-unixfs-importer');
  const options = {
    onlyHash: true,
    wrapWithDirectory: true,
    cidVersion: 0,
  };

  const input = [{
    path: filename,
    content: stream,
  }];

  let dirCid;
  for await (const entry of importer(input, block, options)) {
    if (entry.path === '') {
      dirCid = entry.cid;
    }
  }
  if (!dirCid) throw new Error('Could not determine directory CID');

  return `${dirCid.toString()}/${filename}`;
}

module.exports = {
  cidToHex(cid) {
    return `0x${Buffer.from(cid.bytes.slice(2)).toString('hex')}`;
  },

  of: hash,

  ofDirWithStream,
};

