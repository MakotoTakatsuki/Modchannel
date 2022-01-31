var src = '/.static/js/argon2.umd.min.js';

if (typeof importScripts === 'function') {
  importScripts(src);
  setTimeout(() => {
    postMessage({
      "event": "start"
    });
  }, 100);
}

async function guessHash(payload, first, max, onSuccess) {
  for (var cur = first; cur <= max; cur++) {
    if (cur > max) {
      alert("hashcash failure");
      return;
    }
    postMessage({
      'event': 'progress',
      'value': (cur-first)
    });
    var str = cur.toString();
    var ok = await hashwasm.argon2Verify({
      password: str,
      hash: payload
    });
    if (ok) {
      onSuccess(cur);
      return;
    }
  }
};

onmessage = function(e) {
  var data = e.data;
  guessHash(data[0], data[1], data[2], function(succ) {
    postMessage({
      "event": "finished",
      "value": succ
    });
  });
};

