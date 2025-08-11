const block = {
  get: async (cid) => {
    throw new Error(`unexpected block API get for ${cid}`);
  },
  put: async () => {
    throw new Error('unexpected block API put');
  },
};

async function hash(content, options) {
  const { importer } = await import('ipfs-unixfs-importer');
  options = options || {}
  options.onlyHash = true

  if (typeof content === 'string') {
    content = new TextEncoder().encode(content)
  }

  let lastCid
  for await (const { cid } of importer([{ content }], block, options)) {
    lastCid = cid
  }

  return ${lastCid}
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

