'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import { useUser } from '@clerk/nextjs';
import { Search, ChevronDown, CheckCircle, ChefHat, Bike, XCircle, AlertCircle, MapPin, Clock, Download, FileSpreadsheet, FileText, ChevronRight, Package, Utensils } from 'lucide-react';
import { getOrders, updateOrderStatus, getLocations, ApiLocation } from '@/lib/api';

type OrderStatus = 'Routing' | 'Pending' | 'Confirmed' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';
interface Order { id: string; displayId: string; customer: string; email: string; userPhone?: string; branch: string; mode: 'Delivery' | 'Pickup' | 'Dine-In'; items: string[]; total: string; status: OrderStatus; rawStatus: string; time: string; tableNo?: number; address?: string; customerStreet?: string; customerCity?: string; customerPostcode?: string; deliveryInstructions?: string; }

const PIPELINE: OrderStatus[] = ['Routing', 'Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed'];
const NEXT: Partial<Record<OrderStatus, OrderStatus>> = { Routing: 'Pending', Pending: 'Confirmed', Confirmed: 'Preparing', Preparing: 'Ready', Ready: 'Completed' };
const NEXT_LABEL: Partial<Record<OrderStatus, string>> = { Routing: 'Accept Manually', Pending: 'Confirm', Confirmed: 'Start Prep', Preparing: 'Mark Ready', Ready: 'Complete' };
const MODE_ICON: Record<string, React.ReactNode> = { 
    Delivery: <Bike size={16} />, 
    Pickup: <Package size={16} />, 
    'Dine-In': <Utensils size={16} /> 
};

