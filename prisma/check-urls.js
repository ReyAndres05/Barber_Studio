const urls = [
  "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1605497746444-ac9dbd39f69c?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1512864084360-7c0c4d0a0845?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1593702295094-aec22597af65?auto=format&fit=crop&w=500&q=80"
];

async function check() {
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      console.log(url, '->', res.status);
    } catch (e) {
      console.log(url, '-> ERROR', e.message);
    }
  }
}

check();
