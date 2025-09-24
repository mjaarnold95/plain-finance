// server/index.js
basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
baseOptions: {
headers: {
'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
'PLAID-SECRET': process.env.PLAID_SECRET,
},
},
});
const plaid = new PlaidApi(config);

const APP_NAME = 'Plaid Finance Sandbox';

// 1) Create Link Token
app.post('/api/create_link_token', async (req, res) => {
const { userId = 'demo-user-1' } = req.body || {};
try {
const response = await plaid.linkTokenCreate({
user: { client_user_id: userId },
client_name: APP_NAME,
language: 'en',
products: [Products.Transactions],
country_codes: ['US'],
// redirect_uri: 'http://localhost:5173/return' // needed only for OAuth banks
// webhook: 'https://your.ngrok.dev/plaid/webhook' // prod recommendation
});
res.json({ link_token: response.data.link_token });
} catch (err) {
res.status(500).json({ error: err.response?.data || err.message });
}
});

// 2) Exchange public_token for access_token
app.post('/api/exchange_public_token', async (req, res) => {
const { public_token, userId = 'demo-user-1' } = req.body;
try {
const exchange = await plaid.itemPublicTokenExchange({ public_token });
const accessToken = exchange.data.access_token;
setUser(userId, { accessToken });
res.json({ ok: true });
} catch (err) {
res.status(500).json({ error: err.response?.data || err.message });
}
});

// 3) Transactions Sync (idempotent & incremental)
app.post('/api/transactions/sync', async (req, res) => {
const { userId = 'demo-user-1' } = req.body || {};
try {
const { accessToken, cursor } = getUser(userId);
if (!accessToken) return res.status(400).json({ error: 'Link an account first.' });

const addedAll = []; const modifiedAll = []; const removedAll = [];
let nextCursor = cursor || null; let hasMore = true;
while (hasMore) {
const resp = await plaid.transactionsSync({
access_token: accessToken,
cursor: nextCursor || undefined,
count: 500,
});
addedAll.push(...resp.data.added);
modifiedAll.push(...resp.data.modified);
removedAll.push(...resp.data.removed);
hasMore = resp.data.has_more;
nextCursor = resp.data.next_cursor;
}
setUser(userId, { cursor: nextCursor });
res.json({ added: addedAll, modified: modifiedAll, removed: removedAll, next_cursor: nextCursor });
} catch (err) {
const code = err.response?.data?.error_code;
if (code === 'PRODUCT_NOT_READY') return res.status(202).json({ retryAfterMs: 3000 });
res.status(500).json({ error: err.response?.data || err.message });
}
});

app.listen(process.env.PORT, () => console.log(`API on http://localhost:${process.env.PORT}`));
