const BASE=process.env.NEXT_PUBLIC_API_URL||"http://localhost:8000/api/developer";
export async function api<T>(path:string,options?:RequestInit):Promise<T>{const r=await fetch(`${BASE}${path}`,{...options,headers:{"Content-Type":"application/json",...(options?.headers||{})},cache:"no-store"});if(!r.ok)throw new Error(await r.text()||`Request failed: ${r.status}`);return r.json() as Promise<T>}
