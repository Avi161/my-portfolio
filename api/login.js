const { checkPassword, issueToken, sleep } = require('./_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method-not-allowed' });
  }
  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'not-configured' });
  }
  const password = req.body && req.body.password;
  if (!checkPassword(password)) {
    await sleep(500);
    return res.status(401).json({ error: 'invalid-password' });
  }
  return res.status(200).json(issueToken());
};