const STATUS_CFG: Record<OrderStatus, { color: string; bg: string; border: string; icon: React.ReactNode; barColor: string }> = {
    Routing: { color: '#a855f7', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.2)', icon: <ChevronRight size={11} />, barColor: '#a855f7' },
    Pending: { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)', icon: <AlertCircle size={11} />, barColor: '#fbbf24' },
    Confirmed: { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)', icon: <CheckCircle size={11} />, barColor: '#60a5fa' },
    Preparing: { color: '#2563eb', bg: 'rgba(37,99,235,0.08)', border: 'rgba(37,99,235,0.2)', icon: <ChefHat size={11} />, barColor: '#2563eb' },
    Ready: { color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)', icon: <Bike size={11} />, barColor: '#4ade80' },
    Completed: { color: '#6b7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.2)', icon: <CheckCircle size={11} />, barColor: '#6b7280' },
    Cancelled: { color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', icon: <XCircle size={11} />, barColor: '#f87171' },
};

// ── Export helpers ─────────────────────────────────────────────────────────────

function ordersToRows(orders: Order[]) {
    return orders.map(o => ({
        'Order ID': o.displayId,
        'Customer': o.customer,
        'Email': o.email,
        'Branch': o.branch,
        'Mode': o.mode,
        'Items': o.items.join(', '),
        'Total': o.total,
        'Status': o.status,
        'Time': o.time,
        'Address': o.address ?? (o.tableNo ? `Table ${o.tableNo}` : '—'),
    }));
}

async function exportExcel(orders: Order[]) {
    if (!(window as any).XLSX) {
        await new Promise<void>((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
            s.onload = () => resolve(); s.onerror = reject;
            document.head.appendChild(s);
        });
    }
    const XLSX = (window as any).XLSX;
    const rows = ordersToRows(orders);
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [10, 22, 26, 14, 10, 50, 10, 12, 14, 24].map(w => ({ wch: w }));
    const range = XLSX.utils.decode_range(ws['!ref']!);
    for (let C = range.s.c; C <= range.e.c; C++) {
        const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
        if (cell) cell.s = { font: { bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '2563eb' } }, alignment: { horizontal: 'center' } };
    }
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    XLSX.writeFile(wb, `orders_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

async function exportPDF(orders: Order[]) {
    if (!(window as any).jspdf) {
        await new Promise<void>((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            s.onload = () => resolve(); s.onerror = reject;
            document.head.appendChild(s);
        });
    }
    if (!(window as any).jspdfAutoTable) {
        await new Promise<void>((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js';
            s.onload = () => resolve(); s.onerror = reject;
            document.head.appendChild(s);
        });
    }
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    doc.setFontSize(18); doc.setTextColor(37, 99, 235); doc.setFont('helvetica', 'bold');
    doc.text('Orders Export', 14, 18);
    doc.setFontSize(9); doc.setTextColor(150, 150, 150); doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}  ·  Total orders: ${orders.length}`, 14, 25);
    const rows = ordersToRows(orders);
    (doc as any).autoTable({
        head: [Object.keys(rows[0])],
        body: rows.map(r => Object.values(r)),
        startY: 30,
        styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
        headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [30, 30, 38] },
        bodyStyles: { textColor: [220, 220, 220], fillColor: [22, 22, 30] },
        columnStyles: { 0: { cellWidth: 18 }, 1: { cellWidth: 30 }, 2: { cellWidth: 38 }, 3: { cellWidth: 22 }, 4: { cellWidth: 18 }, 5: { cellWidth: 60 }, 6: { cellWidth: 18 }, 7: { cellWidth: 20 }, 8: { cellWidth: 18 }, 9: { cellWidth: 35 } },
        margin: { left: 14, right: 14 },
        didDrawPage: (data: any) => {
            doc.setFontSize(7); doc.setTextColor(100, 100, 100);
            doc.text(`Page ${data.pageNumber} of ${doc.getNumberOfPages()}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 6, { align: 'center' });
        },
    });
    doc.save(`orders_export_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ── Export dropdown ────────────────────────────────────────────────────────────

function ExportMenu({ orders, onOpenChange }: { orders: Order[]; onOpenChange?: (o: boolean) => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState<'excel' | 'pdf' | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    // Close on any outside click — no backdrop, no interference with page
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
                onOpenChange?.(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const handle = async (type: 'excel' | 'pdf') => {
        setOpen(false);
        onOpenChange?.(false);
        setLoading(type);
        try {
            if (type === 'excel') await exportExcel(orders);
            else await exportPDF(orders);
        } catch (e) {
            console.error(e);
            alert('Export failed. Check console for details.');
        } finally { setLoading(null); }
    };

    return (
        <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
            <button
                onClick={() => { const next = !open; setOpen(next); onOpenChange?.(next); }}
                disabled={!!loading}
                style={{
                    height: 38, padding: '0 16px',
                    display: 'flex', alignItems: 'center', gap: 7,
                    background: open ? 'rgba(0,0,0,0.09)' : 'rgba(0,0,0,0.05)',
                    border: `1px solid ${open ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: open ? '10px 10px 0 0' : '10px',
                    color: '#0f172a', fontSize: 13, fontWeight: 700,
                    cursor: loading ? 'wait' : 'pointer',
                    fontFamily: 'inherit',
                    opacity: loading ? 0.75 : 1,
                    transition: 'border-radius 0.15s, background 0.18s, border-color 0.18s',
                    letterSpacing: '0.01em',
                    position: 'relative', zIndex: 51,
                    borderBottom: open ? '1px solid transparent' : undefined,
                }}
                onMouseEnter={e => { if (!open) { e.currentTarget.style.background = 'rgba(0,0,0,0.09)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.18)'; } }}
                onMouseLeave={e => { if (!open) { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; } }}
            >
                <Download size={14} />
                {loading ? 'Exporting…' : 'Export'}
                <ChevronDown size={12} style={{ color: 'rgba(0,0,0,0.45)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.22s' }} />
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: '100%', right: 0,
                    background: '#ffffff',
                    border: '1px solid rgba(0,0,0,0.12)',
                    borderTop: 'none',
                    borderRadius: '0 0 12px 12px',
                    padding: '4px 6px 6px',
                    minWidth: '100%',
                    width: 220,
                    zIndex: 50,
                    boxShadow: '0 16px 40px rgba(0,0,0,0.15)',
                    animation: 'expandDown 0.18s cubic-bezier(0.4,0,0.2,1) both',
                }}>
                    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', color: 'rgba(0,0,0,0.2)', textTransform: 'uppercase', padding: '6px 10px 8px' }}>
                        Export {orders.length} order{orders.length !== 1 ? 's' : ''}
                    </div>

                    <button
                        onClick={() => handle('excel')}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 9, border: 'none', background: 'transparent', cursor: 'pointer', color: '#0f172a', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', textAlign: 'left', transition: 'background 0.14s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FileSpreadsheet size={15} style={{ color: '#4ade80' }} />
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>Excel (.xlsx)</div>
                            <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)', marginTop: 2 }}>Spreadsheet with all columns</div>
                        </div>
                    </button>

                    <div style={{ height: 1, background: 'rgba(0,0,0,0.05)', margin: '4px 6px' }} />

                    <button
                        onClick={() => handle('pdf')}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 9, border: 'none', background: 'transparent', cursor: 'pointer', color: '#0f172a', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', textAlign: 'left', transition: 'background 0.14s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FileText size={15} style={{ color: '#f87171' }} />
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>PDF (.pdf)</div>
                            <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)', marginTop: 2 }}>Print-ready landscape table</div>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
    const isLoaded = true;
    const user = { publicMetadata: { role: 'admin', branchId: undefined } };
    
    const [orders, setOrders] = useState<Order[]>([]);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<OrderStatus | 'All'>('All');
    const [filterMode, setFilterMode] = useState<'All' | string>('All');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [exportOpen, setExportOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const rawRole = (user?.publicMetadata?.role as string || 'customer');
    const userRole = rawRole.toLowerCase();
    const userBranchId = user?.publicMetadata?.branchId as string | undefined;

    useEffect(() => {
        if (!isLoaded) return; 
        loadData();
    }, [isLoaded]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Removed branch filtering - UI only placeholder
            const data = await getOrders(undefined);
            const mapped: Order[] = data.map((o: any) => {
                const modeMap: any = { DELIVERY: 'Delivery', PICKUP: 'Pickup', DINE_IN: 'Dine-In' };
                const mode = modeMap[o.mode] || 'Delivery';
                const statusMap: any = {
                    ROUTING: 'Pending',
                    PENDING: 'Pending',
                    REASSIGNING: 'Pending',
                    ESCALATED: 'Pending',
                    LONG_DISTANCE: 'Pending',
                    SCHEDULED: 'Pending',
                    CONFIRMED: 'Confirmed',
                    PREPARING: 'Preparing',
                    READY_FOR_PICKUP: 'Ready',
                    OUT_FOR_DELIVERY: 'Ready',
                    DELIVERED: 'Completed',
                    COMPLETED: 'Completed',
                    CANCELLED: 'Cancelled'
                };
                const status = statusMap[o.status] || 'Pending';

                const date = new Date(o.createdAt);
                const diffMins = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
                const timeStr = diffMins === 0 ? 'Just now' : diffMins < 60 ? `${diffMins} min ago` : `${Math.floor(diffMins / 60)} hr ago`;

                const items = o.orderItems?.map((i: any) => `${i.menuItem?.name || 'Item'} x${i.quantity}`) || [];

                return {
                    id: o.id,
                    displayId: '#' + o.id.split('-')[0].toUpperCase(),
                    customer: o.customerName || o.user?.name || 'Guest User',
                    email: o.customerEmail || o.user?.email || '—',
                    userPhone: o.customerPhone || o.user?.phone || undefined,
                    branch: o.branch?.name || 'Unassigned',
                    mode,
                    items,
                    total: `AED ${(o.totalAmount || 0).toFixed(2)}`,
                    status,
                    rawStatus: o.status,
                    time: timeStr,
                    address: o.customerAddress || undefined,
                    customerStreet: o.customerStreet || undefined,
                    customerCity: o.customerCity || undefined,
                    customerPostcode: o.customerPostcode || undefined,
                    deliveryInstructions: o.deliveryInstructions || undefined,
                };
            });
            setOrders(mapped);
        } catch (e) {
            console.error('Failed to load orders', e);
        } finally {
            setLoading(false);
        }
    };

    const advance = async (order: Order) => {
        const nextTarget = NEXT[order.status];
        if (!nextTarget) return;

        let backendStatus = 'PENDING';
        if (nextTarget === 'Confirmed') backendStatus = 'CONFIRMED';
        if (nextTarget === 'Preparing') backendStatus = 'PREPARING';
        if (nextTarget === 'Ready') backendStatus = order.mode === 'Delivery' ? 'OUT_FOR_DELIVERY' : 'READY_FOR_PICKUP';
        if (nextTarget === 'Completed') backendStatus = 'COMPLETED';

        try {
            await updateOrderStatus(order.id, backendStatus);
            setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: nextTarget } : o));
        } catch (e) {
            console.error('Failed to update status', e);
            alert('Failed to update order status');
        }
    };

    const cancel = async (order: Order) => {
        try {
            await updateOrderStatus(order.id, 'CANCELLED');
            setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'Cancelled' } : o));
        } catch (e) {
            console.error('Failed to cancel order', e);
            alert('Failed to cancel order');
        }
    };

    const filtered = orders.filter(o => {
        const q = search.toLowerCase();
        return (!q || o.displayId.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q))
            && (filterStatus === 'All' || o.status === filterStatus)
            && (filterMode === 'All' || o.mode === filterMode);
    });

    const liveCount = orders.filter(o => ['Pending', 'Confirmed', 'Preparing', 'Ready'].includes(o.status)).length;

    return (
        <div style={{ maxWidth: 1200, fontFamily: '"DM Sans", system-ui, sans-serif' }}>

            {/* ── Header ── */}
            <div style={{ marginBottom: 28, animation: 'fadeUp 0.4s ease both' }}>
                <div>
                    <h2 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 5px', letterSpacing: '-0.04em', color: '#0f172a' }}>
                        Live Orders
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{
                            width: 7, height: 7, borderRadius: '50%',
                            background: '#4ade80', boxShadow: '0 0 7px rgba(74,222,128,0.9)',
                            display: 'inline-block', animation: 'pulse 2s infinite',
                        }} />
                        <span style={{ fontSize: 13, color: 'rgba(15,23,42,0.4)' }}>
                            {liveCount} active order{liveCount !== 1 ? 's' : ''} right now
                        </span>
                    </div>
                </div>

                {/* Export — top right */}
                <ExportMenu orders={filtered} onOpenChange={setExportOpen} />
            </div>

            {/* ── Pipeline summary pills ── */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                {PIPELINE.map((status, i) => {
                    const count = orders.filter(o => o.status === status).length;
                    const isSelected = filterStatus === status;
                    return (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(isSelected ? 'All' : status)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: 10,
                                border: `1px solid ${isSelected ? 'rgba(37,99,235,0.1)' : 'rgba(0,0,0,0.06)'}`,
                                background: isSelected ? 'rgba(37,99,235,0.05)' : '#fff',
                                color: isSelected ? '#2563eb' : 'rgba(15,23,42,0.4)',
                                fontSize: 12, fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex', alignItems: 'center', gap: 7,
                                whiteSpace: 'nowrap',
                                position: 'relative',
                            }}
                            onMouseEnter={e => {
                                if (!isSelected) {
                                    e.currentTarget.style.background = 'rgba(0,0,0,0.02)';
                                    e.currentTarget.style.color = 'rgba(15,23,42,0.6)';
                                    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!isSelected) {
                                    e.currentTarget.style.background = '#fff';
                                    e.currentTarget.style.color = 'rgba(15,23,42,0.4)';
                                    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)';
                                }
                            }}
                        >
                            {status}
                            <span style={{
                                background: isSelected ? '#2563eb' : 'rgba(15,23,42,0.1)',
                                color: isSelected ? '#fff' : 'rgba(15,23,42,0.4)',
                                fontSize: 10, padding: '1px 5px', borderRadius: 5,
                                transition: 'all 0.2s',
                            }}>
                                {count}
                            </span>
                            {isSelected && <motion.div layoutId="pipeline-bar" style={{ position: 'absolute', bottom: -12, left: '20%', right: '20%', height: 3, background: '#2563eb', borderRadius: '3px 3px 0 0', boxShadow: '0 0 10px rgba(37,99,235,0.4)' }} />}
                        </button>
                    );
                })}
            </div>

            {/* ── Filters ── */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(15,23,42,0.3)', pointerEvents: 'none' }}>
                        <Search size={16} />
                    </div>
                    <input
                        placeholder="Search by ID, customer name or phone..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '11px 16px 11px 40px',
                            background: '#fff',
                            border: '1px solid rgba(0,0,0,0.08)',
                            borderRadius: 12,
                            color: '#0f172a',
                            fontSize: 13,
                            fontWeight: 500,
                            outline: 'none',
                            transition: 'all 0.2s',
                            fontFamily: 'inherit',
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.3)'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.05)'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                </div>

                <div style={{ flex: 1 }} />
                
                <select
                    value={filterMode}
                    onChange={e => setFilterMode(e.target.value)}
                    style={{
                        appearance: 'none', flexShrink: 0,
                        padding: '11px 14px',
                        background: '#fff',
                        border: '1px solid rgba(0,0,0,0.08)',
                        borderRadius: 12,
                        color: '#0f172a',
                        fontSize: 13,
                        fontWeight: 600,
                        outline: 'none',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                    }}
                >
                    <option value="All">All Modes</option>
                    <option value="Delivery">Delivery</option>
                    <option value="Pickup">Pickup</option>
                    <option value="Dine-In">Dine-In</option>
                </select>
            </div>

            {/* ── Order rows ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '64px 0', color: 'rgba(15,23,42,0.2)', fontSize: 14 }}>
                        No orders found.
                    </div>
                )}

                {filtered.map((order, i) => {
                    const cfg = STATUS_CFG[order.status];
                    const expanded = expandedId === order.id;

                    return (
                        <div
                            key={order.id}
                            style={{
                                background: '#fff',
                                border: `1px solid ${expanded ? 'rgba(37,99,235,0.2)' : 'rgba(0,0,0,0.08)'}`,
                                borderRadius: 16,
                                overflow: 'hidden',
                                transition: 'border-color 0.18s',
                                animation: `fadeUp 0.4s ease both`,
                                animationDelay: `${i * 0.05}s`,
                            }}
                            onMouseEnter={e => {
                                if (!expanded) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={e => {
                                if (!expanded) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,0.08)';
                            }}
                        >
                            <div style={{
                                height: 2,
                                background: cfg.barColor,
                                opacity: 0.7,
                                boxShadow: `0 0 8px ${cfg.barColor}66`,
                            }} />

                            <div
                                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', cursor: 'pointer' }}
                                onClick={() => setExpandedId(expanded ? null : order.id)}
                            >
                                <div style={{
                                    width: 32, height: 32, borderRadius: 8,
                                    background: 'rgba(37,99,235,0.06)',
                                    border: '1px solid rgba(37,99,235,0.15)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#2563eb',
                                }}>
                                    {MODE_ICON[order.mode]}
                                </div>

                                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 0.8fr', gap: 16, minWidth: 0 }}>

                                    <div>
                                        <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#2563eb', fontWeight: 700, margin: '0 0 2px' }}>
                                            {order.displayId}
                                        </p>
                                        <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 1px', letterSpacing: '-0.01em' }}>
                                            {order.customer}
                                        </p>
                                        <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {order.email}
                                        </p>
                                    </div>

                                    <div>
                                        <p style={{ fontSize: 10, color: 'rgba(0,0,0,0.3)', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                                            Branch
                                        </p>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: '0 0 2px' }}>{order.branch}</p>
                                        <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)', margin: 0 }}>
                                            {MODE_ICON[order.mode]} {order.mode}
                                            {order.tableNo ? ` · Table ${order.tableNo}` : ''}
                                        </p>
                                    </div>

                                    <div>
                                        <p style={{ fontSize: 10, color: 'rgba(0,0,0,0.3)', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                                            Items
                                        </p>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: '0 0 2px' }}>
                                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                        </p>
                                        <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)', margin: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
                                            <Clock size={10} /> {order.time}
                                        </p>
                                    </div>

                                    <div>
                                        <p style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.03em' }}>
                                            {order.total}
                                        </p>
                                        <div style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 4,
                                            fontSize: 10, fontWeight: 700,
                                            color: cfg.color,
                                            background: cfg.bg,
                                            border: `1px solid ${cfg.border}`,
                                            borderRadius: 20, padding: '3px 8px',
                                            letterSpacing: '0.03em',
                                        }}>
                                            {cfg.icon} {order.status}
                                        </div>
                                    </div>
                                </div>

                                <ChevronDown
                                    size={15}
                                    style={{
                                        color: 'rgba(0,0,0,0.2)',
                                        flexShrink: 0,
                                        transition: 'transform 0.2s',
                                        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                    }}
                                />
                            </div>

                            {expanded && (
                                <div style={{
                                    padding: '0 20px 20px',
                                    borderTop: '1px solid rgba(0,0,0,0.05)',
                                }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) minmax(200px, 1fr) minmax(250px, 1.5fr)', gap: 24, paddingTop: 20 }}>
                                        {/* Customer Info */}
                                        <div>
                                            <p style={{ fontSize: 10, color: 'rgba(0,0,0,0.3)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800 }}>
                                                Customer Details
                                            </p>
                                            <div style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                <div>
                                                    <p style={{ fontSize: 10, color: 'rgba(0,0,0,0.3)', margin: '0 0 2px', fontWeight: 600 }}>Full Name</p>
                                                    <p style={{ fontSize: 13, color: '#0f172a', margin: 0, fontWeight: 600 }}>{order.customer}</p>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: 10, color: 'rgba(0,0,0,0.3)', margin: '0 0 2px', fontWeight: 600 }}>Email</p>
                                                    <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', margin: 0 }}>{order.email}</p>
                                                </div>
                                                {order.userPhone && (
                                                    <div>
                                                        <p style={{ fontSize: 10, color: 'rgba(0,0,0,0.3)', margin: '0 0 2px', fontWeight: 600 }}>Phone Number</p>
                                                        <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', margin: 0 }}>{order.userPhone}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Delivery / Fulfillment Details */}
                                        <div>
                                            <p style={{ fontSize: 10, color: 'rgba(0,0,0,0.2)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800 }}>
                                                {order.mode === 'Delivery' ? 'Delivery Details' : 'Fulfillment Details'}
                                            </p>
                                            <div style={{ background: 'rgba(37,99,235,0.03)', border: '1px solid rgba(37,99,235,0.1)', borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                <div>
                                                    <p style={{ fontSize: 10, color: 'rgba(37,99,235,0.5)', margin: '0 0 2px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mode</p>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#0f172a', fontWeight: 600 }}>
                                                        {MODE_ICON[order.mode]} {order.mode}
                                                    </div>
                                                </div>
                                                {order.customerStreet && (
                                                    <div>
                                                        <p style={{ fontSize: 10, color: 'rgba(37,99,235,0.5)', margin: '0 0 4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Street Address</p>
                                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                                            <MapPin size={12} style={{ color: '#2563eb', marginTop: 2, flexShrink: 0 }} />
                                                            <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.7)', margin: 0, lineHeight: 1.5 }}>
                                                                {order.customerStreet}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                                {order.customerCity && (
                                                    <div>
                                                        <p style={{ fontSize: 10, color: 'rgba(37,99,235,0.5)', margin: '0 0 2px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>City</p>
                                                        <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.7)', margin: 0 }}>{order.customerCity}</p>
                                                    </div>
                                                )}
                                                {order.customerPostcode && (
                                                    <div>
                                                        <p style={{ fontSize: 10, color: 'rgba(37,99,235,0.5)', margin: '0 0 2px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Postcode</p>
                                                        <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.7)', margin: 0 }}>{order.customerPostcode}</p>
                                                    </div>
                                                )}
                                                {order.deliveryInstructions && (
                                                    <div>
                                                        <p style={{ fontSize: 10, color: 'rgba(37,99,235,0.5)', margin: '0 0 2px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivery Instructions</p>
                                                        <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.7)', margin: 0, fontStyle: 'italic' }}>{order.deliveryInstructions}</p>
                                                    </div>
                                                )}
                                                {order.tableNo && (
                                                    <div>
                                                        <p style={{ fontSize: 10, color: 'rgba(37,99,235,0.5)', margin: '0 0 2px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Table No</p>
                                                        <p style={{ fontSize: 14, color: '#0f172a', margin: 0, fontWeight: 800 }}>{order.tableNo}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div>
                                            <p style={{ fontSize: 10, color: 'rgba(0,0,0,0.2)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800 }}>
                                                Order Items
                                            </p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: 'rgba(0,0,0,0.02)', padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)' }}>
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <span style={{
                                                            width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                                                            background: 'rgba(0,0,0,0.2)',
                                                        }} />
                                                        <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.65)' }}>{item}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                    </div>

                                    <div style={{ display: 'flex', gap: 8, marginTop: 18, alignItems: 'center' }}>
                                        {NEXT[order.status] && (
                                            <button
                                                onClick={() => advance(order)}
                                                style={{
                                                    height: 36, padding: '0 18px',
                                                    background: 'linear-gradient(135deg, #2563eb, #1e40af)',
                                                    border: 'none', borderRadius: 9,
                                                    color: '#fff', fontSize: 12, fontWeight: 700,
                                                    cursor: 'pointer', letterSpacing: '0.02em',
                                                    boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
                                                    display: 'flex', alignItems: 'center', gap: 6,
                                                    transition: 'transform 0.15s, box-shadow 0.15s',
                                                    fontFamily: 'inherit',
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(37,99,235,0.45)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.35)'; }}
                                            >
                                                {NEXT_LABEL[order.status]}
                                            </button>
                                        )}

                                        {!['Completed', 'Cancelled'].includes(order.status) && (
                                            <button
                                                onClick={() => cancel(order)}
                                                style={{
                                                    height: 36, padding: '0 16px',
                                                    background: 'rgba(248,113,113,0.07)',
                                                    border: '1px solid rgba(248,113,113,0.2)',
                                                    borderRadius: 9,
                                                    color: '#f87171', fontSize: 12, fontWeight: 700,
                                                    cursor: 'pointer', letterSpacing: '0.02em',
                                                    display: 'flex', alignItems: 'center', gap: 6,
                                                    transition: 'background 0.15s, border-color 0.15s',
                                                    fontFamily: 'inherit',
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.12)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.35)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.07)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.2)'; }}
                                            >
                                                <XCircle size={12} /> Cancel Order
                                            </button>
                                        )}

                                        {order.status === 'Completed' && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#4ade80', fontWeight: 700 }}>
                                                <CheckCircle size={13} /> Order Completed
                                            </div>
                                        )}
                                        {order.status === 'Cancelled' && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#f87171', fontWeight: 700 }}>
                                                <XCircle size={13} /> Order Cancelled
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes expandDown {
                    from { opacity: 0; transform: scaleY(0.85); transform-origin: top; }
                    to   { opacity: 1; transform: scaleY(1);    transform-origin: top; }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0.35; }
                }
                input::placeholder { color: rgba(0,0,0,0.15) !important; }
                select option { background: #ffffff; color: #0f172a; }
            `}</style>
        </div>
    );
}