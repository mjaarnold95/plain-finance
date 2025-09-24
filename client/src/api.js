export async function post(url, body) {
const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
if (!res.ok) throw new Error(await res.text());
return res.json();
}
