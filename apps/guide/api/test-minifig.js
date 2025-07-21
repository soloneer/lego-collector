// Simple test to check minifig image URLs
export default function handler(req, res) {
  // Test known minifig IDs with different URL patterns
  const testMinifigs = [
    'sw001', 'sw002', 'hp001', 'cas001', 'cty001',
    '10212-1', '10212-2', '75192-1', '76240-1'
  ];

  const testUrls = testMinifigs.map(figNum => ({
    fig_num: figNum,
    bricklink_mn: `https://img.bricklink.com/ItemImage/MN/0/${figNum}.png`,
    bricklink_ml: `https://img.bricklink.com/ItemImage/ML/${figNum}.png`,
    rebrickable_direct: `https://cdn.rebrickable.com/media/minifigs/${figNum}.jpg`,
    rebrickable_thumb: `https://cdn.rebrickable.com/media/thumbs/minifigs/${figNum}.jpg/250x250p.jpg`
  }));

  const html = `
    <!DOCTYPE html>
    <html>
    <head><title>Minifig Image Test</title></head>
    <body>
      <h1>Minifig Image URL Test</h1>
      ${testUrls.map(minifig => `
        <div style="margin: 20px; padding: 20px; border: 1px solid #ccc;">
          <h3>${minifig.fig_num}</h3>
          <div style="display: flex; gap: 10px;">
            <div>
              <p>BrickLink MN:</p>
              <img src="${minifig.bricklink_mn}" width="100" onerror="this.style.display='none'">
            </div>
            <div>
              <p>BrickLink ML:</p>
              <img src="${minifig.bricklink_ml}" width="100" onerror="this.style.display='none'">
            </div>
            <div>
              <p>Rebrickable:</p>
              <img src="${minifig.rebrickable_direct}" width="100" onerror="this.style.display='none'">
            </div>
            <div>
              <p>Rebrickable Thumb:</p>
              <img src="${minifig.rebrickable_thumb}" width="100" onerror="this.style.display='none'">
            </div>
          </div>
        </div>
      `).join('')}
    </body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}