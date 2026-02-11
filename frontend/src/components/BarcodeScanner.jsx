import React, { useState } from 'react';
import { ScanLine, Search, Loader2 } from 'lucide-react';

export function BarcodeScanner({ onScan, loading }) {
    const [barcode, setBarcode] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (barcode.trim()) {
            onScan(barcode);
        }
    };

    return (
        <div className="w-full text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-slow relative">
                <div className="absolute inset-0 rounded-full border border-primary/30 animate-ping opacity-20"></div>
                <ScanLine className="w-8 h-8 text-primary" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2 font-heading">Scan Product</h2>
            <p className="text-gray-400 mb-6 text-sm">Enter barcode manually.</p>

            <form onSubmit={handleSubmit} className="relative group w-full">
                <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Barcode ID"
                    className="relative w-full py-4 px-4 rounded-xl bg-[#0B0F14] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-lg font-mono tracking-widest text-center mb-4"
                    autoFocus={false} // Disable autofocus on mobile to prevent keyboard popping up immediately
                />

                <button
                    type="submit"
                    disabled={loading || !barcode}
                    className="w-full bg-gradient-to-r from-primary to-emerald-500 hover:from-emerald-400 hover:to-primary text-black font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            Analyze Product
                        </>
                    )}
                </button>
            </form>

            <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/5 text-left">
                <p className="text-xs text-gray-500 mb-2 font-bold uppercase">Dev Mode Hints:</p>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setBarcode('3017624010701')} className="px-2 py-1 bg-white/5 text-[10px] text-gray-300 rounded hover:bg-white/10">Nutella</button>
                    <button onClick={() => setBarcode('5449000000996')} className="px-2 py-1 bg-white/5 text-[10px] text-gray-300 rounded hover:bg-white/10">Coke</button>
                </div>
            </div>
        </div>
    );
}
