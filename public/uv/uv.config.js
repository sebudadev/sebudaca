/*global Ultraviolet*/
self.__uv$config = {
  prefix: "/service/",
  bare: "https://math.cinevez.lol/bare/",
  encodeUrl: Ultraviolet.codec.xor.encode,
  decodeUrl: Ultraviolet.codec.xor.decode,
  handler: "/uv/uv.handler.js",
  bundle: "/uv/uv.bundle.js",
  config: "/uv/uv.config.js"
};