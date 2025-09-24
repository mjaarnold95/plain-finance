import { useEffect, useMemo, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { post } from './api';

export default function App() {
const [linkToken, setLinkToken] = useState(null);
const [txns, setTxns] = useState([]);
const userId = 'demo-user-1';

useEffect(() => {
post('http://localhost:5175/api/create_link_token', { userId }).then(d => setLinkToken(d.link_token));
}, []);

const config = useMemo(() => ({
token: linkToken,
onSuccess: async (public_token, metadata) => {
await post('http://localhost:5175/api/exchange_public_token', { public_token, userId });
await refresh();
},
onExit: (err, metadata) => { /* optional logging */ },
}), [linkToken]);

const { open, ready } = usePlaidLink(config);

async function refresh() {
const d = await post('http://localhost:5175/api/transactions/sync', { userId });
const rows = [...d.added, ...d.modified]
.sort((a,b) => new Date(b.date) - new Date(a.date));
setTxns(rows);
}

return (
<div className="app">
<h1>Plaid Finance (Sandbox)</h1>
<button disabled={!ready} onClick={() => open()}>Link an account</button>
<button onClick={refresh}>Refresh transactions</button>
<table>
<thead><tr><th>Date</th><th>Merchant</th><th>Category</th><th>Amount</th></tr></thead>
<tbody>
{txns.map(t => (
<tr key={t.transaction_id}>
<td>{t.date}</td>
<td>{t.merchant_name || t.name}</td>
<td>{(t.personal_finance_category?.primary || t.category?.[0] || '-') }</td>
<td>{(t.amount ?? 0).toFixed(2)}</td>
</tr>
))}
</tbody>
</table>
</div>
);
}
