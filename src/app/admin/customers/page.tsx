'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, UserX, UserCheck } from 'lucide-react';
// import { useUser } from '@clerk/nextjs';
import { getAnalyticsDashboard } from '@/lib/api';

interface Customer {
    name: string; email: string; joined: string;
    orders: number; spend: string; status: 'Active' | 'Disabled';
}

const AVATAR_COLORS = ['#2563eb', '#818cf8', '#34d399', '#fbbf24', '#f87171', '#60a5fa', '#a78bfa'];
const avatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

export default function CustomersPage() {
    const isLoaded = true;
    const user = { publicMetadata: { role: 'admin', branchId: undefined } };
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const rawRole = (user?.publicMetadata?.role as string || 'customer');
    const userRole = rawRole.toLowerCase();

    useEffect(() => {
        if (!isLoaded) return;
        
        // Removed branch filtering - UI only placeholder
        getAnalyticsDashboard(undefined)
            .then(data => {
                setCustomers(data.customerList || []);
            })
            .catch(e => console.error('Failed to load customers', e))
            .finally(() => setLoading(false));
    }, [isLoaded]);

    const toggle = (email: string) =>
        setCustomers(prev => prev.map(c =>
            c.email === email ? { ...c, status: c.status === 'Active' ? 'Disabled' : 'Active' } : c
        ));

    const filtered = customers.filter(c => {
        const q = search.toLowerCase();
        return !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    });

    const activeCount = customers.filter(c => c.status === 'Active').length;
    const disabledCount = customers.filter(c => c.status === 'Disabled').length;
    const totalSpend = customers.reduce((sum, c) => sum + parseInt(c.spend.replace(/\D/g, '') || '0'), 0);

    return (
        <div style={{ maxWidth: 1200, fontFamily: '"DM Sans", system-ui, sans-serif' }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, animation: 'fadeUp 0.4s ease both' }}>
                <div>
                    <h2 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 5px', letterSpacing: '-0.04em', color: '#0f172a' }}>
                        Customers
                    </h2>
                    <p style={{ fontSize: 13, color: 'rgba(15,23,42,0.4)', margin: 0 }}>
                        {loading ? 'Loading…' : `${customers.length} registered customers`}
                    </p>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(15,23,42,0.25)', fontSize: 14 }}>
                    Loading customers…
                </div>
            ) : (
                <>
                    {/* ── Summary stat pills ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20, animation: 'fadeUp 0.4s ease both', animationDelay: '0.06s' }}>
                        {[
                            { label: 'Active', value: activeCount, color: '#16a34a', glow: 'rgba(22,163,74,0.06)', border: 'rgba(22,163,74,0.12)' },
                            { label: 'Disabled', value: disabledCount, color: '#dc2626', glow: 'rgba(220,38,38,0.06)', border: 'rgba(220,38,38,0.12)' },
                            { label: 'Total Spend', value: `AED ${totalSpend.toLocaleString()}`, color: '#2563eb', glow: 'rgba(37,99,235,0.06)', border: 'rgba(37,99,235,0.12)' },
                        ].map((s, i) => (
                            <div key={s.label} style={{
                                background: '#fff',
                                border: `1px solid rgba(0,0,0,0.08)`,
                                borderRadius: 14, padding: '16px 20px',
                                position: 'relative', overflow: 'hidden',
                                animation: `fadeUp 0.4s ease both`,
                                animationDelay: `${0.08 + i * 0.07}s`,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                            }}>
                                <div style={{
                                    position: 'absolute', top: -24, right: -24,
                                    width: 80, height: 80, borderRadius: '50%',
                                    background: `radial-gradient(circle, ${s.color}15 0%, transparent 70%)`,
                                }} />
                                <p style={{ fontSize: 10, color: 'rgba(15,23,42,0.4)', margin: '0 0 6px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    {s.label}
                                </p>
                                <p style={{ fontSize: 24, fontWeight: 900, margin: 0, color: s.color, letterSpacing: '-0.04em' }}>
                                    {s.value}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* ── Search ── */}
                    <div style={{ position: 'relative', maxWidth: 360, marginBottom: 16, animation: 'fadeUp 0.4s ease both', animationDelay: '0.16s' }}>
                        <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(15,23,42,0.3)', pointerEvents: 'none' }} />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name or email…"
                            style={{
                                width: '100%', boxSizing: 'border-box',
                                background: '#fff',
                                border: '1px solid rgba(0,0,0,0.1)',
                                borderRadius: 10, padding: '9px 12px 9px 34px',
                                fontSize: 13, color: '#0f172a', outline: 'none',
                                fontFamily: 'inherit', transition: 'all 0.2s',
                            }}
                            onFocus={e => {
                                e.currentTarget.style.borderColor = 'rgba(37,99,235,0.4)';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.05)';
                            }}
                            onBlur={e => {
                                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        />
                    </div>

                    {/* ── Table ── */}
                    <div style={{
                        background: '#fff',
                        border: '1px solid rgba(0,0,0,0.08)',
                        borderRadius: 16, overflow: 'hidden',
                        animation: 'fadeUp 0.45s ease both',
                        animationDelay: '0.2s',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'rgba(0,0,0,0.01)' }}>
                                    {['Customer', 'Joined', 'Orders', 'Total Spend', 'Status', 'Actions'].map((h, i) => (
                                        <th key={h} style={{
                                            padding: '12px 20px',
                                            textAlign: i === 5 ? 'right' : 'left',
                                            fontSize: 10, fontWeight: 800,
                                            color: 'rgba(15,23,42,0.3)',
                                            letterSpacing: '0.1em',
                                            textTransform: 'uppercase',
                                        }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '52px 0', color: 'rgba(15,23,42,0.25)', fontSize: 14 }}>
                                            No customers found.
                                        </td>
                                    </tr>
                                )}

                                {filtered.map((c, i) => {
                                    const color = avatarColor(c.name);
                                    const active = c.status === 'Active';
                                    const maxOrders = Math.max(...customers.map(cu => cu.orders), 1);

                                    return (
                                        <tr
                                            key={c.email}
                                            style={{
                                                borderBottom: i < filtered.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                                                transition: 'background 0.15s',
                                                opacity: active ? 1 : 0.6,
                                                animation: `fadeUp 0.4s ease both`,
                                                animationDelay: `${0.22 + i * 0.04}s`,
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(37,99,235,0.02)')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                        >
                                            <td style={{ padding: '13px 20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{
                                                        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                                                        background: color + '12',
                                                        border: `1px solid ${color}25`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: 13, fontWeight: 900, color,
                                                    }}>
                                                        {c.name[0]}
                                                    </div>
                                                    <div>
                                                        <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 1px', letterSpacing: '-0.01em' }}>
                                                            {c.name}
                                                        </p>
                                                        <p style={{ fontSize: 11, color: 'rgba(15,23,42,0.4)', margin: 0 }}>
                                                            {c.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td style={{ padding: '13px 20px' }}>
                                                <span style={{ fontSize: 12, color: 'rgba(15,23,42,0.5)', fontWeight: 500 }}>{c.joined}</span>
                                            </td>

                                            <td style={{ padding: '13px 20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ width: 40, height: 4, background: 'rgba(0,0,0,0.05)', borderRadius: 99, overflow: 'hidden' }}>
                                                        <div style={{
                                                            height: '100%', borderRadius: 99,
                                                            background: '#2563eb',
                                                            width: `${Math.round((c.orders / maxOrders) * 100)}%`,
                                                        }} />
                                                    </div>
                                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{c.orders}</span>
                                                </div>
                                            </td>

                                            <td style={{ padding: '13px 20px' }}>
                                                <span style={{ fontSize: 14, fontWeight: 800, color: '#2563eb', letterSpacing: '-0.02em' }}>
                                                    {c.spend}
                                                </span>
                                            </td>

                                            <td style={{ padding: '13px 20px' }}>
                                                <div style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 5,
                                                    padding: '4px 10px', borderRadius: 20,
                                                    fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase',
                                                    color: active ? '#16a34a' : '#64748b',
                                                    background: active ? 'rgba(22,163,74,0.08)' : 'rgba(100,116,139,0.08)',
                                                    border: `1px solid ${active ? 'rgba(22,163,74,0.15)' : 'rgba(100,116,139,0.12)'}`,
                                                }}>
                                                    <span style={{
                                                        width: 5, height: 5, borderRadius: '50%',
                                                        background: active ? '#16a34a' : '#64748b',
                                                        flexShrink: 0,
                                                    }} />
                                                    {c.status}
                                                </div>
                                            </td>

                                            <td style={{ padding: '13px 20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                                                    <button
                                                        style={{
                                                            height: 30, padding: '0 12px',
                                                            background: 'rgba(37,99,235,0.06)',
                                                            border: '1px solid rgba(37,99,235,0.15)',
                                                            borderRadius: 8, cursor: 'pointer',
                                                            fontSize: 11, fontWeight: 700,
                                                            color: '#2563eb',
                                                            display: 'flex', alignItems: 'center', gap: 5,
                                                            transition: 'all 0.15s',
                                                            fontFamily: 'inherit',
                                                        }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.12)'; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.25)'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.06)'; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.15)'; }}
                                                    >
                                                        <Eye size={11} /> History
                                                    </button>

                                                    <button
                                                        onClick={() => toggle(c.email)}
                                                        style={{
                                                            width: 30, height: 30, borderRadius: 8,
                                                            background: 'transparent',
                                                            border: `1px solid ${active ? 'rgba(220,38,38,0.15)' : 'rgba(22,163,74,0.15)'}`,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            color: active ? '#dc2626' : '#16a34a',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.15s',
                                                            opacity: 0.6
                                                        }}
                                                        title={active ? 'Disable customer' : 'Enable customer'}
                                                        onMouseEnter={e => {
                                                            e.currentTarget.style.background = active ? 'rgba(220,38,38,0.06)' : 'rgba(22,163,74,0.06)';
                                                            e.currentTarget.style.opacity = '1';
                                                        }}
                                                        onMouseLeave={e => {
                                                            e.currentTarget.style.background = 'transparent';
                                                            e.currentTarget.style.opacity = '0.6';
                                                        }}
                                                    >
                                                        {active ? <UserX size={12} /> : <UserCheck size={12} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                input::placeholder { color: rgba(15,23,42,0.3) !important; }
            `}</style>
        </div>
    );
}